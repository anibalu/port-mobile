import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import getPermissionIcon from '@components/getPermissionIcon';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {
  DirectPermissions,
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {updatePermissions} from '@utils/Storage/permissions';

import AccentArrow from '@assets/icons/AccentArrow.svg';

import {useTheme} from 'src/context/ThemeContext';

import SimpleCard from '../Cards/SimpleCard';
import OptionWithToggle from '../OptionButtons/OptionWithToggle';

const FavouriteFolderSettingsCard = ({
  permissions,
  setOpenFolderBottomsheet,
  permissionsId,
  setPermissions,
}: {
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
      <View style={{width: '100%'}}>
        <OptionWithToggle
          IconLeftView={getPermissionIcon([
            'favourite',
            permissions.favourite,
            themeValue,
          ])}
          boldTitle={true}
          toggleActiveState={permissions.favourite}
          heading="Mark as important"
          onToggle={onUpdateBooleanPermission}
        />
      </View>
      <NumberlessText
        style={{
          color: Colors.text.subtitle,
          paddingHorizontal: PortSpacing.intermediate.uniform,
        }}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        Get a summary of unread messages from this folder in your home screen.
      </NumberlessText>
      <View style={styles.item}>
        <NumberlessText
          style={{paddingBottom: 2}}
          onPress={() => setOpenFolderBottomsheet(p => !p)}
          textColor={'#7A98FF'}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          See how
        </NumberlessText>
        <AccentArrow />
      </View>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  item: {
    width: '100%',
    marginBottom: PortSpacing.secondary.uniform,
    paddingHorizontal: PortSpacing.intermediate.uniform,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    paddingVertical: 0,
  },
});

export default FavouriteFolderSettingsCard;
