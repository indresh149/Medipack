import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {ScreenHeight} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import IconPeople from 'react-native-vector-icons/Ionicons';
import {getUserInfo} from '../../Utils/utils';
import {Colors} from '../../constants/colours';

const {height, width} = Dimensions.get('window');

const CustomDrawer = (props: any) => {
  const navigation = useNavigation<any>();
  const [storedEmail, setStoredEmail] = useState('indreshgoswami149@gmail.com');
  const [storedFirstName, setStoredFirstName] = useState('Indresh');
  const [storedlastName, setStoredlastName] = useState('Goswami');

  const handleEditProfilePress = () => {
    navigation.navigate('ProfileScreen');
  };

  const handleAdminPress = () => {
    navigation.navigate('AdministrationScreen');
  };

  useEffect(() => {
    async function fetchEmail() {
      const userInfo = await getUserInfo();

      if (userInfo) {
        setStoredEmail(userInfo.email);
        setStoredFirstName(userInfo.firstName);
        setStoredlastName(userInfo.surname);
      }
    }
    fetchEmail();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('UserInfo');
      await AsyncStorage.removeItem('ActualLogin');
      navigation.replace('LoginScreen' as any);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = ScreenHeight < 768;

  return (
    <View style={styles.drawerMainView}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: '#F3F3F4'}}>
        <View style={styles.upperDrawerView}>
          <View style={styles.nameContainer}>
            <IconPeople
              name="person"
              size={30}
              color={Colors.white}
              style={[
                styles.iconView,
                isSmallScreen ? {marginTop: height * 0.05} : null,
              ]}
            />
            <View>
              <Text
                style={[
                  styles.fullName,
                  isSmallScreen ? {marginTop: height * 0.02} : null,
                ]}>
                {storedFirstName} {storedlastName}
              </Text>
              <Text style={styles.emailStyle}>{storedEmail}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            paddingTop: 5,
            borderTopWidth: 1,
            borderTopColor: '#1B75BB',
          }}>
          <DrawerItemList {...props} />
        </View>
        <View style={styles.lowerDrawerSection}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <DrawerItem
            label="Pending Scan In Parcel"
            onPress={() => navigation.navigate('PendingScainInParcelScreen')}
            labelStyle={{flexWrap: 'wrap'}}
          />
          <DrawerItem
            label="Overdue Parcels"
            onPress={() => navigation.navigate('OverDueParcelReportScreen')}
          />

          <DrawerItem
            label="One Week Scanned Out"
            onPress={() => navigation.navigate('OneWeekScannedOutReportScreen')}
          />
          <DrawerItem
            label="One Week Returned"
            onPress={() =>
              navigation.navigate('ScanOutParcelRturnedReportScreen')
            }
          />

          <DrawerItem
            label="Device Summary"
            onPress={() => navigation.navigate('OneWeekSummaryReportScreen')}
          />
        </View>
      </DrawerContentScrollView>
      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#1B75BB'}}>
        <TouchableOpacity onPress={() => {}} style={{paddingVertical: 3}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}></View>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={{paddingVertical: 6}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                color: '#676A6C',
                fontSize: 15,
                fontFamily: 'zwodrei',
                marginLeft: 5,
              }}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleEditProfilePress}
          style={{paddingVertical: 6}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                color: '#676A6C',
                fontSize: 15,
                fontFamily: 'zwodrei',
                marginLeft: 5,
              }}>
              My Profile
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAdminPress}
          style={{paddingVertical: 6}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                color: '#676A6C',
                fontSize: 15,
                fontFamily: 'zwodrei',
                marginLeft: 5,
              }}>
              Administration
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerMainView: {
    flex: 1,
    backgroundColor: '#F3F3F4',
  },
  upperDrawerView: {
    height: height * 0.15,
    backgroundColor: Colors.green,
  },
  fullName: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: width * 0.01,
    marginTop: height * 0.07,
  },
  emailStyle: {
    color: Colors.white,
    fontSize: 15,
    marginLeft: width * 0.01,
  },
  nameContainer: {
    flexDirection: 'row',
  },
  iconView: {
    marginTop: height * 0.09,
    marginLeft: width * 0.01,
  },
  drawerListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#1B75BB',
  },
  lowerDrawerSection: {
    borderTopWidth: 1,
    borderTopColor: '#1B75BB',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#676A6C',
    marginBottom: 10,
  },
});
export default CustomDrawer;
