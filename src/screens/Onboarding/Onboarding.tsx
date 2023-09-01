/*
 * This screen allows a user to add a nickname.
 */
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import {joinApp} from '../../actions/JoinApp';
import {NICKNAME_LENGTH_LIMIT} from '../../configs/constants';
import {BackButton} from '../../components/BackButton';
import {NextButton} from '../../components/NextButton';
import {SafeAreaView} from '../../components/SafeAreaView';
import {
  NumberlessClickableText,
  NumberlessRegularText,
  NumberlessBoldText,
  NumberlessMediumText,
} from '../../components/NumberlessText';
import {useNavigation} from '@react-navigation/native';

function Onboarding() {
  //setup navigation props
  const navigation = useNavigation();
  //setting initial state of nickname string to ""
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const onChangeName = (newName: string) => {
    setName(newName);
  };
  return (
    <SafeAreaView style={styles.basicContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={styles.container}>
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
              maxLength={NICKNAME_LENGTH_LIMIT}
              placeholder={isFocused ? '' : 'Name'}
              textAlign="center"
              placeholderTextColor="#BABABA"
              onChangeText={onChangeName}
              value={name}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
        </View>
        <View style={styles.nextButtonContainer}>
          <NextButton
            onPress={async () => {
              if (name) {
                await joinApp({nickname: name});
                navigation.navigate('SetupUser');
              } else {
                await joinApp({nickname: ' '});
                navigation.navigate('SetupUser');
              }
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    color: '#BABABA',
    fontSize: 17,
    fontFamily: 'Rubik-Bold',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
  },
  nextButtonContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: '8%',
    paddingBottom: '8%',
    marginTop: 10,
  },
});

export default Onboarding;
