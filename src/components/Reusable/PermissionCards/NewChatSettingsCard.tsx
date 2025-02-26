import { PortSpacing } from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithChevron from '@components/Reusable/OptionButtons/OptionWithChevron';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import { getLabelByTimeDiff } from '@utils/Time';
import {
  BooleanPermissions,
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import { ContentType } from '@utils/Messaging/interfaces';
import { updatePermissions } from '@utils/Storage/permissions';
import React, { useState } from 'react';
import { View } from 'react-native';
import DissapearingMessagesBottomsheet from '../BottomSheets/DissapearingMessagesBottomSheet';
import DynamicColors from '@components/DynamicColors';
import getPermissionIcon from '@components/getPermissionIcon';
import { useTheme } from 'src/context/ThemeContext';

const NewChatSettingsCard = ({
  chatId,
  permissionsId,
  permissions,
  setPermissions,
  showDissapearingMessagesOption = true,
  heading = 'Other chat settings',
  setOpenDisabledPermissionBottomsheet = () => { },
  isDefaultFolder = false,
}: {
  chatId?: string;
  permissionsId?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
  showDissapearingMessagesOption?: boolean;
  heading?: string;
  isDefaultFolder?: boolean;
  setOpenDisabledPermissionBottomsheet?: (x: boolean) => void;
}) => {
  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);

  const Colors = DynamicColors();

  const onUpdateBooleanPermission = async (
    permissionKey: keyof BooleanPermissions,
  ) => {
    if (permissionKey === 'focus' && permissions.focus && isDefaultFolder) {
      setOpenDisabledPermissionBottomsheet(true);
    }
    const updatedPermissions: PermissionsStrict = {
      ...permissions,
      [permissionKey]: !permissions[permissionKey],
    };
    if (permissionsId) {
      await updatePermissions(permissionsId, updatedPermissions);
    }
    setPermissions(updatedPermissions);
  };

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

  const { themeValue } = useTheme();

  return (
    <SimpleCard style={{ backgroundColor: 'transparent', paddingVertical: 0 }}>
      <View
        style={{
          width: '100%',
          height: 48,
          paddingHorizontal: PortSpacing.intermediate.uniform,
          justifyContent: 'center',
        }}>
        <NumberlessText
          textColor={Colors.labels.text}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          {heading}
        </NumberlessText>
      </View>
      <View style={{ width: '100%' }}>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'focus',
            permissions.focus,
            themeValue,
          ])}
          toggleActiveState={permissions.focus}
          heading="Show chat in Home Tab"
          onToggle={async () => await onUpdateBooleanPermission('focus')}
        />
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'autoDownload',
            permissions.autoDownload,
            themeValue,
          ])}
          toggleActiveState={permissions.autoDownload}
          heading="Media auto-download"
          onToggle={async () => await onUpdateBooleanPermission('autoDownload')}
        />
      </View>
      {showDissapearingMessagesOption && (
        <>
          <OptionWithChevron
            IconLeftView={getPermissionIcon([
              'disappearingMessages',
              !!permissions.disappearingMessages,
              themeValue,
            ])}
            labelActiveState={
              getLabelByTimeDiff(permissions.disappearingMessages) !== 'Off'
            }
            labelText={getLabelByTimeDiff(permissions.disappearingMessages)}
            heading="Disappearing messages"
            onClick={() => setShowDissappearingMessageModal(true)}
          />
          <DissapearingMessagesBottomsheet
            showDesappearingMessageModal={showDesappearingMessageModal}
            setShowDissappearingMessageModal={setShowDissappearingMessageModal}
            permission={permissions.disappearingMessages}
            onUpdateDisappearingMessagedPermission={
              onUpdateDisappearingMessagedPermission
            }
          />
        </>
      )}
    </SimpleCard>
  );
};

export default NewChatSettingsCard;
