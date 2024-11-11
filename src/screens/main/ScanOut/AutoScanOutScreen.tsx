import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import {
  Camera,
  useCameraDevice,
  useCodeScanner
} from 'react-native-vision-camera';
import { Colors } from '../../../../constants/colours';
import uuid from 'react-native-uuid';
import { Parcel, SmsData } from '../../../../Utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useToast} from 'react-native-toast-notifications';
import { getUserInfo } from '../../../../Utils/utils';
import { getDeviceInfo } from '../../../../database/DeviceSync';
import { updateParcel } from '../../../../database/DatabseOperations';
import { insertSmsData } from '../../../../database/DeviceDatabase';

const AutoScanOutScreen = () => {
  const navigation = useNavigation<any>();
  const [timer, setTimer] = useState(30);
  const toast = useToast();

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);

    if (timer === 0) {
      clearInterval(countdown);
      navigation.replace('Drawer', {screen: 'Scan Out'});
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

  const handleManualScanOut = async () => {
    if (parcel?.scanInDatetime === null) {
      // Alert.alert('Parcel not scanned in');
      toast.show('Parcel not scanned in', {
        type: 'error',
        placement: 'top',
        duration: 5000,
        animationType: 'slide-in',
      });
      return;
    }

   

    const userInfo = await getUserInfo();
    const currentUserId = userInfo?.userId;
    const deviceInfo = await getDeviceInfo();

    const deviceId = deviceInfo?.deviceId;
    const facilityId = deviceInfo?.facilityId;
    const UUID = uuid.v4().toString().toUpperCase();
    const scanoutDatetime = new Date().toISOString();

    const smsData: SmsData = {
      syncId: UUID.toString(),
      parcelId: parcel?.parcelId || 1,
      cellphone: parcel?.cellphone || '',
      smsCreatedDateTime: scanoutDatetime,
      deviceId: deviceId,
      facilityId: facilityId,
      smsTypeId: 2,
      dirtyFlag: 1,
    };

    try {
      if (selectedId == '1') {
        await updateParcel(
          parcel!,
          currentUserId,
          'scanOutDatetime',
          'scanOutByUserId',
          5,
          parcel!.passcode,
        );
        await insertSmsData(smsData);
        //  updateCloudOnModifieddata();
      }

      if (selectedId == '2') {
        await updateParcel(
          parcel!,
          currentUserId,
          'scanOutDatetime',
          'scanOutByUserId',
          4,
          parcel!.passcode,
        );
        await insertSmsData(smsData);
        //  updateCloudOnModifieddata();
      }
      //  Alert.alert('Parcel scanned out successfully');
      toast.show('Parcel scanned out successfully', {
        type: 'success',
        placement: 'top',
        duration: 5000,

        animationType: 'slide-in',
      });
      navigation.replace('Drawer', {screen: 'Scan Out'});
     
    } catch (error) {
     
      toast.show('Error during auto scan-out', {
        type: 'error',
        placement: 'top',
        duration: 5000,

        animationType: 'slide-in',
      });
    }
  };


  const codeScanner = useCodeScanner({
    //   codeTypes: ['qr', 'ean-13'],
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
          navigation.replace('ScanOutManualScreen');
        }
        else{
         await handleManualScanOut();
          navigation.replace('Drawer', {screen: 'Scan Out'});
        }
        // setBarcode(codes[0].value);
        // navigation.replace('AutoScanOutDetails', {barcode: codes[0].value});
      }
    },
  });



  return (
    <View style={styles.mainView}>
      <View style={styles.upperContainer}>
        <Text>BarcodeScanner</Text>
        {device != null && hasPermission && (
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
        )}
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
          // onAnimationComplete={() => {

          //   //navigation.replace('Drawer', { screen: 'Scan Out' })}
          // }
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
    marginTop: '15%',
    height: '40%',
    width: '30%',
  },
  lowerConatiner: {
    marginTop: '10%',
    height: '60%',
    width: '20%',
    alignContent: 'center',
  },
});

export default AutoScanOutScreen;
