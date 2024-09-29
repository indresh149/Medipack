import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Card} from '@rneui/themed';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Colors} from '../../../../constants/colours';
import moment from 'moment';
import {Parcel} from '../../../../Utils/types';
import {fetchParcels} from '../../../../database/DatabseOperations';

const {height, width} = Dimensions.get('window');

const ScanInScreen = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [barcode, setBarcode] = useState<string>('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const loadParcels = async () => {
    try {
      let fetchedParcels: Parcel[] = await fetchParcels(2);
      // console.log("parcel data", fetchedParcels);
      setParcels(fetchedParcels);
      setSearchResults(fetchedParcels);
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

  type ParcelCardProps = {
    parcel: Parcel;
  };

  const ParcelCard: React.FC<ParcelCardProps> = ({parcel}) => {
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

    return (
      <View style={styles.mainContainer}>
        <View style={styles.nameCircle}>
          <Text style={styles.circleText}>{parcel.firstName.charAt(0)}</Text>
        </View>
        <View style={styles.basicDetails}>
          <Text style={styles.infoText}>
            Name: {parcel.title} {parcel.firstName} {parcel.surname}
          </Text>
          <Text style={styles.infoText}>Barcode: {parcel.barcode}</Text>
          <Text style={styles.infoText}>Manifest: {parcel.dispatchRef}</Text>
          <Text style={styles.infoText}>Gender: {parcel.gender}</Text>
        </View>
        <View style={[styles.basicDetails, {marginTop: height * 0.03}]}>
          <Text style={styles.infoText}>Id Number: {parcel.idNumber}</Text>
          <Text style={styles.infoText}>
            Due Date:{' '}
            {formattedDueDate === 'Invalid date' ? '' : formattedDueDate}
          </Text>
          <Text style={styles.infoText}>
            Consignment No.: {parcel.consignmentNo}
          </Text>
        </View>
        <View style={[styles.basicDetails, {marginTop: height * 0.03}]}>
          <Text style={styles.infoText}>Cellphone: {parcel.cellphone}</Text>
          <Text style={styles.infoText}>
            Date Of Birth: {formattedDOB === 'Invalid date' ? '' : formattedDOB}
          </Text>
        </View>
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
    );
  };

  const handleSearch = () => {
    const filteredParcels = parcels.filter(parcel =>
      parcel.barcode.toLowerCase().includes(barcode.toLowerCase()),
    );
    setSearchResults(filteredParcels);
  };

  useEffect(() => {
    const filteredParcels = parcels.filter(parcel =>
      parcel.barcode.toLowerCase().includes(barcode.toLowerCase()),
    );
    // console.log("filtered parcels", filteredParcels);
    setSearchResults(filteredParcels);
  }, [barcode, parcels]);

  const handleParcelPress = (parcel: Parcel) => {
    navigation.navigate('ScanInManualScreen', {parcel});
  };

  const renderItem = ({item}: {item: Parcel}) => (
    <TouchableOpacity onPress={() => handleParcelPress(item)}>
      <ParcelCard parcel={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainView}>
      <Card containerStyle={styles.cardView}>
        <View style={styles.inputTextContainer}>
          <TextInput
            style={styles.textInputView}
            placeholder="Enter Barcode"
            value={barcode}
            onChangeText={setBarcode}
          />
          <TouchableOpacity style={styles.buttomView} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <FlatList
        data={searchResults}
        keyExtractor={item => item.syncId.toString()}
        renderItem={renderItem}
      />
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
  mainContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#F2F5F7',
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  nameCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: Colors.green,
    borderWidth: 5,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  NumberCircle: {
    marginLeft: width * 0.7,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: Colors.green,
    borderWidth: 5,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  NumberText: {
    fontSize: 20,
    color: '#333',
  },
  circleText: {
    fontSize: 20,
    color: '#333',
  },
  basicDetails: {
    marginLeft: width * 0.05,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
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
});

export default ScanInScreen;
