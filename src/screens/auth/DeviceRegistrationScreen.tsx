import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useToast} from 'react-native-toast-notifications';
import BASE_URL from '../../../config';
import {Colors} from '../../../constants/colours';
import {setupOperationsDatabase} from '../../../database/DatabseOperations';
import {
  createDatabase,
  insertDeviceData,
} from '../../../database/DeviceDatabase';
import {
  loginToDevice,
  setupDatabase,
  //getSyncData,
  startBackgroundTasks,
} from '../../../database/DeviceSync';

const {height, width} = Dimensions.get('window');

const DeviceRegistrationScreen: React.FC = () => {
  const toast = useToast();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function initializeAllDb() {
      await createDatabase();
      await setupDatabase();
      await setupOperationsDatabase();
    }
    initializeAllDb();
  }, []);
  const navigation = useNavigation<NavigationProp<any>>();
  const [registrationKey, setRegistrationKey] = React.useState('');

  const handleRegister = () => {
    registerDevice(navigation, registrationKey);
  };

  const registerDevice = async (navigation: any, registrationKey: string) => {
    setModalVisible(true);
    if (!registrationKey) {
      Alert.alert('Alert', 'Please enter registration key');
      setModalVisible(false);
      return;
    }
    try {
      let macAddress = await DeviceInfo.getMacAddress();
      if (!macAddress) {
        macAddress = '02:00:00:00:00:00';
      }
      console.log('macAddress', macAddress);

      const headers = {
        registrationKey: registrationKey,
        macAddress: macAddress,
      };

      const response = await axios.post(
        `${BASE_URL}/device/registerdevice`,
        {},
        {headers},
      );

      if (response.status === 200) {
        if (response.data.devicePassword) {
          toast.show('Device Registered successfully', {
            type: 'success',
            placement: 'top',
            duration: 5000,

            animationType: 'slide-in',
          });

          const deviceInfo = {
            userId: response.data.id.toString(),
            devicePassword: response.data.devicePassword,
            deviceId: response.data.id.toString(),
            facilityId: response.data.facilityId.toString(),
          };

          await AsyncStorage.setItem('DeviceInfo', JSON.stringify(deviceInfo));

          await insertDeviceData(response.data);
          console.log('Device data inserted and registered successfully');
          await loginToDevice();
          console.log('Logged in to device line 70 successfully');

          console.log('Tables created successfully');

          await startBackgroundTasks(navigation);
          console.log('Background tasks started successfully line 102');
          setModalVisible(false);
          navigation.navigate('LoginScreen');
        }
      }
    } catch (error) {
      setModalVisible(false);
      toast.show('Error registering device ' + error, {
        type: 'error',
        placement: 'top',
        duration: 5000,
        animationType: 'slide-in',
      });
    }
  };

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
          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Register Device</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for ActivityIndicator */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={Colors.green} />
          </View>
        </View>
      </Modal>
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
    alignContent: 'center',
    justifyContent: 'center',

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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: width * 0.3,
    height: height * 0.2,
    padding: 20,
  },
});

export default DeviceRegistrationScreen;
