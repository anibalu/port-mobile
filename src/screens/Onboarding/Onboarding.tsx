/*
 * This screen allows a user to add a nickname.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';

import GenericHuman from '../../../assets/miscellaneous/genericHuman.svg';
import {joinApp} from '../../actions/JoinApp';
import {JOIN_SCREEN_INPUT_LIMIT} from '../../configs/constants';

function Onboarding({navigation}) {
  //setting initial state of nickname string to ""
  const [name, setName] = React.useState('');
  const onChangeName = (newName: string) => {
    setName(newName);
  };
  return (
    <View style={styles.background}>
      <View style={styles.avatarBox}>
        <GenericHuman width={150} height={150} style={styles.avatar} />
      </View>
      <View style={styles.nicknameBox}>
        <TextInput
          maxLength={JOIN_SCREEN_INPUT_LIMIT}
          placeholder="Enter a name...or don't"
          onChangeText={onChangeName}
          value={name}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          if (name) {
            const response = await joinApp({nickname: name});
            if (response === 0) {
              navigation.navigate('Placeholder');
            }
          } else {
            const response = await joinApp({nickname: ' '});
            if (response === 0) {
              navigation.navigate('Placeholder');
            }
          }
        }}>
        <Text style={styles.buttonText}>Join</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    display: 'flex',
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarBox: {
    marginTop: '25%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '30%',
  },
  nicknameBox: {
    backgroundColor: '#F9F9F9',
    marginBottom: '0%',
    width: '85%',
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    flex: 0,
  },
  name: {
    flex: 1,
  },
  button: {
    backgroundColor: '#547CEF',
    marginBottom: '10%',
    width: '85%',
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
});

export default Onboarding;
