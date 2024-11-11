import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Colors } from '../../../../constants/colours';
import uuid from 'react-native-uuid';
import { Parcel, SmsData } from '../../../../Utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useToast} from 'react-native-toast-notifications';
import { getUserInfo } from '../../../../Utils/utils';
import { getDeviceInfo } from '../../../../database/DeviceSync';
import { updateParcel } from '../../../../database/DatabseOperations';
import { insertSmsData } from '../../../../database/DeviceDatabase';

const {height, width} = Dimensions.get('window');
const AutoScanOutScannerScreen = () => {
  const navigation = useNavigation<any>();
  const [timer, setTimer] = useState(30);
  const toast = useToast();

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);

    if (timer === 0) {
      clearInterval(countdown);
      navigation.replace('ScanOutManualScreen');
    }

    return () => clearInterval(countdown);
  }, [timer, navigation]);


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
      //console.error('Error during manual scan-out:', error);
      toast.show('Error during auto scan-out', {
        type: 'error',
        placement: 'top',
        duration: 5000,

        animationType: 'slide-in',
      });
    }
  };

  const handleBarcodeChange = (text: string) => {
    setBarcode(text);

    // If barcode length is greater than 12 and matches parcel ID, call handleManualScanOut
    if (text.length > 12 && barcode == parcel?.barcode) {
        
      handleManualScanOut();
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

export default AutoScanOutScannerScreen;
