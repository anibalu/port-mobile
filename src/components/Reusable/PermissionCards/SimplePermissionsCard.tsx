import React, {useState} from 'react';
import {View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {permissionConfigMap} from '@components/getPermissionIcon';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import OptionWithChevron from '@components/Reusable/OptionButtons/OptionWithChevron';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';

import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {getLabelByTimeDiff} from '@utils/Time';

import {useTheme} from 'src/context/ThemeContext';

import DissapearingMessagesBottomsheet from '../BottomSheets/DissapearingMessagesBottomSheet';
import SimpleCard from '../Cards/SimpleCard';

/**
 * Simple Permissions Card component
 * @param permissions - The permissions object
 * @param setPermissions - The function to set the permissions
 * @param setSeeMoreClicked - The function to set the see more clicked state
 * @param seeMoreClicked - The state to store the see more clicked state
 */
const SimplePermissionsCard = ({
  permissions,
  setPermissions,
  setSeeMoreClicked,
  seeMoreClicked,
}: {
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
  setSeeMoreClicked: (value: boolean) => void;
  seeMoreClicked: boolean;
}) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();

  // icons for the permissions
  const ContactSharingIcon = permissions.contactSharing
    ? permissionConfigMap.contactSharing.enabledIcon
    : themeValue === 'light'
    ? permissionConfigMap.contactSharing.disabledIconLight
    : permissionConfigMap.contactSharing.disabledIconDark;

  const DisplayPictureIcon = permissions.displayPicture
    ? permissionConfigMap.displayPicture.enabledIcon
    : themeValue === 'light'
    ? permissionConfigMap.displayPicture.disabledIconLight
    : permissionConfigMap.displayPicture.disabledIconDark;

  const ReadReceiptsIcon = permissions.readReceipts
    ? permissionConfigMap.readReceipts.enabledIcon
    : themeValue === 'light'
    ? permissionConfigMap.readReceipts.disabledIconLight
    : permissionConfigMap.readReceipts.disabledIconDark;
  const FocusIcon = permissions.focus
    ? permissionConfigMap.focus.enabledIcon
    : themeValue === 'light'
    ? permissionConfigMap.focus.disabledIconLight
    : permissionConfigMap.focus.disabledIconDark;

  const NotificationsIcon = permissions.notifications
    ? permissionConfigMap.notifications.enabledIcon
    : themeValue === 'light'
    ? permissionConfigMap.notifications.disabledIconLight
    : permissionConfigMap.notifications.disabledIconDark;

  const AutoDownloadIcon = permissions.autoDownload
    ? permissionConfigMap.autoDownload.enabledIcon
    : themeValue === 'light'
    ? permissionConfigMap.autoDownload.disabledIconLight
    : permissionConfigMap.autoDownload.disabledIconDark;

  const DisappearingMessagesIcon = permissions.disappearingMessages
    ? permissionConfigMap.disappearingMessages.enabledIcon
    : themeValue === 'light'
    ? permissionConfigMap.disappearingMessages.disabledIconLight
    : permissionConfigMap.disappearingMessages.disabledIconDark;

  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);
  return (
    <SimpleCard>
      <NumberlessText
        style={{
          paddingVertical: PortSpacing.tertiary.uniform,
          marginHorizontal: PortSpacing.secondary.uniform,
        }}
        textColor={Colors.labels.text}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        New contact can
      </NumberlessText>
      <View>
        <OptionWithToggle
          IconLeft={ContactSharingIcon}
          borderColorEnabled={permissions.contactSharing}
          backgroundColor={
            Colors.lowAccentColors[
              permissionConfigMap.contactSharing
                .bgColor as keyof typeof Colors.lowAccentColors
            ]
          }
          toggleActiveState={permissions.contactSharing}
          heading="Share my contact"
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
          IconLeft={DisplayPictureIcon}
          borderColorEnabled={permissions.displayPicture}
          backgroundColor={
            Colors.lowAccentColors[
              permissionConfigMap.displayPicture
                .bgColor as keyof typeof Colors.lowAccentColors
            ]
          }
          toggleActiveState={permissions.displayPicture}
          heading="See my profile picture"
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
          IconLeft={ReadReceiptsIcon}
          borderColorEnabled={permissions.readReceipts}
          backgroundColor={
            Colors.lowAccentColors[
              permissionConfigMap.readReceipts
                .bgColor as keyof typeof Colors.lowAccentColors
            ]
          }
          toggleActiveState={permissions.readReceipts}
          heading="See my read receipts"
          onToggle={async () => {
            setPermissions({
              ...permissions,
              readReceipts: !permissions.readReceipts,
            });
          }}
        />
      </View>
      {seeMoreClicked ? (
        <>
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
              IconLeft={FocusIcon}
              borderColorEnabled={permissions.focus}
              backgroundColor={
                Colors.lowAccentColors[
                  permissionConfigMap.focus
                    .bgColor as keyof typeof Colors.lowAccentColors
                ]
              }
              toggleActiveState={permissions.focus}
              heading="Show chat in Home Tab"
              onToggle={async () => {
                setPermissions({...permissions, focus: !permissions.focus});
              }}
            />
          </View>
          <View>
            <OptionWithToggle
              IconLeft={NotificationsIcon}
              borderColorEnabled={permissions.notifications}
              backgroundColor={
                Colors.lowAccentColors[
                  permissionConfigMap.notifications
                    .bgColor as keyof typeof Colors.lowAccentColors
                ]
              }
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
              IconLeft={AutoDownloadIcon}
              borderColorEnabled={permissions.autoDownload}
              backgroundColor={
                Colors.lowAccentColors[
                  permissionConfigMap.autoDownload
                    .bgColor as keyof typeof Colors.lowAccentColors
                ]
              }
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
              IconLeft={DisappearingMessagesIcon}
              borderColorEnabled={permissions.disappearingMessages}
              backgroundColor={
                Colors.lowAccentColors[
                  permissionConfigMap.disappearingMessages
                    .bgColor as keyof typeof Colors.lowAccentColors
                ]
              }
              labelActiveState={
                getLabelByTimeDiff(permissions.disappearingMessages) !== 'Off'
              }
              labelText={getLabelByTimeDiff(permissions.disappearingMessages)}
              heading="Disappearing messages"
              onClick={() => setShowDissappearingMessageModal(true)}
            />
          </View>
          <NumberlessText
            onPress={() => setSeeMoreClicked(p => !p)}
            style={{
              alignSelf: 'flex-end',
              flex: 1,
              paddingRight: PortSpacing.intermediate.right,
            }}
            textColor={Colors.primary.accent}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            See less
          </NumberlessText>
        </>
      ) : (
        <NumberlessText
          onPress={() => setSeeMoreClicked(p => !p)}
          style={{
            alignSelf: 'flex-end',
            flex: 1,
            paddingRight: PortSpacing.intermediate.right,
          }}
          textColor={Colors.primary.accent}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          See more
        </NumberlessText>
      )}

      {!seeMoreClicked && (
        <NumberlessText
          style={{
            paddingLeft: PortSpacing.intermediate.left,
            paddingTop: PortSpacing.tertiary.top,
          }}
          textColor={Colors.text.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          You can always change these permissions later.
        </NumberlessText>
      )}

      <DissapearingMessagesBottomsheet
        showDesappearingMessageModal={showDesappearingMessageModal}
        setShowDissappearingMessageModal={setShowDissappearingMessageModal}
        permission={permissions.disappearingMessages}
        onUpdateDisappearingMessagesPermission={async newValue => {
          setPermissions({...permissions, disappearingMessages: newValue});
        }}
      />
    </SimpleCard>
  );
};

export default SimplePermissionsCard;
