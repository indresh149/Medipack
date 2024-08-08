import {Card} from '@rneui/base';
import React from 'react';
import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Colors } from '../../../constants/colours';

interface Parcel {
  id: number;
  surname: string;
  name: string;
  idNumber: string;
  cellphone: string;
  nhiNumber: string;
  dueDate: string;
  status: string; // Overdue or not
}

interface ParcelCardProps {
  parcel: Parcel;
}

const parcels: Parcel[] = [
  {
    id: 1,
    surname: 'MAKOBELA',
    name: 'MARIA',
    idNumber: '8804041574085',
    cellphone: '0632216446',
    nhiNumber: 'NHIF08CA005',
    dueDate: '2023-07-24',
    status: 'Over Due',
  },
  {
    id: 2,
    surname: 'MOKOENA',
    name: 'THABO',
    idNumber: '8904041574085',
    cellphone: '0632216446',
    nhiNumber: 'NHIF08CA005',
    dueDate: '2023-07-24',
    status: 'Not Over Due',
  },
  {
    id: 3,
    surname: 'MOKOENA',
    name: 'THABO',
    idNumber: '8904041574085',
    cellphone: '0632216446',
    nhiNumber: 'NHIF08CA005',
    dueDate: '2023-07-24',
    status: 'Not Over Due',
  },
  {
    id: 4,
    surname: 'MOKOENA',
    name: 'THABO',
    idNumber: '8904041574085',
    cellphone: '0632216446',
    nhiNumber: 'NHIF08CA005',
    dueDate: '2023-07-24',
    status: 'Over Due',
  },
  {
    id: 5,
    surname: 'MOKOENA',
    name: 'THABO',
    idNumber: '8904041574085',
    cellphone: '0632216446',
    nhiNumber: 'NHIF08CA005',
    dueDate: '2023-07-24',
    status: 'Not Over Due',
  },
  {
    id: 6,
    surname: 'MOKOENA',
    name: 'THABO',
    idNumber: '8904041574085',
    cellphone: '0632216446',
    nhiNumber: 'NHIF08CA005',
    dueDate: '2023-07-24',
    status: 'Over Due',
  },
  {
    id: 7,
    surname: 'MOKOENA',
    name: 'THABO',
    idNumber: '8904041574085',
    cellphone: '0632216446',
    nhiNumber: 'NHIF08CA005',
    dueDate: '2023-07-24',
    status: 'Not Over Due',
  },
  {
    id: 8,
    surname: 'MOKOENA',
    name: 'THABO',
    idNumber: '8904041574085',
    cellphone: '0632216446',
    nhiNumber: 'NHIF08CA005',
    dueDate: '2023-07-24',
    status: 'Over Due',
  }
];

const ParcelCard: React.FC<ParcelCardProps> = ({parcel}) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.nameCircle}>
        <Text style={styles.circleText}>{parcel.surname.charAt(0)}</Text>
      </View>
      <View style={styles.basicDetails}>
        <Text style={styles.infoText}>Patient Surname: {parcel.surname}</Text>
        <Text style={styles.infoText}>Patient Name: {parcel.name}</Text>
        <Text style={styles.infoText}>
          Patient Id Number: {parcel.idNumber}
        </Text>
      </View>
      <View style={styles.basicDetails}>
        <Text style={styles.infoText}>
          Patient Cellphone: {parcel.cellphone}
        </Text>
        <Text style={styles.infoText}>
          Patient NHI Number: {parcel.nhiNumber}
        </Text>
        <Text style={styles.infoText}>Patient Due Date: {parcel.dueDate}</Text>
      </View>
      <View style={styles.rightBottomText}>
        <Text style={styles.bottomText}>{parcel.status}</Text>
      </View>
    </View>
  );
};


const {height, width} = Dimensions.get('window');
const UploadParcelScreen = () => {
  return (
    <>
      <View style={styles.cardContainer}>
        <Card containerStyle={styles.cardView}>
          <View style={styles.cardInnerView}>
          <Text style={styles.infoTextLarge}>Upload Parcel</Text>
          <View style={styles.NumberCircle}>
            <Text style={styles.NumberText}>9</Text>
          </View>
          </View>
        </Card>
      </View>
      <FlatList
        data={parcels}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <ParcelCard parcel={item} />}
      />
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
  },
  cardView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width : '100%',
    margin: 10
  },
  cardInnerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoTextLarge: {
    fontSize: RFPercentage(3),
    color: Colors.green,
  },
  mainContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
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
  },
  rightBottomText: {
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 5,
    marginLeft: width * 0.3,
  },
  bottomText: {
    color: '#fff',
  },
});

export default UploadParcelScreen;
