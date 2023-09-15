/**
 * A pop up that is used on the MyProfile screen to allow
 * the user to enter a new nickname to update the user's
 * profile
 */

import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {getConnection, updateConnection} from '../../utils/Connection';

export interface updateNicknameProps {
  setUpdated: Function;
  initialNickname: string;
  lineId: string;
}

export default function NicknamePopup(props: updateNicknameProps) {
  const [newNickname, setNewNickname] = useState(props.initialNickname || '');

  useEffect(() => {
    (async () =>
      setNewNickname((await getConnection(props.lineId)).nickname))();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.editRegion}>
      <NumberlessSemiBoldText style={styles.titleText}>
        Update this contact's nickname
      </NumberlessSemiBoldText>
      <TextInput
        style={styles.nicknameInput}
        onChangeText={setNewNickname}
        value={newNickname}
        placeholder={'Enter a new nickname'}
      />
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
                nickname: newNickname,
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
    height: 200,
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
  },
  titleText: {
    fontSize: 17,
    color: 'black',
  },
  nicknameInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#F0F0F0',
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
    padding: 7,
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
