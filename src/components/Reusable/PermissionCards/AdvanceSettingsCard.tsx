import React from 'react';
import {View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import getPermissionIcon from '@components/getPermissionIcon';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';

import {
  pauseContactPortForDirectChat,
  resumeContactPortForDirectChat,
} from '@utils/Ports/contactport';
import {
  BooleanPermissions,
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {updatePermissions} from '@utils/Storage/permissions';

import {useTheme} from 'src/context/ThemeContext';

const AdvanceSettingsCard = ({
  permissionsId,
  permissions,
  setPermissions,
  chatId,
  heading = 'Access permissions',
}: {
  permissionsId?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
  chatId?: string;
  heading?: string;
}) => {
  const Colors = DynamicColors();

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
          height: 56,
          paddingHorizontal: PortSpacing.intermediate.uniform,
          justifyContent: 'center',
        }}>
        <NumberlessText
          textColor={Colors.labels.text}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          {heading}
        </NumberlessText>
      </View>
      <View style={{width: '100%'}}>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'contactSharing',
            permissions.contactSharing,
            themeValue,
          ])}
          toggleActiveState={permissions.contactSharing}
          heading="Share your contact"
          onToggle={toggleContactSharing}
        />
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'displayPicture',
            permissions.displayPicture,
            themeValue,
          ])}
          toggleActiveState={permissions.displayPicture}
          heading="See your display picture"
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
          heading="See your read receipts"
          onToggle={async () => await onUpdateBooleanPermission('readReceipts')}
        />
      </View>
    </SimpleCard>
  );
};

export default AdvanceSettingsCard;
