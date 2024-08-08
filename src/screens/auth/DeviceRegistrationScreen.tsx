import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import SQLite, {ResultSet, Transaction} from 'react-native-sqlite-storage';
import {Colors} from '../../../constants/colours';
import {RFPercentage} from 'react-native-responsive-fontsize';
import axios from 'axios';
import BASE_URL from '../../../config';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabase({
  name: 'DeviceDatabase.db',
  location: 'default',
});

const {height, width} = Dimensions.get('window');
const DeviceRegistrationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [registrationKey, setRegistrationKey] = useState('');

  const registerDevice = async () => {
    if(!registrationKey){
      Alert.alert('Alert', 'Please enter registration key');
      return;
    }
    try {
    
      let macAddress = await DeviceInfo.getMacAddress();
      if(!macAddress){
        macAddress = '02:00:00:00:00:00'
      }
       console.log('macAddress', macAddress);
      
     
      const headers = {
        'registrationKey': registrationKey,
        'macAddress': macAddress,
      };

    
      const response = await axios.post(
        `${BASE_URL}/device/registerdevice`,
        {}, 
        { headers }
      );

      
      if(response.status === 200){
         if(response.data.devicePassword){
          Alert.alert('Success', 'Device registered successfully');
          await AsyncStorage.setItem('DevicePassword', response.data.devicePassword);
          await AsyncStorage.setItem('DeviceId', response.data.id.toString());
          navigation.navigate('LoginScreen');
         
         }
       
      }
    } catch (error) {
       Alert.alert('Error', 'Error registering device, error: ' + error);
    }
  };
  
  const createDeviceTable = async () => {
    try {
      await new Promise<void>(async (resolve, reject) => {
        (await db).transaction((txn: Transaction) => {
          txn.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='device_table'",
            [],
            (tx: Transaction, res: ResultSet) => {
              console.log('item: table device_table', res.rows.length);
              if (res.rows.length === 0) {
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
                    console.log(' device table  created successfully');
                    resolve();
                  },
                  error => {
                    console.error('Error creating table:', error);
                    reject(error);
                    return true;
                  },
                );
              } else {
                resolve();
              }
            },
            error => {
              console.error('Error checking table existence:', error);
              reject(error);
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
    createDeviceTable();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Device Registration</Text>
        </View>
        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/LogoIcon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Registration Key"
            placeholderTextColor="#555"
            value={registrationKey}
            onChangeText={text => setRegistrationKey(text)}
          />
          <TouchableOpacity
            onPress={() => {
               registerDevice();
            }}
            style={styles.button}>
            <Text style={styles.buttonText}>Register Device</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: height * 0.08,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  headerText: {
    color: Colors.white,
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: '30%',
    marginBottom: height * 0.05,
  },
  input: {
    width: '50%',
    borderColor: Colors.green,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: height * 0.05,
    color: Colors.black,
  },
  button: {
    width: '50%',
    backgroundColor: Colors.green,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFPercentage(1.5),
    fontWeight: 'bold',
  },
});

export default DeviceRegistrationScreen;
