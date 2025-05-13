import React, { useState } from 'react';
import { View } from 'react-native';

import { useColors } from '@components/colorGuide';
import { permissionConfigMap } from '@components/getPermissionIcon';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import BooleanPermissionOption from '@components/PermissionsCards/Options/BooleanPermissionOption';
import NumberPermissionOption from '@components/PermissionsCards/Options/NumberPermissionOption';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import { Spacing } from '@components/spacingGuide';

import { ContentType } from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import { updatePermissions } from '@utils/Storage/permissions';
import { getLabelByTimeDiff } from '@utils/Time';

import DissapearingMessagesBottomsheet from '../BottomSheets/DissapearingMessagesBottomSheet';


const NewChatSettingsCard = ({
  chatId,
  permissionsId,
  permissions,
  setPermissions,
  heading = 'Other chat settings',
  // setOpenDisabledPermissionBottomsheet = () => { },
  // isDefaultFolder = false,
}: {
  chatId?: string;
  permissionsId?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
  heading?: string;
  isDefaultFolder?: boolean;
  setOpenDisabledPermissionBottomsheet?: (x: boolean) => void;
}) => {
  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);

  const Colors = useColors();

  const onUpdateDisappearingMessagedPermission = async (newValue: number) => {
    if (permissions.disappearingMessages !== newValue) {
      const updatedPermissions = {
        ...permissions,
        ['disappearingMessages']: newValue,
      };

      if (permissionsId) {
        await updatePermissions(permissionsId, updatedPermissions);
      }

      if (chatId) {
        const sender = new SendMessage(
          chatId,
          ContentType.disappearingMessages,
          {
            timeoutValue: newValue,
          },
        );
        await sender.send();
      }

      //Send broadcast here
      setPermissions(updatedPermissions);
    }
  };

  return (
    <SimpleCard style={{ backgroundColor: 'transparent', paddingVertical: 0 }}>
      <View
        style={{
          width: '100%',
          height: 48,
          paddingHorizontal: Spacing.xl,
          justifyContent: 'center',
        }}>
        <NumberlessText
          textColor={Colors.text.title}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          {heading}
        </NumberlessText>
      </View>
      <View style={{ marginHorizontal: Spacing.l }}>
        <BooleanPermissionOption
          onToggle={async () => {
            const editedPermissions = {
              ...permissions,
              autoDownload: !permissions.autoDownload,
            };
            if (permissionsId) {
              updatePermissions(permissionsId, editedPermissions);
            }
            setPermissions(editedPermissions);
          }}
          permissionState={permissions.autoDownload}
          title="Media auto-download"
          PermissionConfigMap={permissionConfigMap.autoDownload}
          theme={Colors.theme}
        />
        <NumberPermissionOption
          onClick={() => setShowDissappearingMessageModal(true)}
          permissionState={permissions.disappearingMessages}
          title="Disappearing messages"
          PermissionConfigMap={permissionConfigMap.disappearingMessages}
          labelText={getLabelByTimeDiff(permissions.disappearingMessages)}
          theme={Colors.theme}
        />
      </View>
      <DissapearingMessagesBottomsheet
        showDesappearingMessageModal={showDesappearingMessageModal}
        setShowDissappearingMessageModal={setShowDissappearingMessageModal}
        permission={permissions.disappearingMessages}
        onUpdateDisappearingMessagesPermission={
          onUpdateDisappearingMessagedPermission
        }
      />
    </SimpleCard>
  );
};

export default NewChatSettingsCard;
