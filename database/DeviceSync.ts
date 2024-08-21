import axios from 'axios';
import SQLite, { Transaction, ResultSet } from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import BackgroundService from 'react-native-background-actions';
import BASE_URL from '../config';
import { Parcel } from '../Utils/types';


// Utility function to sleep for a specified time
const sleep = (time: number) => new Promise<void>((resolve) => setTimeout(resolve, time));

// Enable SQLite debugging (optional, but useful for debugging)
SQLite.DEBUG(true);
SQLite.enablePromise(true);

// Open the database
let db: SQLite.SQLiteDatabase;

const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const database = await SQLite.openDatabase({
      name: 'mydatabase.db',
      location: 'default',
    });

    console.log('Database opened successfully');
    return database;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

// Initialize the database
const initializeDatabase = async (): Promise<void> => {
  db = await openDatabase();
};

// Create the parcel table
export const createParcelTable = async (): Promise<void> => {
  try {
    await db.transaction(async (txn: Transaction) => {
      await txn.executeSql(
        `CREATE TABLE IF NOT EXISTS parcel_table (
          syncId VARCHAR(50) PRIMARY KEY,
          parcelId INTEGER,
          title VARCHAR(10),
          firstName VARCHAR(50),
          surname VARCHAR(50),
          dispatchRef VARCHAR(50),
          barcode VARCHAR(50),
          dueDate DATETIME,
          cellphone VARCHAR(15),
          idNumber VARCHAR(20),
          dateOfBirth DATETIME,
          gender VARCHAR(10),
          consignmentNo VARCHAR(50),
          scanInDatetime DATETIME,
          passcode VARCHAR(20),
          scanInByUserId INTEGER,
          loggedInDatetime DATETIME,
          scanOutDatetime DATETIME,
          scanOutByUserId INTEGER,
          parcelStatusId INTEGER,
          deviceId INTEGER,
          facilityId INTEGER,
          dirtyFlag INTEGER,
          parcelStatus BOOLEAN
        )`,
        [],
        () => {
          console.log('Parcel table created successfully');
        }
      );
    });
  } catch (error) {
    console.error('Error creating parcel table:', error);
    throw error;
  }
};

// Create the user table
export const createUserTable = async (): Promise<void> => {
  try {
    await db.transaction(async (txn: Transaction) => {
      await txn.executeSql(
        `CREATE TABLE IF NOT EXISTS user_table (
          syncId VARCHAR(50) PRIMARY KEY,
          userId INTEGER,
          firstName VARCHAR(50),
          surname VARCHAR(50),
          middleName VARCHAR(50),
          loginId VARCHAR(50),
          password VARCHAR(50),
          cellphone VARCHAR(15),
          email VARCHAR(50),
          gender VARCHAR(10),
          facilityRole VARCHAR(50),
          roleId INTEGER,
          deviceId INTEGER,
          facilityId INTEGER,
          dirtyFlag INTEGER,
          userStatus BOOLEAN
        )`,
        [],
        () => {
          console.log('User table created successfully');
        }
      );
    });
  } catch (error) {
    console.error('Error creating user table:', error);
    throw error;
  }
};

// Initialize database and create tables
export const setupDatabase = async (): Promise<void> => {
  try {
    await initializeDatabase();
    await createParcelTable();
    await createUserTable();
  } catch (error) {
    console.error('Error setting up the database:', error);
  }
};

const getDeviceInfo = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('DeviceInfo');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Error reading value", e);
  }
};

