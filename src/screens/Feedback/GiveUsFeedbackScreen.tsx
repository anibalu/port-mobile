import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import LargeTextInput from '@components/Reusable/Inputs/LargeTextInput';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import Upload from '@assets/icons/UploadImageAccent.svg';
import AddImage from '@assets/icons/AddImage.svg';
import BlueCross from '@assets/icons/BlueCross.svg';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import DeviceInfo from 'react-native-device-info';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {submitBugReport} from '@utils/BugReporting/bug_reports';

const GiveUsFeedbackScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [images, setImages] = useState<(string | undefined)[]>([]);
  const [loading, setIsLoading] = useState(false);
  const {shareFeedbackSucceess, shareFeedbackError} = useErrorModal();

  const openImageGallery = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 3,
      });
      //images are selected
      const selected: Asset[] = response.assets || [];
      const imageList = [];
      for (let index = 0; index < selected.length; index++) {
        imageList.push(selected[index].uri);
      }
      if (images.length > 0) {
        setImages([...images, ...imageList]);
      } else {
        setImages(imageList);
      }
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };
  const sendBugReport = async (
    description: string,
    attached_files: (string | undefined)[],
  ) => {
    let deviceInfo = await DeviceInfo.getUserAgent();
    const images = attached_files[0] === '' ? [] : attached_files;
    const response = await submitBugReport(
      'Feedback',
      'Feedback',
      deviceInfo,
      images,
      description,
      setIsLoading,
    );
    if (response) {
      shareFeedbackSucceess();
      navigation.goBack();
    } else {
      shareFeedbackError();
    }
  };
  const removeImage = index => {
    setImages(prevImage => {
      const updatedimages = [...prevImage];
      updatedimages.splice(index, 1);
      return updatedimages;
    });
  };

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.background}
      />
      <SafeAreaView style={styles.screen}>
        <BackTopbar bgColor="g" onBackPress={() => navigation.goBack()} />
        <KeyboardAvoidingView
          style={styles.scrollViewContainer}
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}>
          <View style={styles.component}>
            <View>
              <NumberlessText
                fontSizeType={FontSizeType.xl}
                fontType={FontType.sb}
                textColor={PortColors.title}
                style={{
                  textAlign: 'left',
                  marginTop: PortSpacing.secondary.uniform,
                }}>
                Give us feedback
              </NumberlessText>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}
                textColor={PortColors.text.secondary}
                style={{
                  marginTop: PortSpacing.tertiary.top,
                  marginBottom: PortSpacing.secondary.top,
                }}>
                Tell us what you love about Port, or what we could be doing
                better.
              </NumberlessText>
              <View style={{marginBottom: PortSpacing.secondary.top}}>
                <LargeTextInput
                  showLimit={true}
                  setText={setText}
                  text={text}
                  placeholderText="Write your feedback"
                  maxLength={250}
                />
              </View>
              {images.length > 0 ? (
                <>
                  <View style={styles.row}>
                    {images.map((image, index) => {
                      return (
                        <View key={index}>
                          <Image style={styles.image} source={{uri: image}} />
                          <BlueCross
                            onPress={() => removeImage(index)}
                            style={styles.cross}
                          />
                        </View>
                      );
                    })}
                    {images.length < 3 && (
                      <AddImage onPress={() => openImageGallery()} />
                    )}
                  </View>
                </>
              ) : (
                <SecondaryButton
                  buttonText="Upload image"
                  secondaryButtonColor="b"
                  Icon={Upload}
                  iconSize="s"
                  onClick={() => openImageGallery()}
                />
              )}
              {images.length > 3 && (
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={PortColors.primary.red.error}
                  style={{
                    textAlign: 'left',
                    marginTop: PortSpacing.secondary.uniform,
                  }}>
                  Only 3 images are allowed. Please remove {images.length - 3}{' '}
                  images.
                </NumberlessText>
              )}
            </View>
            <PrimaryButton
              buttonText="Submit"
              disabled={text.length <= 0}
              isLoading={loading}
              onClick={async () => await sendBugReport(text, images)}
              primaryButtonColor="b"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: PortColors.background,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  scrollViewContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  cross: {
    position: 'absolute',
    right: -5,
    top: -5,
  },
  component: {
    marginHorizontal: 20,
    justifyContent: 'space-between',
    flex: 1,
    marginBottom: PortSpacing.secondary.uniform,
  },
});
export default GiveUsFeedbackScreen;
