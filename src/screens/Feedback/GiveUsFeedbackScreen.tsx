import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { Asset, launchImageLibrary } from 'react-native-image-picker';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import { useColors } from '@components/colorGuide';
import { isIOS } from '@components/ComponentUtils';
import { CustomStatusBar } from '@components/CustomStatusBar';
import { GestureSafeAreaView } from '@components/GestureSafeAreaView';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import FeedbackPortBottomsheet from '@components/Reusable/BottomSheets/FeedbackPortBottomsheet';
import LargeTextInput from '@components/Reusable/Inputs/LargeTextInput';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import { Spacing } from '@components/spacingGuide';

import { defaultFolderId, defaultPermissionsId} from '@configs/constants';

import { submitBugReport } from '@utils/BugReporting/bug_reports';
import { Port } from '@utils/Ports/SingleUsePorts/Port';
import { getProfileName } from '@utils/Profile';
import { getPermissions } from '@utils/Storage/DBCalls/permissions';
import { expiryOptions } from '@utils/Time/interfaces';

import AddImage from '@assets/icons/AddImage.svg';
import BlueCross from '@assets/icons/BlueCross.svg';
import Upload from '@assets/icons/GalleryAccentLight.svg';
import UploadBlack from '@assets/icons/GalleryOutline.svg';

import { useTheme } from 'src/context/ThemeContext';
import { ToastType, useToast } from 'src/context/ToastContext';



const GiveUsFeedbackScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [images, setImages] = useState<(string | undefined)[]>([]);
  const [loading, setIsLoading] = useState(false);

  const { showToast } = useToast();
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

  const getPortLink = async () => {
    const defaultPermissions = await getPermissions(defaultPermissionsId);
    const portClass = await Port.generator.create('Port Team Feedback', defaultFolderId, defaultPermissions, expiryOptions[0]);
    const name = await getProfileName();
    const link = await portClass.getShareableLink(name);
    return link;
  }

  const sendBugReport = async (
    description: string,
    attached_files: (string | undefined)[],
    sendPort: boolean
  ) => {
    const deviceInfo = await DeviceInfo.getUserAgent();
    const images = attached_files[0] === '' ? [] : attached_files;
    let port = null;
    if(sendPort) {
      port = await getPortLink();
    }
    const response = await submitBugReport(
      'Feedback',
      'Feedback',
      deviceInfo,
      images,
      description,
      port,
    );
    if (response) {
      showToast('Thanks for sharing your feedback.', ToastType.success);
      navigation.goBack();
    } else {
      showToast(
        'Network error while sending feedback. Please try again later',
        ToastType.error,
      );
    }
  };
  const removeImage = index => {
    setImages(prevImage => {
      const updatedimages = [...prevImage];
      updatedimages.splice(index, 1);
      return updatedimages;
    });
  };

  const Colors = useColors();
  const styles = styling(Colors);
  const { themeValue } = useTheme();
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.background} />
      <GestureSafeAreaView style={styles.screen}>
        <BackTopbar bgColor="g" onBackPress={() => navigation.goBack()} />
        <KeyboardAvoidingView
          style={styles.scrollViewContainer}
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}>
          <View style={styles.component}>
            <View>
              <NumberlessText
                fontSizeType={FontSizeType.xl}
                fontWeight={FontWeight.sb}
                textColor={Colors.text.buttonText}
                style={{
                  textAlign: 'left',
                  marginTop: Spacing.l,
                }}>
                Give us feedback
              </NumberlessText>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontWeight={FontWeight.rg}
                textColor={Colors.text.subtitle}
                style={{
                  marginTop: Spacing.s,
                  marginBottom: Spacing.l,
                }}>
                Tell us what you love about Port, or what we could be doing
                better.
              </NumberlessText>
              <View style={{ marginBottom: Spacing.l }}>
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
                          <Image style={styles.image} source={{ uri: image }} />
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
                  secondaryButtonColor={themeValue === 'dark' ? 'b' : 'black'}
                  Icon={themeValue === 'dark' ? Upload : UploadBlack}
                  iconSize="s"
                  onClick={() => openImageGallery()}
                />
              )}
              {images.length > 3 && (
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontWeight={FontWeight.rg}
                  textColor={Colors.red}
                  style={{
                    textAlign: 'left',
                    marginTop: Spacing.l,
                  }}>
                  Only 3 images are allowed. Please remove {images.length - 3}{' '}
                  images.
                </NumberlessText>
              )}
            </View>
            <PrimaryButton
              text="Next"
              disabled={text.length <= 0}
              theme={Colors.theme}
              isLoading={loading}
              onClick={async () => setOpenModal(true)}
            />
          </View>
        </KeyboardAvoidingView>
        <FeedbackPortBottomsheet
          openModal={openModal}
          title={'Chat with the Port team'}
          body={"We're still in our early days and would love to hear from you. By sharing your Port, we can reach out to understand your feedback better and help if you're facing any issues."}
          topButton={
            'Submit a Port with feedback'
          }
          topButtonFunction={async () => {
            setIsLoading(true);
            await sendBugReport(text, images, false)
            setIsLoading(false);
          }}
          middleButton={"Submit feedback only"}
          middleButtonFunction={async () => {
            setIsLoading(true);
            await sendBugReport(text, images, true)
            setIsLoading(false);
          }}
          onClose={() => {
            setOpenModal(false);
          }}
        />
      </GestureSafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    screen: {
      backgroundColor: colors.background,
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
      marginBottom: Spacing.l,
    },
  });
export default GiveUsFeedbackScreen;
