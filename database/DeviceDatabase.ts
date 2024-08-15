import SQLite, { Transaction, ResultSet } from 'react-native-sqlite-storage';

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



// Function to create the device table
export const createDeviceTable = async () => {
  try {
    (await db).transaction((txn: Transaction) => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS device_table (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          DeviceName VARCHAR(100),
          DeviceType VARCHAR(50),
          DeviceModel VARCHAR(50),
          SerialNumber VARCHAR(50),
          FacilityId INTEGER,
          FacilityName VARCHAR(100),
          PartnerName VARCHAR(100),
          AuthToken VARCHAR(100),
          TokenExpireDatetime DATETIME,
          SyncIntervalInSec INTEGER,
          isActive BOOLEAN,
          DirtyFlag INTEGER
        )`,
        [],
        () => {
          console.log('Device table created successfully');
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

export const setupDeviceDatabase = async (): Promise<void> => {
  try {
    await initializeDatabase();
    await createDeviceTable();
  } catch (error) {
    console.error('Error setting up the database:', error);
  }
};

// Function to insert device data into the table
export const insertDeviceData = async (deviceData: any) => {
  try {
    (await db).transaction((txn: Transaction) => {
      txn.executeSql(
        `INSERT INTO device_table 
          (Id, DeviceName, DeviceType, DeviceModel, SerialNumber, FacilityId, FacilityName, PartnerName, AuthToken, TokenExpireDatetime, SyncIntervalInSec, isActive, DirtyFlag) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deviceData.id,
          deviceData.deviceName,
          deviceData.deviceType,
          deviceData.deviceModel,
          deviceData.serialNumber,
          deviceData.facilityId,
          deviceData.facilityName,
          deviceData.partnerName,
          deviceData.devicePassword, // Assuming AuthToken is stored in devicePassword
          new Date().toISOString(),  // Assuming TokenExpireDatetime is current time
          deviceData.syncIntervalInSec,
          1, // Assuming isActive is true
          0  // Assuming DirtyFlag is 0
        ],
        (tx: Transaction, result: ResultSet) => {
          console.log('Device data inserted successfully');
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
              console.log(`Device ${i + 1}:`, row);
            }
          } else {
            console.log('No devices found');
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