import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import React from 'react';
import {View} from 'react-native';
import {updatePermissions} from '@utils/Storage/permissions';
import {
  BooleanPermissions,
  GroupPermissions,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import DynamicColors from '@components/DynamicColors';
import getPermissionIcon from '@components/getPermissionIcon';
import {useTheme} from 'src/context/ThemeContext';

const AdvanceSettingsCardGroup = ({
  permissionsId,
  permissions,
  setPermissions,
  chatId,
  heading = 'Access permissions',
}: {
  permissionsId?: string;
  permissions: GroupPermissions;
  setPermissions: (permissions: GroupPermissions) => void;
  chatId?: string;
  heading?: string;
}) => {
  const Colors = DynamicColors();

  const onUpdateBooleanPermission = async (
    permissionKey: keyof BooleanPermissions,
  ) => {
    console.log(chatId);
    const updatedPermissions: GroupPermissions = {
      ...permissions,
      [permissionKey]: !permissions[permissionKey],
    };
    if (permissionsId) {
      await updatePermissions(permissionsId, updatedPermissions);
    }
    setPermissions(updatedPermissions);
  };

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
      </View>
    </SimpleCard>
  );
};

export default AdvanceSettingsCardGroup;
