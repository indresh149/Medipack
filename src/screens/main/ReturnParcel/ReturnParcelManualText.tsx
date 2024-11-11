import {useNavigation} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {Card} from '@rneui/base';
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

const ReturnParcelManualTextScreen: React.FC<NativeStackScreenProps<any, any>> = ({
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
    //  const selectedId = await AsyncStorage.getItem('selectedId');
      if (parcel) {
        setParcel(JSON.parse(parcel));
      }
        // if (selectedId) {
        //     setSelectedId(selectedId);
        // }
    };

    fetchParcel();
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
      //   updateCloudOnModifieddata();

      // Alert.alert('Parcel returned successfully');
      toast.show('Parcel returned successfully', {
        type: 'success',
        placement: 'top',
        duration: 5000,
      });
      navigation.replace('Drawer', {screen: 'Return Parcels'});
      
    } catch (error) {
      // console.error('Error during manual returned :', error);
      toast.show('Error during manual parcel returned', {
        type: 'error',
        placement: 'top',
        duration: 5000,
      });
    }
  };





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
            onPress={handleManualReturn}>
            
            <Text style={styles.buttonText}>Return Parcel</Text>
          </TouchableOpacity>
        </View>
      </Card>
      {/* 
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
      </View> */}
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

export default ReturnParcelManualTextScreen;
