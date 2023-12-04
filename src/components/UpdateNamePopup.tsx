/**
 * A pop up that is used on the MyProfile screen to allow
 * the user to enter a new nickname to update the user's
 * profile
 */

import {NumberlessSemiBoldText} from '@components/NumberlessText';
import {updateConnection} from '@utils/Connections';
import {updateProfileInfo} from '@utils/Profile';
import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {FontSizes, screen} from './ComponentUtils';
import GenericInput from './GenericInput';

interface updateNameProps {
  setUpdated: Function;
  initialName: string;
  chatId?: string;
}

export default function UpdateNamePopup(props: updateNameProps) {
  const [newName, setNewName] = useState(props.initialName);
  const chatId = props.chatId;
  return (
    <View style={styles.editRegion}>
      <NumberlessSemiBoldText style={styles.titleText}>
        {props?.chatId ? ' Update your name' : "Update this contact's name"}
      </NumberlessSemiBoldText>
      <GenericInput
        wrapperStyle={{
          width: screen.width,
          height: 50,
          marginBottom: 20,
          paddingHorizontal: '8%',
        }}
        inputStyle={{...FontSizes[15].medium, borderRadius: 4, paddingLeft: 10}}
        text={newName}
        setText={setNewName}
        placeholder="Enter a new name"
        alignment="left"
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
              if (chatId) {
                const payload = {
                  chatId: chatId,
                  name: newName,
                };
                await updateConnection(payload);
              } else {
                const payload = {
                  name: newName,
                };
                await updateProfileInfo(payload);
              }

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
    borderTopStartRadius: 32,
    borderTopEndRadius: 32,
  },
  titleText: {
    fontSize: 17,
    color: 'black',
    paddingLeft: 20,
    paddingRight: 20,
  },
  nicknameInput: {
    width: screen.width - 40,
    backgroundColor: '#F0F0F0',
    fontSize: 15,
    fontFamily: 'Rubik-Regular',
    paddingLeft: 10,
    paddingRight: 10,
    height: 50,
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
