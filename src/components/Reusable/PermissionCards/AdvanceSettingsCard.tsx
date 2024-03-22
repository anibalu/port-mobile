import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import ContactShareIcon from '@assets/icons/ContactShareIcon.svg';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
import {
  BooleanPermissions,
  PermissionsStrict,
} from '@utils/ChatPermissions/interfaces';

const AdvanceSettingsCard = ({
  permissionsId,
  permissions,
  setPermissions,
}: {
  permissionsId?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
}) => {
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
  return (
    <SimpleCard>
      <NumberlessText
        style={{
          padding: PortSpacing.secondary.uniform,
        }}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        Advanced settings
      </NumberlessText>
      <View style={{paddingBottom: PortSpacing.tertiary.bottom}}>
        <OptionWithToggle
          IconLeft={ContactShareIcon}
          toggleActiveState={permissions.contactSharing}
          heading="Contact sharing"
          description="Allow a contact to connect you with others"
          onToggle={() => onUpdateBooleanPermission('contactSharing')}
        />
      </View>
    </SimpleCard>
  );
};

export default AdvanceSettingsCard;
