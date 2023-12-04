import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {NumberlessRegularText} from '@components/NumberlessText';
import ToggleSwitch from 'toggle-switch-react-native';
import {getConnection, updateConnection} from '@utils/Connections';

export default function PermissionTile(props: {
  permissionValue: string;
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
        onToggle={newState => {
          updatePermission(props.chatId, props.permissionValue, newState);
          setCurrentState(newState);
        }}
      />
    </View>
  );
}

async function updatePermission(
  chatId: string,
  permissionValue: string,
  newState: boolean,
) {
  let permissionsObject = (await getConnection(chatId)).permissions;
  permissionsObject[permissionValue].toggled = newState;
  await updateConnection({
    chatId: chatId,
    permissions: permissionsObject,
  });
}

const styles = StyleSheet.create({
  permissionTile: {
    width: '100%',
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
