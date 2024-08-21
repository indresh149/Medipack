import AsyncStorage from "@react-native-async-storage/async-storage";


export const getDeviceInfo = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('DeviceInfo');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Error reading value", e);
    }
  };

export const getUserInfo = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('UserInfo');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Error reading value", e);
    }
  };