import React, {useMemo, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Colors} from '../../../constants/colours';
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import {RFPercentage} from 'react-native-responsive-fontsize';

const {height, width} = Dimensions.get('window');
const ScanOutScreen = () => {
  const [idNumber, setIdNumber] = useState('');
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
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.buttonText}>SEARCH</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoSection}>
          <View style={styles.headlineView}>
            <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Name of Patient</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>ELIZABETH</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Surname of Patient</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>ELIZABETH</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Passport Number</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>123456789</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Cellphone Number</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>123456789</Text>
            </View>
          </View>
        </View>
        <View style={styles.infoSection}>
          <View style={styles.headlineView}>
            <Text style={styles.sectionTitle}>MEDICATION INFORMATION</Text>
          </View>

          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Scanned Barcode</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>NHIALKJHKJH</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Parcel Scanned In Date</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>2023-12-17 21:37:26</Text>
            </View>
          </View>
          <View style={styles.oneRowView}>
            <View style={styles.attributeView}>
              <Text style={styles.infoText}>Parcel Due Date</Text>
            </View>
            <View style={styles.valueView}>
              <Text style={styles.infoTextBlack}>2017-10-26T00:00:00</Text>
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
        <TouchableOpacity style={styles.scanOutButton}>
          <Text style={styles.buttonText}>SCAN OUT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.white,
    flexDirection: 'row',
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
    width: '50%',
    padding: 10,
  },
  infoSection: {
    width: '100%',
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

export default ScanOutScreen;
