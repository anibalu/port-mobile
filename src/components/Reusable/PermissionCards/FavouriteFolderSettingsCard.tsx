import React from 'react';
import SimpleCard from '../Cards/SimpleCard';
import {StyleSheet, View} from 'react-native';
import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import OptionWithToggle from '../OptionButtons/OptionWithToggle';
import getPermissionIcon from '@components/getPermissionIcon';
import {
  DirectPermissions,
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {useTheme} from 'src/context/ThemeContext';
import {updatePermissions} from '@utils/Storage/permissions';

const FavouriteFolderSettingsCard = ({
  heading,
  permissions,
  setOpenFolderBottomsheet,
  permissionsId,
  setPermissions,
}: {
  heading: string;
  permissions: PermissionsStrict;
  setOpenFolderBottomsheet: (p: boolean) => void;
  permissionsId?: string;
  setPermissions: (p: PermissionsStrict) => void;
}) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();

  const onUpdateBooleanPermission = async () => {
    const permissionKey = 'favourite';
    const updatedPermissions: DirectPermissions = {
      ...permissions,
      [permissionKey]: !permissions[permissionKey],
    };
    if (permissionsId) {
      await updatePermissions(permissionsId, updatedPermissions);
    }
    setPermissions(updatedPermissions);
  };
  return (
    <SimpleCard style={styles.card}>
      <View style={styles.item}>
        <NumberlessText
          textColor={Colors.labels.text}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          {heading}
        </NumberlessText>
        <NumberlessText
          onPress={() => setOpenFolderBottomsheet(p => !p)}
          style={{textDecorationLine: 'underline'}}
          textColor={Colors.text.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          What's this?
        </NumberlessText>
      </View>
      <View style={{width: '100%'}}>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'favourite',
            permissions.favourite,
            themeValue,
          ])}
          toggleActiveState={permissions.favourite}
          heading="Show in Home"
          onToggle={onUpdateBooleanPermission}
        />
      </View>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  item: {
    width: '100%',
    height: 36,
    paddingHorizontal: PortSpacing.intermediate.uniform,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
});

export default FavouriteFolderSettingsCard;
