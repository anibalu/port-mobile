import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import React from 'react';
import {View} from 'react-native';
import {updatePermissions} from '@utils/Storage/permissions';
import {
  BooleanPermissions,
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import DynamicColors from '@components/DynamicColors';
import getPermissionIcon from '@components/getPermissionIcon';
import {useTheme} from 'src/context/ThemeContext';
import {
  pauseContactPortForDirectChat,
  resumeContactPortForDirectChat,
} from '@utils/Ports/contactport';
import DirectChat from '@utils/DirectChats/DirectChat';
import {modifyCallPermission} from '@utils/Calls/APICalls';
import {setRemoteNotificationPermissionsForChats} from '@utils/Notifications';

const ContactSettingsCard = ({
  permissionsId,
  permissions,
  setPermissions,
  chatId,
  chatName,
  heading,
}: {
  permissionsId?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
  chatId?: string;
  chatName?: string;
  heading?: string;
}) => {
  const Colors = DynamicColors();

  const onUpdateNotificationPermission = async () => {
    const newNotificationPermissionState = !permissions.notifications;
    // Toggle the notification switch immediately to give the user immediate feedback
    setPermissions({
      ...permissions,
      ['notifications']: newNotificationPermissionState,
    });
    if (chatId) {
      const directChat = new DirectChat(chatId);
      const lineId = (await directChat.getChatData()).lineId;
      // We have a specific chat to update
      // API call to udpate a single chatId on the backend
      try {
        await setRemoteNotificationPermissionsForChats(
          newNotificationPermissionState,
          [{id: lineId, type: 'line'}],
        );
      } catch (e) {
        console.error(
          '[NOTIFICATION PERMISSION] Could not update permissions',
          e,
        );
        // If the API call fails, toggle back to old setting
        setPermissions({
          ...permissions,
          ['notifications']: !newNotificationPermissionState,
        });
        return;
      }
    }

    // Update the notification state
    if (permissionsId) {
      await updatePermissions(permissionsId, {
        notifications: newNotificationPermissionState,
      });
    }
  };

  const onUpdateCallPermission = async () => {
    const newCallPermissionState = !permissions.calling;
    // Toggle the notification switch immediately to give the user immediate feedback
    setPermissions({
      ...permissions,
      ['calling']: newCallPermissionState,
    });
    if (chatId) {
      const directChat = new DirectChat(chatId);
      const lineId = (await directChat.getChatData()).lineId;
      // We have a specific chat to update
      // API call to udpate a single chatId on the backend
      try {
        await modifyCallPermission(lineId, newCallPermissionState);
      } catch (e) {
        console.error('[CALL PERMISSION] Could not update permissions', e);
        // If the API call fails, toggle back to old setting
        setPermissions({
          ...permissions,
          ['calling']: !newCallPermissionState,
        });
        return;
      }
    }
    // Update the notification state
    if (permissionsId) {
      await updatePermissions(permissionsId, {
        calling: newCallPermissionState,
      });
    }
  };
  const onUpdateBooleanPermission = async (
    permissionKey: keyof BooleanPermissions,
  ) => {
    const updatedPermissions: PermissionsStrict = {
      ...permissions,
      [permissionKey]: !permissions[permissionKey],
    };
    if (permissionsId) {
      await updatePermissions(permissionsId, updatedPermissions);
    }
    setPermissions(updatedPermissions);
  };

  async function toggleContactSharing() {
    const oldPermissions = permissions;
    const newPermission = !permissions.contactSharing;
    const updatedPermissions: PermissionsStrict = {
      ...permissions,
      ['contactSharing']: newPermission,
    };
    setPermissions(updatedPermissions);
    if (newPermission && chatId) {
      try {
        await resumeContactPortForDirectChat(chatId);
        if (permissionsId) {
          await updatePermissions(permissionsId, updatedPermissions);
        }
      } catch (e) {
        console.error('Could not resume contact port', e);
        setPermissions(oldPermissions);
        if (permissionsId) {
          await updatePermissions(permissionsId, oldPermissions);
        }
        return;
      }
    } else if (chatId) {
      try {
        await pauseContactPortForDirectChat(chatId);
        if (permissionsId) {
          await updatePermissions(permissionsId, updatedPermissions);
        }
      } catch (e) {
        console.error('Could not pause contact port', e);
        setPermissions(oldPermissions);
        if (permissionsId) {
          await updatePermissions(permissionsId, oldPermissions);
        }
        return;
      }
    }
  }

  const {themeValue} = useTheme();
  return (
    <SimpleCard style={{backgroundColor: 'transparent', paddingVertical: 0}}>
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
          {heading ? heading : `Enable ${chatName} to`}
        </NumberlessText>
      </View>
      <View style={{width: '100%'}}>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'notifications',
            permissions.notifications,
            themeValue,
          ])}
          toggleActiveState={permissions.notifications}
          heading="Notify me"
          onToggle={onUpdateNotificationPermission}
        />
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'calling',
            permissions.calling,
            themeValue,
          ])}
          toggleActiveState={permissions.calling}
          heading="Call me"
          onToggle={onUpdateCallPermission}
        />
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'contactSharing',
            permissions.contactSharing,
            themeValue,
          ])}
          toggleActiveState={permissions.contactSharing}
          heading="Share my contact"
          onToggle={toggleContactSharing}
        />
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'displayPicture',
            permissions.displayPicture,
            themeValue,
          ])}
          toggleActiveState={permissions.displayPicture}
          heading="See my display picture"
          onToggle={async () =>
            await onUpdateBooleanPermission('displayPicture')
          }
        />
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'readReceipts',
            permissions.readReceipts,
            themeValue,
          ])}
          toggleActiveState={permissions.readReceipts}
          heading="See my read receipts"
          onToggle={async () => await onUpdateBooleanPermission('readReceipts')}
        />
      </View>
    </SimpleCard>
  );
};

export default ContactSettingsCard;
