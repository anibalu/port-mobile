import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import OptionWithChevron from '@components/Reusable/OptionButtons/OptionWithChevron';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import {getLabelByTimeDiff} from '@utils/Time';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import React, {useState} from 'react';
import {View} from 'react-native';
import DissapearingMessagesBottomsheet from '../BottomSheets/DissapearingMessagesBottomSheet';
import DynamicColors from '@components/DynamicColors';
import getPermissionIcon from '@components/getPermissionIcon';
import {useTheme} from 'src/context/ThemeContext';

const SimplePermissionsCard = ({
  permissions,
  setPermissions,
}: {
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
}) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();

  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);
  return (
    <View>
      <NumberlessText
        style={{
          paddingVertical: PortSpacing.tertiary.uniform,
          marginHorizontal: PortSpacing.secondary.uniform,
        }}
        textColor={Colors.labels.text}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        Allow the formed contact to
      </NumberlessText>
      <View>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'contactSharing',
            permissions.contactSharing,
            themeValue,
          ])}
          toggleActiveState={permissions.contactSharing}
          heading="Share your contact"
          onToggle={async () => {
            setPermissions({
              ...permissions,
              contactSharing: !permissions.contactSharing,
            });
          }}
        />
      </View>
      <View>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'displayPicture',
            permissions.displayPicture,
            themeValue,
          ])}
          toggleActiveState={permissions.displayPicture}
          heading="See your display picture"
          onToggle={async () => {
            setPermissions({
              ...permissions,
              displayPicture: !permissions.displayPicture,
            });
          }}
        />
      </View>
      <View>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'readReceipts',
            permissions.readReceipts,
            themeValue,
          ])}
          toggleActiveState={permissions.readReceipts}
          heading="See your read receipts"
          onToggle={async () => {
            setPermissions({
              ...permissions,
              readReceipts: !permissions.readReceipts,
            });
          }}
        />
      </View>
      <NumberlessText
        style={{
          paddingBottom: PortSpacing.medium.uniform,
          paddingTop: PortSpacing.primary.uniform,
          marginHorizontal: PortSpacing.secondary.uniform,
        }}
        textColor={Colors.labels.text}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        Other settings for the formed chat
      </NumberlessText>
      <View>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'focus',
            permissions.focus,
            themeValue,
          ])}
          toggleActiveState={permissions.focus}
          heading="Show chat in Home Tab"
          onToggle={async () => {
            setPermissions({...permissions, focus: !permissions.focus});
          }}
        />
      </View>
      <View>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'notifications',
            permissions.notifications,
            themeValue,
          ])}
          toggleActiveState={permissions.notifications}
          heading="Receive notifications"
          onToggle={async () => {
            setPermissions({
              ...permissions,
              notifications: !permissions.notifications,
            });
          }}
        />
      </View>
      <View>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'autoDownload',
            permissions.autoDownload,
            themeValue,
          ])}
          toggleActiveState={permissions.autoDownload}
          heading="Auto-download media"
          onToggle={async () => {
            setPermissions({
              ...permissions,
              autoDownload: !permissions.autoDownload,
            });
          }}
        />
      </View>
      <View style={{paddingBottom: PortSpacing.tertiary.bottom}}>
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
      </View>
      <DissapearingMessagesBottomsheet
        showDesappearingMessageModal={showDesappearingMessageModal}
        setShowDissappearingMessageModal={setShowDissappearingMessageModal}
        permission={permissions.disappearingMessages}
        onUpdateDisappearingMessagedPermission={async newValue => {
          setPermissions({...permissions, disappearingMessages: newValue});
        }}
      />
    </View>
  );
};

export default SimplePermissionsCard;
