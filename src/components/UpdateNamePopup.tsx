/**
 * A pop up that is used on the MyProfile screen to allow
 * the user to enter a new nickname to update the user's
 * profile
 */

import {
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import {updateConnection} from '@utils/Connections';
import {updateProfileInfo} from '@utils/Profile';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {FontSizes, screen} from './ComponentUtils';
import GenericInput from './GenericInput';
import GenericModalTopBar from './GenericModalTopBar';
import Cross from '../../assets/icons/cross.svg';
import {GenericButton} from './GenericButton';

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
      <GenericModalTopBar RightOptionalIcon={Cross} />
      <NumberlessSemiBoldText style={styles.titleText}>
        {props?.chatId ? ' Update your name' : "Update this contact's name"}
      </NumberlessSemiBoldText>
      <NumberlessRegularText style={styles.subtitleText}>
        When left blank the username would be “Numberless” and will appear so
        while forming connections.
      </NumberlessRegularText>
      <GenericInput
        wrapperStyle={{
          width: screen.width,
          height: 50,
          marginBottom: 20,
          paddingHorizontal: 20,
        }}
        inputStyle={{...FontSizes[15].medium, borderRadius: 4, paddingLeft: 10}}
        text={newName}
        setText={setNewName}
        placeholder="Enter a new name"
        alignment="left"
      />
      <View style={styles.options}>
        <GenericButton
          buttonStyle={styles.save}
          textStyle={styles.saveText}
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
          Save
        </GenericButton>
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
  subtitleText: {
    fontSize: 14,
    color: '#868686',
    paddingLeft: 20,
    paddingRight: 5,
    marginTop: 10,
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
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  save: {
    height: '100%',
    width: '70%',
    backgroundColor: '#547CEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  saveText: {
    fontSize: 15,
    color: 'white',
  },
});
