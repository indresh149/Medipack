import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
  } from 'react-native';
  import React, { useEffect, useState ,useCallback, useMemo } from 'react';
  import { Colors } from '../../../../constants/colours';
  import { Card } from '@rneui/themed';
  import { TextInput } from 'react-native';
  import { RFPercentage } from 'react-native-responsive-fontsize';
  import SQLite, { ResultSet, Transaction } from 'react-native-sqlite-storage';
  import { useNavigation ,useFocusEffect} from '@react-navigation/native';
  import { NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
  import { fetchParcels } from '../../../../database/DeviceSync';
  import { Parcel} from '../../../../Utils/types'; // Update path as needed
  import moment from 'moment';
  import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
  
  
  const { height, width } = Dimensions.get('window');
  
  const OverdueParcel= () => {
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [searchResults, setSearchResults] = useState<Parcel[]>([]);
    const [barcode, setBarcode] = useState<string>('');
    const navigation = useNavigation<NativeStackNavigationProp<any>>(); 
    const [filteredResults, setFilteredResults] = useState<Parcel[]>([]);
    const [selectedId, setSelectedId] = useState<string>('1');
  
    const loadParcels = async () => {
      try {
        let fetchedParcels: Parcel[] = await fetchParcels(3);
        console.log("parcel data scan out ", fetchedParcels);
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
      }, [])
    );
  
  
    type ParcelCardProps = {
      parcel: Parcel;
    };
  
    const ParcelCard: React.FC<ParcelCardProps> = ({ parcel }) => {
  
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
          <Text style={styles.infoText}>Name: {parcel.title} {parcel.firstName} {parcel.surname}</Text>
          <Text style={styles.infoText}>Barcode: {parcel.barcode}</Text>
          <Text style={styles.infoText}>Manifest: {parcel.dispatchRef}</Text>
          <Text style={styles.infoText}>Gender: {parcel.gender}</Text>
        </View>
        <View style={[styles.basicDetails, { marginTop: height * 0.03 }]}>
          <Text style={styles.infoText}>Id Number: {parcel.idNumber}</Text>
          <Text style={styles.infoText}>Due Date: {formattedDueDate}</Text>
          <Text style={styles.infoText}>Consignment No.: {parcel.consignmentNo}</Text>
        </View>
        <View style={[styles.basicDetails, { marginTop: height * 0.03 }]}>
          <Text style={styles.infoText}>Cellphone: {parcel.cellphone}</Text>
          <Text style={styles.infoText}>Date Of Birth: {formattedDOB}</Text>
        </View>
        {statusText !== '' && (
          <View style={[styles.rightBottomText,{backgroundColor: statusText == '7 days overdue' ? '#d9534f' : '#F89406'}]}>
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
      filtered = parcels.filter((parcel) => {
        const dueDateMoment = moment(parcel.dueDate);
        const daysDifference = now.diff(dueDateMoment, 'days');
        return daysDifference > 2 && daysDifference <= 7;
      });
    } else if (filter === '3') {
      filtered = parcels.filter((parcel) => {
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
    const filteredParcels = data.filter(parcel =>
      parcel.barcode.toLowerCase().includes(lowerCaseQuery) ||
      parcel.firstName.toLowerCase().includes(lowerCaseQuery) ||
      parcel.surname.toLowerCase().includes(lowerCaseQuery) ||
      parcel.cellphone.toLowerCase().includes(lowerCaseQuery) ||
      parcel.idNumber.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredResults(filteredParcels);
  };
  
  useEffect(() => {
    applyFilter(searchResults, selectedId);
  }, [selectedId, searchResults]);
  
  // const handleSearch = () => {
  //   const lowerCaseQuery = barcode.toLowerCase(); // Assuming you're using 'barcode' as the search input variable
  
  //   const filteredParcels = parcels.filter(parcel =>
  //     parcel.barcode.toLowerCase().includes(lowerCaseQuery) ||
  //     parcel.firstName.toLowerCase().includes(lowerCaseQuery) ||
  //     parcel.surname.toLowerCase().includes(lowerCaseQuery) ||
  //     parcel.cellphone.toLowerCase().includes(lowerCaseQuery) ||
  //     parcel.idNumber.toLowerCase().includes(lowerCaseQuery)
  //   );
  
  //   setSearchResults(filteredParcels);
  // };
  
  useEffect(() => {
    const lowerCaseQuery = barcode.toLowerCase(); // Assuming you're using 'barcode' as the search input variable
  
    const filteredParcels = parcels.filter(parcel =>
      parcel.barcode.toLowerCase().includes(lowerCaseQuery) ||
      parcel.firstName.toLowerCase().includes(lowerCaseQuery) ||
      parcel.surname.toLowerCase().includes(lowerCaseQuery) ||
      parcel.cellphone.toLowerCase().includes(lowerCaseQuery) ||
      parcel.idNumber.toLowerCase().includes(lowerCaseQuery)
    );
  
    console.log("filtered parcels", filteredParcels);
    setSearchResults(filteredParcels);
  }, [barcode, parcels]);
  
    const handleParcelPress = (parcel: Parcel) => {
      navigation.navigate('ReturnParcelDetailsScreen', { parcel });
    };
  
    const renderItem = ({ item }: { item: Parcel }) => (
      <TouchableOpacity
      disabled = {true}
       onPress={() => handleParcelPress(item)}>
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
              <Text>Search by Name, Cellphone, ID Number, or Barcode</Text>
              <TextInput
                style={styles.textInputView}
                placeholder="Enter Search Text"
                value={barcode}
                onChangeText={(text) => {
                  setBarcode(text);
                  handleSearch(text);
                }}
              />
              <TouchableOpacity
                style={styles.buttonView}
                onPress={() => handleSearch(barcode)}
              >
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.rightContainer}>
              <RadioGroup
                 radioButtons={radioButtons}
                 onPress={setSelectedId}
                 selectedId={selectedId}
                 layout="row"
              />
            </View>
          </View>
        </Card>
  
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.syncId.toString()}
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
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
      alignContent: 'center',
    },
    textInputView: {
      width: '90%',
      height: height * 0.08,
      backgroundColor: Colors.white,
      borderRadius: 10,
      borderBottomWidth: 1,
      margin: 10,
      paddingLeft: 10,
    },
    buttonView: {
      width: '20%',
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
    radioLabel: {
      fontSize: RFPercentage(2),
      color: Colors.black,
      marginVertical: 10,
    },
    leftContainer: {
      flex: 1,
      justifyContent: 'center',
      width: '50%',
      alignContent  : 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    rightContainer: {
      flex: 1,
      justifyContent: 'center',
      width: '50%',
      alignContent  : 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    patientInfoContainer: {
      margin: 20,
      flexDirection: 'row',
      borderColor: '#DDDDDD',
      borderWidth: 1,
      padding: 10,
      marginBottom:height * 0.2,
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
      marginLeft: width*0.7,
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
  
  export default OverdueParcel;
  