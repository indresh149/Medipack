import React, {useContext, useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import {useNavigation} from '@react-navigation/native';
import { Colors } from '../../constants/colours';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

 import Ionicons from 'react-native-vector-icons/Ionicons';
 import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
 import axios from 'axios';
import BASE_URL from '../../config';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {height, width} = Dimensions.get('window');

const CustomDrawer = (props: any) => {
  const navigation = useNavigation();
  const [storedEmail, setStoredEmail] = useState("indreshgoswami149@gmail.com");
  const [storedFirstName, setStoredFirstName] = useState("Indresh");
  const [storedlastName, setStoredlastName] = useState("Goswami");

  useEffect(() => {
    async function fetchEmail() {
      // const storedEmail = await AsyncStorage.getItem('email');
      // const storedFirstName = await AsyncStorage.getItem('firstName');
      // const storedLastName = await AsyncStorage.getItem('lastName');
      // setStoredEmail(storedEmail);
      // setStoredFirstName(storedFirstName);
      // setStoredlastName(storedLastName);
    }
    fetchEmail();
  }, []);
  const handleEditProfilePress = () => {
    //  navigation.navigate('ProfileScreen');
  };

  const deregisterDevice = async () => {
    console.log('Deregistering device');
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

     const authToken = await AsyncStorage.getItem('AuthToken');
     console.log('auth token', authToken);
     if(!authToken){
        Alert.alert('Error', 'Auth token not found, please login first');
        return;
      }

    try {
      const response = await axios.post(
        `${BASE_URL}/device/deregistration`,
        {},
        {
          headers: {
            deviceId: deviceId,
            devicePassword: devicePassword,
            userId: '4',
            macAddress: macAddress,
            Authorization: 'Bearer ' + authToken,
          },
        }
      );
      console.log(response.data);
      if (response.status === 200 && response.data == true) {

        Alert.alert('Success', 'Device deregistered successfully');
        await AsyncStorage.removeItem('DevicePassword');
        await AsyncStorage.removeItem('DeviceId');
        await AsyncStorage.removeItem('AuthToken');
        navigation.navigate('DeviceRegistrationScreen' as never);
      }
    } catch (error) {
      console.error('Error deregistering device:', error);
    }
  };

  return (
    <View style={styles.drawerMainView}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: '#F3F3F4'}}>
       <View style={styles.upperDrawerView}>
          <Text style={styles.fullName}>{storedFirstName} {storedlastName}</Text>
          <Text style={styles.emailStyle}>{storedEmail}</Text>
       </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            paddingTop: 5,
            borderTopWidth: 1,
            borderTopColor: '#1B75BB',
          }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#1B75BB'}}>
        <TouchableOpacity onPress={() => {}} style={{paddingVertical: 3}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* <IconButton
                            icon="people"
                            color='#53C1BA'
                            size={25}

                        /> */}
            {/* <Text
              style={{
                color: '#676A6C',
                fontSize: 15,
                fontFamily: 'zwodrei',
                marginLeft: 5,
              }}>
              About us
            </Text> */}
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
        onPress={deregisterDevice}
        style={{paddingVertical: 3}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* <IconButton
                            icon="exit"
                            color='#53C1BA'
                            size={25}
                            onPress={authCtx.logout}
                        /> */}
            <Text
              style={{
                color: '#676A6C',
                fontSize: 15,
                fontFamily: 'zwodrei',
                marginLeft: 5,
              }}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleEditProfilePress}
          style={{paddingVertical: 3}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* <IconButton
                            icon="person"
                            color='#53C1BA'
                            size={25}
                            onPress={handleEditProfilePress}
                        /> */}
            {/* <Text
              style={{
                color: '#676A6C',
                fontSize: 15,
                fontFamily: 'zwodrei',
                marginLeft: 5,
              }}>
              My Profile
            </Text> */}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    drawerMainView:{
        flex: 1,
        backgroundColor: '#F3F3F4',
    },
    upperDrawerView:{
        height: height * 0.15,
        backgroundColor: Colors.green,
    }
    ,
    fullName:{
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: width * 0.01,
        marginTop: height * 0.07,
    },
    emailStyle:{
        color: Colors.white,
        fontSize: 15,
        marginLeft: width * 0.01,
    }
});
export default CustomDrawer;
