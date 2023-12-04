/**
 * This screen sets up a user account
 * screen id:
 */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Avatar from '@assets/avatars/avatar1.svg';
import {NumberlessRegularText} from '@components/NumberlessText';
import ProgressBar from '@components/ProgressBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {getInitialGroupConnectionLinks} from '@utils/ConnectionLinks/group';
import {addNewGroup, attemptNewGroup} from '@utils/Groups';
import {GroupInfo} from '@utils/Groups/interfaces';
import {generateISOTimeStamp} from '@utils/Time';

type Props = NativeStackScreenProps<AppStackParamList, 'SetupGroup'>;

function SetupGroup({route, navigation}: Props) {
  // Get navigation props
  const {
    groupName = '',
    groupDescription = '',
    displayPicPath = '',
  } = route.params;
  let groupId: string = '';
  //state of progress
  const [progress, setProgress] = useState(10);
  const [loaderText, setLoaderText] = useState('Initializing...');

  //actions attached to progress
  type ThunkAction = () => Promise<boolean>;
  const setupActions: ThunkAction[] = [
    async () => {
      //attempt to post group info -> update state variable group info and return true / return false
      setLoaderText('creating group');
      try {
        groupId = await attemptNewGroup();
        return true;
      } catch (error) {
        console.log('error in group creation: ', error);
        return false;
      }
    },
    async () => {
      setLoaderText('saving group');
      //attempt to save group info, return true when successful.
      const groupInfo: GroupInfo = {
        groupId: groupId,
        name: groupName,
        joinedAt: generateISOTimeStamp(),
        description: groupDescription,
        pathToGroupProfilePic: displayPicPath,
        amAdmin: true,
        members: [],
      };
      await addNewGroup(groupInfo);
      return true;
    },
    async () => {
      //attempt to get some group links. return true either way. this is not an essential step.
      setLoaderText('fetching group connection links');
      await getInitialGroupConnectionLinks(groupId);
      return true;
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
    return true;
  };
  useEffect(() => {
    runActions().then(ret => {
      if (ret) {
        //navigate to add members screen if successful. for now, navigate to home.
        navigation.navigate('ShareGroup', {groupId: groupId});
      } else {
        //navigate to new group screen if unsuccessful with an error message to be displayed on the NewGroup screen.
        navigation.navigate('NewGroup', {
          errorMessage: 'Network error, please try again!',
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.basicContainer}>
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

export default SetupGroup;
