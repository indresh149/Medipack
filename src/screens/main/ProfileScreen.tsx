import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Iconuser from 'react-native-vector-icons/EvilIcons';
import {getUserInfo} from '../../../Utils/utils';
import {Colors} from '../../../constants/colours';
import LoadingOverlay from '../../components/LoadingOverlay';

const ProfileScreen = () => {
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    async function fetchEmail() {
      const userInfo = await getUserInfo();
    
      if (userInfo) {
        setUserDetails(userInfo);
      }
    }
    fetchEmail();
  }, []);

  if (!userDetails) {
    return <LoadingOverlay message="Loading..." />;
  }

  return (
    <View style={styles.container}>
      <Iconuser name="user" size={150} color={Colors.green} />
      <Text style={styles.profileText}>Profile</Text>

      <View style={styles.fieldcontainer}>
        <Text style={styles.label}>Name: </Text>
        <Text style={styles.value}>
          {userDetails.firstName} {userDetails.surname}
        </Text>
      </View>

      <View style={styles.fieldcontainer}>
        <Text style={styles.label}>Username: </Text>
        <Text style={styles.value}>{userDetails.loginId}</Text>
      </View>

      <View style={styles.fieldcontainer}>
        <Text style={styles.label}>Email: </Text>
        <Text style={styles.value}>{userDetails.email}</Text>
      </View>

      <View style={styles.fieldcontainer}>
        <Text style={styles.label}>Phone Number: </Text>
        <Text style={styles.value}>{userDetails.cellphone}</Text>
      </View>

      {/* <View>
        <Text style={styles.editLink}>Edit Profile</Text>
      </View>

      <View>
        <TouchableOpacity>
          <Text style={styles.label}>Send reset password email</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldcontainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  editLink: {
    marginBottom: 10,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  profileText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
});

export default ProfileScreen;
