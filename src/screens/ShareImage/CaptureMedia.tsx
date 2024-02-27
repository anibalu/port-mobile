/**
 * QR scanner used in the App.
 */
import CameraButton from '@assets/icons/CameraButton.svg';
import CameraReverse from '@assets/icons/CameraReverse.svg';
import TorchOff from '@assets/icons/TorchOff.svg';
import TorchOn from '@assets/icons/TorchOn.svg';
import VideoRecord from '@assets/icons/VideoRecord.svg';
import Gallery from '@assets/icons/WhiteGallery.svg';
import Cross from '@assets/icons/Whitecross.svg';
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {checkCameraPermission} from '@utils/AppPermissions';
import {generateRandomHexId} from '@utils/IdGenerator';
import {ContentType} from '@utils/Messaging/interfaces';
import {FileAttributes} from '@utils/Storage/interfaces';
import React, {useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {
  Camera,
  useCameraDevice,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import {imageRegex} from 'src/context/ConnectionModalContext';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptureMedia'>;

const CaptureMedia = ({navigation, route}: Props) => {
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
    useState(false);
  const {hasPermission, requestPermission} = useMicrophonePermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    checkCameraPermission(setIsCameraPermissionGranted);

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [mediaList, setMediaList] = useState<any>([]);

  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );

  //   const [torchState, setTorchState] = useState<'on' | 'off'>('off');

  const camera = useRef<Camera>(null);

  const [isRecording, setRecording] = useState(false);

  const startRecording = () => {
    handleReset();
    if (camera.current) {
      handleStartStop();
      camera.current.startRecording({
        flash: flash,
        onRecordingFinished: video => {
          const extension = video.path.split('.')[!isIOS ? 2 : 1];

          //videos are selected
          const file: FileAttributes = {
            fileUri: video.path || '',
            fileType: 'video/' + extension,
            fileName: generateRandomHexId() + '.' + extension || '',
          };
          //video is sent
          const msg = {
            contentType: ContentType.video,
            data: {...file},
          };

          setMediaList(oldList => [...oldList, msg]);
        },
        onRecordingError: error => {
          console.error(error);
        },
      });
      setRecording(true);
    }
  };

  const takePhoto = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto({
        flash: cameraPosition === 'back' ? flash : false,
      });
      const extension = photo.path.split('.')[2];
      //videos are selected
      const file: FileAttributes = {
        fileUri: photo.path || '',
        fileType: 'image/' + extension,
        fileName: generateRandomHexId() + '.' + extension || '',
      };
      //video is sent
      const msg = {
        contentType: ContentType.image,
        data: {...file},
      };
      setMediaList(oldList => [...oldList, msg]);
    }
  };

  const onGalleryPressed = async (): Promise<void> => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'mixed',
        includeBase64: false,
        selectionLimit: 6,
      });
      //videos are selected
      const selected: Asset[] = response.assets || [];
      const finalList = [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };
        //video is sent
        const msg = {
          contentType: imageRegex.test(file.fileType)
            ? ContentType.image
            : ContentType.video,
          data: {...file},
        };
        finalList.push(msg);
      }
      setMediaList(oldList => [...oldList, ...finalList]);
      //send media message
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  useEffect(() => {
    goToConfirmation();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaList]);

  const goToConfirmation = () => {
    if (mediaList.length > 0) {
      navigation.navigate('GalleryConfirmation', {
        selectedMembers: [{chatId: route.params.chatId}],
        shareMessages: mediaList,
        isChat: true,
        isGroupChat: route.params.isGroupChat,
        fromCapture: true,
        onRemove: (item: any) => {
          setMediaList((oldList: any[]) =>
            oldList.filter(ele => ele.data.fileUri != item),
          );
        },
      });
    }
  };

  const stopRecording = () => {
    setRecording(false);
    if (isRecording && camera.current) {
      camera.current.stopRecording();
      handleStartStop();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 6000);
    const seconds = Math.floor((time % 6000) / 1000);
    const milliseconds = time % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
  };

  let device = useCameraDevice(cameraPosition);

  return (
    <View style={styles.container}>
      {isCameraPermissionGranted && device ? (
        <Camera
          device={device}
          ref={camera}
          isActive={true}
          video={true}
          audio={hasPermission}
          photo={true}
          style={styles.camera}
        />
      ) : (
        <View style={styles.permissionDenied}>
          <NumberlessText
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}
            style={styles.text}>
            Please provide camera permission
          </NumberlessText>
        </View>
      )}
      <View style={styles.topbar}>
        <Pressable
          onPress={() => {
            navigation.goBack();
          }}>
          <Cross color={PortColors.primary.white} />
        </Pressable>
        {cameraPosition === 'back' ? (
          flash === 'off' ? (
            <Pressable
              onPress={() => {
                setFlash('on');
              }}>
              <TorchOff />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                setFlash('off');
              }}>
              <TorchOn />
            </Pressable>
          )
        ) : null}
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 32,
          alignItems: 'center',
          width: '100%',
        }}>
        {isRunning ? (
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.rg}
            textColor={PortColors.text.primaryWhite}
            style={{
              backgroundColor: PortColors.primary.red.error,
              paddingVertical: 4,
              paddingHorizontal: 11,
              borderRadius: 16,
              marginBottom: 54,
              overflow: 'hidden',
            }}>
            {formatTime(time)}
          </NumberlessText>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            marginBottom: 24,
            justifyContent: isRunning ? 'center' : 'space-between',
            alignItems: 'center',
            paddingHorizontal: 50,
            width: '100%',
          }}>
          {!isRunning && (
            <Pressable onPress={onGalleryPressed}>
              <Gallery />
            </Pressable>
          )}
          <Pressable
            onPress={takePhoto}
            onLongPress={startRecording}
            onPressOut={stopRecording}>
            {isRecording ? <VideoRecord /> : <CameraButton />}
          </Pressable>
          {!isRunning && (
            <Pressable
              onPress={() => {
                setCameraPosition(old => (old === 'front' ? 'back' : 'front'));
              }}>
              <CameraReverse />
            </Pressable>
          )}
        </View>
        {!isRunning && (
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            textColor={PortColors.text.primaryWhite}>
            Tap for photo, hold for video
          </NumberlessText>
        )}
      </View>
    </View>
  );
};

export default CaptureMedia;

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
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 100,
    width: '100%',
  },
  successIndicatorArea: {
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    backgroundColor: PortColors.primary.grey.light,
    width: screen.width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanSuccessText: {
    color: PortColors.primary.success,
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  newPortArea: {
    backgroundColor: PortColors.primary.white,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 30,
    paddingBottom: 30,
  },
  groupName: {
    textAlign: 'center',
    color: '#547CEF',
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
  topbar: {
    position: 'absolute',
    top: 36,
    width: screen.width,
    flexDirection: 'row',
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'black',
    borderRadius: 50,
    opacity: 0.5,
  },
  popUpArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  saveButton: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#547CEF',
    width: '85%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  disabledbutton: {
    backgroundColor: '#547CEF',
    width: '85%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    opacity: 0.7,
    flexDirection: 'row',
  },
  buttontext: {
    color: 'white',
    fontSize: 15,
    width: '80%',
    textAlign: 'center',
  },
  savedInput: {
    width: '85%',
    height: 60,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 15,
  },
  savedInputText: {
    textAlign: 'center',
    color: '#000000',
  },
  savedDescription: {
    width: '85%',
    height: 150,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  savedDescriptionText: {
    textAlign: 'center',
    color: '#000000',
    height: '100%',
    padding: 15,
  },
});
