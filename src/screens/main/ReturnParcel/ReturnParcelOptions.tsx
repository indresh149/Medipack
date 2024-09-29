import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Card, Image} from '@rneui/base';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Colors} from '../../../../constants/colours';

const {height, width} = Dimensions.get('window');
const ReturnParcelOptions = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <ScrollView style={styles.mainView}>
      <View style={styles.textConatiner}>
        <Text style={styles.textStyle}>Return Parcels</Text>
      </View>
      <Card containerStyle={styles.middleView}>
        <View style={styles.middleContainer}>
          <View>
            <Image
              style={styles.imageStyle}
              source={require('../../../../assets/images/BarcodeImg.png')}
            />
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() => navigation.navigate('AutoReturnParcelScreen')}>
              <Text style={styles.buttonText}>Auto Return</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Image
              style={styles.imageStyle}
              source={require('../../../../assets/images/KeyboardImg.png')}
            />
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() => navigation.navigate('ReturnParcelManualScreen')}>
              <Text style={styles.buttonText}>Manual Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  textConatiner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: Colors.green,
    marginTop: 20,
  },
  middleView: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 50,
    opacity: 0.8,
    borderRadius: 10,
  },
  middleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  imageStyle: {
    resizeMode: 'contain',
    width: width * 0.3,
    height: height * 0.2,
  },
  textContainer: {
    alignSelf: 'center',
    height: height * 0.08,
    width: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: Colors.green,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFPercentage(1.5),
  },
});

export default ReturnParcelOptions;
