import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ActivityIndicator,
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
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useToast} from 'react-native-toast-notifications';
import {Colors} from '../../../constants/colours';
import {findUser, printAllUsers} from '../../../database/DeviceSync';
import IconEye from 'react-native-vector-icons/FontAwesome5';

const {height, width} = Dimensions.get('window');
const LoginScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const toast = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (identifier === '' || password === '') {
        toast.show('Please enter all fields', {
          type: 'warning',
          placement: 'top',
          duration: 5000,
          animationType: 'slide-in',
        });
      return;
    }

    setModalVisible(true);

    try {
      await printAllUsers();
      const userExists = await findUser(identifier, password);

      if (userExists) {
        await AsyncStorage.setItem('UserInfo', JSON.stringify(userExists));

        setModalVisible(false);
        navigation.replace('MyDrawer' as any);
        toast.show('Logged in successfully', {
          type: 'success',
          placement: 'top',
          duration: 5000,

          animationType: 'slide-in',
        });
      } else {
        setModalVisible(false);
        setError('Invalid credentials');
        toast.show('Invalid credentials, Please check again', {
          type: 'warning',
          placement: 'top',
          duration: 5000,

          animationType: 'slide-in',
        });
      }
    } catch (err) {
      setModalVisible(false);
      console.error('Login error:', err);
      setError('An error occurred during login');
    }
  };

  return (
    <KeyboardAvoidingView contentContainerStyle={styles.container}>
      <View style={styles.mainView}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerText}>Login</Text>
      </View>

      <Image
        source={require('../../../assets/images/LogoIcon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="User ID / Cellphone / Email"
          value={identifier}
          onChangeText={setIdentifier}
          placeholderTextColor="#555"
          keyboardType="email-address"
        />
        <View style={styles.inputContainerPassword}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#555"
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}>
            <IconEye
              name={passwordVisible ? 'eye' : 'eye-slash'}
              size={24}
              color="#555"
            />
          </TouchableOpacity>
          </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          handleLogin();
        }}
        style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

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

  header: {
    width: '100%',
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
 
  logo: {
    width: '60%',
    height: '15%',
    marginBottom: height * 0.05,
    marginTop: height * 0.05,
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
    color: Colors.black,
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
    marginBottom: 40,
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
  eyeIcon: {
    paddingHorizontal: 10,
  },
  inputContainerPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
});

export default LoginScreen;
