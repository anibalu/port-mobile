import SingleUp from '@assets/icons/BlueSingleUp.svg';
import SingleDown from '@assets/icons/single-down.svg';
import PermissionIconActive from '@assets/permissions/permissions-active.svg';
import PermissionIconInactive from '@assets/permissions/permissions-inactive.svg';
import {screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import GenericModal from '@components/GenericModal';
import {
  NumberlessBoldText,
  NumberlessMediumText,
} from '@components/NumberlessText';
import DisappearingMessage from '@screens/Presets/DisappearingMessage';
import Permissions from '@screens/Presets/Permissions';
import {deepEqual} from '@screens/Presets/deepEqual';
import {
  getChatPermissions,
  getDefaultPermissions,
  getLabelByTimeDiff,
  updateChatPermissions,
} from '@utils/ChatPermissions';
import {
  GroupPermissions,
  MasterPermissions,
  booleanKeysOfGroupPermissions,
  numberKeysOfGroupPermissions,
} from '@utils/ChatPermissions/interfaces';
import {ChatType} from '@utils/Connections/interfaces';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

export default function GroupChatPermissionDropdown(props: {
  bold: boolean;
  chatId: string; // The line id to manage permissions for
}) {
  const chatId = props.chatId;
  const isBold = props.bold;
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionsObj, setPermissionsObj] = useState<GroupPermissions>(
    getDefaultPermissions(ChatType.group),
  );
  const [selected, setSelected] = useState<number>(0);
  const [modifiedPreset, setModifiedPreset] =
    useState<MasterPermissions | null>(getDefaultPermissions(ChatType.direct));
  const [isDisappearClicked, setIsDisappearClicked] = useState(false);
  const duration = modifiedPreset?.disappearingMessages;
  const timelabel = getLabelByTimeDiff(duration);

  const togglePermission = () => {
    setShowPermissions(!showPermissions);
  };
  useEffect(() => {
    (async () => {
      setPermissionsObj(await getChatPermissions(chatId, ChatType.group));
      setModifiedPreset(await getChatPermissions(chatId, ChatType.direct));
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
        <View style={{marginTop: 30}}>
          <Permissions
            masterKeys={[
              ...booleanKeysOfGroupPermissions,
              ...numberKeysOfGroupPermissions,
            ]}
            timelabel={timelabel}
            selected={selected}
            preset={modifiedPreset}
            setIsDisappearClicked={setIsDisappearClicked}
            setModifiedPreset={setModifiedPreset}
          />
          <GenericButton
            disabled={deepEqual(permissionsObj, modifiedPreset)}
            buttonStyle={
              deepEqual(permissionsObj, modifiedPreset)
                ? styles.disabled
                : styles.save
            }
            onPress={async () => {
              await updateChatPermissions(chatId, {
                ...modifiedPreset,
              });
              setPermissionsObj({...modifiedPreset});
            }}>
            Save
          </GenericButton>
        </View>
      ) : (
        <></>
      )}

      <GenericModal
        visible={isDisappearClicked}
        onClose={() => {
          setIsDisappearClicked(p => !p);
        }}>
        <DisappearingMessage
          setModifiedPreset={setModifiedPreset}
          selected={timelabel}
          timelabel={timelabel}
          setSelected={setSelected}
          setIsDisappearClicked={setIsDisappearClicked}
        />
      </GenericModal>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionDropDown: {
    width: screen.width,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  dropdownHitbox: {
    width: screen.width,
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
  save: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  disabled: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#C9C9C9',
    marginBottom: 10,
  },
});
