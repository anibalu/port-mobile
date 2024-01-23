/**
 * A pop up that is used on the MyProfile screen to allow
 * the user to enter a new nickname to update the user's
 * profile
 */

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {updateProfileName} from '@utils/Profile';
import React, {ReactNode, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {PortColors, screen} from './ComponentUtils';
import {GenericButton} from './GenericButton';
import GenericInput from './GenericInput';

import DirectChat from '@utils/DirectChats/DirectChat';
import Notch from './ConnectionModal/Notch';

interface updateNameProps {
  setUpdated: Function;
  initialName: string;
  chatId?: string;
}

export default function UpdateNamePopup({
  chatId,
  initialName,
  setUpdated,
}: updateNameProps): ReactNode {
  const [newName, setNewName] = useState(initialName);

  const onSavePressed = (): void => {
    (async () => {
      if (chatId) {
        const chat = new DirectChat(chatId);
        await chat.updateName(newName);
      } else {
        await updateProfileName(newName);
      }

      setUpdated(true);
    })();
  };

  return (
    <View style={styles.editRegion}>
      <Notch />

      <NumberlessText fontType={FontType.sb} fontSizeType={FontSizeType.l}>
        {chatId ? "Update this contact's name" : 'Update your name'}
      </NumberlessText>
      <NumberlessText
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}
        style={{marginTop: 8}}
        textColor={PortColors.text.secondary}>
        When left blank the username would be “Numberless” and will appear so
        while forming connections.
      </NumberlessText>
      <GenericInput
        inputStyle={styles.nameInputStyle}
        text={newName}
        setText={setNewName}
        placeholder="Enter a new name"
        alignment="left"
      />
      <View style={styles.buttonContainer}>
        <GenericButton buttonStyle={styles.save} onPress={onSavePressed}>
          Save
        </GenericButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editRegion: {
    backgroundColor: PortColors.primary.white,
    flexDirection: 'column',
    width: screen.width,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 30,
    borderTopStartRadius: 32,
    borderTopEndRadius: 32,
  },

  buttonContainer: {
    alignSelf: 'stretch',
    height: 50,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  cancel: {
    flex: 1,
    backgroundColor: PortColors.primary.white,
  },
  cancelTextStyle: {
    color: PortColors.text.secondary,
  },
  nameInputStyle: {
    paddingLeft: 10,
    height: 58,
    marginTop: 24,
    marginBottom: 38,
  },
  save: {
    flex: 0.8,
  },
  saveText: {
    fontSize: 15,
    color: 'white',
  },
});
