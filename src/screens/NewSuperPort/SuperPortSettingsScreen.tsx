// import TagCard from '@components/Reusable/Cards/TagCard';
import PrimaryButton from '@components/Buttons/PrimaryButton';
import {defaultPermissions} from '@configs/constants';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Spacing, Width} from '@components/spacingGuide';
import TopBarDescription from '@components/Text/TopBarDescription';
import {useColors} from '@components/colorGuide';
import {GradientScreenView} from '@components/GradientScreenView';
import ExpandableLocalPermissionsCard from '@components/PermissionsCards/ExpandableLocalPermissionsCard';
import {NewSuperPortStackParamList} from '@navigation/AppStack/NewSuperPortStack/NewSuperPortStackTypes';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import {
  useSuperPortData,
  useSuperPortActions,
} from './context/SuperPortContext';
import PortLabelAndLimitCard from './components/PortLabelAndLimitCard';
import {ToastType, useToast} from 'src/context/ToastContext';

type Props = NativeStackScreenProps<
  NewSuperPortStackParamList,
  'SuperPortSettingsScreen'
>;

const SuperPortSettingsScreen = ({navigation}: Props) => {
  console.log('[Rendering NewPortScreenSettingsScreen]');
  const color = useColors();
  const styles = styling(color);
  const {showToast} = useToast();

  const superPortActions = useSuperPortActions();
  const {
    label: contextLabel,
    permissions: contextPermissions,
    port,
    limit: contextLimit,
  } = useSuperPortData(state => state);

  // sets name/label of the port
  const [portName, setPortName] = useState<string>(contextLabel || '');
  const [limit, setLimit] = useState<number>(contextLimit || 0);

  //set permissions for the port
  const [permissions, setPermissions] = useState<PermissionsStrict>(
    contextPermissions ? {...contextPermissions} : {...defaultPermissions},
  );
  // sets the boolean need to view more permissions
  const [seeMoreClicked, setSeeMoreClicked] = useState<boolean>(false);

  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // handles back navigation on backpress
  const onBackPress = () => {
    navigation.goBack();
  };

  const onSavePress = async () => {
    setSaveLoading(true);
    try {
      if (port) {
        if (portName !== contextLabel) {
          await port.updateSuperPortName(portName);
          superPortActions.setLabel(portName);
        }
        if (limit !== contextLimit) {
          await port.updateSuperPortLimit(limit);
          superPortActions.setLimit(limit);
        }
        // Check if permissions have changed by comparing individual properties
        if (
          JSON.stringify(permissions) !== JSON.stringify(contextPermissions)
        ) {
          await port.updateSuperPortPermissions({...permissions});
          superPortActions.setPermissions({...permissions});
        }
        navigation.goBack();
      } else {
        throw new Error('Port not found');
      }
    } catch (error: any) {
      console.log('Error saving port', error);
      showToast(
        'Error saving port: ' + error?.message || 'Unknown error',
        ToastType.error,
      );
    }
    setSaveLoading(false);
  };

  const onDeletePress = async () => {
    setDeleteLoading(true);
    try {
      if (port) {
        await port.clean();
        // Reset the navigation state to go back to a common parent and then navigate to the desired screen
        (navigation as any).reset({
          index: 0,
          routes: [
            {
              name: 'HomeTab', // The common parent/root screen
            },
          ],
        });
      } else {
        throw new Error('Port not found');
      }
    } catch (error: any) {
      console.log('Error deleting port', error);
      showToast(
        'Error deleting port: ' + error?.message || 'Unknown error',
        ToastType.error,
      );
    }
    setDeleteLoading(false);
  };

  return (
    <GradientScreenView
      color={color}
      title="Edit Port Settings"
      onBackPress={onBackPress}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={color.black}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContainer}>
          <TopBarDescription
            theme={color.theme}
            description="A Port is a highly customizable QR code or link used to invite new contacts. All chats formed over Ports are end-to-end encrypted."
          />
          <View style={styles.scrollableElementsParent}>
            <PortLabelAndLimitCard
              portName={portName}
              setPortName={setPortName}
              limit={limit}
              setLimit={setLimit}
              connectionsMade={port?.getPort().connectionsMade || 0}
            />
            <ExpandableLocalPermissionsCard
              permissions={permissions}
              setPermissions={setPermissions}
              setSeeMoreClicked={setSeeMoreClicked}
              seeMoreClicked={seeMoreClicked}
              bottomText={'You can always change these permissions later.'}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <SecondaryButton
          text={'Delete'}
          color={color.red}
          theme={color.theme}
          isLoading={deleteLoading}
          disabled={false}
          onClick={onDeletePress}
          buttonStyle={{
            width: Width.screen / 2 - (Spacing.s * 2 + Spacing.xs),
          }}
        />
        <PrimaryButton
          theme={color.theme}
          text={'Save'}
          isLoading={saveLoading}
          disabled={false}
          onClick={onSavePress}
          buttonStyle={{
            width: Width.screen / 2 - (Spacing.s * 2 + Spacing.xs),
          }}
        />
      </View>
    </GradientScreenView>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    scrollContainer: {
      backgroundColor: color.background,
    },
    scrollableElementsParent: {
      marginTop: -Spacing.xxl,
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
      gap: Spacing.l,
    },
    footer: {
      backgroundColor: color.surface,
      padding: Spacing.l,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });

export default SuperPortSettingsScreen;
