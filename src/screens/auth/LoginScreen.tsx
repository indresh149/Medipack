import {useNavigation} from '@react-navigation/native';
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
import {Colors} from '../../../constants/colours';

import SQLite, {ResultSet, Transaction} from 'react-native-sqlite-storage';
import {RFPercentage} from 'react-native-responsive-fontsize';
import axios from 'axios';
import BASE_URL from '../../../config';
import DeviceInfo from 'react-native-device-info';
import BackgroundService from 'react-native-background-actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const db = SQLite.openDatabase({
  name: 'mydatabase.db',
  location: 'default',
});

const {height, width} = Dimensions.get('window');
const LoginScreen = () => {
  const navigation = useNavigation();

  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const loginToDevice = async () => {
    console.log('Logging in to device');
    const devicePassword = await AsyncStorage.getItem('DevicePassword');
    console.log('device password:', devicePassword);
    if (!devicePassword) {
      Alert.alert('Error', 'Device not registered, device password not found');
      return;
    }

    const deviceId = await AsyncStorage.getItem('DeviceId');
    console.log('device id:', deviceId);
    if(!deviceId){
      Alert.alert('Error', 'Device not registered, device id not found');
      return;
    }

    let macAddress = await DeviceInfo.getMacAddress();
    if(!macAddress){
      macAddress = '02:00:00:00:00:00'
    }
     console.log('macAddress', macAddress);


    try {
      const response = await axios.post(
        `${BASE_URL}/device/devicelogin`,
        {},
        {
          headers: {
            deviceId: deviceId,
            devicePassword: devicePassword,
            macAddress: macAddress,
          },
        }
      );
      console.log(response.data);
      console.log(response.status);
      if (response.status === 200) {
        if(response.data){
          await AsyncStorage.setItem('AuthToken', response.data);
          Alert.alert('Success', 'Logged in to device successfully');
          navigation.navigate('MyDrawer' as never);
        }
        
      }
     
    } catch (error) {
      console.error('Error logging in to device:', error);

    }
  };

  const createUsersTable = async () => {
    try {
      await new Promise<void>(async (resolve, reject) => {
        (await db).transaction((txn: Transaction) => {
          txn.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='Users'",
            [],
            (tx: Transaction, res: ResultSet) => {
              console.log('Item table users', res.rows.length);
              if (res.rows.length === 0) {
                txn.executeSql(
                  `CREATE TABLE IF NOT EXISTS Users (
                      Id INTEGER PRIMARY KEY AUTOINCREMENT,
                      FirstName VARCHAR(50),
                      Surname VARCHAR(50),
                      MiddleName VARCHAR(50),
                      LoginId VARCHAR(50),
                      Password VARCHAR(50),
                      Cellphone VARCHAR(50),
                      Email VARCHAR(100),
                      Gender VARCHAR(10),
                      FacilityRole VARCHAR(50),
                      RoleId INTEGER,
                      isActive BOOLEAN,
                      DirtyFlag INTEGER
                    )`,
                  [],
                  () => {
                    console.log('Users table created successfully');
                    resolve();
                  },
                  txError => {
                    console.error('Error creating Users table:', txError);
                    reject(txError);
                    return true;
                  },
                );
              } else {
                console.log('Users table already exists');
                resolve();
              }
            },
            queryError => {
              console.error(
                'Error checking Users table existence:',
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


  const sleep = (time: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

  // Define your task
  const fetchDataTask = async (taskDataArguments: any) => {
    const { delay } = taskDataArguments;
  
    // Infinite loop task
    await new Promise<void>(async (resolve) => {
      while (BackgroundService.isRunning()) {
        try {
          // Replace with your API endpoint and request details
          const response = await axios.get('https://your-api-endpoint.com/data');
          console.log('API response:', response.data);
        } catch (error) {
          console.error('API request error:', error);
        }
  
        await sleep(delay);
      }
    });
  };
  
  // Options for the background task
  const options = {
    taskName: 'API Fetcher',
    taskTitle: 'Fetching Data in Background',
    taskDesc: 'Running a background task to fetch data every 30 seconds.',
    taskIcon: {
      name: 'ic_launcher', // Icon name
      type: 'mipmap', // Icon type
    },
    color: '#ff00ff', // Notification color
    linkingURI: 'yourSchemeHere://chat/jane', // Deep linking URI
    parameters: {
      delay: 3000, // Delay of 30 seconds
    },
  };
  
  const startBackgroundService = async () => {
    try {
      console.log('Starting background service...');
      await BackgroundService.start(fetchDataTask, options);
  
      // Update the notification (only on Android)
      await BackgroundService.updateNotification({ taskDesc: 'Fetching data every 30 seconds...' });
    } catch (error) {
      console.error('Error starting background service:', error);
    }
  };
  
  const stopBackgroundService = async () => {
    try {
      console.log('Stopping background service...');
      await BackgroundService.stop();
    } catch (error) {
      console.error('Error stopping background service:', error);
    }
  };

  
  useEffect(() => {
    createUsersTable();
    // startBackgroundService();
    stopBackgroundService();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Login</Text>
        </View>
        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/LogoIcon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#555"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#555"
              secureTextEntry
            />
          </View>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={toggleCheckbox} style={styles.checkbox}>
              {isChecked && <View style={styles.checkboxTick} />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>Remember Me</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('PasswordResetScreen' as never);
              }}>
              <Text style={styles.requestPasswordText}>Request Password</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
             // navigation.navigate('DeviceRegistrationScreen' as never);
             loginToDevice();
            }}
            style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '60%',
    height: '20%',
    marginBottom: height * 0.05,
  },
  inputContainer: {
    width: '50%',
    marginBottom: height * 0.05,
  },
  input: {
    width: '100%',
    borderColor: Colors.green,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: height * 0.02,
    color: Colors.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  checkbox: {
    width: width * 0.01,
    height: height * 0.02,
    borderColor: Colors.green,
    borderWidth: 1,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: height * 0.02,
  },
  checkboxTick: {
    width: width * 0.005,
    height: height * 0.01,
    backgroundColor: Colors.green,
  },
  checkboxText: {
    marginLeft: 8,
    marginRight: 20,
    color: Colors.black,
  },
  requestPasswordText: {
    color: Colors.green,
    textDecorationLine: 'underline',
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

export default LoginScreen;
