import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Alert} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import DeviceInfo from 'react-native-device-info';
import SQLite, {ResultSet, Transaction} from 'react-native-sqlite-storage';
import BASE_URL from '../config';
import {
  deleteDatabase,
  deleteSmsRecordsWithDirtyFlag,
  fetchDirtyParcels,
  getSmsDataWithDirtyFlag,
  sendDataToApi,
} from './DatabseOperations';
import { Colors } from '../constants/colours';

// Utility function to sleep for a specified time
const sleep = (time: number) =>
  new Promise<void>(resolve => setTimeout(resolve, time));

// Enable SQLite debugging (optional, but useful for debugging)
// SQLite.DEBUG(true);
SQLite.enablePromise(true);

// Open the database
let db: SQLite.SQLiteDatabase;

const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const database = await SQLite.openDatabase({
      name: 'medipack.db',
      location: 'default',
    });

    // console.log('Database opened successfully');
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

// Initialize database and create tables
export const setupDatabase = async (): Promise<void> => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Error setting up the database:', error);
  }
};

export const getDeviceInfo = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('DeviceInfo');
    // if (jsonValue == null) {
    //   const jsonValue = getDeviceInfoFromDatabase();
    //   await AsyncStorage.setItem('DeviceInfo', JSON.stringify(jsonValue));
    // }
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading value', e);
  }
};

export const startBackgroundTasks = async (navigation: any): Promise<void> => {
  try {
    await loginToDevice();

    // await BackgroundService.start(deviceSyncTask as any, options);
    await BackgroundService.start(
      deviceSyncTask.bind(null, navigation) as any, // Pass navigation to the task
      options,
    );
  } catch (error) {
    console.error('Error starting background tasks:', error);
  }
};

const deviceSyncTask = async (
  navigation: any,
  taskDataArguments: {delay: number},
) => {
  const {delay} = taskDataArguments;
  // await createTables();

  while (BackgroundService.isRunning()) {
    try {
      let cloudStatus = {
        parcelStatus: [],
        userStatus: [],
        smsStatus: [],
      };

      cloudStatus = await getCloudData(navigation);
      // console.log("cloud status line 98", cloudStatus);

      if (
        cloudStatus.parcelStatus.length > 0 ||
        cloudStatus.userStatus.length > 0 ||
        cloudStatus.smsStatus.length > 0
      ) {
        console.log('cloud status line 106', cloudStatus);
        await updateCloudStatus(cloudStatus);
      }

      await updateCloudOnModifieddata();

      // console.log('Device synced with modified data successfully');
    } catch (error) {
      loginToDevice();
      // console.error('Error during device sync task:', error);
    }

    await sleep(delay);
  }
};

// Function to login to the device
export const loginToDevice = async (): Promise<void> => {
  const deviceInfo = await getDeviceInfo();
  const devicePassword = deviceInfo?.devicePassword;
  const deviceId = deviceInfo?.deviceId;

  if (!devicePassword || !deviceId) {
    console.log('Device not registered, credentials not found');
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
      },
    );

    if (response.status === 200 && response.data) {
      await AsyncStorage.setItem('AuthToken', response.data);
    }
  } catch (error) {
    // console.error('Error logging in to device:', error);
  }
};
interface ParcelStatus {
  syncId: string;
  status: boolean;
}

interface UserStatus {
  syncId: string;
  status: boolean;
}

