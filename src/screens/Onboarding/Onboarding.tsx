/**
 * This screen allows a user to add a nickname.
 * screen id: 3
 */
import Next from '@assets/navigation/nextButton.svg';
import {BackButton} from '@components/BackButton';
import {FontSizes, PortColors, isIOS} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import {
  NumberlessBoldText,
  NumberlessClickableText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {processName} from '@utils/Profile';
import React, {useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, TextInput, View} from 'react-native';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

function Onboarding({navigation}: Props) {
  //setting initial state of nickname string to ""

  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const onChangeName = (newName: string) => {
    setName(newName);
  };
  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={styles.basicContainer}>
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          style={styles.container}>
          <View style={styles.contentBox}>
            <BackButton
              style={styles.topBarContainer}
              onPress={() => navigation.navigate('RequestPermissions')}
            />
            <NumberlessBoldText style={styles.titleText}>
              Enter a name... or don't
            </NumberlessBoldText>
            <NumberlessMediumText style={styles.topBodyText}>
              We like to stay simple. We don't require any personal data to get
              you setup.
            </NumberlessMediumText>
            <NumberlessRegularText style={styles.bodyText}>
              If you add a name below, it can be seen only by your Port
              connections in an end-to-end encrypted way. Port never gets to see
              your name.
            </NumberlessRegularText>
            <NumberlessClickableText
              onPress={() =>
                console.log('Learn more about how numberless works')
              }>
              Learn more about how numberless works
            </NumberlessClickableText>
            <View style={styles.nicknameBox}>
              <TextInput
                style={styles.inputText}
                maxLength={NAME_LENGTH_LIMIT}
                placeholder={isFocused ? '' : 'Name'}
                textAlign="center"
                placeholderTextColor={PortColors.primary.grey.medium}
                onChangeText={onChangeName}
                value={name}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
          </View>
          <GenericButton
            onPress={() =>
              navigation.navigate('SetupUser', {name: processName(name)})
            }
            Icon={Next}
            buttonStyle={styles.nextButtonContainer}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  basicContainer: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  contentBox: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  topBarContainer: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 51,
    alignItems: 'flex-start',
    paddingLeft: '6%',
  },
  titleText: {
    fontSize: 24,
    marginBottom: 30,
    marginTop: 20,
    paddingRight: '8%',
    paddingLeft: '8%',
  },
  topBodyText: {
    marginBottom: 20,
    paddingRight: '8%',
    paddingLeft: '8%',
    fontSize: 15,
  },
  bodyText: {
    marginBottom: 10,
    paddingRight: '8%',
    paddingLeft: '8%',
  },
  nicknameBox: {
    width: '100%',
    height: 76,
    justifyContent: 'center',
    marginTop: 30,
    paddingLeft: '8%',
    paddingRight: '8%',
  },
  inputText: {
    width: '100%',
    height: '100%',
    color: PortColors.primary.grey.medium,
    ...FontSizes[17].bold,
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 16,
  },
  nextButtonContainer: {
    backgroundColor: PortColors.primary.blue.app,
    height: 65,
    width: 65,
    marginRight: 25,
    marginBottom: 28,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});

export default Onboarding;
