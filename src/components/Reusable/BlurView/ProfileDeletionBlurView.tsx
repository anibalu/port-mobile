import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {useNavigation} from '@react-navigation/native';
import store from '@store/appStore';

const ProfileDeletionBlurView = ({modalClose}: {modalClose: boolean}) => {
  const svgArray = [
    {
      assetName: 'Logo',
      light: require('@assets/light/icons/logo.svg').default,
      dark: require('@assets/dark/icons/logo.svg').default,
    },
    {
      assetName: 'Poster',
      dark: require('@assets/dark/icons/DeletionPoster.svg').default,
      light: require('@assets/light/icons/DeletionPoster.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Logo = results.Logo;
  const Poster = results.Poster;
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const navigation = useNavigation();

  if (!modalClose) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {}}
      style={styles.mainContainer}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.boxWrapper}
        onPress={() => {}}>
        <View style={styles.successcard}>
          <Logo />
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.sb}
            textColor={Colors.text.primary}>
            Successfully deleted your account
          </NumberlessText>
          <Poster />
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.rg}
            textColor={Colors.text.primary}>
            We’re sorry to see you go
          </NumberlessText>
          <PrimaryButton
            textStyle={{
              textAlign: 'center',
              flex: 1,
            }}
            buttonText="Back to onboarding"
            disabled={false}
            isLoading={false}
            onClick={() => {
              store.dispatch({
                type: 'DELETE_ACCOUNT',
                payload: false,
              });
              navigation.navigate('LoginStack', {
                screen: 'OnboardingStack',
                params: {
                  startOnboarding: false,
                },
              });
            }}
            primaryButtonColor={'p'}
          />
        </View>
      </TouchableOpacity>
      {!isIOS && <CustomStatusBar backgroundColor="#00000000" />}
    </TouchableOpacity>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#000000BF',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      justifyContent: 'center',
      height: screen.height,
      width: screen.width,
    },
    boxWrapper: {
      backgroundColor: colors.primary.surface,
      paddingVertical: PortSpacing.intermediate.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      borderRadius: PortSpacing.intermediate.uniform,
    },
    headerContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: PortSpacing.secondary.bottom,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    avatar: {
      marginVertical: PortSpacing.secondary.uniform,
    },
    textContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    successcard: {
      padding: PortSpacing.tertiary.uniform,
      gap: PortSpacing.medium.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
      alignItems: 'center',
    },
  });

export default ProfileDeletionBlurView;
