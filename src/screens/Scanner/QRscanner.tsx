import {Camera} from 'react-native-camera-kit';
import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Pressable, Alert} from 'react-native';
import {NumberlessRegularText} from '../../components/NumberlessText';
import Area from '../../../assets/miscellaneous/scanArea.svg';
import TorchOn from '../../../assets/icons/TorchOn.svg';
import TorchOff from '../../../assets/icons/TorchOff.svg';
import {checkCameraPermission} from '../../utils/OSpermissions';
import { useNavigation } from '@react-navigation/native';

export default function QRScanner({onCodeScanned}) {
  const navigation = useNavigation();
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
    useState(false);

  useEffect(() => {
    checkCameraPermission(setIsCameraPermissionGranted);
  }, []);
  const [viewWidth, setViewWidth] = useState(0);
  const [qrData, setQrData] = useState("");
  const showAlertAndWait = () => {
    Alert.alert(
      'Incorrect OR',
      'QR code not a numberless QR code',
      [
        {
          text: 'OK',
          onPress: () => {setQrData("");
          setScanCode(true);},
        },
      ],
      { cancelable: false }
    );
};
  useEffect(() => {
    if (qrData !== "") {
      //this makes scan happen only once
      onCodeScanned(qrData).then((ret) => {if(ret) {
        navigation.navigate('Home');
      } else {
        showAlertAndWait();
      }})
    } 
  }, [qrData]);

  const onLayout = event => {
    const {width} = event.nativeEvent.layout;
    setViewWidth(width);
  };
  const [torchState, setTorchState] = useState('off');
  const [scanCode, setScanCode] = useState(true);
  return (
    <View style={styles.container} onLayout={onLayout}>
      {isCameraPermissionGranted ? (
        <Camera
          cameraType="back"
          flashMode="off"
          focusMode="on"
          zoomMode="on"
          torchMode={torchState}
          saveToCameraRoll={false}
          style={styles.camera}
          scanBarcode={scanCode}
          onReadCode={(event) => {setScanCode(false);
            setQrData(event.nativeEvent.codeStringValue);}}
        />
      ) : (
        <View style={styles.permissionDenied}>
          <NumberlessRegularText style={styles.text}>
            Please provide camera permission
          </NumberlessRegularText>
        </View>
      )}
      <View style={styles.cameraOptions}>
        <Area
          width={viewWidth * 0.7}
          height={viewWidth * 0.7}
          style={styles.scanArea}
        />
      </View>
      <View style={styles.torch}>
        <Torch state={torchState} setState={setTorchState} />
      </View>
    </View>
  );
}

function Torch({state, setState}) {
  if (state === 'on') {
    return (
      <Pressable style={styles.roundButton} onPress={() => setState('off')}>
        <TorchOn />
      </Pressable>
    );
  } else {
    return (
      <Pressable style={styles.roundButton} onPress={() => setState('on')}>
        <TorchOff />
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  permissionDenied: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '5%',
    paddingRight: '5%',
    paddingBottom: 100,
    width: '100%',
  },
  text: {
    color: '#FFFFFF',
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  cameraOptions: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    marginBottom: 100,
    borderRadius: 14,
  },
  torch: {
    position: 'absolute',
    paddingBottom: 150,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  roundButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'black',
    borderRadius: 50,
    opacity: 0.5,
  },
});
