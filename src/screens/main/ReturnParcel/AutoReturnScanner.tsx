import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, Text, TextInput, View} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {Colors} from '../../../../constants/colours';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Parcel, SmsData } from '../../../../Utils/types';
import { getUserInfo } from '../../../../Utils/utils';
import uuid from 'react-native-uuid';
import { getDeviceInfo } from '../../../../database/DeviceSync';
import { updateParcel } from '../../../../database/DatabseOperations';
import { insertSmsData } from '../../../../database/DeviceDatabase';
import {useToast} from 'react-native-toast-notifications';

const {height, width} = Dimensions.get('window');
const AutoReturnScannerScreen = () => {
  const navigation = useNavigation<any>();
  const [timer, setTimer] = useState(30);
  const toast = useToast();

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);

    if (timer === 0) {
      clearInterval(countdown);
      navigation.replace("ReturnParcelDetailsScreen");
    }

    return () => clearInterval(countdown);
  }, [timer, navigation]);

  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const device = useCameraDevice('back');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [barcode, setBarcode] = useState<string | any>('');

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [selectedId, setSelectedId] = useState<string>('1');

  useEffect(() => {
    const fetchParcel = async () => {
      const parcel = await AsyncStorage.getItem('parcel');
      const selectedId = await AsyncStorage.getItem('selectedId');

      if (parcel) {
        setParcel(JSON.parse(parcel));
      }
      if(selectedId) {
        setSelectedId(selectedId);
      }
    };

    fetchParcel();
  }, []);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
    })();
  }, []);

  const handleManualReturn = async () => {
    const userInfo = await getUserInfo();
    const currentUserId = userInfo?.userId;
    const deviceInfo = await getDeviceInfo();

    const deviceId = deviceInfo?.deviceId;
    const facilityId = deviceInfo?.facilityId;
    const UUID = uuid.v4().toString().toUpperCase();
    const returnDatetime = new Date().toISOString();

    const smsData: SmsData = {
      syncId: UUID.toString(),
      parcelId: parcel?.parcelId || 1,
      cellphone: parcel?.cellphone || '',
      smsCreatedDateTime: returnDatetime,
      deviceId: deviceId,
      facilityId: facilityId,
      smsTypeId: 3,
      dirtyFlag: 1,
    };
    try {
      await updateParcel(
        parcel!,
        currentUserId,
        'scanOutDatetime',
        'scanOutByUserId',
        6,
        parcel!.passcode,
      );
      await insertSmsData(smsData);
      // updateCloudOnModifieddata();

      //Alert.alert('Parcel returned successfully');
      toast.show('Parcel returned successfully', {
        type: 'success',
        placement: 'top',
        duration: 5000,
        animationType: 'slide-in',
      });
      navigation.replace('Drawer', {screen: 'Return Parcels'});
     
    } catch (error) {
      
      toast.show('Error during manual returned', {
        type: 'error',
        placement: 'top',
        duration: 5000,
        animationType: 'slide-in',
      });
    }
  };

 
  const codeScanner = useCodeScanner({
    // codeTypes: ['qr', 'ean-13'],
    codeTypes: ['code-128', 'code-39', 'code-93'],
    onCodeScanned:async codes => {
   
      if (codes[0].value) {
        setBarcode(codes[0].value);
        if(parcel?.barcode != codes[0].value){
          toast.show('Barcode does not match', {
              type: 'error',
              placement: 'top',
              duration: 5000,
      
              animationType: 'slide-in',
          });
          navigation.replace('ReturnParcelDetailsScreen');
        }
        else{
         await handleManualReturn();
          navigation.replace('Drawer', {screen: 'Return Parcels'});
        }
      }
    },
  });

  const handleBarcodeChange = (text: string) => {
    setBarcode(text);

    // If barcode length is greater than 12 and matches parcel ID, call handleManualScanOut
    if (text.length > 12 && barcode == parcel?.barcode) {
        
        handleManualReturn();
    }
  };



  return (
    <View style={styles.mainView}>
      <View style={styles.upperContainer}>
      <TextInput
            style={styles.textInputView}
            placeholderTextColor={Colors.black}
            placeholder="                Enter Barcode"
            value={barcode}
            onChangeText={handleBarcodeChange}
          />
      </View>
      <View style={styles.lowerConatiner}>
        <CircularProgress
          value={timer}
          radius={100}
          maxValue={30}
          valueSuffix="s"
          inActiveStrokeColor={Colors.grey}
          inActiveStrokeOpacity={0.5}
          duration={1000}
          // onAnimationComplete={() => navigation.navigate('ScanInManualScreen')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  upperContainer: {
    marginTop: height * 0.3,
    height: height * 0.3,
    width: width,
    alignItems: 'center',
  },
  lowerConatiner: {
    marginTop: '10%',
    height: '60%',
    width: '20%',
    alignContent: 'center',
  },
  textInputView: {
    width: '20%',
    height: height * 0.09,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderBottomWidth: 1,
    margin: 10,
    paddingLeft: 10,
    alignContent: 'center',
    alignItems: 'center',
    color: Colors.black,
  },
});

export default AutoReturnScannerScreen;
