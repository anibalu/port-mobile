import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import PermissionIconActive from '@assets/permissions/permissions-active.svg';
import PermissionIconInactive from '@assets/permissions/permissions-inactive.svg';
import {
  NumberlessBoldText,
  NumberlessMediumText,
} from '@components/NumberlessText';
import SingleDown from '@assets/icons/single-down.svg';
import SingleUp from '@assets/icons/BlueSingleUp.svg';
import PermissionTile from './PermissionTile';
import {screen} from '@components/ComponentUtils';
import {
  DirectPermissions,
  keysOfDirectPermissions,
} from '@utils/ChatPermissions/interfaces';
import {
  getChatPermissions,
  getDefaultPermissions,
} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';

export default function DirectChatPermissionDropdown(props: {
  bold: boolean;
  chatId: string; // The line id to manage permissions for
}) {
  const chatId = props.chatId;
  const isBold = props.bold;
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionsObj, setPermissionsObj] = useState<DirectPermissions>(
    getDefaultPermissions(ChatType.direct),
  );
  const togglePermission = () => {
    setShowPermissions(!showPermissions);
  };
  useEffect(() => {
    (async () => {
      console.log(
        'setting new: ',
        await getChatPermissions(chatId, ChatType.direct),
      );
      setPermissionsObj(await getChatPermissions(chatId, ChatType.direct));
    })();
  }, [chatId]);
  return (
    <View style={styles.permissionDropDown}>
      <Pressable
        style={styles.dropdownHitbox}
        onPress={() => {
          togglePermission();
        }}>
        <View style={styles.titleBox}>
          {showPermissions ? (
            <PermissionIconActive />
          ) : (
            <PermissionIconInactive />
          )}
          {isBold ? (
            <NumberlessBoldText style={styles.headerTextStyle}>
              Permissions
            </NumberlessBoldText>
          ) : (
            <NumberlessMediumText style={styles.headerTextStyle}>
              Permissions
            </NumberlessMediumText>
          )}
        </View>
        {showPermissions ? <SingleUp /> : <SingleDown />}
      </Pressable>
      {showPermissions ? (
        <ShowPermissionTiles permissions={permissionsObj} chatId={chatId} />
      ) : (
        <></>
      )}
    </View>
  );
}

function ShowPermissionTiles(props: {
  permissions: DirectPermissions;
  chatId: string;
}) {
  return keysOfDirectPermissions.map(value => (
    <PermissionTile
      key={value}
      currentState={props.permissions[value]}
      permissionValue={value}
      permissionName={value}
      chatId={props.chatId}
    />
  ));
}

const styles = StyleSheet.create({
  permissionDropDown: {
    marginTop: 15,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 15,
  },
  dropdownHitbox: {
    width: screen.width - 40,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  headerTextStyle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    left: 10,
  },
  titleBox: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
