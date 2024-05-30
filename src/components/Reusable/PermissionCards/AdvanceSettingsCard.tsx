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
} from '@utils/ChatPermissions/interfaces';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const AdvanceSettingsCard = ({
  permissionsId,
  permissions,
  setPermissions,
}: {
  permissionsId?: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
}) => {
  const Colors = DynamicColors();

  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'ContactShareIcon',
      light: require('@assets/light/icons/ContactShareIcon.svg').default,
      dark: require('@assets/dark/icons/ContactShareIcon.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const ContactShareIcon = results.ContactShareIcon;

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
        textColor={Colors.labels.text}
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
