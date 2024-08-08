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

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{ headerTintColor: '#53C1BA' }}>
      <Drawer.Screen name="Upload Parcels" component={UploadParcelScreen} />
      <Drawer.Screen name="Scan In" component={ScanInScreen} />
      <Drawer.Screen name="Scan Out" component={ScanOutScreen} />
      <Drawer.Screen name="Search Patient" component={SearchPatientScreen} />
      <Drawer.Screen name="Return Parcels" component={ReturnParcelScreen} />
      <Drawer.Screen name="Request Pass" component={PasswordResetScreen} />
      <Drawer.Screen name="Device Registration" component={DeviceRegistrationScreen} />
      <Drawer.Screen name="Login" component={LoginScreen} />
    </Drawer.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Drawer" component={MyDrawer} />
      <Stack.Screen name="DeviceRegistrationScreen" component={DeviceRegistrationScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
    </Stack.Navigator>
  );
}



function Root() {
  const [initialRoute, setInitialRoute] = useState(''); // Default to null
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    async function fetchToken() {
      try {
        const devicePassword = await AsyncStorage.getItem('DevicePassword');
        console.log('device password', devicePassword);
        const authToken = await AsyncStorage.getItem('AuthToken');
        console.log('auth token', authToken);

        if (devicePassword != null && authToken != null) {
          setInitialRoute('MyDrawer');
        } else if (devicePassword != null && authToken == null) {
          setInitialRoute('LoginScreen');
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
