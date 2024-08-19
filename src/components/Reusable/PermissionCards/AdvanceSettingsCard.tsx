import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
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

const AdvanceSettingsCard = ({
  permissionsId,
  permissions,
  setPermissions,
  chatId,
}: {
  permissionsId: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
  chatId?: string;
}) => {
  const Colors = DynamicColors();

  useEffect(() => {
    (async () => {
      if (permissionsId) {
        setPermissions(await getPermissions(permissionsId));
      }
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
      } catch (e) {
        console.error('Could not resume contact port', e);
        setPermissions(oldPermissions);
        return;
      }
    } else if (chatId) {
      try {
        await pauseContactPortForDirectChat(chatId);
      } catch (e) {
        console.error('Could not pause contact port', e);
        setPermissions(oldPermissions);
        return;
      }
    }
    await updatePermissions(permissionsId, updatedPermissions);
  }

  const {themeValue} = useTheme();
  return (
    <SimpleCard style={{backgroundColor: 'transparent'}}>
      <NumberlessText
        style={{
          padding: PortSpacing.secondary.uniform,
        }}
        textColor={Colors.labels.text}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        Access Permissions
      </NumberlessText>
      <View style={{paddingBottom: PortSpacing.tertiary.bottom}}>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'contactSharing',
            permissions.contactSharing,
            themeValue,
          ])}
          toggleActiveState={permissions.contactSharing}
          heading="Contact sharing"
          onToggle={toggleContactSharing}
        />
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'displayPicture',
            permissions.displayPicture,
            themeValue,
          ])}
          toggleActiveState={permissions.displayPicture}
          heading="Show my profile photo"
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
          heading="Send read receipts"
          onToggle={async () => await onUpdateBooleanPermission('readReceipts')}
        />
      </View>
    </SimpleCard>
  );
};

export default AdvanceSettingsCard;
