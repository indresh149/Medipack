import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Parcel, SmsData} from '../../../../Utils/types';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useToast} from 'react-native-toast-notifications';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Colors} from '../../../../constants/colours';
import {getUserInfo} from '../../../../Utils/utils';
import {getDeviceInfo} from '../../../../database/DeviceSync';
import uuid from 'react-native-uuid';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  deleteAllParcelsFromSelectedTable,
  fetchSelectedParcels,
  updateParcel,
  updateParcelStatus,
} from '../../../../database/DatabseOperations';
import {insertSmsData} from '../../../../database/DeviceDatabase';
import moment from 'moment';

const {height, width} = Dimensions.get('window');
const ReturnParcelSelected = () => {
  const navigation = useNavigation<any>();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [returnType, setReturnType] = useState<string | null>(null);

  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const device = useCameraDevice('back');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [barcode, setBarcode] = useState<string | any>('');
  const [matchedParcel, setMatchedParcel] = useState<Parcel | null>(null);
  const [isAllReturned, setIsAllReturned] = useState<any>();
 

  const codeScanner = useCodeScanner({
    // codeTypes: ['qr', 'ean-13'],
    codeTypes: ['code-128', 'code-39', 'code-93'],
    onCodeScanned: async codes => {
      
      if (codes[0].value) {
       

        if (barcode == '') {
          setBarcode(codes[0].value);
          // match the barcode with the parcel barcode of any of the parcels in the list
          if (parcels.some(parcel => parcel.barcode === codes[0].value)) {
            // store the matched parcel in a state
            // setParcel(parcels.find(parcel => parcel.barcode === codes[0].value));
            const matchedParcel: any = parcels.find(
              parcel => parcel.barcode === codes[0].value,
            );
            handleManualReturn(matchedParcel);
          }
        } else {
          return;
        }
      }
    },
  });



  const loadParcels = async () => {
    try {
      let fetchedParcels: Parcel[] = await fetchSelectedParcels(3);
      let fetchReturnedParcels = await fetchSelectedParcels(6);
      const returnTypeAsync = await AsyncStorage.getItem('returnType');
     
      const bothParcels = fetchedParcels.concat(fetchReturnedParcels);

      //if all the parcels having parcel status id 6 then set a state as all returned true
      const allReturned = fetchedParcels.every(
        parcel => parcel.parcelStatusId === 6,
      );
    
      setIsAllReturned(allReturned);
      setParcels(bothParcels);
      setReturnType(returnTypeAsync);
      
    } catch (error) {
      console.error('Error loading parcels:', error);
    }
  };

  useEffect(() => {
    loadParcels();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadParcels();
    }, []),
  );



  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
    })();
  }, []);

  const formatDates = (date: string) => {
    return moment(date).format('DD MMM YYYY');
  };

  const renderParcelItem = ({item}: {item: Parcel}) => (
    <View style={styles.parcelItem}>
      <View style={styles.leftView}>
        <Text style={styles.parcelText}>
          Name: {item.title} {item.firstName} {item.surname}
        </Text>
        <Text style={styles.parcelText}>Barcode: {item.barcode}</Text>
        <Text style={styles.parcelText}>Manifest: {item.dispatchRef}</Text>
        <Text style={styles.parcelText}>Gender: {item.gender}</Text>
        <Text style={styles.parcelText}>ID Number: {item.idNumber}</Text>
      </View>
      <View style={styles.rightView}>
        <Text style={styles.parcelText}>
          Due Date:{' '}
          {formatDates(item.dueDate) === 'Invalid date'
            ? ''
            : formatDates(item.dueDate)}
        </Text>
        <Text style={styles.parcelText}>
          Consignment No.: {item.consignmentNo}
        </Text>
        <Text style={styles.parcelText}>Cellphone: {item.cellphone}</Text>
        <Text style={styles.parcelText}>
          Date Of Birth:{' '}
          {formatDates(item.dateOfBirth) === 'Invalid date'
            ? ''
            : formatDates(item.dateOfBirth)}
        </Text>
        {item.parcelStatusId === 3 ? (
          <View style={styles.statusButton}>
            <Text style={styles.textView}> Not Returned</Text>
          </View>
        ) : (
          <View style={styles.statusButtonRed}>
            <Text style={styles.textView}> Returned</Text>
          </View>
        )}
      </View>
    </View>
  );



  const toast = useToast();

  const handleBarcodeChange = (text: string) => {
    setBarcode(text);



    // If barcode length is greater than 12 and matches parcel ID, call handleManualScanOut
    if (text.length > 11 && parcels.some(parcel => parcel.barcode == text)) {
      Alert.alert('Barcode matches');
      //  handleManualReturn();
      const matchedParcel: any = parcels.find(parcel => parcel.barcode === text);
      setMatchedParcel(matchedParcel);
      handleManualReturn(matchedParcel);
    }
  };

  // Manual Return Button Click
  const handleManualButtonClick = () => {
    if (barcode == '') {
      toast.show('Barcode cannot be empty', {
        type: 'error',
        placement: 'top',
        duration: 5000,
      });
    } else if (!parcels.some(parcel => parcel.barcode == barcode)) {
      toast.show('Barcode does not match', {
        type: 'error',
        placement: 'top',
        duration: 5000,
      });
    } else {
      const matchedParcel: any = parcels.find(
        parcel => parcel.barcode === barcode,
      );
      setMatchedParcel(matchedParcel);
      handleManualReturn(matchedParcel);
    }
  };

  const handleManualReturn = async (matchedParcel: Parcel) => {
  
    const userInfo = await getUserInfo();
    const currentUserId = userInfo?.userId;
    const deviceInfo = await getDeviceInfo();

    const deviceId = deviceInfo?.deviceId;
    const facilityId = deviceInfo?.facilityId;
    const UUID = uuid.v4().toString().toUpperCase();
    const returnDatetime = new Date().toISOString();

   // toast.show('Barcode matches', {type: 'success'});

    const smsData: SmsData = {
      syncId: UUID.toString(),
      parcelId: matchedParcel?.parcelId || 1,
      cellphone: matchedParcel?.cellphone || '',
      smsCreatedDateTime: returnDatetime,
      deviceId: deviceId,
      facilityId: facilityId,
      smsTypeId: 3,
      dirtyFlag: 1,
    };

    try {
      await updateParcel(
        matchedParcel!,
        currentUserId,
        'scanOutDatetime',
        'scanOutByUserId',
        6,
        matchedParcel!.passcode,
      );
      await insertSmsData(smsData);
      
      AsyncStorage.removeItem('selectedParcels');
      await updateParcelStatus(matchedParcel.syncId, 6);
      setBarcode('');
      loadParcels();
    } catch (error) {
      console.error('Error during manual returned :', error);
      toast.show('Error during manual parcel returned', {
        type: 'error',
        placement: 'top',
        duration: 5000,
      });
    }
  };

  const handleDone = async () => {
    navigation.navigate('Drawer', {screen: 'Return Parcels'})
    await deleteAllParcelsFromSelectedTable();
  }

  return (
    <View style={styles.container}>
      {/* Left Side: Parcel List */}
      <View style={styles.leftContainer}>
        <FlatList
          data={parcels}
          renderItem={renderParcelItem}
          keyExtractor={item => item.syncId}
        />
      </View>

      {/* Right Side: Empty Area */}
      <View style={styles.rightContainer}>
        {/* <Text style={styles.emptyText}>
          {returnType === 'autoCamera'
            ? 'Auto Return using Camera'
            : returnType === 'autoScanner'
            ? 'Auto Return using Scanner'
            : returnType === 'manual'
            ? 'Manual Return'
            : 'No return type selected'}
        </Text> */}

        <View style={styles.camerabox}>
          {returnType === 'autoCamera' &&
            device != null &&
            hasPermission &&
            isAllReturned == false && (
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

          {returnType === 'autoScanner' && isAllReturned == false && (
            <>
              <TextInput
                style={styles.textInputView}
                placeholderTextColor={Colors.black}
                placeholder="                Enter Barcode"
                value={barcode}
                onChangeText={handleBarcodeChange}
              />
            </>
          )}

          {returnType === 'manual' && isAllReturned == false && (
            <>
              <TextInput
                style={styles.textInputView}
                placeholderTextColor={Colors.black}
                placeholder="                Enter Barcode"
                value={barcode}
                onChangeText={setBarcode}
              />
              <TouchableOpacity
                style={styles.buttomView}
                onPress={handleManualButtonClick}>
                <Text style={styles.buttonText}>Return Parcel</Text>
              </TouchableOpacity>
            </>
          )}
          {isAllReturned == true && (
            <>
              <Text style={styles.emptyText}>All Parcels Returned</Text>
              <TouchableOpacity style={styles.goBackButton}
              onPress={
                handleDone
              }
              >
                <Text style={styles.textView}>Done</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  leftContainer: {
    width: '50%',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  rightContainer: {
    width: '50%',
    padding: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camerabox: {
    width: '70%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  parcelItem: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  parcelText: {
    color:Colors.black,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  textInputView: {
    width: '60%',
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
    width: '48%',
    height: height * 0.07,
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
  leftView: {
    width: '50%',
  },
  rightView: {
    width: '50%',
  },
  statusButton: {
    width: '50%',
    height: height * 0.05,
    backgroundColor: Colors.green,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  statusButtonRed: {
    width: '50%',
    height: height * 0.05,
    backgroundColor: Colors.yellow,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  textView: {
    color: Colors.white,
  },
  goBackButton: {
    width: '50%',
    height: height * 0.05,
    backgroundColor: Colors.green,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
});

export default ReturnParcelSelected;
