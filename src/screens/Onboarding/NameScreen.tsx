/**
 * This screen allows a user to add a nickname.
 * screen id: 3
 */
import Next from '@assets/navigation/nextButton.svg';
import {PortColors, isIOS} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {processName} from '@utils/Profile';
import React, {ReactNode, useEffect, useState} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

function NameScreen({navigation}: Props): ReactNode {
  //setting initial state of nickname string to ""
  const [name, setName] = useState('');

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
        <NumberlessText fontType={FontType.md} fontSizeType={FontSizeType.xl}>
          Share a name but
        </NumberlessText>
        <NumberlessText
          fontType={FontType.md}
          fontSizeType={FontSizeType.xl}
          textColor={PortColors.text.title}>
          not a number
        </NumberlessText>
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          style={{textAlign: 'center', marginTop: 44}}
          textColor={PortColors.text.secondary}>
          We like to keep things simple. We don't require any data to set up
          your portfolio. Just a name will do.{'\n\n'} And even this is
          optional.
        </NumberlessText>
        <GenericInput
          placeholder="Name (Optional)"
          inputStyle={{marginTop: 44}}
          text={name}
          setText={setName}
        />
        <View style={{flex: 1}} />
        <GenericButton
          onPress={() =>
            navigation.navigate('PermissionsScreen', {
              name: processName(name),
            })
          }
          IconLeft={Next}
          buttonStyle={onboardingStylesheet.nextButtonContainer}
        />
      </KeyboardAvoidingView>
    </>
  );
}

export const onboardingStylesheet = StyleSheet.create({
  scrollViewContainer: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: 22,
    backgroundColor: PortColors.primary.white,
  },
  nextButtonContainer: {
    backgroundColor: PortColors.primary.blue.app,
    height: 60,
    width: 65,
    bottom: isIOS ? 36 : 18,
    right: 25,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});

export default NameScreen;