interface SmsStatus {
  SyncId: string;
  Status: boolean;
}
// Function to fetch sync data and insert into tables
export const getCloudData = async (navigation: any): Promise<any> => {
  const authToken = await AsyncStorage.getItem('AuthToken');
  const deviceInfo = await getDeviceInfo();
  const deviceId = deviceInfo?.deviceId;
  const facilityId = deviceInfo?.facilityId;

  let cloudStatus = {
    parcelStatus: [] as ParcelStatus[],
    userStatus: [] as UserStatus[],
    smsStatus: [] as SmsStatus[],
  };

  if (!authToken || !deviceId || !facilityId) {
    return cloudStatus; // Return empty status if any required value is missing
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
      },
    );
    //console.log('Response:', response.status);
    if (response.status === 200) {
      const {parcels, users, deregister, smSs} = response.data;
      // console.log('response data line 192:', response.data);
      console.log('Sms data from cloud line 193:', smSs);
      //  console.log('deregister value line 194:', deregister);

      // console.log('Parcels line 255:', parcels);
      // console.log('Users: line 256', users);
      // console.log('Deregister: line 257', deregister);

      if (deregister) {
        await AsyncStorage.removeItem('DeviceInfo');
        await AsyncStorage.removeItem('AuthToken');
        await AsyncStorage.removeItem('UserInfo');
        await stopBackgroundTasks();
        await deleteDatabase();

        navigation.replace('DeviceRegistrationScreen' as any);

        Alert.alert('Device deregistered successfully');

        return;
      }

      // if (parcels.length === 0 || users.length === 0) {
      //   return cloudStatus; // No data to process, return empty status
      // }

      if (parcels.length > 0) {
        cloudStatus.parcelStatus = await insertParcels(parcels);
      }
      // console.log('Parcel status: line 271', cloudStatus.parcelStatus);

      if (users.length > 0) {
        cloudStatus.userStatus = await insertUsers(users);
      }

      if (smSs.length > 0) {
        cloudStatus.smsStatus = await deleteSmsRecordsWithDirtyFlag(smSs);
      }

      // console.log('User status: bline 273', cloudStatus.userStatus);
    }
  } catch (error: any) {
    if (error.response.status === 401) {
      loginToDevice();
    } else {
      console.error('Error fetching sync data:', error);
    }
  }
  return cloudStatus;
};

// Function to insert parcels into parcel table
const insertParcels = async (parcels: any[]): Promise<ParcelStatus[]> => {
  return new Promise((resolve, reject) => {
    const parcelStatus: any[] = [];
    db.transaction(
      (txn: Transaction) => {
        parcels.forEach(parcel => {
          const dueDate = parcel.dueDate
            ? new Date(
                parcel.dueDate.year,
                parcel.dueDate.month - 1,
                parcel.dueDate.day,
              ).toISOString()
            : null;

          console.log('parceldue date line 312', dueDate);

          const dateOfBirth = parcel.dateOfBirth
            ? new Date(
                parcel.dateOfBirth.year,
                parcel.dateOfBirth.month - 1,
                parcel.dateOfBirth.day,
              ).toISOString()
            : null;

          switch (parcel.dirtyFlag) {
            case 0:
              // No action
              //console.log(`No action needed for parcel ${parcel.parcelId}`);
              break;

            case 1:
              // Insert or Update the record
              txn.executeSql(
                `INSERT OR REPLACE INTO parcel_table (
                syncId, 
                parcelId,
                title,
                firstName,
                surname, 
                dispatchRef,
                barcode,
                dueDate,
                cellphone, 
                idNumber, 
                dateOfBirth, 
                gender, 
                consignmentNo,
                scanInDatetime, 
                passcode, 
                scanInByUserId, 
                loggedInDatetime, 
                scanOutDatetime, 
                scanOutByUserId, 
                parcelStatusId,
                deviceId, 
                facilityId,
                dirtyFlag
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                ],
                (tx: Transaction, result: ResultSet) => {
                  parcelStatus.push({SyncId: parcel.syncId, Status: true});
                },
                (tx: Transaction, error) => {
                  console.error(
                    `Error inserting/updating parcel ${parcel.parcelId}:`,
                    error,
                  );
                  reject(error);
                  return true;
                },
              );
              break;

            case 2:
              // Update the record based on SyncId
              txn.executeSql(
                `UPDATE parcel_table SET
                parcelId=?,
                 title=?, 
                 firstName=?, 
                 surname=?,
                  dispatchRef=?, 
                  barcode=?, 
                  dueDate=?,
                   cellphone=?, 
                   idNumber=?, 
                   dateOfBirth=?, 
                   gender=?, 
                   consignmentNo=?, s
                   canInDatetime=?, 
                   passcode=?, 
                   scanInByUserId=?, 
                   loggedInDatetime=?, 
                   scanOutDatetime=?, 
                   scanOutByUserId=?, 
                   parcelStatusId=?, 
                   deviceId=?, 
                   facilityId=?, 
                   dirtyFlag=?,
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
                  parcel.syncId,
                ],
                (tx: Transaction, result: ResultSet) => {
                  //console.log(`Parcel ${parcel.parcelId} updated successfully`);
                  parcelStatus.push({SyncId: parcel.syncId, Status: true});
                },
                (tx: Transaction, error) => {
                  console.error(
                    `Error updating parcel ${parcel.parcelId}:`,
                    error,
                  );
                  reject(error);
                  return true;
                },
              );
              break;

            case 3:
              // Delete the record based on SyncId
              txn.executeSql(
                `DELETE FROM parcel_table WHERE syncId=?`,
                [parcel.syncId],
                (tx: Transaction, result: ResultSet) => {
                  parcelStatus.push({SyncId: parcel.syncId, Status: true});
                },
                (tx: Transaction, error) => {
                  console.error(
                    `Error deleting parcel ${parcel.parcelId}:`,
                    error,
                  );
                  reject(error);
                  return true;
                },
              );
              break;

            default:
              console.error(`Invalid dirtyFlag for parcel ${parcel.parcelId}`);
          }
        });
      },

      error => {
        reject(error);
      },
      () => {
        resolve(parcelStatus);
      },
    );
  });
};

