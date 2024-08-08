import {View, Text, StyleSheet, TextInput, Dimensions} from 'react-native';
import React, {useMemo, useState} from 'react';
import {Colors} from '../../../constants/colours';
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Card} from '@rneui/base';
import {TouchableOpacity} from 'react-native-gesture-handler';

const {height, width} = Dimensions.get('window');
const SearchPatientScreen = () => {
  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: '1',
        label: 'ID Number/Passport',
        value: 'option1',
      },
      {
        id: '2',
        label: 'Cell Number',
        value: 'option2',
      },
      {
        id: '3',
        label: 'Surname',
        value: 'option3',
      },
      {
        id: '4',
        label: 'Date of Birth',
        value: 'option4',
      },
    ],
    [],
  );

  const [selectedId, setSelectedId] = useState<string | undefined>();

  const [idNumber, setIdNumber] = useState('');
  const [cellNumber, setCellNumber] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');

  return (
    <View style={styles.mainView}>
      <Card containerStyle={styles.cardView}>
        <View style={styles.radioGroup}>
          <RadioGroup
            radioButtons={radioButtons}
            onPress={setSelectedId}
            selectedId={selectedId}
            layout="row"
          />
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
              placeholder="Enter Cell Number"
              value={cellNumber}
              onChangeText={setCellNumber}
            />
          )}
          {selectedId === '3' && (
            <TextInput
              style={styles.input}
              placeholder="Enter Surname"
              value={surname}
              onChangeText={setSurname}
            />
          )}
          {selectedId === '4' && (
            <TextInput
              style={styles.input}
              placeholder="Enter Date of Birth"
              value={dob}
              onChangeText={setDob}
            />
          )}
        </View>

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.buttonText}>SEARCH</Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <View style={styles.mainContainer}>
          <View style={styles.nameCircle}>
            <Text style={styles.circleText}>M</Text>
          </View>
          <View style={styles.basicDetails}>
            <Text style={styles.infoText}>Patient Surname: MAKOBELA</Text>
            <Text style={styles.infoText}>Patient Name: MARIA</Text>
            <Text style={styles.infoText}>Patient Id Number: MAKOBELA</Text>
          </View>
          <View style={styles.basicDetails}>
            <Text style={styles.infoText}>Patient Cellphone: 123456789</Text>
            <Text style={styles.infoText}>Patient NHI Number: MARIAAA</Text>
            <Text style={styles.infoText}>Patient Due Dater: 2023-24-25</Text>
          </View>
          <View style={styles.rightBottomText}>
            <Text style={styles.bottomText}>Over Due</Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  cardView: {
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },
  radioGroup: {
    alignItems: 'center',
  },
  input: {
    width: '50%',
    height: height * 0.08,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  searchButton: {
    width: '50%',
    backgroundColor: Colors.green,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFPercentage(1.5),
  },
  nameCircle: {
    width: width * 0.06,
    height: height * 0.1,
    borderRadius: (width * 0.06) / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.green,
    borderWidth: 5,
  },
  circleText: {
    color: Colors.green,
    fontSize: RFPercentage(2),
  },
  mainContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  basicDetails: {
    marginLeft: width * 0.05,
  },
  infoText: {
    fontSize: RFPercentage(1.2),
    marginBottom: 5,
  },
  rightBottomText: {
    position: 'absolute',
    right: 10,
    bottom: 5,
    padding: 5,
    borderRadius: 5,
  },
  bottomText: {
    color: Colors.red,
    fontSize: RFPercentage(1.5),
    padding: 1,
    borderRadius: 5,
  },
});

export default SearchPatientScreen;
