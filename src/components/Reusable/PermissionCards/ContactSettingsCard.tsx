import React, { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, View } from 'react-native';

import { useColors } from '@components/colorGuide';
import { permissionConfigMap } from '@components/getPermissionIcon';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import BooleanPermissionOption from '@components/PermissionsCards/Options/BooleanPermissionOption';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import { Spacing } from '@components/spacingGuide';

import { checkNotificationPermission } from '@utils/AppPermissions';
import { modifyCallPermission } from '@utils/Calls/APICalls';
import DirectChat from '@utils/DirectChats/DirectChat';
import { setRemoteNotificationPermissionsForChats } from '@utils/Notifications';
import { pauseContactPortForDirectChat, resumeContactPortForDirectChat } from '@utils/Ports';
import {
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import { updatePermissions } from '@utils/Storage/permissions';

const ContactSettingsCard = ({
  chatId,
  permissions,
  permissionsId,
  setPermissions,
  chatName,
  heading}: {
  permissionsId: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
  chatId?: string;
  chatName?: string;
  heading?: string;
}) => {
  const Colors = useColors();

  const [notificationPermission, setNotificationPermission] = useState(true);

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

  // Define the permission check function with useCallback
  const checkPermissions = useCallback(async () => {
    const notificationPermission = await checkNotificationPermission();
    setNotificationPermission(notificationPermission);
    console.log('Checked permissions, status:', notificationPermission);
  }, []);

  // Run when app comes to foreground
  useEffect(() => {
    checkPermissions();
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          checkPermissions();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [checkPermissions]);

  const onUpdateBooleanPermission = async (
    permissionsId: string,
    editedPermissions: PermissionsStrict,
  ) => {
    await updatePermissions(permissionsId, editedPermissions);
    setPermissions(editedPermissions);
  };

  return (
    <SimpleCard style={{ backgroundColor: 'transparent', paddingVertical: 0 }}>
      <View
        style={{
          width: '100%',
          height: 48,
          paddingHorizontal: Spacing.l,
          justifyContent: 'center',
        }}>
        <NumberlessText
          textColor={Colors.text.title}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          {heading ? heading : `Enable ${chatName} to`}
        </NumberlessText>
      </View>
      <View style={{ marginHorizontal: Spacing.l }}>
        <BooleanPermissionOption
          onToggle={onUpdateNotificationPermission}
          permissionState={permissions.notifications}
          title="Notify me"
          PermissionConfigMap={permissionConfigMap.notifications}
          theme={Colors.theme}
          appPermissionNotGranted={!notificationPermission}
          appPermissionNotGrantedText="Please enable notifications in your device settings to receive alerts from contacts."
        />
        <BooleanPermissionOption
          onToggle={onUpdateCallPermission}
          permissionState={permissions.calling}
          title="Call me"
          PermissionConfigMap={permissionConfigMap.calling}
          theme={Colors.theme}
        />
        <BooleanPermissionOption
          onToggle={toggleContactSharing}
          permissionState={permissions.contactSharing}
          title="Share my contact"
          PermissionConfigMap={permissionConfigMap.contactSharing}
          theme={Colors.theme}
        />
        <BooleanPermissionOption
          onToggle={async () => 
            await onUpdateBooleanPermission(permissionsId, {
              ...permissions,
              displayPicture: !permissions.displayPicture,
            })
          }
          permissionState={permissions.displayPicture}
          title="See my profile picture"
          PermissionConfigMap={permissionConfigMap.displayPicture}
          theme={Colors.theme}
        />
        <BooleanPermissionOption
          onToggle={async () => await onUpdateBooleanPermission(permissionsId, {
            ...permissions,
            readReceipts: !permissions.readReceipts,
          })}
          permissionState={permissions.readReceipts}
          title="See my read receipts"
          PermissionConfigMap={permissionConfigMap.readReceipts}
          theme={Colors.theme}
        />
      </View>
    </SimpleCard>
  );
};

export default ContactSettingsCard;
