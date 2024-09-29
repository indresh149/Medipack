import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ToastProvider} from 'react-native-toast-notifications';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
//import {openDatabase} from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

import CustomDrawer from './src/components/CustomDrawer';
import LoadingOverlay from './src/components/LoadingOverlay';

import {createDatabase} from './database/DeviceDatabase';
// import {createDeviceTable, setupDeviceDatabase } from './database/DeviceDatabase';
import {
  setupDatabase,
  startBackgroundTasks,
  getDeviceInfo,
} from './database/DeviceSync';

import DeviceRegistrationScreen from './src/screens/auth/DeviceRegistrationScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
//import PasswordResetScreen from './src/screens/auth/PasswordResetScreen';

import DashboardScreen from './src/screens/main/DashboardScreen';
import ScanInScreen from './src/screens/main/ScanIn/ScanInScreen';
import ScanInManualScreen from './src/screens/main/ScanIn/ScanInManual';
import ScanInOptions from './src/screens/main/ScanIn/ScanInOptions';
import AutoScanInScreen from './src/screens/main/ScanIn/AutoScanInScreen';
import ScanOutScreen from './src/screens/main/ScanOut/ScanOutScreen';
import ScanOutManualScreen from './src/screens/main/ScanOut/ScanOutManual';
import ScanOutOptions from './src/screens/main/ScanOut/ScanOutOptions';
import AutoScanOutScreen from './src/screens/main/ScanOut/AutoScanOutScreen';
import AutoScanOutDetails from './src/screens/main/ScanOut/AutoScanOutDetails';
import SearchPatientScreen from './src/screens/main/SearchPatientScreen';
import ReturnParcelScreen from './src/screens/main/ReturnParcel/ReturnParcelScreen';
import ReturnParcelDetailsScreen from './src/screens/main/ReturnParcel/ReturnParcelDetailsScreen';
//import UploadParcelScreen from './src/screens/main/UploadParcelScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
//import BarcodeScanner from './src/screens/main/ScanIn/BarcodeScanner';

import ScanOutParcelReturned from './src/screens/main/Reports/ScanOutParcelReturned';
import PendingScanInParcel from './src/screens/main/Reports/PendingScanInParcel';
import OverdueParcel from './src/screens/main/Reports/OverdueParcel';
import OneWeekScannedOut from './src/screens/main/Reports/OneWeekScannedOut';
import OneWeekSummary from './src/screens/main/Reports/OneWeekSummary';

//import { Parcel } from './Utils/types';
import {getUserInfo} from './Utils/utils';
import {setupOperationsDatabase} from './database/DatabseOperations';
import ReturnParcelOptions from './src/screens/main/ReturnParcel/ReturnParcelOptions';
import AutoReturnParcelScreen from './src/screens/main/ReturnParcel/AutoReturnParelScreen';
import AutoScanInDetails from './src/screens/main/ScanIn/AutoScanInDetails';
import AutoReturnParcelDetails from './src/screens/main/ReturnParcel/AutoReturnParcelDetails';
import {navigationRef} from './RootNavigation';
import AdministrationScreen from './src/screens/main/AdministrationScreen';
import SearchPatientDetailsScreen from './src/screens/main/SearchpatientDetailsScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{headerTintColor: '#53C1BA'}}>
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />

      <Drawer.Screen name="Scan In" component={ScanInOptions} />
      <Drawer.Screen name="Scan Out" component={ScanOutOptions} />
      <Drawer.Screen name="Search Patient" component={SearchPatientScreen} />
      <Drawer.Screen name="Return Parcels" component={ReturnParcelOptions} />
    </Drawer.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Drawer" component={MyDrawer} />
      <Stack.Screen
        name="DeviceRegistrationScreen"
        component={DeviceRegistrationScreen}
      />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="ScanInScreen" component={ScanInScreen} />
      <Stack.Screen name="ScanOutScreen" component={ScanOutScreen} />
      <Stack.Screen name="ScanInManualScreen" component={ScanInManualScreen} />
      <Stack.Screen
        name="ScanOutManualScreen"
        component={ScanOutManualScreen}
      />
      <Stack.Screen name="AutoScanInScreen" component={AutoScanInScreen} />
      <Stack.Screen name="AutoScanOutScreen" component={AutoScanOutScreen} />
      <Stack.Screen
        name="ReturnParcelManualScreen"
        component={ReturnParcelScreen}
      />
      <Stack.Screen
        name="ReturnParcelDetailsScreen"
        component={ReturnParcelDetailsScreen}
      />
      <Stack.Screen name = "SearchPatientDetailsScreen" 
        component = {SearchPatientDetailsScreen}
      />
      <Stack.Screen
        name="AutoReturnParcelScreen"
        component={AutoReturnParcelScreen}
      />
      <Stack.Screen
        name="ScanOutParcelRturnedReportScreen"
        component={ScanOutParcelReturned}
      />
      <Stack.Screen
        name="PendingScainInParcelScreen"
        component={PendingScanInParcel}
      />
      <Stack.Screen
        name="OverDueParcelReportScreen"
        component={OverdueParcel}
      />
      <Stack.Screen
        name="OneWeekScannedOutReportScreen"
        component={OneWeekScannedOut}
      />
      <Stack.Screen
        name="OneWeekSummaryReportScreen"
        component={OneWeekSummary}
      />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name = "AdministrationScreen" component = {AdministrationScreen}/>
      <Stack.Screen name="AutoScanOutDetails" component={AutoScanOutDetails} />
      <Stack.Screen name="AutoScainInDetails" component={AutoScanInDetails} />
      <Stack.Screen
        name="AutoReturnParcelDetails"
        component={AutoReturnParcelDetails}
      />
    </Stack.Navigator>
  );
}

function Root() {
  const [initialRoute, setInitialRoute] = useState('DeviceRegistrationScreen'); // Initial route
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    async function fetchToken() {
      await createDatabase();
      await setupDatabase();
      await setupOperationsDatabase();

      try {
        const deviceInfo = await getDeviceInfo();
        const devicePassword = deviceInfo?.devicePassword;
      //  console.log('deviceInfo 117', deviceInfo?.devicePassword);
        const authToken = await AsyncStorage.getItem('AuthToken');

        if (devicePassword == null) {
          setInitialRoute('DeviceRegistrationScreen');
        } else if (deviceInfo != null && authToken != null) {
          await startBackgroundTasks(navigationRef);
          setInitialRoute('MyDrawer');
        } else {
          const devicePassword = deviceInfo?.devicePassword;
          const authToken = await AsyncStorage.getItem('AuthToken');
          await startBackgroundTasks(navigationRef);
          setInitialRoute('LoginScreen');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchToken();
  }, []);

  if (isLoading) {
    return <LoadingOverlay message={'Loading..'} />;
  }

  console.log('initial route', initialRoute);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={initialRoute}>
        <Stack.Screen name="MyDrawer" component={AuthenticatedStack} />
        <Stack.Screen
          name="DeviceRegistrationScreen"
          component={DeviceRegistrationScreen}
        />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const App = () => (
  <ToastProvider
     warningColor='#ffad33'
  >
    <Root />
  </ToastProvider>
);

export default App;
