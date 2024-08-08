import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import {Colors} from '../../../constants/colours';
import { RFPercentage } from 'react-native-responsive-fontsize';

const {height, width} = Dimensions.get('window');
const PasswordResetScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <View style={styles.overlay}>
        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/LogoIcon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Request Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              placeholderTextColor="#555"
              keyboardType="email-address"
            />
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Request Password</Text>
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
    height: height * 0.1,
    backgroundColor: Colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  headerText: {
    color: Colors.white,
    fontSize: RFPercentage(2.5),
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
  title: {
    fontSize: 20,
    color: '#000',
    marginBottom:height * 0.05,
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
    marginBottom: 10,
    color: Colors.white,
  },
  button: {
    width: '50%',
    backgroundColor: Colors.green,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color:  Colors.white,
    fontSize: RFPercentage(1.5),
    fontWeight: 'bold',
  },
});

export default PasswordResetScreen;
