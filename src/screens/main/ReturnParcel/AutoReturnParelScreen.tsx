import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {Colors} from '../../../../constants/colours';

const AutoReturnParcelScreen = () => {
  const navigation = useNavigation<any>();
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);

    if (timer === 0) {
      clearInterval(countdown);
      navigation.replace('Drawer', {screen: 'Scan In'});
    }

    return () => clearInterval(countdown);
  }, [timer, navigation]);

  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const device = useCameraDevice('back');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [barcode, setBarcode] = useState<string | any>('');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
    })();
  }, []);

  const codeScanner = useCodeScanner({
    // codeTypes: ['qr', 'ean-13'],
    codeTypes: ['code-128', 'code-39', 'code-93'],
    onCodeScanned: codes => {
      console.log(codes);
      console.log(`Scanned ${codes.length} codes!`);
      if (codes[0].value) {
        setBarcode(codes[0].value);
        navigation.replace('AutoReturnParcelDetails', {
          barcode: codes[0].value,
        });
      }
    },
  });

  return (
    <View style={styles.mainView}>
      <View style={styles.upperContainer}>
        <Text>BarcodeScanner</Text>
        {device != null && hasPermission && (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            isActive={hasInitialized}
            photo={true}
            device={device}
            pixelFormat="yuv"
            codeScanner={codeScanner}
            photoQualityBalance={'speed'}
            onInitialized={() => {
              setHasInitialized(true);
            }}
          />
        )}
      </View>
      <View style={styles.lowerConatiner}>
        <CircularProgress
          value={timer}
          radius={100}
          maxValue={30}
          valueSuffix="s"
          inActiveStrokeColor={Colors.grey}
          inActiveStrokeOpacity={0.5}
          duration={1000}
          // onAnimationComplete={() => navigation.navigate('ScanInManualScreen')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  upperContainer: {
    marginTop: '15%',
    height: '40%',
    width: '30%',
  },
  lowerConatiner: {
    marginTop: '10%',
    height: '60%',
    width: '20%',
    alignContent: 'center',
  },
});

export default AutoReturnParcelScreen;
