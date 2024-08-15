import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import DeviceRegistrationScreen from './src/screens/auth/DeviceRegistrationScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import PasswordResetScreen from './src/screens/auth/PasswordResetScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomDrawer from './src/components/CustomDrawer';
import UploadParcelScreen from './src/screens/main/UploadParcelScreen';
import ScanInScreen from './src/screens/main/ScanInScreen';
import ScanOutScreen from './src/screens/main/ScanOutScreen';
import SearchPatientScreen from './src/screens/main/SearchPatientScreen';
import ReturnParcelScreen from './src/screens/main/ReturnParcelScreen';
import {openDatabase} from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingOverlay from './src/components/LoadingOverlay';
import { createDeviceTable, setupDeviceDatabase } from './database/DeviceDatabase';
import { setupDatabase, startBackgroundTasks } from './database/DeviceSync';
import ScanInManualScreen from './src/screens/main/ScanInManual';
import { Parcel } from './Utils/types';
import DashboardScreen from './src/screens/main/DashboardScreen';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import ScanOutManualScreen from './src/screens/main/ScanOutManual';



const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{ headerTintColor: '#53C1BA' }}>
        <Drawer.Screen name = "Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Upload Parcels" component={UploadParcelScreen} />
      <Drawer.Screen name="Scan In" component={ScanInScreen} />
      <Drawer.Screen name="Scan Out" component={ScanOutScreen} />
      <Drawer.Screen name="Search Patient" component={SearchPatientScreen} />
      <Drawer.Screen name="Return Parcels" component={ReturnParcelScreen} />
    
    </Drawer.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Drawer" component={MyDrawer} />
      <Stack.Screen name="DeviceRegistrationScreen" component={DeviceRegistrationScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      
      <Stack.Screen name="ScanInManualScreen" component={ScanInManualScreen} />
      <Stack.Screen name = "ScanOutManualScreen" component={ScanOutManualScreen} />
    </Stack.Navigator>
  );
}



function Root() {
  const [initialRoute, setInitialRoute] = useState('DeviceRegistrationScreen'); // Initial route
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const getDeviceInfo = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('DeviceInfo');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Error reading value", e);
    }
  };

  const getUserInfo = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('UserInfo');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Error reading value", e);
    }
  };

  useEffect(() => {
    async function fetchToken() {
      await setupDeviceDatabase();
      await setupDatabase();
      console.log('setup databaseses called  from root');
      try {
        //const devicePassword = await AsyncStorage.getItem('DevicePassword');
       // console.log('device password', devicePassword);
       const deviceInfo = await getDeviceInfo();
       const devicePassword = deviceInfo?.devicePassword;
        const authToken = await AsyncStorage.getItem('AuthToken');
        
        const userlogin = await getUserInfo();
        console.log('auth token', authToken);
        console.log('user login', userlogin);
        console.log('device password', devicePassword);

        if (devicePassword != null && authToken != null && userlogin == null) {
          await startBackgroundTasks();
          setInitialRoute('LoginScreen');
        } else if (devicePassword != null && authToken != null && userlogin != null) {
           await startBackgroundTasks();
          setInitialRoute('MyDrawer');
        } else {
          setInitialRoute('DeviceRegistrationScreen');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      } finally {
        setIsLoading(false); // Stop loading once async operation is complete
      }
    }
   
    fetchToken();
  }, []);

  if (isLoading) {
    // Optionally, show a loading indicator or splash screen here
    return <LoadingOverlay message={"Loading.."}/>; // Return null while loading
  }

  console.log('initial route', initialRoute);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="MyDrawer" component={AuthenticatedStack} />
        <Stack.Screen name="DeviceRegistrationScreen" component={DeviceRegistrationScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const App = () => <Root />;

export default App;
