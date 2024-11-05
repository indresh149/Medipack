import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Alert} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import SQLite, {Transaction} from 'react-native-sqlite-storage';
import {Parcel} from '../Utils/types';
import {getUserInfo} from '../Utils/utils';
import BASE_URL from '../config';
import {getDeviceInfo, loginToDevice, stopBackgroundTasks} from './DeviceSync';

// Enable SQLite debugging (optional, but useful for debugging)
//SQLite.DEBUG(true);
SQLite.enablePromise(true);

// Open the database
let db: SQLite.SQLiteDatabase;

const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const database = await SQLite.openDatabase({
      name: 'medipack.db',
      location: 'default',
    });

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
export const setupOperationsDatabase = async (): Promise<void> => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Error setting up the database:', error);
  }
};

export const getParcelByBarcode = async (
  parcelStatusId: number,
  barcode: string,
): Promise<Parcel> => {
  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT * FROM parcel_table WHERE parcelStatusId = ? and barcode = ?`,
        [parcelStatusId, barcode],
        (tx, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0));
          } else {
            resolve({
              syncId: '0',
              parcelId: 0,
              title: '',
              firstName: '',
              surname: '',
              dispatchRef: '',
              barcode: '',
              dueDate: '',
              cellphone: '',
              idNumber: '',
              dateOfBirth: '',
              gender: '',
              consignmentNo: '',
              scanInDatetime: '',
              passcode: '',
              scanInByUserId: 0,
              loggedInDatetime: '',
              scanOutDatetime: '',
              scanOutByUserId: 0,
              parcelStatusId: 0,
              deviceId: 0,
              facilityId: 0,
              dirtyFlag: 0,
              parcelStatus: false,
            });
          }
        },
        error => {
          console.error('Error fetching parcel by barcode:', error);
          reject(error);
        },
      );
    });
  });
};

export const fetchParcels = async (id: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(txn => {
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
        error => {
          console.error('Error fetching parcels:', error);
          reject(error);
        },
      );
    });
  });
};

export const fetchParcelsByStatusAndDueDate = async (
  parcelStatusId: number,
  dueDate: string,
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT * FROM parcel_table 
         WHERE parcelStatusId = ? 
         AND DATE(datetime(dueDate, 'localtime')) = ?`,
        [parcelStatusId, dueDate],
        (tx, results) => {
          let parcels = [];
          for (let i = 0; i < results.rows.length; i++) {
            parcels.push(results.rows.item(i));
          }

          resolve(parcels);
        },
        error => {
          console.error(
            'Error fetching parcels by status and due date:',
            error,
          );
          reject(error);
        },
      );
    });
  });
};

