import {useNavigation} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import moment from 'moment';
import React, {useMemo, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useToast} from 'react-native-toast-notifications';
import uuid from 'react-native-uuid';
import {Parcel, SmsData} from '../../../../Utils/types';
import {Colors} from '../../../../constants/colours';
import {getUserInfo} from '../../../../Utils/utils';
import {updateParcel} from '../../../../database/DatabseOperations';
import {insertSmsData} from '../../../../database/DeviceDatabase';
import {getDeviceInfo} from '../../../../database/DeviceSync';

const {height, width} = Dimensions.get('window');

const ScanOutManualScreen: React.FC<NativeStackScreenProps<any, any>> = ({
  route,
}) => {
  const {parcel} = route.params as {parcel: Parcel};
  console.log('Parcel:', parcel);
  const navigation = useNavigation<NativeStackNavigationProp<any>>(); // Add parentheses to call the function
  const [idNumber, setIdNumber] = useState('');
  const toast = useToast();
  const [pin, setPin] = useState('');

  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: '1',
        label: 'ID Number/Passport',
        value: 'option1',
      },
      {
        id: '2',
        label: 'Pin',
        value: 'option2',
      },
    ],
    [],
  );

  const [selectedId, setSelectedId] = useState<string | undefined>();

  const handleManualScanOut = async () => {
    if (selectedId === '1' && idNumber === '') {
      // Alert.alert('Please enter ID Number/Passport');
      toast.show('Please enter ID Number/Passport', {
        type: 'warning',
        placement: 'top',
        duration: 5000,
        animationType: 'slide-in',
      });
      setIdNumber('');
      return;
    }

    if (selectedId === '2' && pin === '') {
      // Alert.alert('Please enter Pin');
      toast.show('Please enter Pin', {
        type: 'warning',
        placement: 'top',
        duration: 5000,
        animationType: 'slide-in',
      });
      setPin('');
      return;
    }

    if (selectedId === '1') {
      if (idNumber !== parcel.idNumber) {
        // Alert.alert('ID Number/Passport does not match');
        toast.show('ID Number/Passport does not match', {
          type: 'warning',
          placement: 'top',
          duration: 5000,
          animationType: 'slide-in',
        });
        setIdNumber('');
        return;
      }
    } else {
      if (pin !== parcel.passcode) {
        // Alert.alert('Pin does not match');
        toast.show('Pin does not match', {
          type: 'warning',
          placement: 'top',
          duration: 5000,
          animationType: 'slide-in',
        });
        setPin('');
        return;
      }
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
      parcelId: parcel.parcelId,
      cellphone: parcel.cellphone,
      smsCreatedDateTime: scanoutDatetime,
      deviceId: deviceId,
      facilityId: facilityId,
      smsTypeId: 2,
      dirtyFlag: 1,
    };

    try {
      if (selectedId == '1') {
        await updateParcel(
          parcel,
          currentUserId,
          'scanOutDatetime',
          'scanOutByUserId',
          5,
          parcel.passcode,
        );
        await insertSmsData(smsData);
        // updateCloudOnModifieddata();
      }

      if (selectedId == '2') {
        await updateParcel(
          parcel,
          currentUserId,
          'scanOutDatetime',
          'scanOutByUserId',
          4,
          parcel.passcode,
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
  const formattedDueDate = moment(parcel.dueDate).format('DD MMM YYYY');
  const formattedDOB = moment(parcel.dateOfBirth).format('DD MMM YYYY');
  const fromattedScanInDate = moment(parcel?.scanInDatetime).format(
    'DD MMM YYYY, h:mm:ss a',
  );

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.radioGroup}>
          <RadioGroup
            radioButtons={radioButtons}
            onPress={setSelectedId}
            selectedId={selectedId}
            layout="row"
          />
        </View>
        {selectedId === '1' && (
          <TextInput
            style={styles.input}
            placeholder="Enter ID Number / Passport"
            value={idNumber}
            onChangeText={setIdNumber}
          />
        )}
        {selectedId === '2' && (
          <TextInput
            style={styles.input}
            placeholder="Enter Pin"
            value={pin}
            onChangeText={setPin}
          />
        )}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleManualScanOut}>
          <Text style={styles.buttonText}>SCAN OUT</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoSection}>
          <View style={styles.headlineView}>
            <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Name</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>
                {parcel.title} {parcel.firstName} {parcel.surname}
              </Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Cellphone</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>{parcel.cellphone}</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Date Of Birth</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>
                {formattedDOB === 'Invalid date' ? '' : formattedDOB}
              </Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Gender</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>{parcel.gender}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.infoSection, {marginBottom: height * 0.18}]}>
          <View style={styles.headlineView}>
            <Text style={styles.sectionTitle}>MEDICATION INFORMATION</Text>
          </View>

          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Barcode</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>{parcel.barcode}</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Manifest</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>{parcel.dispatchRef}</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Due Date</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>
                {formattedDueDate === 'Invalid date' ? '' : formattedDueDate}
              </Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Scan In Date Time</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>
                {fromattedScanInDate === 'Invalid date'
                  ? ''
                  : fromattedScanInDate}
              </Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Consignment No.</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>{parcel.consignmentNo}</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Parcel Status</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>Scanned In</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    marginBottom: height * 0.05,
    textAlign: 'center',
  },
  inputContainer: {
    width: '50%',
    marginBottom: height * 0.05,
    alignItems: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: height * 0.04,
  },
  radioText: {
    fontSize: RFPercentage(1.5),
  },
  input: {
    height: height * 0.08,
    borderColor: Colors.white,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    marginBottom: height * 0.04,
  },
  searchButton: {
    width: '80%',
    backgroundColor: Colors.green,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFPercentage(1.5),
  },
  infoContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 10,
    alignSelf: 'center',
  },
  infoSection: {
    width: '50%',
    height: height * 0.45,
  },
  headlineView: {
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginBottom: height * 0.02,
    padding: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: RFPercentage(1.5),
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  infoText: {
    fontSize: RFPercentage(1.5),
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    color: Colors.white,
  },
  infoTextBlack: {
    fontSize: RFPercentage(1.5),
    marginBottom: height * 0.01,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    color: Colors.black,
  },
  scanOutButton: {
    backgroundColor: Colors.green,
    padding: 10,
    alignItems: 'center',
  },
  attributeView: {
    width: '50%',
    borderRadius: 10,
    backgroundColor: Colors.green,
    marginBottom: height * 0.01,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  valueView: {
    width: '50%',
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginBottom: height * 0.01,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  oneRowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: height * 0.01,
  },
});

export default ScanOutManualScreen;
