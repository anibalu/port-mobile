/**
 * This screen allows a user to add a nickname.
 * screen id: 3
 */
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericAvatar} from '@components/GenericAvatar';
import EditCameraIcon from '@assets/icons/EditCamera.svg';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {processName, setNewProfilePicture} from '@utils/Profile';
import React, {ReactNode, useEffect, useState} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import {
  DEFAULT_AVATAR,
  MIN_NAME_LENGTH,
  NAME_LENGTH_LIMIT,
} from '@configs/constants';
import {checkPermissions} from '@utils/AppPermissions/checkAllPermissions';
import EditAvatar from '@screens/EditAvatar/EditAvatar';
import {FileAttributes} from '@utils/Storage/interfaces';
import GenericBottomsheet from '@components/Modals/GenericBottomsheet';
type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

function NameScreen({navigation}: Props): ReactNode {
  //setting initial state of nickname string to ""
  const [name, setName] = useState('');
  const [imagePath, setImagePath] = useState<FileAttributes>({
    fileUri: DEFAULT_AVATAR,
    fileName: '1',
    fileType: 'avatar',
  });
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);

  const onNextCllick = async () => {
    const permissionsResult = await checkPermissions();
    if (permissionsResult) {
      navigation.navigate('SetupUser', {
        name: processName(name),
        avatar: imagePath,
      });
    } else {
      navigation.navigate('PermissionsScreen', {
        name: processName(name),
        avatar: imagePath,
      });
    }
  };

  useEffect(() => {
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

  async function onSavePicture(profilePicAttr: FileAttributes) {
    await setNewProfilePicture(profilePicAttr);
    setOpenEditAvatarModal(false);
  }

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />

      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        keyboardVerticalOffset={isIOS ? -24 : undefined}
        style={onboardingStylesheet.scrollViewContainer}>
        <NumberlessText
          style={{paddingHorizontal: 16}}
          fontType={FontType.sb}
          fontSizeType={FontSizeType.xl}>
          Enter your name
        </NumberlessText>
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          style={{textAlign: 'center', marginTop: 20, paddingHorizontal: 16}}
          textColor={PortColors.text.secondary}>
          Port is a numberless communication app. This means we don't need your
          phone number or email to get you setup. Just a name will do.
        </NumberlessText>
        <View style={onboardingStylesheet.profilePictureHitbox}>
          <GenericAvatar
            profileUri={imagePath.fileUri}
            avatarSize="semiMedium"
          />
          <GenericButton
            IconLeft={EditCameraIcon}
            iconSize={20}
            buttonStyle={onboardingStylesheet.updatePicture}
            onPress={() => {
              setOpenEditAvatarModal(p => !p);
            }}
          />
        </View>
        <GenericInput
          placeholder="Name"
          maxLength={NAME_LENGTH_LIMIT}
          placeholderTextColor={PortColors.primary.grey.dark}
          inputStyle={onboardingStylesheet.nameInputStyle}
          text={name}
          setText={setName}
        />
        <View style={{flex: 1}} />
        <GenericButton
          disabled={name.trim().length >= MIN_NAME_LENGTH ? false : true}
          onPress={onNextCllick}
          textStyle={onboardingStylesheet.buttonText}
          buttonStyle={StyleSheet.compose(
            onboardingStylesheet.nextButtonContainer,
            {opacity: name.trim().length >= MIN_NAME_LENGTH ? 1 : 0.4},
          )}>
          Next
        </GenericButton>
      </KeyboardAvoidingView>
      <GenericBottomsheet
        headerTile={'Change your profile picture'}
        showCloseButton={true}
        visible={openEditAvatarModal}
        onClose={() => {
          setOpenEditAvatarModal(p => !p);
        }}>
        <EditAvatar
          onSave={onSavePicture}
          localImagePath={imagePath}
          setLocalImagePath={setImagePath}
        />
      </GenericBottomsheet>
    </>
  );
}

export const onboardingStylesheet = StyleSheet.create({
  scrollViewContainer: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 72,
    backgroundColor: PortColors.primary.white,
  },
  profilePictureHitbox: {
    marginTop: 30,
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  updatePicture: {
    width: 32,
    height: 32,
    backgroundColor: PortColors.primary.blue.app,
    position: 'absolute',
    bottom: -8,
    right: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
  nameInputStyle: {
    marginTop: 20,
    height: 50,
    padding: 16,
    width: screen.width - 32,
    alignSelf: 'center',
    textAlign: 'center',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '400',
    color: PortColors.primary.black,
  },
  nextButtonContainer: {
    marginBottom: 32,
    backgroundColor: PortColors.primary.blue.app,
    height: 50,
    flexDirection: 'row',
    borderRadius: 12,
    alignItems: 'center',
    width: screen.width - 32,
    justifyContent: 'center',
  },
  buttonText: {
    color: PortColors.primary.white,
    fontSize: 16,
  },
});

export default NameScreen;
