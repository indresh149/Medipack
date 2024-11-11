import {useNavigation} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {Card} from '@rneui/base';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useToast} from 'react-native-toast-notifications';
import uuid from 'react-native-uuid';
import {Parcel, SmsData} from '../../../../Utils/types';
import {getUserInfo} from '../../../../Utils/utils';
import {Colors} from '../../../../constants/colours';
import {
  getParcelByBarcode,
  updateParcel,
} from '../../../../database/DatabseOperations';
import {insertSmsData} from '../../../../database/DeviceDatabase';
import {getDeviceInfo} from '../../../../database/DeviceSync';
import LoadingOverlay from '../../../components/LoadingOverlay';


const {height, width} = Dimensions.get('window');

const AutoScanInDetails: React.FC<NativeStackScreenProps<any, any>> = ({
  route,
}) => {
  const {barcode} = route.params as {barcode: string};
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>(); // Add parentheses to call the function
  const [enteredBarcode, setBarcode] = useState<string>();
  const [parcel, setParcel] = useState<Parcel>({
    syncId: '0',
    parcelId: 0,
    title: '',
    firstName: '',
    surname: '',
    dispatchRef: '',
    barcode: '',
    dueDate: '',
    cellphone: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    consignmentNo: '',
    scanInDatetime: '',
    passcode: '',
    scanInByUserId: 0,
    loggedInDatetime: '',
    scanOutDatetime: '',
    scanOutByUserId: 0,
    parcelStatusId: 0,
    deviceId: 0,
    facilityId: 0,
    dirtyFlag: 0,
    parcelStatus: false,
  });

  useEffect(() => {
   
    const fetchParcel = async () => {
      const fetchedParcel = await getParcelByBarcode(2, barcode);
     
      if (fetchedParcel.syncId == '0') {
        Alert.alert('Parcel not found with barcode: ' + barcode);
        navigation.replace('Drawer', {screen: 'Scan In'});
        return;
      }
      setParcel(fetchedParcel);
    };
    fetchParcel();
  }, [barcode]);

  const handleManualScanIn = async () => {
    const userInfo = await getUserInfo();
    const deviceInfo = await getDeviceInfo();
    const currentUserId = userInfo?.userId;
    const deviceId = deviceInfo?.deviceId;
    const facilityId = deviceInfo?.facilityId;
    const passcode = Math.floor(10000 + Math.random() * 90000).toString();

    const UUID = uuid.v4();
    const scanInDatetime = new Date().toISOString();

    const smsData: SmsData = {
      syncId: UUID.toString().toUpperCase(),
      parcelId: parcel.parcelId,
      cellphone: parcel.cellphone,
      smsCreatedDateTime: scanInDatetime,
      deviceId: deviceId,
      facilityId: facilityId,
      smsTypeId: 1,
      dirtyFlag: 1,
    };

    try {
      await updateParcel(
        parcel,
        currentUserId,
        'scanInDatetime',
        'scanInByUserId',
        3,
        passcode,
      );
      await insertSmsData(smsData);
      //  updateCloudOnModifieddata();
      // Alert.alert('Parcel scanned in successfully');
      toast.show('Parcel scanned in successfully', {
        type: 'success',
        placement: 'top',
        duration: 5000,

        animationType: 'slide-in',
      });
      navigation.replace('Drawer', {screen: 'Scan In'});
    
    } catch (error) {
      toast.show('Error during auto scan-in', {
        type: 'error',
        placement: 'top',
        duration: 5000,

        animationType: 'slide-in',
      });
    }
  };

  // Format the dates as "15 Aug 2024"
  const formattedDueDate = moment(parcel.dueDate).format('DD MMM YYYY');
  const formattedDOB = moment(parcel.dateOfBirth).format('DD MMM YYYY');

  // Calculate the status based on the due date
  const now = moment();
  const dueDateMoment = moment(parcel.dueDate);
  let statusText = '';

  const daysDifference = now.diff(dueDateMoment, 'days');

  if (daysDifference > 2 && daysDifference <= 7) {
    statusText = '48 - hours overdue';
  } else if (daysDifference > 7) {
    statusText = '7 days overdue';
  }



  if (parcel.syncId == '0') {
    return <LoadingOverlay message="Loading" />;
  }
  return (
    <ScrollView style={styles.mainView}>
     
      <Card containerStyle={styles.cardView}>
        <View style={styles.inputTextContainer}>
          {/* <TextInput
            style={styles.textInputView}
            placeholder="Enter Barcode"
            value={enteredBarcode}
            onChangeText={setBarcode}
          /> */}
          <TouchableOpacity
            style={styles.buttomView}
            onPress={handleManualScanIn}>
            <Text style={styles.buttonText}>Scan In</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <View style={styles.patientInfoContainer}>
        <View style={styles.leftContainer}>
          <Text style={styles.patientInfoText}>
            Name: {parcel.title} {parcel.firstName} {parcel.surname}
          </Text>
          <Text style={styles.patientInfoText}>Barcode: {parcel.barcode}</Text>
          <Text style={styles.patientInfoText}>
            Manifest: {parcel.dispatchRef}
          </Text>
          <Text style={styles.patientInfoText}>Gender: {parcel.gender}</Text>
          <Text style={styles.patientInfoText}>
            Id Number: {parcel.idNumber}
          </Text>
          <Text style={styles.patientInfoText}>
            Due Date:{' '}
            {formattedDueDate === 'Invalid date' ? '' : formattedDueDate}
          </Text>
          <Text style={styles.patientInfoText}>
            Consignment No.: {parcel.consignmentNo}
          </Text>
          <Text style={styles.patientInfoText}>
            Cellphone: {parcel.cellphone}
          </Text>
          <Text style={styles.patientInfoText}>
            Date Of Birth: {formattedDOB === 'Invalid date' ? '' : formattedDOB}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          {statusText !== '' && (
            <View
              style={[
                styles.rightBottomText,
                {
                  backgroundColor:
                    statusText == '7 days overdue' ? '#d9534f' : '#F89406',
                },
              ]}>
              <Text style={styles.bottomText}>{statusText}</Text>
            </View>
          )}
        </View>
      </View>
     
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputView: {
    width: '20%',
    height: height * 0.08,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderBottomWidth: 1,
    margin: 10,
    paddingLeft: 10,
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

export default AutoScanInDetails;
