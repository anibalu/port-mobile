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
import {screen} from '@components/ComponentUtils';
import {
  DirectPermissions,
  MasterPermissions,
  booleanKeysOfDirectPermissions,
  numberKeysOfDirectPermissions,
} from '@utils/ChatPermissions/interfaces';
import {
  getChatPermissions,
  getDefaultPermissions,
  getLabelByTimeDiff,
  updateChatPermissions,
} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import Permissions from '@screens/Presets/Permissions';
import GenericModal from '@components/GenericModal';
import DisappearingMessage from '@screens/Presets/DisappearingMessage';
import {GenericButton} from '@components/GenericButton';
import {deepEqual} from '@screens/Presets/deepEqual';

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
  const [selected, setSelected] = useState<number>(0);

  useEffect(() => {
    (async () => {
      console.log(
        'setting new: ',
        await getChatPermissions(chatId, ChatType.direct),
      );
      setPermissionsObj(await getChatPermissions(chatId, ChatType.direct));
      setModifiedPreset(await getChatPermissions(chatId, ChatType.direct));
    })();
  }, [chatId]);

  const [modifiedPreset, setModifiedPreset] =
    useState<MasterPermissions | null>(getDefaultPermissions(ChatType.direct));
  const [isDisappearClicked, setIsDisappearClicked] = useState(false);
  const duration = modifiedPreset?.disappearingMessages;
  const timelabel = getLabelByTimeDiff(duration);

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
              ...booleanKeysOfDirectPermissions,
              ...numberKeysOfDirectPermissions,
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
    marginTop: 15,
    width: screen.width,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 15,
  },
  dropdownHitbox: {
    width: screen.width - 20,
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
  },
  disabled: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#C9C9C9',
  },
});
