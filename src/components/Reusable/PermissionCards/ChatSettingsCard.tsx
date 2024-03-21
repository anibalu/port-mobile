import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import NotificationIcon from '@assets/icons/NotificationOutline.svg';
import UserCircleIcon from '@assets/icons/UserCircle.svg';
import DownloadIcon from '@assets/icons/DownloadArrowDown.svg';
import ClockIcon from '@assets/icons/ClockIcon.svg';
import CheckIcon from '@assets/icons/CheckCircle.svg';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import React, {useEffect, useState} from 'react';
import OptionWithChevron from '@components/Reusable/OptionButtons/OptionWithChevron';
import {View} from 'react-native';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
import DissapearingMessagesBottomsheet from '../BottomSheets/DissapearingMessagesBottomSheet';
import {getLabelByTimeDiff} from '@utils/ChatPermissions';
import {
  BooleanPermissions,
  PermissionsStrict,
} from '@utils/ChatPermissions/interfaces';

const ChatSettingsCard = ({
  permissionsId,
  permissions,
  setPermissions,
}: {
  permissionsId?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
}) => {
  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);

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
    const updatedPermissions = {
      ...permissions,
      ['disappearingMessages']: newValue,
    };
    if (permissionsId) {
      await updatePermissions(permissionsId, updatedPermissions);
    }
    setPermissions(updatedPermissions);
  };

  return (
    <SimpleCard>
      <NumberlessText
        style={{
          padding: PortSpacing.secondary.uniform,
        }}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        Chat settings
      </NumberlessText>
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
      <View>
        <OptionWithToggle
          IconLeft={UserCircleIcon}
          toggleActiveState={permissions.displayPicture}
          heading="Reveal my display picture"
          onToggle={async () =>
            await onUpdateBooleanPermission('displayPicture')
          }
        />
      </View>
      <LineSeparator />
      <View>
        <OptionWithToggle
          IconLeft={DownloadIcon}
          toggleActiveState={permissions.autoDownload}
          heading="Media auto-download"
          onToggle={async () => await onUpdateBooleanPermission('autoDownload')}
        />
      </View>
      <LineSeparator />
      <View>
        <OptionWithToggle
          IconLeft={CheckIcon}
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
