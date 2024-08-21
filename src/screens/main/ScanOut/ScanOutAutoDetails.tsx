import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { NativeStackScreenProps ,NativeStackNavigationProp} from '@react-navigation/native-stack';
import { Card } from '@rneui/base';
import { Colors } from '../../../../constants/colours';
import { RFPercentage } from 'react-native-responsive-fontsize';

const ScanOutAutoDetails : React.FC<NativeStackScreenProps<any, any>> = ({ route }) => {
      const {barcode} = route.params as {barcode: string};
      return (
        <View style={styles.mainView}>
          <Card containerStyle={styles.cardView}>
            <View style={styles.cardContainer}>
            <Text style={styles.headingText}>Scan Details</Text>
            <View style={styles.textContainer}>
            <Text style={styles.normalText}>Barcode value: </Text>
            <Text style={styles.normalTextLarge}>{barcode}</Text>
            
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
    
export default ScanOutAutoDetails