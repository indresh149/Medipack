import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
    Camera,
    Point,
    useCameraDevice,
    useCodeScanner,
  } from 'react-native-vision-camera';

const BarcodeScanner = () => {
    const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const device = useCameraDevice('back');
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
    })();
  }, []);

    const codeScanner = useCodeScanner({
         codeTypes: ['qr', 'ean-13'],
     //   codeTypes: ['code-128', 'code-39', 'code-93'],
        onCodeScanned: codes => {
          console.log(codes);
          console.log(`Scanned ${codes.length} codes!`);
        },
      });

      
  return (
    <View style={styles.container}>
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
              onInitialized={() => {
                setHasInitialized(true);
              }}
            />
          )}
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
})

export default BarcodeScanner