// Function to login to the device
export const loginToDevice = async (): Promise<void> => {
 // const devicePassword = await AsyncStorage.getItem('DevicePassword');
  //const deviceId = await AsyncStorage.getItem('DeviceId');
  const deviceInfo = await getDeviceInfo();
  const devicePassword = deviceInfo?.devicePassword;
  const deviceId = deviceInfo?.deviceId;

  if (!devicePassword || !deviceId) {
    console.error('Device not registered, credentials not found');
    return;
  }

  let macAddress = await DeviceInfo.getMacAddress();
  if (!macAddress) {
    macAddress = '02:00:00:00:00:00';
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/device/devicelogin`,
      {},
      {
        headers: {
          deviceId,
          devicePassword,
          macAddress,
        },
      }
    );

    if (response.status === 200 && response.data) {
      await AsyncStorage.setItem('AuthToken', response.data);
      console.log('Logged in to device successfully');
    }
  } catch (error) {
    console.error('Error logging in to device:', error);
  }
};

// Function to fetch sync data and insert into tables
export const getSyncData = async (): Promise<void> => {
  const authToken = await AsyncStorage.getItem('AuthToken');
  // const deviceId = await AsyncStorage.getItem('DeviceId');
  // const facilityId = await AsyncStorage.getItem('FacilityId');

  const deviceInfo = await getDeviceInfo();
  const deviceId = deviceInfo?.deviceId;
  const facilityId = deviceInfo?.facilityId;

  console.log('AuthToken:', authToken);

  if (!authToken) {
    console.error('AuthToken not found');
    return;
  }

  if(!deviceId){
    console.error('DeviceId not found');
    return;
  }

  if(!facilityId){
    console.error('FacilityId not found');
    return;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/sync/getclouddata`,
      {}, // Pass an empty object as the body
      {
        headers: {
          deviceId: deviceId,
          facilityId: facilityId,
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.status === 200) {
      console.log('Sync data fetched successfully');
      console.log('Sync data: actual data line 220', response.data);

      const { parcels, users } = response.data;

      if(parcels.length === 0 && users.length === 0){
        console.log('No sync data to process');
        return;
      }

      await insertParcels(parcels);
      console.log('Parcels inserted successfully');
      await insertUsers(users);
      console.log('Users inserted successfully');
    }
  } catch (error) {
    console.error('Error fetching sync data:', error);
  }
};

// Function to insert parcels into parcel table
const insertParcels = async (parcels: any[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((txn: Transaction) => {
      parcels.forEach((parcel) => {
        const dueDate = parcel.dueDate
          ? new Date(
              parcel.dueDate.year,
              parcel.dueDate.month - 1,
              parcel.dueDate.day
            ).toISOString()
          : null;

        const dateOfBirth = parcel.dateOfBirth
          ? new Date(
              parcel.dateOfBirth.year,
              parcel.dateOfBirth.month - 1,
              parcel.dateOfBirth.day
            ).toISOString()
          : null;

        switch (parcel.dirtyFlag) {
          case 0:
            // No action
            console.log(`No action needed for parcel ${parcel.parcelId}`);
            break;

          case 1:
            // Insert or Update the record
            txn.executeSql(
              `INSERT OR REPLACE INTO parcel_table (
                syncId, parcelId, title, firstName, surname, dispatchRef, barcode, dueDate, cellphone, idNumber, dateOfBirth, gender, consignmentNo, scanInDatetime, passcode, scanInByUserId, loggedInDatetime, scanOutDatetime, scanOutByUserId, parcelStatusId, deviceId, facilityId, dirtyFlag, parcelStatus
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                parcel.syncId,
                parcel.parcelId,
                parcel.title,
                parcel.firstName,
                parcel.surname,
                parcel.dispatchRef,
                parcel.barcode,
                dueDate,
                parcel.cellphone,
                parcel.idNumber,
                dateOfBirth,
                parcel.gender,
                parcel.consignmentNo,
                parcel.scanInDatetime,
                parcel.passcode,
                parcel.scanInByUserId,
                parcel.loggedInDatetime,
                parcel.scanOutDatetime,
                parcel.scanOutByUserId,
                parcel.parcelStatusId,
                parcel.deviceId,
                parcel.facilityId,
                0,
                true, // Set parcelStatus to true on successful insert/update
              ],
              (tx: Transaction, result: ResultSet) => {
                console.log(
                  `Parcel ${parcel.parcelId} inserted/updated successfully`
                );
              },
              (tx: Transaction, error) => {
                console.error(
                  `Error inserting/updating parcel ${parcel.parcelId}:`,
                  error
                );
                reject(error);
                return true;
              }
            );
            break;

          case 2:
            // Update the record based on SyncId
            txn.executeSql(
              `UPDATE parcel_table SET
                parcelId=?, title=?, firstName=?, surname=?, dispatchRef=?, barcode=?, dueDate=?, cellphone=?, idNumber=?, dateOfBirth=?, gender=?, consignmentNo=?, scanInDatetime=?, passcode=?, scanInByUserId=?, loggedInDatetime=?, scanOutDatetime=?, scanOutByUserId=?, parcelStatusId=?, deviceId=?, facilityId=?, dirtyFlag=?, parcelStatus=?
              WHERE syncId=?`,
              [
                parcel.parcelId,
                parcel.title,
                parcel.firstName,
                parcel.surname,
                parcel.dispatchRef,
                parcel.barcode,
                dueDate,
                parcel.cellphone,
                parcel.idNumber,
                dateOfBirth,
                parcel.gender,
                parcel.consignmentNo,
                parcel.scanInDatetime,
                parcel.passcode,
                parcel.scanInByUserId,
                parcel.loggedInDatetime,
                parcel.scanOutDatetime,
                parcel.scanOutByUserId,
                parcel.parcelStatusId,
                parcel.deviceId,
                parcel.facilityId,
                0,
                true, // Set parcelStatus to true on successful update
                parcel.syncId,
              ],
              (tx: Transaction, result: ResultSet) => {
                console.log(`Parcel ${parcel.parcelId} updated successfully`);
              },
              (tx: Transaction, error) => {
                console.error(
                  `Error updating parcel ${parcel.parcelId}:`,
                  error
                );
                reject(error);
                return true;
              }
            );
            break;

          case 3:
            // Delete the record based on SyncId
            txn.executeSql(
              `DELETE FROM parcel_table WHERE syncId=?`,
              [parcel.syncId],
              (tx: Transaction, result: ResultSet) => {
                console.log(`Parcel ${parcel.parcelId} deleted successfully`);
                txn.executeSql(
                  `INSERT INTO parcel_table (
                    syncId, parcelStatus
                  ) VALUES (?, ?)`,
                  [parcel.syncId, true],
                  (tx: Transaction, result: ResultSet) => {
                    console.log(
                      `ParcelStatus for ${parcel.parcelId} set to true after delete`
                    );
                  },
                  (tx: Transaction, error) => {
                    console.error(
                      `Error setting parcelStatus for deleted parcel ${parcel.parcelId}:`,
                      error
                    );
                    reject(error);
                    return true;
                  }
                );
              },
              (tx: Transaction, error) => {
                console.error(
                  `Error deleting parcel ${parcel.parcelId}:`,
                  error
                );
                reject(error);
                return true;
              }
            );
            break;

          default:
            console.error(`Invalid dirtyFlag for parcel ${parcel.parcelId}`);
        }
      });
      resolve();
    });
  });
};


// Function to insert users into user table
const insertUsers = async (users: any[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((txn: Transaction) => {
      let userStatus = [];
      users.forEach(user => {
        const { syncId, userId, firstName, surname, middleName, loginId, password, cellphone, email, gender, facilityRole, roleId, deviceId, facilityId, dirtyFlag } = user;
         let userData = { syncId: '', status: false };
         userData.syncId = syncId;

         
        // Decide the action based on dirtyFlag
        switch (dirtyFlag) {
          case 0:
            // No action
            console.log(`No action for user ${userId}`);
            break;
          case 1:
            // Insert or replace the record
            txn.executeSql(
              `INSERT OR REPLACE INTO user_table (
                syncId, userId, firstName, surname, middleName, loginId, password, cellphone, email, gender, facilityRole, roleId, deviceId, facilityId, dirtyFlag, userStatus
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                syncId, userId, firstName, surname, middleName, loginId, password, cellphone, email, gender, facilityRole, roleId, deviceId, facilityId, dirtyFlag, true
              ],
              () => {
                userData.status = true;
                console.log(`User ${userId} inserted/updated successfully`);
              },
              error => {
                userData.status = false;
                console.error(`Error inserting user ${userId}:`, error);
                reject(error);
                return true;
              }
            );
            break;
          case 2:
            // Update the record
            txn.executeSql(
              `UPDATE user_table SET 
                userId = ?, firstName = ?, surname = ?, middleName = ?, loginId = ?, password = ?, cellphone = ?, email = ?, gender = ?, facilityRole = ?, roleId = ?, deviceId = ?, facilityId = ?, dirtyFlag = ?, userStatus = ?
              WHERE syncId = ?`,
              [
                userId, firstName, surname, middleName, loginId, password, cellphone, email, gender, facilityRole, roleId, deviceId, facilityId, dirtyFlag, true, syncId
              ],
              () => {
                userData.status = true;
                console.log(`User ${userId} updated successfully`);
              },
              error => {
                userData.status = false;
                console.error(`Error updating user ${userId}:`, error);
                reject(error);
                return true;
              }
            );
            break;
          case 3:
            // Delete the record
            txn.executeSql(
              `DELETE FROM user_table WHERE syncId = ?`,
              [syncId],
              () => {
                console.log(`User ${userId} deleted successfully`);
                // Update userStatus to true after deletion
                txn.executeSql(
                  `INSERT INTO user_table (syncId, userStatus) VALUES (?, ?)`,
                  [syncId, true],
                  () => {
                    userData.status = true;
                    console.log(`User status updated to true for deleted user ${userId}`);
                  },
                  (error) => {
                    userData.status = false;
                    console.error(`Error updating user status for deleted user ${userId}:`, error);
                    reject(error);
                    return true;
                  }
                );
              },
              error => {
                console.error(`Error deleting user ${userId}:`, error);
                reject(error);
                return true;
              }
            );
            break;
          default:
            console.error(`Invalid dirtyFlag for user ${userId}`);
            break;
        }
        userStatus.push(userData);
      });
      resolve();
    });
  });
};

