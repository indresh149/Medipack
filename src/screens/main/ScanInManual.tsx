import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { NativeStackScreenProps ,NativeStackNavigationProp} from '@react-navigation/native-stack';
import { Card } from '@rneui/base';
import { Colors } from '../../../constants/colours';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { updateParcel } from '../../../database/DeviceSync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Parcel } from '../../../Utils/types';


const { height, width } = Dimensions.get('window');

const ScanInManualScreen: React.FC<NativeStackScreenProps<any, any>> = ({ route }) => {
  const { parcel } = route.params as { parcel: Parcel };
  const navigation = useNavigation<NativeStackNavigationProp<any>>(); // Add parentheses to call the function

 

  const getUserInfo = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('UserInfo');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Error reading value", e);
    }
  };

  const [barcode, setBarcode] = useState<string>('');

  // Placeholder for getting current user ID
  //const currentUserId = 12345; // Replace with actual user ID

  const handleManualScanIn = async () => {
    const userInfo = await getUserInfo();
    const currentUserId = userInfo?.userId;
    const passcode = Math.floor(10000 + Math.random() * 90000).toString();
    try {
      await updateParcel(parcel, currentUserId,'scanInDatetime','scanInByUserId',3,passcode);
      Alert.alert('Parcel scanned in successfully');
       navigation.replace('Drawer', { screen: 'Scan In' });;
      console.log('Parcel scanned in successfully');
      // Optionally, navigate back or show a success message
    } catch (error) {
      console.error('Error during manual scan-in:', error);
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
          <TouchableOpacity 
            style={styles.buttomView}
            onPress={handleManualScanIn}
          >
            <Text style={styles.buttonText}>Manual ScanIn</Text>
          </TouchableOpacity>
        </View>
      </Card>

       <View style={styles.patientInfoContainer}>
        <View style={styles.leftContainer}>
          <Text style={styles.patientInfoText}>Name: {parcel.title} {parcel.firstName} {parcel.surname}</Text>
          <Text style={styles.patientInfoText}>Barcode: {parcel.barcode}</Text>
          <Text style={styles.patientInfoText}>
          Manifest: {parcel.dispatchRef}
          </Text>
          <Text style={styles.patientInfoText}>
          Gender: {parcel.gender}
          </Text>
          <Text style={styles.patientInfoText}>
          Id Number: {parcel.idNumber}
          </Text>
          <Text style={styles.patientInfoText}>
          Due Date: {formattedDueDate}
          </Text>
          <Text style={styles.patientInfoText}>
          Consignment No.: {parcel.consignmentNo}
          </Text>
          <Text style={styles.patientInfoText}>
          Cellphone: {parcel.cellphone}
          </Text>
          <Text style={styles.patientInfoText}>
          Date Of Birth: {formattedDOB}
          </Text>
        </View>
        <View style={styles.rightContainer}>
        {statusText !== '' && (
        <View style={[styles.rightBottomText,{backgroundColor: statusText == '7 days overdue' ? '#d9534f' : '#F89406'}]}>
          <Text style={styles.bottomText}>{statusText}</Text>
        </View>
        
      )}
      </View>
        
      </View>
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

export default ScanInManualScreen;