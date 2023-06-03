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
import {JOIN_SCREEN_INPUT_LIMIT} from '../../configs/constants';
import {BackButton} from '../../components/BackButton';
import {NextButton} from '../../components/NextButton';
import {
  NumberlessClickableText,
  NumberlessRegularText,
  NumberlessBoldText,
} from '../../components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from '../../components/SafeAreaView';

function Onboarding() {
  //setup navigation props
  const navigation = useNavigation();
  //setting initial state of nickname string to ""
  const [name, setName] = useState('');
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
          <NumberlessRegularText style={styles.bodyText}>
            Lorem ipsum dolor sit amet consectetur. Magna eget faucibus
            pellentesque sit fusce fames vel. Neque placerat.
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
              maxLength={JOIN_SCREEN_INPUT_LIMIT}
              placeholder="Name "
              placeholderTextColor="#BABABA"
              onChangeText={onChangeName}
              value={name}
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
    height: 83,
    alignItems: 'flex-start',
    paddingLeft: '3%',
  },
  titleText: {
    fontSize: 24,
    marginBottom: 30,
    marginTop: 10,
    paddingRight: '8%',
    paddingLeft: '8%',
  },
  bodyText: {
    marginBottom: 20,
    paddingRight: '8%',
    paddingLeft: '8%',
  },
  nicknameBox: {
    width: '100%',
    height: 76,
    justifyContent: 'center',
    marginTop: 40,
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
    paddingLeft: 30,
  },
  nextButtonContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: '8%',
    paddingBottom: '8%',
  },
});

export default Onboarding;
