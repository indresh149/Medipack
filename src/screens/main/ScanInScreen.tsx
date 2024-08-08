import {
  View,
  Text,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useEffect} from 'react';
import {Colors} from '../../../constants/colours';
import {Card} from '@rneui/themed';
import {TextInput} from 'react-native-gesture-handler';
import {RFPercentage} from 'react-native-responsive-fontsize';
import SQLite, {ResultSet, Transaction} from 'react-native-sqlite-storage';
import {useNavigation, NavigationProp} from '@react-navigation/native';

// Enable debugging (optional)
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const db = SQLite.openDatabase({
  name: 'ParcelDatabase.db',
  location: 'default',
});

const {height, width} = Dimensions.get('window');
const ScanInScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const createParcelsTable = async () => {
    try {
      await new Promise<void>(async (resolve, reject) => {
        (await db).transaction((txn: Transaction) => {
          txn.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='Parcels'",
            [],
            (tx: Transaction, res: ResultSet) => {
              console.log('Number of tables found Parcels:', res.rows.length); // Logs the number of tables found
              if (res.rows.length === 0) {
                txn.executeSql(
                  `CREATE TABLE IF NOT EXISTS Parcels (
                      Id INTEGER  PRIMARY KEY AUTOINCREMENT,
                      Barcode VARCHAR(50),
                      Manifest VARCHAR(50),
                      PatientFirstName VARCHAR(50),
                      PatientSurname VARCHAR(50),
                      PatientCellphone VARCHAR(50),
                      PatientIdNumber VARCHAR(50),
                      DueDate DATETIME,
                      Passcode VARCHAR(10),
                      LoaderCellphone VARCHAR(30),
                      LastModifiedByCellphone VARCHAR(30),
                      ScanInDatetime DATETIME,
                      LoggedInDatetime DATETIME,
                      ScanOutDatetime DATETIME,
                      DeviceId INT,
                      FacilityId INT,
                      StatusId INT,
                      Dirtyflag INT
                    )`,
                  [],
                  () => {
                    console.log('Parcels table created successfully');
                    resolve();
                  },
                  txError => {
                    console.error('Error creating Parcels table:', txError);
                    reject(txError);
                    return true;
                  },
                );
              } else {
                console.log('Parcels table already exists');
                resolve();
              }
            },
            queryError => {
              console.error(
                'Error checking Parcels table existence:',
                queryError,
              );
              reject(queryError);
              return true;
            },
          );
        });
      });
    } catch (error) {
      console.error('Error in transaction:', error);
    }
  };

  useEffect(() => {
    createParcelsTable();
  }, []);

  return (
    <View style={styles.mainView}>
      <Card containerStyle={styles.cardView}>
        <View style={styles.inputTextContainer}>
          <TextInput style={styles.textInputView} placeholder="Enter Barcode" />
          <TouchableOpacity style={styles.buttomView}>
            <Text style={styles.buttonText}>Scan Manual</Text>
          </TouchableOpacity>
        </View>
      </Card>
      <View style={styles.patientInfoContainer}>
        <View style={styles.leftContainer}>
          <Text style={styles.patientInfoText}>Patient Surname: THUKWANA</Text>
          <Text style={styles.patientInfoText}>Patient Name: LINAH</Text>
          <Text style={styles.patientInfoText}>
            Patient ID Number: 7302270389086
          </Text>
          <Text style={styles.patientInfoText}>
            Parcel Due Date: 2017-10-25T00:00:00
          </Text>
          <Text style={styles.patientInfoText}>
            Patient Cellphone: 0764554196
          </Text>
          <Text style={styles.patientInfoText}>
            Patient NHI Number: NHI57B82A011
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>❌</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>✔️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  cardView: {
    margin: 20,
    width: '97%',
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  inputTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputView: {
    width: '20%',
    height: height * 0.08,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderBottomWidth: 1,
    margin: 10,
    paddingLeft: 10,
  },
  buttomView: {
    width: '15%',
    height: height * 0.08,
    backgroundColor: Colors.green,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFPercentage(1.5),
  },
  patientInfoContainer: {
    margin: 20,
    flexDirection: 'row',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    padding: 10,
    marginBottom:height * 0.2,
  },
  patientInfoText: {
    color: Colors.black,
    fontSize: RFPercentage(1.5),
    marginBottom: height * 0.02,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.2,
    marginLeft: width * 0.5,
  },
  actionButton: {
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.2,
  },
  leftContainer: {
    marginLeft: width * 0.05,
  },
});

export default ScanInScreen;
