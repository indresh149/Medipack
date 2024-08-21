import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import BASE_URL from '../../../config';
import LoadingOverlay from '../../components/LoadingOverlay';
import { getUserInfo } from '../../../Utils/utils';
import Iconuser from 'react-native-vector-icons/EvilIcons';
import { Colors } from '../../../constants/colours';



const ProfileScreen = () => {
   
    const [userDetails, setUserDetails] = useState<any>(null);

    useEffect(() => {
      async function fetchEmail() {
        const userInfo = await getUserInfo();
        console.log('user info:', userInfo);
        if (userInfo) {
          setUserDetails(userInfo);
        }
      }
      fetchEmail();
    }, []);

    // const handleForgotPassword = () => {
    //     axios.post(`${BASE_URL}/account/forgot-password`,
    //         { email: userDetails.email })
    //         .then(response => {
    //             Alert.alert(response.data);
    //         })
    //         .catch(error => {
    //             Alert.alert(error);
    //         });
    // };


    // useEffect(() => {
    //     const fetchData = async () => {
    //         const response = await axios.get(`${BASE_URL}/account/user`, {
    //             headers: {
    //                 'Authorization': `Bearer ${jwtToken}`
    //             }
    //         });
    //         setUserDetails(response.data);
    //         console.log(response.data);
    //     };
    //     fetchData();
    // }, []);

    if (!userDetails) {
        return (
            <LoadingOverlay message="Loading..." />
        );
    }

    return (
        <View style={styles.container}>
            <Iconuser name="user" size={150} color={Colors.green} />
            <Text style={styles.profileText}>Profile</Text>

            <View style={styles.fieldcontainer}>
                <Text style={styles.label}>Name: </Text>
                <Text style={styles.value}>{userDetails.firstName} {userDetails.surname}</Text>
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

            <View>
                <Text style={styles.editLink}>Edit Profile</Text>
            </View>

            <View>
                <TouchableOpacity 
                
                >
                    <Text style={styles.label}>Send reset password email</Text>
                </TouchableOpacity>
            </View>
            
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
        marginBottom: 20
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
    }
});

export default ProfileScreen;