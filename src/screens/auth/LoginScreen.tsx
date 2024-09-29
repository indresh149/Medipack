import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
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

const {height, width} = Dimensions.get('window');
const LoginScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const toast = useToast();

  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (identifier === '' || password === '') {
      setError('Please enter credentials');
      return;
    }

    setModalVisible(true);

    try {
      await printAllUsers();
      const userExists = await findUser(identifier, password);
      // console.log('userExists', userExists);
      if (userExists) {
        // console.log('Login successful line 57');
        await AsyncStorage.setItem('UserInfo', JSON.stringify(userExists));

        // console.log('Actual login set to true');
        setModalVisible(false);
        navigation.replace('MyDrawer' as any);
        toast.show('Logged in successfully', {
          type: 'success',
          placement: 'top',
          duration: 5000,

          animationType: 'slide-in',
        });
        // console.log('Navigated to MyDrawer');
        // Navigate to the next screen or do whatever on successful login
      } else {
        setModalVisible(false);
        setError('Invalid credentials');
        toast.show('Invalid credentials, Please check again', {
          type: 'warning',
          placement: 'top',
          duration: 5000,

          animationType: 'slide-in',
        });
        // Alert.alert('Invalid credentials');
      }
    } catch (err) {
      setModalVisible(false);
      console.error('Login error:', err);
      setError('An error occurred during login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#555"
          secureTextEntry
        />
      </View>
      {/* <View style={styles.checkboxContainer}>
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
          </View> */}
      <TouchableOpacity
        onPress={() => {
          // navigation.navigate('DeviceRegistrationScreen' as never);

          handleLogin();
        }}
        style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.white,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '60%',
    height: '20%',
    marginBottom: height * 0.05,
    marginTop: height * 0.01,
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
});

export default LoginScreen;
