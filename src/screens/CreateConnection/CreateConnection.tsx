import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import {BOTTOMBAR_HEIGHT} from '@configs/constants';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {useTheme} from 'src/context/ThemeContext';
import {ToastType, useToast} from 'src/context/ToastContext';
import OnboardingQRScanner from './Components/OnboardingQRScanner';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'CreateConnection'
>;
const CreateConnection = ({route, navigation}: Props) => {
  const {type} = route.params;
  const Colors = DynamicColors();
  const {themeValue} = useTheme();

  const [inputValue, setInputValue] = useState<string>('');
  const [validatingLink, setValidatingLink] = useState<boolean>(false);

  const svgArray = [
    {
      assetName: 'Cross',
      dark: require('@assets/dark/icons/Cross.svg').default,
      light: require('@assets/light/icons/Cross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Cross = results.Cross;
  const styles = styling(Colors, themeValue);
  const {showToast} = useToast();

  const onCreateConnection = () => {
    setValidatingLink(true);

    const numberlessDomain = 'porting.me';
    const match = inputValue.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    const hostname = match ? match[1] : null;

    if (hostname && hostname.endsWith(numberlessDomain)) {
      navigation.navigate('OnboardingSetupScreen', {
        portUrl: inputValue,
      });
    } else {
      showToast(
        'Link is invalid! Please re-check the link you have entered.',
        ToastType.error,
      );
    }

    setValidatingLink(false);
  };

  if (type === 'QR') {
    return (
      <>
        <OnboardingQRScanner />
      </>
    );
  } else {
    return (
      <>
        <CustomStatusBar
          backgroundColor={
            themeValue === 'dark'
              ? Colors.primary.background
              : Colors.primary.white
          }
        />
        <SafeAreaView style={styles.mainContainer}>
          <TopBarWithRightIcon
            borderBottom={false}
            heading=""
            onIconRightPress={() => navigation.goBack()}
            IconRight={Cross}
            bgColor={themeValue === 'dark' ? 'b' : 'g'}
          />
          <View
            style={{
              marginHorizontal: PortSpacing.secondary.uniform,
              flex: 1,
              justifyContent: 'center',
            }}>
            <View
              style={{
                gap: PortSpacing.tertiary.uniform,
              }}>
              <NumberlessText
                style={{textAlign: 'left'}}
                textColor={Colors.text.primary}
                fontType={FontType.sb}
                fontSizeType={FontSizeType.es}>
                Looks like someone sent you a Port link
              </NumberlessText>
              <NumberlessText
                style={{textAlign: 'left'}}
                textColor={Colors.text.subtitle}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.l}>
                Paste the link here or click on it to form your first
                connection.
              </NumberlessText>
            </View>

            <TextInput
              autoFocus
              numberOfLines={2}
              style={styles.textInput}
              placeholderTextColor={`${Colors.text.placeholder}80`}
              placeholder={'Paste link here'}
              value={inputValue}
              onChangeText={text => setInputValue(text)}
              keyboardType={'url'}
            />
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton
              buttonText="Create connection"
              disabled={inputValue.length === 0 || validatingLink}
              isLoading={validatingLink}
              onClick={onCreateConnection}
              primaryButtonColor="p"
              untrimmedText={true}
            />
          </View>
        </SafeAreaView>
      </>
    );
  }
};

const styling = (color: any, themeValue: any) =>
  StyleSheet.create({
    hiddenInput: {
      ...StyleSheet.absoluteFillObject, // Fills container but is invisible
      opacity: 0,
    },
    mainContainer: {
      height: screen.height,
      width: screen.width,
      backgroundColor:
        themeValue === 'dark' ? color.primary.background : color.primary.white,
      paddingBottom: isIOS ? PortSpacing.secondary.bottom : 0,
    },
    textInput: {
      color: color.primary.accent,
      marginVertical: PortSpacing.primary.top,
      fontSize: 40,
      height: 100,
      fontWeight: '600',
    },
    buttonContainer: {
      marginHorizontal: PortSpacing.secondary.uniform,
      height: BOTTOMBAR_HEIGHT,
      alignItems: 'center',
    },
  });

export default CreateConnection;
