import {useNavigation} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {Card} from '@rneui/base';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useToast} from 'react-native-toast-notifications';
import uuid from 'react-native-uuid';
import {Parcel, SmsData} from '../../../../Utils/types';
import {getUserInfo} from '../../../../Utils/utils';
import {Colors} from '../../../../constants/colours';
import {updateParcel} from '../../../../database/DatabseOperations';
import {insertSmsData} from '../../../../database/DeviceDatabase';
import {getDeviceInfo} from '../../../../database/DeviceSync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingOverlay from '../../../components/LoadingOverlay';

const {height, width} = Dimensions.get('window');

const ScanOutManualTextScreen: React.FC<NativeStackScreenProps<any, any>> = ({
  route,
}) => {
  //const {parcel} = route?.params as {parcel: Parcel};
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>(); // Add parentheses to call the function

  const [barcode, setBarcode] = useState<string>('');

  const proceedtoOptions = () => {
    //  AsyncStorage.setItem('parcel', JSON.stringify(parcel));
    navigation.navigate('ScanInOptionsScreen');
  };

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [selectedId, setSelectedId] = useState<string>('1');

  useEffect(() => {
    const fetchParcel = async () => {
      const parcel = await AsyncStorage.getItem('parcel');
      const selectedId = await AsyncStorage.getItem('selectedId');
      if (parcel) {
        setParcel(JSON.parse(parcel));
      }
        if (selectedId) {
            setSelectedId(selectedId);
        }
    };

    fetchParcel();
  }, []);

  const handleManualScanOut = async () => {
    if(parcel?.barcode !== barcode){
        toast.show('Barcode does not match', {
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
        // updateCloudOnModifieddata();
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
      // Alert.alert('Parcel scanned out successfully');
      toast.show('Parcel scanned out successfully', {
        type: 'success',
        placement: 'top',
        duration: 5000,

        animationType: 'slide-in',
      });
      navigation.replace('Drawer', {screen: 'Scan Out'});
      console.log('Parcel scanned out successfully');
    } catch (error) {
      // console.error('Error during manual scan-out:', error);
      toast.show('Error during manual scan-out', {
        type: 'error',
        placement: 'top',
        duration: 5000,

        animationType: 'slide-in',
      });
    }
  };

  // Format the dates as "15 Aug 2024"
  // const formattedDueDate = moment(parcel!.dueDate).format('DD MMM YYYY');
  //const formattedDOB = moment(parcel!.dateOfBirth).format('DD MMM YYYY');

  // Calculate the status based on the due date
  //   const now = moment();
  //   const dueDateMoment = moment(parcel!.dueDate);
  //   let statusText = '';

  //   const daysDifference = now.diff(dueDateMoment, 'days');

  //   if (daysDifference > 2 && daysDifference <= 7) {
  //     statusText = '48 - hours overdue';
  //   } else if (daysDifference > 7) {
  //     statusText = '7 days overdue';
  //   }

  console.log('Parcel line 131', parcel);

  if (parcel === null) {
    return <LoadingOverlay message="Loading.." />;
  }

  return (
    <View style={styles.mainView}>
      <Card containerStyle={styles.cardView}>
        <View style={styles.inputTextContainer}>
          <TextInput
            style={styles.textInputView}
            placeholderTextColor={Colors.black}
            placeholder="                Enter Barcode"
            value={barcode}
            onChangeText={setBarcode}
          />
          <TouchableOpacity
            style={styles.buttomView}
            onPress={handleManualScanOut}>
            
            <Text style={styles.buttonText}>Scan Out</Text>
          </TouchableOpacity>
        </View>
      </Card>
     
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  cardView: {
    margin: 20,
    width: '97%',
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  inputTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  buttomView: {
    width: '15%',
    height: height * 0.08,
    backgroundColor: Colors.green,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFPercentage(1.5),
  },
  detailsContainer: {
    padding: 20,
  },
  detailsText: {
    fontSize: 18,
    marginBottom: 10,
  },
  patientInfoContainer: {
    margin: 20,
    flexDirection: 'row',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    padding: 10,
    marginBottom: height * 0.2,
  },
  patientInfoText: {
    color: Colors.black,
    fontSize: RFPercentage(1.5),
    marginBottom: height * 0.02,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.2,
    marginLeft: width * 0.5,
  },
  actionButton: {
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.2,
  },
  leftContainer: {
    marginLeft: width * 0.05,
  },
  rightBottomText: {
    marginTop: height * 0.06,
    marginLeft: 'auto',
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  bottomText: {
    fontSize: RFPercentage(1.1),
    fontWeight: 'bold',
    color: '#fff',
  },
  rightContainer: {
    marginLeft: 'auto',
    marginRight: width * 0.05,
    marginTop: height * 0.4,
  },
});

export default ScanOutManualTextScreen;
