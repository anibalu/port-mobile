import React, {useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import {useColors} from '@components/colorGuide';
import CustomKeyboardAvoidingView from '@components/CustomKeyboardAvoidingView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {FontSizeType, FontWeight,NumberlessText} from '@components/NumberlessText';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import {SafeAreaView} from '@components/SafeAreaView';
import {Spacing} from '@components/spacingGuide';
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';

import {OnboardingStackParamList} from '@navigation/OnboardingStack/OnboardingStackTypes';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'OnboardingLinkInput'
>;

function OnboardingLinkInput({navigation}: Props) {
  //show error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  //error message
  // const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
  //   null,
  // );
  //link data
  const [linkData, setLinkData] = useState('');
  //is loading
  // const [isLoading, setIsLoading] = useState(false);

  const colors = useColors();

  //clean the screen
  // const cleanScreen = () => {
  //   setLinkData('');
  //   setErrorMessage(null);
  // };

  //on Error, show error bottom sheet with error message
  // const onError = (errorMessage?: string | null) => {
  //   cleanScreen();
  //   setErrorMessage(errorMessage);
  //   setShowErrorModal(true);
  // };

  //process the qr data
  // useEffect(() => {
  //   (async () => {
  //     if (linkData && linkData !== '') {
  //       try {
  //         setIsLoading(true);
  //         setIsLoading(false);
  //         //navigate to home screen
  //         navigation.navigate('OnboardingSetupScreen', {
  //           portUrl: linkData,
  //         });
  //       } catch (error) {
  //         console.log('error using link', error);
  //         setIsLoading(false);
  //         onError();
  //       }
  //     }
  //   })();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [linkData]);

  const onClickCreateConnection = () => {
    console.log('onClickCreateConnection', linkData);
  };

  return (
    <>
      <CustomStatusBar
        theme={colors.theme}
        backgroundColor={colors.background}
      />
      <SafeAreaView backgroundColor={colors.background}>
        <GenericBackTopBar
          onBackPress={() => navigation.goBack()}
          theme={colors.theme}
        />
        <CustomKeyboardAvoidingView>
          <ScrollView contentContainerStyle={styles.mainContainer}>
            <View
              style={{
                gap: Spacing.l,
              }}>
              <NumberlessText
                textColor={colors.text.title}
                fontWeight={FontWeight.sb}
                fontSizeType={FontSizeType.es}>
                Looks like someone sent you a Port link
              </NumberlessText>
              <NumberlessText
                textColor={colors.text.subtitle}
                fontWeight={FontWeight.rg}
                fontSizeType={FontSizeType.l}>
                Paste the link here or click on it again to form your first
                connection.
              </NumberlessText>
              <TextInput
                autoFocus={true}
                placeholderTextColor={colors.text.subtitle}
                placeholder={'Paste link here'}
                value={linkData}
                onChangeText={text => setLinkData(text)}
                keyboardType={'url'}
                multiline={true}
                numberOfLines={2}
                allowFontScaling={false}
                style={StyleSheet.compose(styles.textInput, {
                  color: colors.text.title,
                })}
              />
            </View>
            <PrimaryButton
              text="Create connection"
              disabled={false}
              isLoading={false}
              onClick={onClickCreateConnection}
              theme={colors.theme}
            />
          </ScrollView>
        </CustomKeyboardAvoidingView>
        <ErrorBottomSheet
          visible={showErrorModal}
          title={'Invalid Port Scanned'}
          description={
            'The QR code scanned is not a valid Port QR code. Please scan a Port QR code.'
          }
          onClose={() => setShowErrorModal(false)}
        />
      </SafeAreaView>
    </>
  );
}

export default OnboardingLinkInput;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.l,
    justifyContent: 'space-between',
    flex: 1,
  },
  textInput: {
    fontSize: 40,
    height: 110,
  },
});
