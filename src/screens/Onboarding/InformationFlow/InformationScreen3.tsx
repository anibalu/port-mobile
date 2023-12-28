/**
 * This screen allows a user to add a nickname.
 * screen id: 3
 */
import S3 from '@assets/carousels/s3.svg';
import Next from '@assets/navigation/nextButton.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import store from '@store/appStore';
import React, {ReactNode, useEffect} from 'react';
import {BackHandler, ScrollView} from 'react-native';
import {onboardingStylesheet} from '../NameScreen';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

function InformationScreen3({navigation}: Props): ReactNode {
  //setting initial state of nickname string to ""

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

  const onFinish = (): void => {
    store.dispatch({
      type: 'ONBOARDING_COMPLETE',
      payload: true,
    });
  };

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />

      <ScrollView
        contentContainerStyle={onboardingStylesheet.scrollViewContainer}
        showsVerticalScrollIndicator={false}>
        <NumberlessText
          fontType={FontType.sb}
          fontSizeType={FontSizeType.xl}
          style={{marginTop: 26}}
          textColor={PortColors.text.title}>
          Publish "superports"
        </NumberlessText>
        <S3 width={screen.width * 0.9} height={screen.height * 0.4} />
        <NumberlessText
          fontSizeType={FontSizeType.l}
          fontType={FontType.rg}
          style={{textAlign: 'center', paddingHorizontal: 30, marginTop: 30}}
          textColor={PortColors.text.secondary}>
          Publish "superports" to your social channels to funnel new
          conversations safely onto Port or use them to port over large groups.
        </NumberlessText>

        <GenericButton
          onPress={onFinish}
          Icon={Next}
          buttonStyle={onboardingStylesheet.nextButtonContainer}
        />
      </ScrollView>
    </>
  );
}

export default InformationScreen3;
