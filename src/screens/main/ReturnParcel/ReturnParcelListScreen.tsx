import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Card, CheckBox} from '@rneui/themed';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import {Parcel} from '../../../../Utils/types';
import {
  deleteAllParcelsFromSelectedTable,
  fetchParcels,
  insertSelectedParcelData,
} from '../../../../database/DatabseOperations';

const {height, width} = Dimensions.get('window');

const ReturnParcelListScreen = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [barcode, setBarcode] = useState<string>('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [filteredResults, setFilteredResults] = useState<Parcel[]>([]);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [selectedParcels, setSelectedParcels] = useState<Parcel[]>([]);

  const loadParcels = async () => {
    try {
      setSelectedParcels([]);
      let fetchedParcels: Parcel[] = await fetchParcels(3);
      setParcels(fetchedParcels);
      setSearchResults(fetchedParcels);
      await deleteAllParcelsFromSelectedTable();
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

  const handleSelectParcel = (item: Parcel) => {
    const isAlreadySelected = selectedParcels.find(
      parcel => parcel.syncId === item.syncId,
    );

    if (isAlreadySelected) {
      // Remove if already selected
      setSelectedParcels(
        selectedParcels.filter(parcel => parcel.syncId !== item.syncId),
      );
    } else {
      // Add to selected parcels
      setSelectedParcels([...selectedParcels, item]);
    }
  };

 

  const handleSelectedParcels = async () => {
    if (selectedParcels.length > 0) {
      for (const parcel of selectedParcels) {
        await insertSelectedParcelData(parcel);
        navigation.navigate('ReturnParcelOptionsAllScreen');
      }
    }
  };

  const handleSelectedAllParcels = async () => {
    setSelectedParcels(filteredResults);

    if (filteredResults.length > 0) {
      for (const parcel of filteredResults) {
        await insertSelectedParcelData(parcel);
        navigation.navigate('ReturnParcelOptionsAllScreen');
      }
    }
  };



  const ParcelCard: React.FC<ParcelCardProps> = ({parcel}) => {
    const isChecked = selectedParcels.some(
      parcels => parcels.syncId === parcel.syncId,
    );

    const formattedDueDate = moment(parcel.dueDate).format('DD MMM YYYY');
    const formattedDOB = moment(parcel.dateOfBirth).format('DD MMM YYYY');
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
        <CheckBox
          checked={isChecked}
          onPress={() => handleSelectParcel(parcel)}
        />
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

  const applyFilter = (parcels: Parcel[], filter: String) => {
    const now = moment();
    let filtered = parcels;

    if (filter === '2') {
      filtered = parcels.filter(parcel => {
        const dueDateMoment = moment(parcel.dueDate);
        const daysDifference = now.diff(dueDateMoment, 'days');
        return daysDifference > 2 && daysDifference <= 7;
      });
    } else if (filter === '3') {
      filtered = parcels.filter(parcel => {
        const dueDateMoment = moment(parcel.dueDate);
        const daysDifference = now.diff(dueDateMoment, 'days');
        return daysDifference > 7;
      });
    }

    setFilteredResults(filtered);
    handleSearch(barcode, filtered);
  };

  const handleSearch = (query: string, data: Parcel[] = searchResults) => {
    const lowerCaseQuery = query.toLowerCase();
    const filteredParcels = data.filter(
      parcel =>
        parcel.barcode.toLowerCase().includes(lowerCaseQuery) ||
        parcel.firstName.toLowerCase().includes(lowerCaseQuery) ||
        parcel.surname.toLowerCase().includes(lowerCaseQuery) ||
        parcel.cellphone.toLowerCase().includes(lowerCaseQuery) ||
        parcel.idNumber.toLowerCase().includes(lowerCaseQuery),
    );
    setFilteredResults(filteredParcels);
  };

  useEffect(() => {
    applyFilter(searchResults, selectedId);
  }, [selectedId, searchResults]);

  useEffect(() => {
    const lowerCaseQuery = barcode.toLowerCase();

    const filteredParcels = parcels.filter(
      parcel =>
        parcel.barcode.toLowerCase().includes(lowerCaseQuery) ||
        parcel.firstName.toLowerCase().includes(lowerCaseQuery) ||
        parcel.surname.toLowerCase().includes(lowerCaseQuery) ||
        parcel.cellphone.toLowerCase().includes(lowerCaseQuery) ||
        parcel.idNumber.toLowerCase().includes(lowerCaseQuery),
    );

    setSearchResults(filteredParcels);
  }, [barcode, parcels]);

  const handleParcelPress = (parcel: Parcel) => {
    AsyncStorage.setItem('parcel', JSON.stringify(parcel));
    navigation.navigate('ReturnParcelDetailsScreen');
  };

  const renderItem = ({item}: {item: Parcel}) => (
    <TouchableOpacity onPress={() => handleParcelPress(item)}>
      <ParcelCard parcel={item} />
    </TouchableOpacity>
  );

  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: '1',
        label: 'All',
        value: 'option1',
      },
      {
        id: '2',
        label: '48 hours overdue',
        value: 'option2',
      },
      {
        id: '3',
        label: '7 days overdue',
        value: 'option3',
      },
    ],
    [],
  );

  return (
    <View style={styles.mainView}>
      <Card containerStyle={styles.cardView}>
        <View style={styles.inputTextContainer}>
          <View style={styles.leftContainer}>
            <Text style={styles.barcodeHintText}>
              Search by Barcode/Name/Patient Id/Cellphone
            </Text>
            <TextInput
              style={styles.textInputView}
              placeholderTextColor={Colors.black}
              placeholder="                                Enter Barcode"
              value={barcode}
              onChangeText={text => { 
                setBarcode(text);
                handleSearch(text);
              }}
            />
            <TouchableOpacity
              style={styles.buttonView}
              onPress={() => handleSearch(barcode)}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightContainer}>
            <RadioGroup
              containerStyle={styles.radioContainer}
              labelStyle={styles.radioLabel}
              radioButtons={radioButtons}
              onPress={setSelectedId}
              selectedId={selectedId}
              layout="row"
            />
            <View style={styles.rightBottom}>
              <View>
                <TouchableOpacity
                  style={styles.selectedButtons}
                  onPress={handleSelectedParcels}>
                  <Text style={styles.radioTextColorWhite}>
                    Return Selected
                  </Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  style={styles.selectedButtons}
                  onPress={handleSelectedAllParcels}>
                  <Text style={styles.radioTextColorWhite}>Return All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Card>

      <FlatList
        data={filteredResults}
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
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    alignContent: 'center',
  },
  radioTextColor: {
    color: Colors.black,
  },
  barcodeHintText: {
    fontSize: RFPercentage(1.1),
    color: Colors.black,
    marginVertical: 5,
  },
  textInputView: {
    width: '60%',
    height: height * 0.06,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderBottomWidth: 1,
    margin: 10,
    paddingLeft: 10,
    fontSize: RFPercentage(1.1),
    color: Colors.black,
  },
  buttonView: {
    width: '20%',
    height: height * 0.05,
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
  radioLabel: {
    fontSize: RFPercentage(1.2),
    color: Colors.black,
    marginVertical: 10,
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '50%',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '50%',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
  radioContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    overflow: 'visible',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  selectedButtons: {
    marginBottom: height * 0.06,
    padding: 10,
    height: height * 0.05,
    backgroundColor: Colors.green,
    borderRadius: 10,
    justifyContent: 'center',
  },
  radioTextColorWhite: {
    color: Colors.white,
  },
  rightBottom: {
    gap: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ReturnParcelListScreen;
