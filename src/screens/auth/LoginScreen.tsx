import {useNavigation} from '@react-navigation/native';
import React, { useState} from 'react';
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
import {RFPercentage} from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findUser, printAllUsers } from '../../../database/DeviceSync';



const {height, width} = Dimensions.get('window');
const LoginScreen = () => {
  const navigation = useNavigation();

  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async () => {
      if(identifier === '' || password === ''){
        setError('Please enter credentials');
        return;
      }

    try {
      await printAllUsers();
      const userExists = await findUser(identifier, password);
      console.log('userExists', userExists);
      if (userExists) {
        console.log('Login successful line 57');
        await AsyncStorage.setItem('UserInfo', JSON.stringify(userExists));
       

        console.log('Actual login set to true');
        navigation.navigate('MyDrawer' as never);
        console.log('Navigated to MyDrawer');
        // Navigate to the next screen or do whatever on successful login
      } else {
        setError('Invalid credentials');
        Alert.alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    }
  };

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

              handleLogin();
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
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFPercentage(1.5),
    fontWeight: 'bold',
  },
});

export default LoginScreen;
