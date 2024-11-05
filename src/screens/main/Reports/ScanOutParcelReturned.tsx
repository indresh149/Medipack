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
import {fetchParcelsFromLastWeek} from '../../../../database/DatabseOperations';

const {height, width} = Dimensions.get('window');

const ScanOutParcelReturned = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [barcode, setBarcode] = useState<string>('');
  const [noOfParcels, setNoOfParcels] = useState<number>(0);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const loadParcels = async () => {
    try {
      let fetchedParcels: Parcel[] = await fetchParcelsFromLastWeek(6);
      setNoOfParcels(fetchedParcels.length);
      // console.log("parcel data scan out ", fetchedParcels);
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
          <Text style={styles.infoText}>Due Date: {formattedDueDate}</Text>
          <Text style={styles.infoText}>
            Consignment No.: {parcel.consignmentNo}
          </Text>
        </View>
        <View style={[styles.basicDetails, {marginTop: height * 0.03}]}>
          <Text style={styles.infoText}>Cellphone: {parcel.cellphone}</Text>
          <Text style={styles.infoText}>Date Of Birth: {formattedDOB}</Text>
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
    const lowerCaseQuery = barcode.toLowerCase(); // Assuming you're using 'barcode' as the search input variable

    const filteredParcels = parcels.filter(
      parcel =>
        parcel.barcode.toLowerCase().includes(lowerCaseQuery) ||
        parcel.firstName.toLowerCase().includes(lowerCaseQuery) ||
        parcel.surname.toLowerCase().includes(lowerCaseQuery) ||
        parcel.cellphone.toLowerCase().includes(lowerCaseQuery) ||
        parcel.idNumber.toLowerCase().includes(lowerCaseQuery),
    );

    setSearchResults(filteredParcels);
  };

  useEffect(() => {
    const lowerCaseQuery = barcode.toLowerCase(); // Assuming you're using 'barcode' as the search input variable

    const filteredParcels = parcels.filter(
      parcel =>
        parcel.barcode.toLowerCase().includes(lowerCaseQuery) ||
        parcel.firstName.toLowerCase().includes(lowerCaseQuery) ||
        parcel.surname.toLowerCase().includes(lowerCaseQuery) ||
        parcel.cellphone.toLowerCase().includes(lowerCaseQuery) ||
        parcel.idNumber.toLowerCase().includes(lowerCaseQuery),
    );

    //console.log("filtered parcels", filteredParcels);
    setSearchResults(filteredParcels);
  }, [barcode, parcels]);

  const handleParcelPress = (parcel: Parcel) => {
    navigation.navigate('ScanOutManualScreen', {parcel});
  };

  const renderItem = ({item}: {item: Parcel}) => (
    <TouchableOpacity disabled={true} onPress={() => handleParcelPress(item)}>
      <ParcelCard parcel={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainView}>
      <Card containerStyle={styles.cardView}>
        <View style={styles.mainCont}>
          <View style={styles.leftContan}>
            <View style={styles.nameCircleAbove}>
              <Text style={styles.circleTextAbove}>{noOfParcels}</Text>
            </View>
          </View>
          <View style={styles.rightCont}>
            <View style={styles.inputTextContainer}>
              <View>
                <Text style={styles.hintText}>
                  Search by Name or Cellphone or Id Number or Barcode
                </Text>
              </View>

              <TextInput
                style={styles.textInputView}
                placeholder="             Enter Search Text"
                value={barcode}
                onChangeText={setBarcode}
              />
              <TouchableOpacity
                style={styles.buttomView}
                onPress={handleSearch}>
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    height: height * 0.22,

    width: '97%',
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  inputTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCont: {
    flexDirection: 'row',
  },
  leftContan: {
    width: '20%',
    flexDirection: 'row',
    marginLeft: width * 0.01,
    marginTop: height * 0.01,
  },
  rightCont: {
    width: '80%',
    flexDirection: 'row',
    marginLeft: width * 0.1,
    alignItems: 'center',
  },
  nameCircleAbove: {
    marginLeft: width * 0.01,
    width: width * 0.047,
    height: height * 0.07,
    borderRadius: Math.round(width + height) / 2.1,
    borderColor: Colors.green,
    borderWidth: 5,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTextAbove: {
    fontSize: RFPercentage(1.1),
    color: '#333',
  },
  textInputView: {
    width: '70%',
    height: height * 0.06,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderBottomWidth: 1,
    margin: width * 0.01,
    paddingLeft: 10,
    fontSize: RFPercentage(1.1),
    color: Colors.black,
  },
  buttomView: {
    width: '35%',
    height: height * 0.05,
    backgroundColor: Colors.green,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: height * 0.01,
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
    width: width * 0.07,
    height: height * 0.098,
    borderRadius: Math.round(width + height) / 2,
    borderColor: Colors.green,
    borderWidth: 5,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  NumberCircle: {
    marginLeft: width * 0.7,
    width: width * 0.07,
    height: height * 0.098,
    borderRadius: Math.round(width + height) / 2,
    borderColor: Colors.green,
    borderWidth: 5,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  NumberText: {
    fontSize: RFPercentage(1.5),
    color: '#333',
  },
  hintText: {
    fontSize: RFPercentage(1.1),
    color: '#333',
  },
  circleText: {
    fontSize: RFPercentage(1.5),
    color: '#333',
  },
  basicDetails: {
    marginLeft: width * 0.05,
  },
  infoText: {
    fontSize: RFPercentage(1.5),
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

export default ScanOutParcelReturned;