// Function to update cloud status after successful sync
export const updateCloudStatus = async (): Promise<void> => {
  try {

    const authToken = await AsyncStorage.getItem('AuthToken');
   // const deviceId = await AsyncStorage.getItem('DeviceId');
   const deviceInfo = await getDeviceInfo();
    const deviceId = deviceInfo?.deviceId;

    if (!authToken) {
      console.error('AuthToken not found');
      return;
    }

    if (!deviceId) {
      console.error('DeviceId not found');
      return;
    }

    const parcelStatuses = await getStatusesFromTable('parcel_table','parcelStatus');
    const userStatuses = await getStatusesFromTable('user_table','userStatus');

    console.log('Parcel statuses:', parcelStatuses);
    console.log('User statuses:', userStatuses);

    if (parcelStatuses.length === 0 && userStatuses.length === 0) {
      console.log('No statuses to update');
      return;
    }

    const response = await axios.post(`${BASE_URL}/sync/updatecloudstatus`, {
      ParcelStatus: parcelStatuses,
      UserStatus: userStatuses,
    }, {
      headers: {
        deviceId: deviceId,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 200) {
      console.log('Cloud status updated successfully');
    }
  } catch (error) {
    console.error('Error updating cloud status:', error);
  }
};


export const findUser = (identifier: string, password: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM user_table WHERE (loginId = ? OR cellphone = ? OR email = ?) AND password = ?`,
        [identifier, identifier, identifier, password],
        (tx, results) => {

          console.log('Results:', results.rows);
          if (results.rows.length > 0) {
           const user = results.rows.item(0);
            resolve(user); // Resolve with user details
          } else {
            resolve(false); // User not found
          }
        },
        error => {
          console.error('Error finding user:', error);
          reject(error);
        }
      );
    });
  });
};

export const printAllUsers = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM user_table`,
        [],
        (tx, results) => {
          console.log('Results: line 540', results.rows);
          const users = [];
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            users.push(row);
            console.log('User:', row); // Print each user
          }
          resolve();
        },
        error => {
          console.error('Error fetching all users:', error);
          reject(error);
        }
      );
    });
  });
};



