/**
 * This screen allows a user to add a name and select a profile picture.
 */
import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import EditCameraIcon from '@assets/icons/EditCamera.svg';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getRandomAvatarInfo, processName} from '@utils/Profile';
import React, {ReactNode, useEffect, useState} from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import {MIN_NAME_LENGTH, NAME_LENGTH_LIMIT} from '@configs/constants';
import {checkPermissions} from '@utils/AppPermissions/checkAllPermissions';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import {FileAttributes} from '@utils/Storage/interfaces';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import SimpleInput from '@components/Reusable/Inputs/SimpleInput';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {SafeAreaView} from '@components/SafeAreaView';
import DynamicColors from '@components/DynamicColors';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

function NameScreen({navigation}: Props): ReactNode {
  //setting initial state of nickname string to ""
  const [name, setName] = useState('');
  //setting default profile picture attributes
  const [imageAttr, setImageAttr] = useState<FileAttributes>(
    getRandomAvatarInfo(),
  );

  //controls opening of bottom sheet to edit profile picture
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);

  const onNextClick = async () => {
    //checks if necessary permissions are provided
    const permissionsResult = await checkPermissions();
    if (permissionsResult) {
      //permissions are provided, setup user profile
      navigation.navigate('SetupUser', {
        name: processName(name),
        avatar: imageAttr,
      });
    } else {
      //permissions are not provided, ask again
      navigation.navigate('PermissionsScreen', {
        name: processName(name),
        avatar: imageAttr,
      });
    }
  };

  useEffect(() => {
    //disabling clicking back.
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return null;
      },
    );
    navigation.addListener('beforeRemove', e => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
    });
    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //since we're at onboarding, profile picture doesn't get saved and remains in cache.
  //it gets saved on the SetupUser screen instead
  async function onSavePicture(profilePicAttr: FileAttributes) {
    console.log(profilePicAttr);
  }

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.background} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            <NumberlessText
              style={{
                textAlign: 'center',
                paddingHorizontal: PortSpacing.secondary.uniform,
              }}
              textColor={Colors.text.primary}
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}>
              Enter your name
            </NumberlessText>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              style={{
                textAlign: 'center',
                marginTop: PortSpacing.secondary.uniform,
                paddingHorizontal: PortSpacing.secondary.uniform,
              }}
              textColor={Colors.text.subtitle}>
              No emails or phone numbers required. Just enter a name to start
              using Port.
            </NumberlessText>
            <View style={styles.profilePictureHitbox}>
              <AvatarBox
                profileUri={imageAttr.fileUri}
                avatarSize="m"
                onPress={() => {
                  setOpenEditAvatarModal(p => !p);
                }}
              />
              <GenericButton
                IconLeft={EditCameraIcon}
                iconSize={20}
                buttonStyle={styles.updatePicture}
                onPress={() => {
                  setOpenEditAvatarModal(p => !p);
                }}
              />
            </View>
            <KeyboardAvoidingView
              behavior={isIOS ? 'padding' : 'height'}
              keyboardVerticalOffset={50}
              style={styles.scrollViewContainer}>
              <SimpleInput
                placeholderText="Name"
                maxLength={NAME_LENGTH_LIMIT}
                text={name}
                setText={setName}
                bgColor="g"
              />
              <View style={styles.buttonContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    marginVertical: PortSpacing.secondary.uniform,
                  }}>
                  <NumberlessText
                    style={{
                      textAlign: 'center',
                      flex: 1,
                    }}
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.m}
                    textColor={Colors.text.subtitle}>
                    By Clicking on 'Next' or by restoring your account, you
                    acknowledge that you have read and agree to our{' '}
                    <NumberlessText
                      style={{textDecorationLine: 'underline'}}
                      onPress={() =>
                        Linking.openURL(
                          'https://port.numberless.tech/TermsAndConditions',
                        )
                      }
                      fontType={FontType.rg}
                      fontSizeType={FontSizeType.m}
                      textColor={Colors.primary.accent}>
                      Terms
                    </NumberlessText>{' '}
                    and our{' '}
                    <NumberlessText
                      style={{textDecorationLine: 'underline'}}
                      fontType={FontType.rg}
                      onPress={() =>
                        Linking.openURL(
                          'https://port.numberless.tech/PrivacyPolicy',
                        )
                      }
                      fontSizeType={FontSizeType.m}
                      textColor={Colors.primary.accent}>
                      Privacy Policy
                    </NumberlessText>
                    .
                  </NumberlessText>
                </View>
                <PrimaryButton
                  buttonText={'Next'}
                  disabled={
                    name.trim().length >= MIN_NAME_LENGTH ? false : true
                  }
                  onClick={onNextClick}
                  primaryButtonColor={'b'}
                  isLoading={false}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginVertical: PortSpacing.tertiary.uniform,
                    gap: 2,
                  }}>
                  <NumberlessText
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.m}
                    style={{
                      textAlign: 'center',
                      marginTop: PortSpacing.secondary.uniform,
                    }}
                    textColor={PortColors.subtitle}>
                    Have a backup?
                  </NumberlessText>
                  <NumberlessText
                    onPress={() => navigation.navigate('RestoreAccount')}
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.m}
                    style={{
                      textAlign: 'center',
                      marginTop: PortSpacing.secondary.uniform,
                    }}
                    textColor={Colors.primary.accent}>
                    Restore account
                  </NumberlessText>
                </View>
              </View>
            </KeyboardAvoidingView>
            <EditAvatar
              visible={openEditAvatarModal}
              onSave={onSavePicture}
              localImageAttr={imageAttr}
              setLocalImageAttr={setImageAttr}
              onClose={() => {
                setOpenEditAvatarModal(false);
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </>
  );
}

const styling = (color: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: PortSpacing.primary.top,
    },
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    buttonContainer: {
      width: '100%',
      marginBottom: PortSpacing.secondary.bottom,
    },
    profilePictureHitbox: {
      marginTop: PortSpacing.primary.top,
      marginBottom: PortSpacing.primary.bottom,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
    updatePicture: {
      width: 32,
      height: 32,
      backgroundColor: color.primary.accent,
      position: 'absolute',
      bottom: -8,
      right: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 9,
    },
  });

export default NameScreen;
