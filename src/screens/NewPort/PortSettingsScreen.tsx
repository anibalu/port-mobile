// import TagCard from '@components/Reusable/Cards/TagCard';
import React, { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import { useColors } from '@components/colorGuide';
import { GradientScreenView } from '@components/GradientScreenView';
import ExpandableLocalPermissionsCard from '@components/PermissionsCards/ExpandableLocalPermissionsCard';
import { Spacing, Width } from '@components/spacingGuide';
import TopBarDescription from '@components/Text/TopBarDescription';

import { defaultPermissions } from '@configs/constants';

import { NewPortStackParamList } from '@navigation/AppStack/NewPortStack/NewPortStackTypes';

import { checkNotificationPermission } from '@utils/AppPermissions';
import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';

import { ToastType, useToast } from 'src/context/ToastContext';

import PortContactNameCard from './components/PortContactNameCard';
import { usePortDispatch, usePortState } from './context/PortContext';

type Props = NativeStackScreenProps<
  NewPortStackParamList,
  'PortSettingsScreen'
>;

const PortSettingsScreen = ({ navigation }: Props) => {
  console.log('[Rendering NewPortScreenSettingsScreen]');
  const color = useColors();
  const styles = styling(color);
  const { showToast } = useToast();

  const portActions = usePortDispatch();
  const portState = usePortState();

  // sets name/label of the port
  const [portName, setPortName] = useState<string>(portState.contactName || '');

  //set permissions for the port
  const [permissions, setPermissions] = useState<PermissionsStrict>(
    portState.permissions ? { ...portState.permissions } : { ...defaultPermissions },
  );
  // sets the boolean need to view more permissions
  const [seeMoreClicked, setSeeMoreClicked] = useState<boolean>(false);

  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  // const [portNameError, setPortNameError] = useState(false);

  // handles back navigation on backpress
  const onBackPress = () => {
    navigation.goBack();
  };

  const onSavePress = async () => {
    setSaveLoading(true);
    try {
      if (portState.port) {
        if (portName.trim().length === 0 || portName.trim() === '') {
          throw new Error('Contact name cannot be empty');
        }
        if (portName !== portState.contactName) {
          await portState.port.updateContactName(portName);
          portActions({
            payload: portName,
            type: 'SET_CONTACT_NAME'
          })
        }
        // Check if permissions have changed by comparing individual properties
        if (
          JSON.stringify(permissions) !== JSON.stringify(portState.permissions)
        ) {
          await portState.port.updatePermissions({ ...permissions });
          portActions({
            payload: { ...permissions },
            type: 'SET_PERMISSIONS',
          })
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
      if (portState.port) {
        await portState.port.clean();
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

  const [notificationPermission, setNotificationPermission] = useState(true);

  // Define the permission check function with useCallback
  const checkPermissions = useCallback(async () => {
    const notificationPermission = await checkNotificationPermission();
    setNotificationPermission(notificationPermission);
    console.log('Checked permissions, status:', notificationPermission);
  }, []);

  // Run when app comes to foreground
  useEffect(() => {
    checkPermissions();
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          checkPermissions();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [checkPermissions]);

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
            <PortContactNameCard
              portName={portName}
              setPortName={setPortName}
            />
            <ExpandableLocalPermissionsCard
              permissions={permissions}
              setPermissions={setPermissions}
              setSeeMoreClicked={setSeeMoreClicked}
              seeMoreClicked={seeMoreClicked}
              bottomText={'You can always change these permissions later.'}
              appNotificationPermissionNotGranted={!notificationPermission}
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
          disabled={(portName.trim().length === 0 || portName.trim() === '')}
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

export default PortSettingsScreen;
