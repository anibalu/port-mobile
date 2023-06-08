import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from '../../components/SafeAreaView';
import {StyleSheet, StatusBar, View} from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import {NumberlessRegularText} from '../../components/NumberlessText';
import Avatar from '../../../assets/avatars/avatar1.svg';
import {wait} from '../../utils/wait';
import {initialiseUserCrypto} from '../../actions/InitialiseUserCrypto';
import {initialiseTokenAuth} from '../../actions/initialiseTokenAuth';
import {initialiseLineLinks} from '../../actions/InitialiseLineLinks';
import {initialiseFCM} from '../../actions/InitialiseFCM';

function SetupUser() {
  // Get navigation props
  const navigation = useNavigation();
  //state of progress
  const [progress, setProgress] = useState(10);
  const [loaderText, setloaderText] = useState('Initializing...');
  //actions attached to progress
  type ThunkAction = () => Promise<boolean>;
  const setupActions: ThunkAction[] = [
    async () => {
      return await initialiseUserCrypto(setloaderText);
    },
    async () => {
      return await initialiseTokenAuth(setloaderText);
    },
    async () => {
      return await initialiseLineLinks(setloaderText);
    },
    async () => {
      return await initialiseFCM(setloaderText);
    },
  ];
  const runActions = async () => {
    for (let i = 0; i < setupActions.length; i++) {
      const thunk = setupActions[i];
      const result = await thunk();
      if (!result) {
        return false;
      }
      setProgress(prevProgress => prevProgress + 90 / setupActions.length);
    }
    setProgress(100);
    //artificial wait time at the end of load
    await wait(1000);
    return true;
  };
  useEffect(() => {
    runActions().then(ret => {
      if (ret) {
        navigation.navigate('Home');
      } else {
        navigation.navigate('Onboarding');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.basicContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Avatar height={170} width={170} />
        </View>
        <ProgressBar progress={progress} />
        <NumberlessRegularText style={styles.loaderText}>
          {loaderText}
        </NumberlessRegularText>
      </View>
      <View style={styles.absoluteContainer}>
        <NumberlessRegularText>
          This may take a few seconds. Please ensure you have an active internet
          connection.
        </NumberlessRegularText>
      </View>
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
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '8%',
    paddingRight: '8%',
    paddingBottom: '15%',
  },
  absoluteContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingBottom: '10%',
    paddingLeft: '8%',
    paddingRight: '8%',
  },
  avatar: {
    borderRadius: 57,
    overflow: 'hidden',
    marginBottom: '10%',
  },
  loaderText: {
    marginTop: '5%',
  },
});

export default SetupUser;
