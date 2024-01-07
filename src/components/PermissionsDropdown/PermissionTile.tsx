import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {NumberlessRegularText} from '@components/NumberlessText';
import ToggleSwitch from 'toggle-switch-react-native';
import {screen} from '@components/ComponentUtils';
import {
  getChatPermissions,
  updateChatPermissions,
} from '@utils/ChatPermissions';
import {Permissions} from '@utils/ChatPermissions/interfaces';
import {ChatType} from '@utils/Connections/interfaces';

export default function PermissionTile(props: {
  permissionValue: keyof Permissions;
  permissionName: string;
  currentState: boolean;
  chatId: string;
}) {
  const [currentState, setCurrentState] = useState(false);
  useEffect(() => {
    setCurrentState(props.currentState);
  }, [props.currentState]);
  return (
    <View style={styles.permissionTile}>
      <NumberlessRegularText style={styles.textStyle}>
        {props.permissionName}
      </NumberlessRegularText>
      <ToggleSwitch
        isOn={currentState}
        onColor={'#547CEF'}
        offColor={'#B7B6B6'}
        onToggle={async (newState: boolean) => {
          const update: Permissions = {};
          update[props.permissionValue] = newState;
          setCurrentState(newState);
          console.log('toggled to new state: ', update);
          await updateChatPermissions(props.chatId, update);
          console.log(await getChatPermissions(props.chatId, ChatType.direct));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  permissionTile: {
    width: screen.width - 40,
    height: 36,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 30,
  },
  textStyle: {
    fontSize: 17,
    fontWeight: '400',
    color: 'black',
  },
});
