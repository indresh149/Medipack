import {useNavigation} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useToast} from 'react-native-toast-notifications';
import {Parcel, SmsData} from '../../../../Utils/types';
import {Colors} from '../../../../constants/colours';

import AsyncStorage from '@react-native-async-storage/async-storage';

const {height, width} = Dimensions.get('window');

const ReturnParcelDetailsScreen: React.FC<NativeStackScreenProps<any, any>> = ({
  route,
}) => {
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [parcel, setParcel] = useState<Parcel | null>(null);

  useEffect(() => {
    const fetchParcel = async () => {
      const parcel = await AsyncStorage.getItem('parcel');
      if (parcel) {
        setParcel(JSON.parse(parcel));
      }
    };

    fetchParcel();
  }, []);


  const Returnparceloptions = () => {
    AsyncStorage.setItem('parcel', JSON.stringify(parcel));
    navigation.navigate('ReturnParcelOptionsScreen');
  };

  // Format the dates as "15 Aug 2024"
  const formattedDueDate = moment(parcel?.dueDate).format('DD MMM YYYY');
  const formattedDOB = moment(parcel?.dateOfBirth).format('DD MMM YYYY');
  const fromattedScanInDate = moment(parcel?.scanInDatetime).format(
    'DD MMM YYYY, h:mm:ss a',
  );

  // Calculate the status based on the due date
  const now = moment();
  const dueDateMoment = moment(parcel?.dueDate);
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
        <TouchableOpacity
          style={styles.searchButton}
          onPress={Returnparceloptions}>
          <Text style={styles.buttonText}>RETURN DUE TO NON-COLLECTION</Text>
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
                {parcel?.title} {parcel?.firstName} {parcel?.surname}
              </Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Cellphone</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>{parcel?.cellphone}</Text>
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
              <Text style={styles.infoTextBlack}>{parcel?.gender}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.infoSection, {marginBottom: height * 0.4}]}>
          <View style={styles.headlineView}>
            <Text style={styles.sectionTitle}>MEDICATION INFORMATION</Text>
          </View>

          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Barcode</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>{parcel?.barcode}</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Manifest</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>{parcel?.dispatchRef}</Text>
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
              <Text style={styles.infoTextBlack}>{parcel?.consignmentNo}</Text>
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
    backgroundColor: '#F89406',
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

export default ReturnParcelDetailsScreen;
