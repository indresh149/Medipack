import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
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
  startBackgroundTasks,
} from '../../../database/DeviceSync';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import IconCamera from 'react-native-vector-icons/AntDesign';

const {height, width} = Dimensions.get('window');

const DeviceRegistrationScreen: React.FC = () => {
  const toast = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();
  const [registrationKey, setRegistrationKey] = React.useState('');
  const [openCamera, setopenCamera] = React.useState(false);

  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const device = useCameraDevice('back');
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['code-128', 'code-39', 'code-93'],
    onCodeScanned: codes => {
      if (codes[0].value) {
        setRegistrationKey(codes[0].value);
        setopenCamera(false);
      }
    },
  });

  useEffect(() => {
    async function initializeAllDb() {
      await createDatabase();
      await setupDatabase();
      await setupOperationsDatabase();
    }
    initializeAllDb();
  }, []);

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
       
          await loginToDevice();
        

          await startBackgroundTasks(navigation);
       
          setModalVisible(false);
          navigation.replace('LoginScreen');
        }
      }
    } catch (error: any) {
      setModalVisible(false);
      if (error.response.status === 401) {
        toast.show('Invalid Registration Key', {
          type: 'danger',
          placement: 'top',
          duration: 5000,
          animationType: 'slide-in',
        });
      } else {
        toast.show('Error registering device ' + error, {
          type: 'danger',
          placement: 'top',
          duration: 5000,
          animationType: 'slide-in',
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView contentContainerStyle={styles.container}>
      {openCamera && device != null && hasPermission && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={openCamera}
          onRequestClose={() => setopenCamera(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                isActive={hasInitialized}
                photo={true}
                device={device}
                pixelFormat="yuv"
                codeScanner={codeScanner}
                photoQualityBalance={'speed'}
                onInitialized={() => {
                  setHasInitialized(true);
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      <View style={styles.mainView}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />

       
          <View style={styles.header}>
            <Text style={styles.headerText}>Device Registration</Text>
          </View>
          
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
              style={styles.cameraIcon}
              onPress={() => setopenCamera(true)}>
              <IconCamera
                name="camera"
                size={RFPercentage(3)}
                color={Colors.green}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRegister} style={styles.button}>
              <Text style={styles.buttonText}>Register Device</Text>
            </TouchableOpacity>
          
        </View>

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
      
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  mainView: {
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',

  },
  overlay: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',

    backgroundColor: Colors.white,
  },
  header: {
    width: '100%',
    height: height * 0.08,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    //alignContent: 'center',
  },
  headerText: {
    color: Colors.white,
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
  },
  
  logo: {
    width: '80%',
    height: '25%',
    marginBottom: height * 0.05,
    marginTop: height * 0.05,
  },
  input: {
    width: '50%',
    borderColor: Colors.green,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: height * 0.02,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.3,
    height: height * 0.2,
    padding: 20,
  },
  cameraIcon: {
    marginBottom: height * 0.02,
  },
});

export default DeviceRegistrationScreen;
