import SQLite, {ResultSet, Transaction} from 'react-native-sqlite-storage';

// Open the database
// Enable SQLite debugging (optional, but useful for debugging)
// SQLite.DEBUG(true);
SQLite.enablePromise(true);
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

export const createDatabase = async (): Promise<void> => {
  try {
    await initializeDatabase();
    await createDeviceTable();
    await createUserTable();
    await createParcelTable();
    await createSmsTable();
  } catch (error) {
    console.error('Error setting up the database:', error);
  }
};

// Function to create the device table
export const createDeviceTable = async () => {
  try {
    await db.transaction(async (txn: Transaction) => {
      await txn.executeSql(
        `CREATE TABLE IF NOT EXISTS device_table (
          Id INTEGER PRIMARY KEY,
          DeviceName VARCHAR(100),
          DeviceType VARCHAR(50),
          DeviceModel VARCHAR(50),
          SerialNumber VARCHAR(50),
          FacilityId INTEGER,
          FacilityName VARCHAR(100),
          PartnerName VARCHAR(100),
           DeviceStatusId INTEGER,
          DevicePassword VARCHAR(100),
          SyncIntervalInSec INTEGER
        )`,
        [],
        () => {
          //  console.log('Device table created successfully');
        },
        error => {
          console.error('Error creating table:', error);
          return true;
        },
      );
    });
  } catch (error) {
    console.error('Error in transaction:', error);
  }
};

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
          dirtyFlag INTEGER
        )`,
        [],
        () => {
          //  console.log('User table created successfully');
        },
      );
    });
  } catch (error) {
    console.error('Error creating user table:', error);
    throw error;
  }
};

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
          dirtyFlag INTEGER
        )`,
        [],
        () => {
          //  console.log('Parcel table created successfully');
        },
      );
    });
  } catch (error) {
    console.error('Error creating parcel table:', error);
    throw error;
  }
};

export const createSmsTable = async (): Promise<void> => {
  try {
    await db.transaction(async (txn: Transaction) => {
      await txn.executeSql(
        `CREATE TABLE IF NOT EXISTS sms_table (
          syncId VARCHAR(50) PRIMARY KEY,
          parcelId BIGINT,
          cellphone VARCHAR(50),
          smsCreatedDateTime DATETIME,
          deviceId INTEGER,
          facilityId INTEGER,
          smsTypeId INTEGER,
          dirtyFlag INTEGER
        )`,
        [],
        () => {
          console.log('SMS table created successfully');
        },
      );
    });
  } catch (error) {
    console.error('Error creating SMS table:', error);
    throw error;
  }
};

interface SmsData {
  syncId: string;
  parcelId: number;
  cellphone: string;
  smsCreatedDateTime: string; // Use a string or Date object depending on how you're passing the date
  deviceId: number;
  facilityId: number;
  smsTypeId: number;
  dirtyFlag: number;
}

export const insertSmsData = async (smsData: SmsData): Promise<void> => {
  try {
    await db.transaction(async (txn: Transaction) => {
      await txn.executeSql(
        `INSERT INTO sms_table (
          syncId,
          parcelId,
          cellphone,
          smsCreatedDateTime,
          deviceId,
          facilityId,
          smsTypeId,
          dirtyFlag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          smsData.syncId,
          smsData.parcelId,
          smsData.cellphone,
          smsData.smsCreatedDateTime,
          smsData.deviceId,
          smsData.facilityId,
          smsData.smsTypeId,
          smsData.dirtyFlag,
        ],
        () => {
          console.log('SMS data inserted successfully');
        },
      );
    });
  } catch (error) {
    console.error('Error inserting SMS data:', error);
    throw error;
  }
};

// Function to insert device data into the table
export const insertDeviceData = async (deviceData: any) => {
  try {
    (await db).transaction((txn: Transaction) => {
      txn.executeSql(
        `INSERT INTO device_table 
          (Id, DeviceName, DeviceType, DeviceModel, SerialNumber, FacilityId, FacilityName, PartnerName,DeviceStatusId, DevicePassword, SyncIntervalInSec) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deviceData.id,
          deviceData.deviceName,
          deviceData.deviceType,
          deviceData.deviceModel,
          deviceData.serialNumber,
          deviceData.facilityId,
          deviceData.facilityName,
          deviceData.partnerName,
          deviceData.deviceStatusId,
          deviceData.devicePassword,
          deviceData.syncIntervalInSec,
        ],
        (tx: Transaction, result: ResultSet) => {
          //  console.log('Device data inserted successfully');
        },
        error => {
          console.error('Error inserting device data:', error);
          return true;
        },
      );
    });
  } catch (error) {
    console.error('Error in transaction:', error);
  }
};

export const getDeviceInfoFromDatabase = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT Id,DeviceName,DeviceType,DeviceModel,SerialNumber,
        FacilityId,FacilityName,PartnerName,DevicePassword,SyncIntervalInSec  
        FROM device_table`,
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0));
          } else {
            resolve(null);
          }
        },
        (tx, error) => {
          reject(error);
        },
      );
    });
  });
};

// Function to query device data (optional, for demonstration)
export const getDeviceData = async () => {
  try {
    (await db).transaction((txn: Transaction) => {
      txn.executeSql(
        `SELECT * FROM device_table`,
        [],
        (tx: Transaction, result: ResultSet) => {
          let len = result.rows.length;
          if (len > 0) {
            for (let i = 0; i < len; i++) {
              let row = result.rows.item(i);
              //    console.log(`Device ${i + 1}:`, row);
            }
          } else {
            //  console.log('No devices found');
          }
        },
        error => {
          console.error('Error querying device data:', error);
          return true;
        },
      );
    });
  } catch (error) {
    console.error('Error in transaction:', error);
  }
};