// Helper function to get statuses from the local database
const getStatusesFromTable = async (tableName: string,statusType: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT syncId, ${statusType} AS Status FROM ${tableName} WHERE ${statusType} IS NOT NULL`,
        [],
        (tx, results) => {
          const statuses = [];
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            statuses.push({ SyncId: row.syncId, Status: row.Status });
          }
          resolve(statuses);
        },
        error => {
          console.error(`Error fetching statuses from ${tableName}:`, error);
          reject(error);
        }
      );
    });
  });
};




export const fetchParcels = async (id:any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      txn.executeSql(
        'SELECT * FROM parcel_table WHERE parcelStatusId = ?',
        [id], 
        (tx, results) => {
          let parcels = [];
          for (let i = 0; i < results.rows.length; i++) {
            parcels.push(results.rows.item(i));
          }
          
          // Sorting the parcels based on dueDate and firstName
          parcels.sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);

            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;

            // If due dates are the same, sort by firstName
            return a.firstName.localeCompare(b.firstName);
          });

          resolve(parcels);
        },
        (error) => {
          console.error('Error fetching parcels:', error);
          reject(error);
        }
      );
    });
  });
};

export const fetchParcelsFromLastWeek = async (id: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    console.log('Today:', today.toISOString());
    console.log('Last week:', lastWeek.toISOString());

    db.transaction((txn) => {
      txn.executeSql(
        'SELECT * FROM parcel_table WHERE parcelStatusId = ? AND dueDate BETWEEN ? AND ?',
        [id, lastWeek.toISOString(), today.toISOString()],
        (tx, results) => {
          let parcels = [];
          for (let i = 0; i < results.rows.length; i++) {
            parcels.push(results.rows.item(i));
          }

          // Sorting the parcels based on scanInDatetime and firstName
          parcels.sort((a, b) => {
            const dateA = new Date(a.scanInDatetime);
            const dateB = new Date(b.scanInDatetime);

            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;

            // If scanInDatetime are the same, sort by firstName
            return a.firstName.localeCompare(b.firstName);
          });

          resolve(parcels);
        },
        (error) => {
          console.error('Error fetching parcels:', error);
          reject(error);
        }
      );
    });
  });
};


export const updateParcel = async (
  parcel: Parcel,
  userId: number,
  scanDateTimeType: string,
  scanUsertype: string,
  parcelStatusId: number,
  passcode: string
): Promise<void> => {
  const db = openDatabase();
  const scanInDatetime = new Date().toISOString();
   

  try {
    await (await db).transaction(async (txn) => {
       txn.executeSql(
        `UPDATE parcel_table SET 
          ${scanDateTimeType} = ?, 
          ${scanUsertype} = ?, 
          parcelStatusId = ?, 
          passcode = ?, 
          dirtyFlag = ? 
        WHERE syncId = ?`,
        [scanInDatetime, userId, parcelStatusId,passcode, 2, parcel.syncId],
        () => {
          console.log('Parcel updated successfully after scan in or scan out or return');
        }
      );
    });
  } catch (error) {
    console.error('Error updating parcel:', error);
    throw error;
  }
};

interface ParcelUpdate {
  syncId: string;
  scanInDatetime: string | null;
  scanInByUserId: number;
  loggedInDatetime: string | null;
  passcode: string;
  scanOutDatetime: string | null;
  scanOutByUserId: number;
  parcelStatusId: number;
}

const fetchDirtyParcels = async (): Promise<ParcelUpdate[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'SELECT syncId, scanInDatetime, scanInByUserId, loggedInDatetime, passcode, scanOutDatetime, scanOutByUserId, parcelStatusId FROM parcel_table WHERE dirtyFlag != ?',
        [0],
        (tx, result) => {
          const parcels: Parcel[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            parcels.push(result.rows.item(i));
          }
          resolve(parcels);
        },
        (tx, error) => {
          reject(error);
        }
      );
    });
  });
};


export const updateDirtyFlag = async (parcelStatus: Array<{ syncId: string; status: boolean }>) => {
  try {
    await db.transaction(async (txn: Transaction) => {
      for (const parcel of parcelStatus) {
        if (parcel.status) {
          await txn.executeSql(
            `UPDATE parcel_table SET dirtyFlag = 0 WHERE syncId = ?`,
            [parcel.syncId],
            () => {
              console.log(`Updated dirtyFlag for syncId: ${parcel.syncId}`);
            },
            (txn, error) => {
              console.error(`Failed to update dirtyFlag for syncId: ${parcel.syncId}`, error);
              return false;
            }
          );
        }
      }
    });
  } catch (error) {
    console.error('Error updating dirtyFlag:', error);
    throw error;
  }
};


const sendDataToApi = async (data: any) => {
  const deviceInfo = await getDeviceInfo();
  const authToken = await AsyncStorage.getItem('AuthToken');
  const deviceId = deviceInfo?.deviceId;
  console.log("modified parcel dataline 724444", data);
  console.log('Device ID: line 726', deviceId);
  console.log('Auth token: line 727', authToken);

  try {
    const response = await axios.post(
    `${BASE_URL}/sync/updateclouddata`,
      data, {
      headers: {
        deviceId: deviceId,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Data sent successfully: line 734', response.data);

    const { parcelStatus } = response.data;
    if (parcelStatus && parcelStatus.length > 0) {
      await updateDirtyFlag(parcelStatus);
    }

  } catch (error) {
    console.error('Error sending data to API:', error);
  }
};

const updateCloudOnModifieddata = async () => {
  try {
    const dirtyParcels = await fetchDirtyParcels();
    const smSs :any= []; // Fetch or create your `smSs` data here

    if(dirtyParcels.length === 0 && smSs.length === 0){
      console.log('No modified data to send');
      return;
    }
    
    const formattedData = {
      parcels: dirtyParcels,
      smSs: smSs,
    };
    await sendDataToApi(formattedData);
    console.log('Data sent to API successfully after scan in or scan out');
  } catch (error) {
    console.error('Error in main function:', error);
  }
};

export const deleteDatabase = async (): Promise<void> => {
  try {
    await SQLite.deleteDatabase({
      name: 'mydatabase.db',
      location: 'default',
    });
    console.log('Database deleted successfully');
  } catch (error) {
    console.error('Error deleting database:', error);
    throw error;
  }
};

// Define the background task function
const deviceSyncTask = async (taskDataArguments: { delay: number }) => {
  const { delay } = taskDataArguments;
 // await createTables();

  while (BackgroundService.isRunning()) {
    try {
      await loginToDevice();
      await getSyncData();
      await updateCloudStatus();
      await updateCloudOnModifieddata();
    } catch (error) {
      console.error('Error during device sync task:', error);
    }

    await sleep(delay);
  }
};

// Options for the background task
const options = {
  taskName: 'Device Sync',
  taskTitle: 'Device Sync Running',
  taskDesc: 'Syncng device data in the background',
taskIcon: {
name: 'ic_launcher', // Name of the icon file in the drawable folder
type: 'mipmap',
},
color: '#ff00ff',
linkingURI: 'yourappscheme://sync', // Custom scheme to open your app when the notification is tapped
parameters: {
delay: 37000, // Delay in milliseconds (30 seconds)
},
};

// Function to start background tasks using BackgroundService
export const startBackgroundTasks = async (): Promise<void> => {
try {
await BackgroundService.start(deviceSyncTask as any, options);
console.log('Background tasks started');
} catch (error) {
console.error('Error starting background tasks:', error);
}
};

// Function to stop background tasks using BackgroundService
export const stopBackgroundTasks = async (): Promise<void> => {
try {
await BackgroundService.stop();
console.log('Background tasks stopped');
} catch (error) {
console.error('Error stopping background tasks:', error);
}
};