export const fetchParcelsFromLastWeek = async (id: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    db.transaction(txn => {
      txn.executeSql(
        'SELECT * FROM parcel_table WHERE parcelStatusId = ? AND scanOutDatetime BETWEEN ? AND ?',
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
        error => {
          console.error('Error fetching parcels:', error);
          reject(error);
        },
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
  passcode: string,
): Promise<void> => {
  const db = openDatabase();
  const scanInDatetime = new Date().toISOString();

  try {
    await (
      await db
    ).transaction(async txn => {
      txn.executeSql(
        `UPDATE parcel_table SET 
            ${scanDateTimeType} = ?, 
            ${scanUsertype} = ?, 
            parcelStatusId = ?, 
            passcode = ?, 
            dirtyFlag = ? 
          WHERE syncId = ?`,
        [scanInDatetime, userId, parcelStatusId, passcode, 2, parcel.syncId],
        () => {},
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

export const fetchDirtyParcels = async (): Promise<ParcelUpdate[]> => {
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
        },
      );
    });
  });
};

export const getSmsDataWithDirtyFlag = async (): Promise<
  {
    SyncId: string;
    ParcelId: number;
    Cellphone: string;
    SmsCreatedDatetime: string;
    deviceId: number;
    facilityId: number;
    SmsTypeId: number;
  }[]
> => {
  try {
    const smsDataArray: {
      SyncId: string;
      ParcelId: number;
      Cellphone: string;
      SmsCreatedDatetime: string;
      deviceId: number;
      facilityId: number;
      SmsTypeId: number;
    }[] = [];

    await db.transaction(async (txn: Transaction) => {
      await txn.executeSql(
        `SELECT syncId, parcelId, cellphone, smsCreatedDateTime, deviceId, facilityId, smsTypeId 
         FROM sms_table 
         WHERE dirtyFlag != ?`,
        [0],
        (_, result) => {
          const rows = result.rows;
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            smsDataArray.push({
              SyncId: row.syncId,
              ParcelId: row.parcelId,
              Cellphone: row.cellphone,
              SmsCreatedDatetime: row.smsCreatedDateTime,
              deviceId: row.deviceId,
              facilityId: row.facilityId,
              SmsTypeId: row.smsTypeId,
            });
          }
        },
      );
    });
    //console.log('SMS data array: line 295', smsDataArray);
    return smsDataArray;
  } catch (error) {
    console.error('Error retrieving SMS data:', error);
    throw error;
  }
};

export const deleteSmsRecordsWithDirtyFlag = async (
  apiResponse: {
    syncId: string;
    parcelId: number;
    Cellphone: string | null;
    SmsCreatedDatetime: string;
    deviceId: number;
    facilityId: number;
    SmsTypeId: number;
    dirtyFlag: number;
  }[],
): Promise<{SyncId: string; Status: boolean}[]> => {
  const deleteStatus: {SyncId: string; Status: boolean}[] = [];

  try {
    // Filter the API response to get only the records with dirtyFlag = 3
    const recordsToDelete = apiResponse.filter(
      record => record.dirtyFlag === 3,
    );

    console.log('records to delete line 348', recordsToDelete);

    await db.transaction((txn: Transaction) => {
      for (const record of recordsToDelete) {
        console.log('record to delete line 352', record);
        txn.executeSql(
          `DELETE FROM sms_table WHERE syncId = ?`,
          [record.syncId],
          (tx, result) => {
            // Check if any row was affected (deleted)
            if (result.rowsAffected > 0) {
              deleteStatus.push({SyncId: record.syncId, Status: true});
            } else {
              // Record not found
              deleteStatus.push({SyncId: record.syncId, Status: true});
            }
            console.log('delted status line 361', deleteStatus);
          },
          (tx, error) => {
            console.error(
              `Error deleting record with syncId ${record.syncId}:`,
              error,
            );
            deleteStatus.push({SyncId: record.syncId, Status: false});
          },
        );
      }
    });
  } catch (error) {
    console.error('Error during transaction:', error);
    throw error;
  }

  return deleteStatus;
};

export const updateDirtyFlag = async (
  parcelStatus: Array<{syncId: string; status: boolean}>,
) => {
  try {
    await db.transaction(async (txn: Transaction) => {
      for (const parcel of parcelStatus) {
        if (parcel.status) {
          await txn.executeSql(
            `UPDATE parcel_table SET dirtyFlag = 0 WHERE syncId = ?`,
            [parcel.syncId],
            () => {},
            (txn, error) => {
              console.error(
                `Failed to update dirtyFlag for syncId: ${parcel.syncId}`,
                error,
              );
              return false;
            },
          );
        }
      }
    });
  } catch (error) {
    console.error('Error updating dirtyFlag:', error);
    throw error;
  }
};

export const updateSmsRecordsDirtyFlag = async (
  smsStatus: Array<{syncId: string; status: boolean}>,
) => {
  try {
    await db.transaction(async (txn: Transaction) => {
      for (const sms of smsStatus) {
        if (sms.status) {
          await txn.executeSql(
            `UPDATE sms_table SET dirtyFlag = 0 WHERE syncId = ?`,
            [sms.syncId],
            () => {},
            (txn, error) => {
              console.error(
                `Failed to update dirtyFlag for syncId: ${sms.syncId}`,
                error,
              );
              return false;
            },
          );
        }
      }
    });
  } catch (error) {
    console.error('Error updating dirtyFlag:', error);
    throw error;
  }
};

export const insertSelectedParcelData = async (parcelData: any) => {
  try {
    db.transaction((txn: Transaction) => {
      txn.executeSql(
        `INSERT INTO selected_parcel_table 
          (syncId, 
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
           dirtyFlag) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parcelData.syncId,
          parcelData.parcelId,
          parcelData.title,
          parcelData.firstName,
          parcelData.surname,
          parcelData.dispatchRef,
          parcelData.barcode,
          parcelData.dueDate,
          parcelData.cellphone,
          parcelData.idNumber,
          parcelData.dateOfBirth,
          parcelData.gender,
          parcelData.consignmentNo,
          parcelData.scanInDatetime,
          parcelData.passcode,
          parcelData.scanInByUserId,
          parcelData.loggedInDatetime,
          parcelData.scanOutDatetime,
          parcelData.scanOutByUserId,
          parcelData.parcelStatusId,
          parcelData.deviceId,
          parcelData.facilityId,
          parcelData.dirtyFlag,
        ],
        (tx, result) => {
          console.log('Data inserted successfully:', result); // Confirm insertion
        },
        (tx, error) => {
          console.error(
            'Error inserting data into selected_parcel_table:',
            error,
          ); // Log errors if insertion fails
        },
      );
    });
  } catch (error) {
    console.error('Transaction error in insertSelectedParcelData:', error);
  }
};

export const fetchSelectedParcels = async (id: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'SELECT * FROM selected_parcel_table WHERE parcelStatusId = ?',
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
        error => {
          console.error('Error fetching parcels:', error);
          reject(error);
        },
      );
    });
  });
};

export const updateParcelStatus = async (
  syncId: string,
  newParcelStatusId: number,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'UPDATE selected_parcel_table SET parcelStatusId = ? WHERE syncId = ?',
        [newParcelStatusId, syncId],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log(
              `Parcel status updated successfully for syncId: ${syncId}`,
            );
            resolve();
          } else {
            console.warn(`No parcel found with syncId: ${syncId}`);
            reject(`No parcel found with syncId: ${syncId}`);
          }
        },
        error => {
          console.error('Error updating parcel status:', error);
          reject(error);
        },
      );
    });
  });
};

export const deleteAllParcelsFromSelectedTable = async (): Promise<void> => {
  try {
    await db.transaction(async (txn: Transaction) => {
      await txn.executeSql(`DELETE FROM selected_parcel_table`, [], () => {
        console.log('All parcels deleted successfully');
      });
    });
  } catch (error) {
    console.error('Error deleting all parcels from table:', error);
    throw error;
  }
};

export const sendDataToApi = async (data: any) => {
  const deviceInfo = await getDeviceInfo();
  const authToken = await AsyncStorage.getItem('AuthToken');
  const deviceId = deviceInfo?.deviceId;

  console.log('Data to send line 366:', data);

  try {
    const response = await axios.post(
      `${BASE_URL}/sync/updateclouddata`,
      data,
      {
        headers: {
          deviceId: deviceId,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    console.log('Response data status 379:', response.status);

    const {parcelStatus, smsStatus} = response.data;
    console.log('updated response data', response.data);
    if (parcelStatus && parcelStatus.length > 0) {
      await updateDirtyFlag(parcelStatus);
    }

    if (smsStatus && smsStatus.length > 0) {
      await updateSmsRecordsDirtyFlag(smsStatus);
    }
  } catch (error: any) {
    if (error.response.status === 401 || error.response.status === 400) {
      loginToDevice();
    } else {
      console.error('Error sending data to API:', error);
    }
  }
};

export const deregisterDevice = async (navigation: any): Promise<boolean> => {
  const deviceInfo = await getDeviceInfo();
  const devicePassword = deviceInfo?.devicePassword;
  const userInfo = await getUserInfo();
  const userId = userInfo?.userId;

  if (!devicePassword) {
    Alert.alert('Error', 'Device not registered, device password not found');
    return false;
  }

  const deviceId = deviceInfo?.deviceId;
  if (!deviceId) {
    Alert.alert('Error', 'Device not registered, device id not found');
    return false;
  }

  let macAddress = await DeviceInfo.getMacAddress();
  if (!macAddress) {
    macAddress = '02:00:00:00:00:00';
  }

  const authToken = await AsyncStorage.getItem('AuthToken');
  if (!authToken) {
    Alert.alert('Error', 'Auth token not found, please login first');
    return false;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/device/deregistration`,
      {},
      {
        headers: {
          deviceId: deviceId,
          devicePassword: devicePassword,
          userId: userId,
          macAddress: macAddress,
          Authorization: 'Bearer ' + authToken,
        },
      },
    );

    if (response.status === 200 && response.data === true) {
      Alert.alert('Success', 'Device deregistered successfully');
      await AsyncStorage.removeItem('DeviceInfo');
      await AsyncStorage.removeItem('AuthToken');
      await AsyncStorage.removeItem('UserInfo');
      await stopBackgroundTasks();
      await deleteDatabase();
      navigation.replace('DeviceRegistrationScreen' as any);
      return true;
    } else {
      Alert.alert('Error', 'Failed to deregister device');
      return false;
    }
  } catch (error: any) {
    if (error.response.status === 401 || error.response.status === 400) {
      loginToDevice();
    }
    console.error('Error deregistering device:', error);
    return false;
  }
};

export const deleteDatabase = async (): Promise<void> => {
  try {
    // Open the database and wait for the promise to resolve
    const db = await SQLite.openDatabase({
      name: 'medipack.db',
      location: 'default',
    });

    // Close the database before deleting it
    await new Promise<void>((resolve, reject) => {
      db.close(
        () => {
          console.log('Database closed successfully');
          resolve();
        },
        error => {
          console.error('Error closing database:', error);
          reject(error);
        },
      );
    });

    // Now attempt to delete the database
    await new Promise<void>((resolve, reject) => {
      SQLite.deleteDatabase(
        {
          name: 'medipack.db',
          location: 'default',
        },
        () => {
          console.log('Database deleted successfully');
          resolve();
        },
        error => {
          console.error('Error deleting database:', error);
          reject(error);
        },
      );
    });
  } catch (error) {
    console.error('Error handling database operations:', error);
    throw error;
  }
};
