import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import PermissionIconActive from '@assets/permissions/permissions-active.svg';
import PermissionIconInactive from '@assets/permissions/permissions-inactive.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
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
import {deepEqual} from '@screens/Presets/deepEqual';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateISOTimeStamp} from '@utils/Time';
import {saveMessage} from '@utils/Storage/messages';

export default function DirectChatPermissionDropdown(props: {
  bold: boolean;
  chatId: string; // The line id to manage permissions for
}) {
  const chatId = props.chatId;
  const [showPermissions, setShowPermissions] = useState(true);
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

  const sendInfoMessage = async () => {
    const savedMessage: SavedMessageParams = {
      chatId: chatId,
      messageId: generateRandomHexId(),
      contentType: ContentType.info,
      data: {
        info: `You turned on disappearing messages. New messages will disappear from this chat ${timelabel} after they’re sent`,
      },
      sender: true,
      timestamp: generateISOTimeStamp(),
    };
    await saveMessage(savedMessage);
  };

  useEffect(() => {
    (async () => {
      if (!deepEqual(permissionsObj, modifiedPreset)) {
        await updateChatPermissions(chatId, {
          ...modifiedPreset,
        });
        setPermissionsObj({...modifiedPreset});
        if (
          modifiedPreset?.disappearingMessages !== 0 &&
          modifiedPreset?.disappearingMessages !==
            permissionsObj.disappearingMessages
        ) {
          await sendInfoMessage();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsObj, modifiedPreset, deepEqual]);
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

          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.md}
            style={styles.headerTextStyle}>
            Permissions
          </NumberlessText>
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
    backgroundColor: 'white',
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
