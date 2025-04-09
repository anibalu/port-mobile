/**
 * A pop up that is used on the MyProfile screen to allow
 * the user to enter a new nickname to update the user's
 * profile
 */
import {updateProfileName} from '@utils/Profile';
import React, {ReactNode, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {PortColors, screen} from './ComponentUtils';
import GenericInput from './GenericInput';

import DirectChat from '@utils/DirectChats/DirectChat';
import {SaveButton} from './SaveButton';
import {MIN_NAME_LENGTH, NAME_LENGTH_LIMIT} from '@configs/constants';

interface updateNameProps {
  setUpdated: (x: boolean) => void;
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
      <GenericInput
        maxLength={NAME_LENGTH_LIMIT}
        inputStyle={styles.nameInputStyle}
        text={newName}
        setText={setNewName}
        placeholder="Name"
        alignment="left"
      />
      <View style={styles.buttonContainer}>
        <SaveButton
          style={{
            opacity: newName.trim().length >= MIN_NAME_LENGTH ? 1 : 0.4,
            height: 50,
          }}
          disabled={newName.trim().length >= MIN_NAME_LENGTH ? false : true}
          onPress={onSavePressed}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editRegion: {
    flexDirection: 'column',
    width: screen.width,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    borderTopStartRadius: 32,
    borderTopEndRadius: 32,
    gap: 24,
  },
  buttonContainer: {
    alignSelf: 'stretch',
    height: 50,
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
    marginTop: 5,
    paddingLeft: 10,
    backgroundColor: PortColors.primary.white,
    height: 50,
    color: PortColors.primary.black,
  },
});
