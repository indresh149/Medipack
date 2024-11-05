import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { RFPercentage } from 'react-native-responsive-fontsize';
import IconDelete from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../constants/colours';
import { deregisterDevice } from '../../../database/DatabseOperations';

const {height, width} = Dimensions.get('window');
const AdministrationScreen = () => {
  const navigation = useNavigation<any>();
  const version = DeviceInfo.getVersion();
  const {type, isConnected} = useNetInfo();

  console.log('Connection type', type);
  console.log('Is connected?', isConnected);

  const confirmDeregister = () => {
    if (!isConnected) {
      Alert.alert(
        'No Internet Connection', // Title
        'Please connect to the internet to de-register this device', // Message
        [
          {
            text: 'Ok',
            onPress: () => console.log('Deregistration Cancelled'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
      return;
    }
    Alert.alert(
      'Confirm De-registration', // Title
      'Are you sure you want to de-register this device?', // Message
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Deregistration Cancelled'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deregisterDevice(navigation), // Call deregisterDevice if user confirms
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {'App Version : '}
          {version}
        </Text>
      </View>
      <View style={styles.deregisterContainer}>
        <View>
          <IconDelete
            name="delete-forever"
            size={RFPercentage(10)}
            color={Colors.black}
          />
        </View>
        <TouchableOpacity
          style={styles.deregisterButton}
          onPress={confirmDeregister}>
          <Text style={styles.deregsiterText}>De-register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    height: height * 0.05,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: height * 0.003,
  },
  headerText: {
    color: Colors.white,
    fontSize: RFPercentage(1.6),
    fontWeight: 'bold',
  },
  deregisterContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.05,
    marginTop: height * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 10,
  },
  deregisterButton: {
    height: height * 0.06,
    width: width * 0.3,
    backgroundColor: Colors.green,
    padding: height * 0.01,
    marginTop: height * 0.05,
    borderRadius: 4,
  },
  deregsiterText: {
    color: Colors.white,
    fontSize: RFPercentage(1.5),
    textAlign: 'center',
  },
});

export default AdministrationScreen;
