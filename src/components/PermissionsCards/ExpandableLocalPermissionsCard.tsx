import React, {useState} from 'react';
import {View} from 'react-native';

import GradientCard from '@components/Cards/GradientCard';
import {useColors} from '@components/colorGuide';
import {permissionConfigMap} from '@components/getPermissionIcon';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import DissapearingMessagesBottomsheet from '@components/Reusable/BottomSheets/DissapearingMessagesBottomSheet';
import {Spacing} from '@components/spacingGuide';

import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {getLabelByTimeDiff} from '@utils/Time';

import BooleanPermissionOption from './Options/BooleanPermissionOption';
import NumberPermissionOption from './Options/NumberPermissionOption';

const ExpandableLocalPermissionsCard = ({
  heading = 'New Contact can',
  permissions,
  setPermissions,
  setSeeMoreClicked,
  seeMoreClicked,
  expandable = true,
  bottomText,
  appNotificationPermissionNotGranted,
}: {
  heading?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
  setSeeMoreClicked?: (value: boolean) => void;
  seeMoreClicked?: boolean;
  expandable?: boolean;
  bottomText?: string;
  appNotificationPermissionNotGranted?: boolean;
}) => {
  const Colors = useColors();
  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);

  return (
    <GradientCard style={{padding: Spacing.l, paddingVertical: Spacing.l}}>
      <NumberlessText
        style={{marginBottom: Spacing.m}}
        textColor={Colors.text.title}
        fontSizeType={FontSizeType.l}
        fontWeight={FontWeight.md}>
        {heading}
      </NumberlessText>
      <View>
        <BooleanPermissionOption
          onToggle={async () => {
            setPermissions({
              ...permissions,
              notifications: !permissions.notifications,
            });
          }}
          permissionState={permissions.notifications}
          title="Notify me"
          PermissionConfigMap={permissionConfigMap.notifications}
          theme={Colors.theme}
          appPermissionNotGranted={appNotificationPermissionNotGranted}
          appPermissionNotGrantedText="Please enable notifications in your device settings to receive alerts from contacts."
        />
        <BooleanPermissionOption
          onToggle={async () => {
            setPermissions({
              ...permissions,
              calling: !permissions.calling,
            });
          }}
          permissionState={permissions.calling}
          title="Call me"
          PermissionConfigMap={permissionConfigMap.calling}
          theme={Colors.theme}
        />
        <BooleanPermissionOption
          onToggle={async () => {
            setPermissions({
              ...permissions,
              contactSharing: !permissions.contactSharing,
            });
          }}
          permissionState={permissions.contactSharing}
          title="Share my contact"
          PermissionConfigMap={permissionConfigMap.contactSharing}
          theme={Colors.theme}
        />
        <BooleanPermissionOption
          onToggle={async () => {
            setPermissions({
              ...permissions,
              displayPicture: !permissions.displayPicture,
            });
          }}
          permissionState={permissions.displayPicture}
          title="See my profile picture"
          PermissionConfigMap={permissionConfigMap.displayPicture}
          theme={Colors.theme}
        />
        {seeMoreClicked || !expandable ? (
          <>
            <BooleanPermissionOption
              onToggle={async () => {
                setPermissions({
                  ...permissions,
                  readReceipts: !permissions.readReceipts,
                });
              }}
              permissionState={permissions.readReceipts}
              title="See my read receipts"
              PermissionConfigMap={permissionConfigMap.readReceipts}
              theme={Colors.theme}
            />
            <NumberlessText
              style={{marginBottom: Spacing.m, marginTop: Spacing.m}}
              textColor={Colors.text.title}
              fontSizeType={FontSizeType.l}
              fontWeight={FontWeight.md}>
              Other chat settings
            </NumberlessText>
            <BooleanPermissionOption
              onToggle={async () => {
                setPermissions({
                  ...permissions,
                  autoDownload: !permissions.autoDownload,
                });
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
            {expandable && setSeeMoreClicked && (
              <NumberlessText
                style={{alignSelf: 'flex-end', marginVertical: Spacing.s}}
                onPress={() => setSeeMoreClicked(false)}
                textColor={Colors.purple}
                fontWeight={FontWeight.rg}
                fontSizeType={FontSizeType.m}>
                See less
              </NumberlessText>
            )}
          </>
        ) : (
          <>
            {expandable && setSeeMoreClicked && (
              <NumberlessText
                style={{alignSelf: 'flex-end', marginVertical: Spacing.s}}
                onPress={() => setSeeMoreClicked(true)}
                textColor={Colors.purple}
                fontWeight={FontWeight.rg}
                fontSizeType={FontSizeType.m}>
                See more
              </NumberlessText>
            )}
          </>
        )}
        {bottomText && (
          <NumberlessText
            style={{marginTop: Spacing.s}}
            textColor={Colors.text.subtitle}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.s}>
            {bottomText}
          </NumberlessText>
        )}
      </View>
      <DissapearingMessagesBottomsheet
        showDesappearingMessageModal={showDesappearingMessageModal}
        setShowDissappearingMessageModal={setShowDissappearingMessageModal}
        permission={permissions.disappearingMessages}
        onUpdateDisappearingMessagesPermission={async newValue => {
          setPermissions({...permissions, disappearingMessages: newValue});
        }}
      />
    </GradientCard>
  );
};

export default ExpandableLocalPermissionsCard;
