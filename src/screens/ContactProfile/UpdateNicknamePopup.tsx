/**
 * A pop up that is used on the MyProfile screen to allow
 * the user to enter a new nickname to update the user's
 * profile
 */

import React, {useState} from 'react';
import {Dimensions, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {updateConnection} from '../../utils/Connection';
import {processNickname} from '../../utils/Nickname';
import {NICKNAME_LENGTH_LIMIT} from '../../configs/constants';

interface updateNicknameProps {
  setUpdated: Function;
  initialNickname: string;
  lineId: string;
}

export default function NicknamePopup(props: updateNicknameProps) {
  const viewWidth = Dimensions.get('window').width;
  const inputTextBarWidth = viewWidth;
  const [newNickname, setNewNickname] = useState(props.initialNickname);
  return (
    <View style={styles.editRegion}>
      <NumberlessSemiBoldText style={styles.titleText}>
        Update this contact's name
      </NumberlessSemiBoldText>
      <View style={{width: inputTextBarWidth, padding: 20}}>
        <TextInput
          style={styles.nicknameInput}
          onChangeText={setNewNickname}
          value={newNickname}
          placeholder={'Enter a new name'}
          maxLength={NICKNAME_LENGTH_LIMIT}
        />
      </View>
      <View style={styles.options}>
        <Pressable
          style={styles.cancel}
          onPress={() => props.setUpdated(false)}>
          <NumberlessSemiBoldText style={styles.cancelText}>
            Cancel
          </NumberlessSemiBoldText>
        </Pressable>
        <Pressable
          style={styles.save}
          onPress={() => {
            (async () => {
              await updateConnection({
                id: props.lineId,
                nickname: processNickname(newNickname),
                userChoiceNickname: true,
              });
              props.setUpdated(true);
            })();
          }}>
          <NumberlessSemiBoldText style={styles.saveText}>
            Save
          </NumberlessSemiBoldText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editRegion: {
    width: '100%',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingTop: 20,
  },
  titleText: {
    fontSize: 17,
    color: 'black',
    paddingLeft: 20,
    paddingRight: 20,
  },
  nicknameInput: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    fontSize: 15,
    fontFamily: 'Rubik-Regular',
    paddingLeft: 10,
    paddingRight: 10,
  },
  options: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  cancel: {
    height: '100%',
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: '#747474',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 15,
    color: '#747474',
  },
  save: {
    height: '100%',
    width: '40%',
    backgroundColor: '#547CEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  saveText: {
    fontSize: 15,
    color: 'white',
  },
});
