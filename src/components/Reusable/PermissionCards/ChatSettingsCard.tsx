import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithChevron from '@components/Reusable/OptionButtons/OptionWithChevron';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {getLabelByTimeDiff} from '@utils/ChatPermissions';
import {
  BooleanPermissions,
  PermissionsStrict,
} from '@utils/ChatPermissions/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
import React, {useEffect, useState} from 'react';
import {Platform, View} from 'react-native';
import DissapearingMessagesBottomsheet from '../BottomSheets/DissapearingMessagesBottomSheet';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const ChatSettingsCard = ({
  chatId,
  permissionsId,
  permissions,
  setPermissions,
}: {
  chatId?: string;
  permissionsId?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
}) => {
  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);

  const Colors = DynamicColors();

  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'NotificationOutline',
      light: require('@assets/light/icons/NotificationOutline.svg').default,
      dark: require('@assets/dark/icons/NotificationOutline.svg').default,
    },
    // 2.UserCircle
    {
      assetName: 'UserCircle',
      light: require('@assets/light/icons/UserCircle.svg').default,
      dark: require('@assets/dark/icons/UserCircle.svg').default,
    },
    // 3.ClockIcon
    {
      assetName: 'ClockIcon',
      light: require('@assets/light/icons/ClockIcon.svg').default,
      dark: require('@assets/dark/icons/ClockIcon.svg').default,
    },
    // 4.DownloadArrow
    {
      assetName: 'DownloadArrow',
      light: require('@assets/light/icons/DownloadArrow.svg').default,
      dark: require('@assets/dark/icons/DownloadArrow.svg').default,
    },
    // 5. CheckCircle
    {
      assetName: 'CheckCircle',
      light: require('@assets/light/icons/CheckCircle.svg').default,
      dark: require('@assets/dark/icons/CheckCircle.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const NotificationIcon = results?.NotificationOutline;
  const UserCircle = results?.UserCircle;
  const ClockIcon = results?.ClockIcon;
  const Download = results?.DownloadArrow;
  const CheckCircle = results?.CheckCircle;

  useEffect(() => {
    (async () => {
      setPermissions(await getPermissions(permissionsId));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsId]);

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
    <SimpleCard>
      <NumberlessText
        style={{
          padding: PortSpacing.secondary.uniform,
        }}
        textColor={Colors.labels.text}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        Chat settings
      </NumberlessText>
      {Platform.OS === 'android' && (
        <>
          <View>
            <OptionWithToggle
              IconLeft={NotificationIcon}
              toggleActiveState={permissions.notifications}
              heading="Notifications"
              onToggle={async () =>
                await onUpdateBooleanPermission('notifications')
              }
            />
          </View>
          <LineSeparator />
        </>
      )}

      <View>
        <OptionWithToggle
          IconLeft={UserCircle}
          toggleActiveState={permissions.displayPicture}
          heading="Show my profile photo"
          onToggle={async () =>
            await onUpdateBooleanPermission('displayPicture')
          }
        />
      </View>
      <LineSeparator />
      <View>
        <OptionWithToggle
          IconLeft={Download}
          toggleActiveState={permissions.autoDownload}
          heading="Media auto-download"
          onToggle={async () => await onUpdateBooleanPermission('autoDownload')}
        />
      </View>
      <LineSeparator />
      <View>
        <OptionWithToggle
          IconLeft={CheckCircle}
          toggleActiveState={permissions.readReceipts}
          heading="Send read receipts"
          onToggle={async () => await onUpdateBooleanPermission('readReceipts')}
        />
      </View>
      <LineSeparator />
      <View style={{paddingBottom: PortSpacing.tertiary.bottom}}>
        <OptionWithChevron
          IconLeft={ClockIcon}
          labelActiveState={
            getLabelByTimeDiff(permissions.disappearingMessages) !== 'Off'
          }
          labelText={getLabelByTimeDiff(permissions.disappearingMessages)}
          heading="Disappearing messages"
          onClick={() => setShowDissappearingMessageModal(true)}
        />
      </View>
      <DissapearingMessagesBottomsheet
        showDesappearingMessageModal={showDesappearingMessageModal}
        setShowDissappearingMessageModal={setShowDissappearingMessageModal}
        permission={permissions.disappearingMessages}
        onUpdateDisappearingMessagedPermission={
          onUpdateDisappearingMessagedPermission
        }
      />
    </SimpleCard>
  );
};

export default ChatSettingsCard;
