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
  ScrollView
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Colors} from '../../../../constants/colours';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {height, width} = Dimensions.get('window');
const ReturnParcelOptionsAllScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleSelectedOptions = (returnType:any) => {
        AsyncStorage.setItem('returnType', returnType);
        navigation.navigate('ReturnParcelSelected');
    }

  return (
    <ScrollView style={styles.mainView}>
      <View style={styles.textConatiner}>
        <Text style={styles.textStyle}>Return Parcels</Text>
      </View>
      <Card containerStyle={styles.middleView}>
        <View style={styles.middleContainer}>
        <View style={styles.firstView}>
            <Image
              style={styles.imageStyle}
              source={require('../../../../assets/images/BarcodeImg.png')}
            />
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() => handleSelectedOptions("autoCamera")}>
              <Text style={styles.buttonText}>Auto Return using Camera</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Image
              style={styles.imageStyle}
              source={require('../../../../assets/images/BarcodeImg.png')}
            />
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() => handleSelectedOptions("autoScanner")}>
              <Text style={styles.buttonText}>Auto Return using Scanner</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.lastView}>
            <Image
              style={styles.imageStyle}
              source={require('../../../../assets/images/KeyboardImg.png')}
            />
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() => handleSelectedOptions("manual")}>
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
    width: '95%',
    alignSelf: 'center',
    marginTop: 50,
    opacity: 0.8,
    borderRadius: 10,
  },
  middleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.05,
  },
  firstView: {
    marginRight: width * 0.07,
  },
  lastView: {
    marginLeft: width * 0.07,
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

export default ReturnParcelOptionsAllScreen;
