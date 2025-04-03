import React, {FC, useState} from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import BellRed from '@assets/icons/BellRed.svg';
import DownloadTeal from '@assets/icons/DownloadTeal.svg';
import HomeSafron from '@assets/icons/HomeSafron.svg';
import DisappearingMessageBlue from '@assets/icons/DisappearingMessageBlue.svg';
import ProfileTeal from '@assets/icons/ProfileTeal.svg';

import BellDisabled from '@assets/light/icons/BellDisabled.svg';
import DownloadDisabled from '@assets/light/icons/DownloadDisabled.svg';
import HomeDisabled from '@assets/light/icons/HomeDisabled.svg';
import DisappearingMessageDisabled from '@assets/light/icons/DisappearingMessageDisabled.svg';
import ProfileDisabled from '@assets/light/icons/ProfileDisabled.svg';

import BellDisabledDark from '@assets/dark/icons/BellDisabled.svg';
import DownloadDisabledDark from '@assets/dark/icons/DownloadDisabled.svg';
import HomeDisabledDark from '@assets/dark/icons/HomeDisabled.svg';
import DisappearingMessageDisabledDark from '@assets/dark/icons/DisappearingMessageDisabled.svg';
import ProfileDisabledDark from '@assets/dark/icons/ProfileDisabled.svg';

import DynamicColors from '@components/DynamicColors';
import {SvgProps} from 'react-native-svg';
import {PortSpacing} from '@components/ComponentUtils';
import {useTheme} from 'src/context/ThemeContext';
import {
  BooleanPermissions,
  GroupPermissions,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {setRemoteNotificationPermissionsForChats} from '@utils/Notifications';
import {updatePermissions} from '@utils/Storage/permissions';
import {getLabelByTimeDiff} from '@utils/Time';
import DissapearingMessagesBottomsheet from './Reusable/BottomSheets/DissapearingMessagesBottomSheet';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import Group from '@utils/Groups/Group';

/**
 * Returns a JSX element representing an icon with a background color based on the provided permission state.
 *
 * @param {Array<string, boolean>} permission - A tuple where the first element is the permission name and the second is a boolean indicating whether the permission is enabled.
 * @returns {JSX.Element | null} - A circular `View` JSX element representing the icon with the appropriate background color, or null if the permission is not found.
 */

type PermissionConfig = {
  bgColor: string;
  enabledIcon: FC<SvgProps>;
  disabledIconLight: FC<SvgProps>;
  disabledIconDark: FC<SvgProps>;
};

interface PermissionConfigMap {
  notifications: PermissionConfig;
  autoDownload: PermissionConfig;
  focus: PermissionConfig;
  disappearingMessages: PermissionConfig;
  displayPicture: PermissionConfig;
}

const permissionConfigMap: PermissionConfigMap = {
  notifications: {
    bgColor: 'brightRed',
    enabledIcon: BellRed,
    disabledIconLight: BellDisabled,
    disabledIconDark: BellDisabledDark,
  },
  autoDownload: {
    bgColor: 'tealBlue',
    enabledIcon: DownloadTeal,
    disabledIconLight: DownloadDisabled,
    disabledIconDark: DownloadDisabledDark,
  },
  focus: {
    bgColor: 'deepSafron',
    enabledIcon: HomeSafron,
    disabledIconLight: HomeDisabled,
    disabledIconDark: HomeDisabledDark,
  },
  disappearingMessages: {
    bgColor: 'blue',
    enabledIcon: DisappearingMessageBlue,
    disabledIconLight: DisappearingMessageDisabled,
    disabledIconDark: DisappearingMessageDisabledDark,
  },
  displayPicture: {
    bgColor: 'blue',
    enabledIcon: ProfileTeal,
    disabledIconLight: ProfileDisabled,
    disabledIconDark: ProfileDisabledDark,
  },
};

const PermissionIconsGroup = ({
  permissions,
  setPermissions,
  permissionsId,
  chatId,
}: {
  permissionsId: string;
  chatId: string;
  permissions: GroupPermissions;
  setPermissions: (permissions: GroupPermissions) => void;
}) => {
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
  const onUpdateBooleanPermission = async (
    permissionKey: keyof BooleanPermissions,
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
  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);
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
    <View style={styles.wrapContainer}>
      <PermissionIcon
        permission={'notifications'}
        isEnabled={permissions.notifications}
        onToggle={onUpdateNotificationPermission}
      />
      <PermissionIcon
        permission={'focus'}
        isEnabled={permissions.focus}
        onToggle={async () => await onUpdateBooleanPermission('focus')}
      />
      <PermissionIcon
        permission={'displayPicture'}
        isEnabled={permissions.displayPicture}
        onToggle={async () => await onUpdateBooleanPermission('displayPicture')}
      />
      <PermissionIcon
        permission={'autoDownload'}
        isEnabled={permissions.autoDownload}
        onToggle={async () => await onUpdateBooleanPermission('autoDownload')}
      />
      <PermissionIcon
        permission={'disappearingMessages'}
        isEnabled={
          getLabelByTimeDiff(permissions.disappearingMessages) !== 'Off'
        }
        onToggle={() => setShowDissappearingMessageModal(true)}
      />
      <DissapearingMessagesBottomsheet
        showDesappearingMessageModal={showDesappearingMessageModal}
        setShowDissappearingMessageModal={setShowDissappearingMessageModal}
        permission={permissions.disappearingMessages}
        onUpdateDisappearingMessagesPermission={
          onUpdateDisappearingMessagedPermission
        }
      />
    </View>
  );
};

const PermissionIcon = ({
  isEnabled,
  onToggle,
  permission,
}: {
  isEnabled: boolean;
  onToggle: () => void;
  permission: keyof PermissionConfigMap;
}) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const config = permissionConfigMap[permission];
  return (
    <Pressable
      onPress={onToggle}
      style={StyleSheet.compose(styles.container, {
        backgroundColor: isEnabled
          ? Colors.lowAccentColors[
              config.bgColor as keyof typeof Colors.lowAccentColors
            ]
          : 'transparent',
        borderWidth: 0.5,
        borderColor: isEnabled ? 'transparent' : Colors.primary.darkgrey,
      })}>
      {isEnabled ? (
        <config.enabledIcon width={20} height={20} />
      ) : themeValue === 'light' ? (
        <config.disabledIconLight width={20} height={20} />
      ) : (
        <config.disabledIconDark width={20} height={20} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    padding: PortSpacing.tertiary.uniform,
  },
  wrapContainer: {
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
});

export default PermissionIconsGroup;