// Function to insert users into user table
const insertUsers = async (users: any[]): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const userStatus: any[] = [];
    db.transaction(
      (txn: Transaction) => {
        users.forEach(user => {
          const {
            syncId,
            userId,
            firstName,
            surname,
            middleName,
            loginId,
            password,
            cellphone,
            email,
            gender,
            facilityRole,
            roleId,
            deviceId,
            facilityId,
            dirtyFlag,
          } = user;

          // Decide the action based on dirtyFlag
          switch (dirtyFlag) {
            case 0:
              // No action
              //  console.log(`No action for user ${userId}`);
              break;
            case 1:
              // Insert or replace the record
              txn.executeSql(
                `INSERT OR REPLACE INTO user_table (
                syncId, 
                userId, 
                firstName, 
                surname, 
                middleName, 
                loginId, 
                password, 
                cellphone, 
                email, 
                gender, 
                facilityRole, 
                roleId, 
                deviceId, 
                facilityId, 
                dirtyFlag
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  syncId,
                  userId,
                  firstName,
                  surname,
                  middleName,
                  loginId,
                  password,
                  cellphone,
                  email,
                  gender,
                  facilityRole,
                  roleId,
                  deviceId,
                  facilityId,
                  dirtyFlag,
                ],
                () => {
                  userStatus.push({SyncId: syncId, Status: true});
                  //    console.log(`User ${userId} inserted/updated successfully`);
                },
                error => {
                  userStatus.push({SyncId: syncId, Status: false});
                  console.error(`Error inserting user ${userId}:`, error);
                  reject(error);
                  return true;
                },
              );
              break;
            case 2:
              // Update the record
              txn.executeSql(
                `UPDATE user_table SET 
                userId = ?, firstName = ?, surname = ?, middleName = ?, loginId = ?, password = ?, cellphone = ?, email = ?, gender = ?, facilityRole = ?, roleId = ?, deviceId = ?, facilityId = ?, dirtyFlag = ?
              WHERE syncId = ?`,
                [
                  userId,
                  firstName,
                  surname,
                  middleName,
                  loginId,
                  password,
                  cellphone,
                  email,
                  gender,
                  facilityRole,
                  roleId,
                  deviceId,
                  facilityId,
                  dirtyFlag,
                  syncId,
                ],
                () => {
                  userStatus.push({SyncId: syncId, Status: true});
                  //     console.log(`User ${userId} updated successfully`);
                },
                error => {
                  userStatus.push({SyncId: syncId, Status: false});
                  console.error(`Error updating user ${userId}:`, error);
                  reject(error);
                  return true;
                },
              );
              break;
            case 3:
              // Delete the record
              txn.executeSql(
                `DELETE FROM user_table WHERE syncId = ?`,
                [syncId],
                () => {
                  userStatus.push({SyncId: syncId, Status: true});
                  //  console.log(`User ${userId} deleted successfully`);
                },
                error => {
                  userStatus.push({SyncId: syncId, Status: false});
                  console.error(`Error deleting user ${userId}:`, error);
                  reject(error);
                  return true;
                },
              );
              break;
            default:
              console.error(`Invalid dirtyFlag for user ${userId}`);
              break;
          }
        });
      },
      error => {
        reject(error);
      },
      () => {
        resolve(userStatus);
      },
    );
  });
};

// Function to update cloud status after successful sync
export const updateCloudStatus = async (cloudStatus: any): Promise<void> => {
  try {
    const authToken = await AsyncStorage.getItem('AuthToken');
    // const deviceId = await AsyncStorage.getItem('DeviceId');
    const deviceInfo = await getDeviceInfo();
    const deviceId = deviceInfo?.deviceId;
    // console.log("cloud status", cloudStatus);

    if (!authToken) {
      console.error('AuthToken not found');
      return;
    }

    if (!deviceId) {
      console.error('DeviceId not found');
      return;
    }

    // console.log("device id line 551", deviceId);
    // console.log("auth token line 552", authToken);

    // const parcelStatuses = await getStatusesFromTable('parcel_table','parcelStatus');
    // const userStatuses = await getStatusesFromTable('user_table','userStatus');

    // console.log('Parcel statuses:', parcelStatuses);
    // console.log('User statuses:', userStatuses);

    // if (parcelStatuses.length === 0 && userStatuses.length === 0) {
    //   console.log('No statuses to update');
    //   return;
    // }
    // console.log('Cloud status line 566:', cloudStatus);
    const response = await axios.post(
      `${BASE_URL}/sync/updatecloudstatus`,
      cloudStatus,
      {
        headers: {
          deviceId: deviceId,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    if (response.status === 200) {
      console.log('data line 621', response.data);
      // console.log('Cloud status updated successfully line 572');
    }
  } catch (error: any) {
    if (error.response.status === 401) {
      loginToDevice();
    } else {
      console.error('Error updating cloud status:', error);
    }
  }
};

export const findUser = (
  identifier: string,
  password: string,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM user_table WHERE (loginId = ? OR cellphone = ? OR email = ?) AND password = ?`,
        [identifier, identifier, identifier, password],
        (tx, results) => {
          // console.log('Results:', results.rows);
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
        },
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
          //  console.log('Results: line 540', results.rows);
          const users = [];
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            users.push(row);
            //   console.log('User:', row); // Print each user
          }
          resolve();
        },
        error => {
          console.error('Error fetching all users:', error);
          reject(error);
        },
      );
    });
  });
};

