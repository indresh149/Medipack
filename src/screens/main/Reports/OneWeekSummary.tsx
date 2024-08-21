import { View, Text, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigation ,useFocusEffect} from '@react-navigation/native';
  import { NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import { Parcel } from '../../../../Utils/types';
import { fetchParcels, fetchParcelsFromLastWeek } from '../../../../database/DeviceSync';
import { Colors } from '../../../../constants/colours';
import { Card } from '@rneui/base';
import { RFPercentage } from 'react-native-responsive-fontsize';

const OneWeekSummary = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [barcode, setBarcode] = useState<string>('');
  const [noOfParcels, setNoOfParcels] = useState<number>(0);
  const navigation = useNavigation<NativeStackNavigationProp<any>>(); 
  const [scaInPending, setScanInPending] = useState<number>(0);
  const [readyForScanInCount, setReadyForScanInCount] = useState<number>(0);
  const [readyForScanOutCount, setReadyForScanOutCount] = useState<number>(0);
  const [oneWeekCollectionCount, setOneWeekCollectionCount] = useState<number>(0);
  const [oneWeekReturnedCount, setOneWeekReturnedCount] = useState<number>(0);

  const loadParcels = async () => {
    try {
      let fetchReadyForScanInParcels : Parcel[] = await fetchParcels(2);
      setReadyForScanInCount(fetchReadyForScanInParcels.length);

      let fetchReadyForScanOutParcels : Parcel[] = await fetchParcels(3);
      setReadyForScanOutCount(fetchReadyForScanOutParcels.length);
      let fetchedParcelsColletedbyOtp: Parcel[] = await fetchParcelsFromLastWeek(4);
      let fetchedParcelsColletedbyId: Parcel[] = await fetchParcelsFromLastWeek(5);
       let fetchCollectedParcels: Parcel[] = [...fetchedParcelsColletedbyOtp, ...fetchedParcelsColletedbyId];
      setOneWeekCollectionCount(fetchCollectedParcels.length);
      let fetchedParcelsReturned: Parcel[] = await fetchParcelsFromLastWeek(6);
      setOneWeekReturnedCount(fetchedParcelsReturned.length);

       
    } catch (error) {
      console.error('Error loading parcels:', error);
    }

  };


  useEffect(() => {
    loadParcels();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadParcels();
    }, [])
  );

  
  return (
    <View style={styles.mainView}>
      <Card containerStyle={styles.cardView}>
        <View style={styles.cardContainer}>
        <Text style={styles.headingText}>Device Summary</Text>
        <View style={styles.textContainer}>
        <Text style={styles.normalText}>Ready for scan in parcels count:</Text>
        <Text style={styles.normalTextLarge}> {readyForScanInCount}</Text>
        </View>
        <View style={styles.textContainer}>
        <Text style={styles.normalText}>Ready for scan out parcels count: </Text>
        <Text style={styles.normalTextLarge}>{readyForScanOutCount}</Text>
        </View>
        <View style={styles.textContainer}>
        <Text style={styles.normalText}>Collected parcel count (Last one week): </Text>
        <Text style={styles.normalTextLarge}>{oneWeekCollectionCount}</Text>
        </View>
        <View style={styles.textContainer}>
        <Text style={styles.normalText}>Returned parcel count (Last one week): </Text>
        <Text style={styles.normalTextLarge}>{oneWeekReturnedCount}</Text>
         </View>
        </View>
      </Card>
    </View>
  )
}


const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  cardView: {
    alignSelf: 'center',
    margin: 20,
    width: '97%',
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  cardContainer: {
    padding: 10,
  },
  headingText: {
    color: Colors.black,
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
    marginBottom: 10,
  },
  normalText: {
    color: Colors.black,
    fontSize: RFPercentage(1.5),
    marginBottom: 10,
    marginTop: 10,
  },
  normalTextLarge: {
    color: Colors.black,
    fontSize: RFPercentage(1.7),
    marginBottom: 10,
    marginTop: 10,
    fontWeight: 'bold',
  },
  textContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default OneWeekSummary