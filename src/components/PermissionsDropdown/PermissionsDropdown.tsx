import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import PermissionIconActive from '../../../assets/permissions/permissions-active.svg';
import PermissionIconInactive from '../../../assets/permissions/permissions-inactive.svg';
import {NumberlessBoldText} from '../NumberlessText';
import SingleDown from '../../../assets/icons/single-down.svg';
import SingleUp from '../../../assets/icons/BlueSingleUp.svg';
import {getConnection} from '../../utils/Connection';
import PermissionTile from './PermissionTile';
import { defaultPermissions, permissions } from '../../utils/permissionsInterface';

export default function PermissionsDropdown(props: {
  lineId: string; // The line id to manage permissions for
}) {
  const line = props.lineId;
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionsObj, setPermissionsObj] = useState<permissions>(defaultPermissions);
  const togglePermission = () => {
    setShowPermissions(!showPermissions);
  };
  useEffect(() => {
    (async () => {
      const permissionList = (await getConnection(line)).permissions;
      setPermissionsObj(permissionList);
    })();
  }, [line]);

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
          <NumberlessBoldText style={styles.headerTextStyle}>
            Permissions
          </NumberlessBoldText>
        </View>
        {showPermissions ? <SingleUp /> : <SingleDown />}
      </Pressable>
      {showPermissions ? (
        <ShowPermissionTiles permissions={permissionsObj} lineId={line} />
      ) : (
        <></>
      )}
    </View>
  );
}

function ShowPermissionTiles(props: {
  permissions: permissions;
  lineId: string;
}) {
  const permissionsWithKeys = Object.keys(props.permissions);
  return permissionsWithKeys.map((value) => (
    <PermissionTile
      key={props.permissions[value].name}
      currentState={props.permissions[value].toggled}
      permissionName={props.permissions[value].name}
      lineId={props.lineId}
    />
  ));
}

const styles = StyleSheet.create({
  permissionDropDown: {
    marginTop: 15,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
  },
  dropdownHitbox: {
    width: '100%',
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