// Helper function to get statuses from the local database
// const getStatusesFromTable = async (tableName: string,statusType: string): Promise<any[]> => {
//   return new Promise((resolve, reject) => {
//     db.transaction(tx => {
//       tx.executeSql(
//         `SELECT syncId, ${statusType} AS Status FROM ${tableName} WHERE ${statusType} IS NOT NULL`,
//         [],
//         (tx, results) => {
//           const statuses = [];
//           for (let i = 0; i < results.rows.length; i++) {
//             const row = results.rows.item(i);
//             statuses.push({ SyncId: row.syncId, Status: row.Status });
//           }
//           resolve(statuses);
//         },
//         error => {
//           console.error(`Error fetching statuses from ${tableName}:`, error);
//           reject(error);
//         }
//       );
//     });
//   });
// };

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

export const updateCloudOnModifieddata = async () => {
  try {
    const dirtyParcels = await fetchDirtyParcels();
    const smSs: any = await getSmsDataWithDirtyFlag();
    //const smSs: any = [];
    //console.log('Dirty parcels: line 845', dirtyParcels);
    console.log('Dirty sms: line 846', smSs);
    console.log('dirty parcels line 847', dirtyParcels);

    if (dirtyParcels.length === 0 && smSs.length === 0) {
      // console.log('No modified data to send');
      return;
    }

    const formattedData = {
      parcels: dirtyParcels,
      smSs: smSs,
    };

    console.log('Formatted data:', formattedData);
    await sendDataToApi(formattedData);
    console.log('Data sent to API successfully after scan in or scan out');
  } catch (error) {
    console.error('Error in main function:', error);
  }
};

// Define the background task function

// Options for the background task
const options = {
  taskName: 'Device Sync',
  taskTitle: 'Device Sync Running',
  taskDesc: 'Syncng device data in the background',
  taskIcon: {
    name: 'ic_launcher', // Name of the icon file in the drawable folder
    type: 'mipmap',
  },
  color: Colors.green,
  linkingURI: 'yourappscheme://sync', // Custom scheme to open your app when the notification is tapped
  parameters: {
    delay: 37000, // Delay in milliseconds (30 seconds)
  },
};

// Function to start background tasks using BackgroundService

// Function to stop background tasks using BackgroundService
export const stopBackgroundTasks = async (): Promise<void> => {
  try {
    await BackgroundService.stop();
  } catch (error) {
    console.error('Error stopping background tasks:', error);
  }
};
