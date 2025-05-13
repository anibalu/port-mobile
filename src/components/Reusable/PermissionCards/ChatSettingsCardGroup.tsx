import React, {useCallback, useEffect, useState} from 'react';
import {AppState, AppStateStatus, View} from 'react-native';

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

import { checkNotificationPermission } from '@utils/AppPermissions';
import Group from '@utils/Groups/Group';
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import { setRemoteNotificationPermissionsForChats } from '@utils/Notifications';
import {
  GroupPermissions,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {updatePermissions} from '@utils/Storage/permissions';
import {getLabelByTimeDiff} from '@utils/Time';


import DissapearingMessagesBottomsheet from '../BottomSheets/DissapearingMessagesBottomSheet';


const ChatSettingsCardGroup = ({
  chatId,
  permissionsId,
  permissions,
  setPermissions,
  heading = 'Other chat settings',
}: {
  chatId?: string;
  permissionsId?: string;
  permissions: GroupPermissions;
  setPermissions: (permissions: GroupPermissions) => void;
  showDissapearingMessagesOption?: boolean;
  heading?: string;
}) => {
  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);

  const Colors = useColors();

  const [notificationPermission, setNotificationPermission] = useState(true);

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
    permissionKey: keyof GroupPermissions,
  ) => {
    const updatedPermissions: GroupPermissions = {
      ...permissions,
      [permissionKey]: !permissions[permissionKey],
    };
    if (permissionsId) {
      await updatePermissions(permissionsId, updatedPermissions);
    }
    setPermissions(updatedPermissions);
  };

  const onUpdateNotificationPermission = async () => {
    const newNotificationPermissionState = !permissions.notifications;
    // Toggle the notification switch immediately to give the user immediate feedback
    setPermissions({
      ...permissions,
      ['notifications']: newNotificationPermissionState,
    });
    if (chatId) {
      const group = new Group(chatId);
      const groupId = (await group.getData())?.groupId;
      // We have a specific chat to update
      // API call to udpate a single chatId on the backend
      try {
        if (!groupId) {
          throw new Error('No group Id');
        }
        await setRemoteNotificationPermissionsForChats(
          newNotificationPermissionState,
          [{id: groupId, type: 'group'}],
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
    <SimpleCard style={{backgroundColor: 'transparent', paddingVertical: 0}}>
      <View
        style={{
          width: '100%',
          height: 56,
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
      <View style={{
        width: '100%',
        paddingHorizontal: Spacing.xl,
      }}>
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
          onToggle={async () => await onUpdateBooleanPermission('autoDownload')}
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

export default ChatSettingsCardGroup;
