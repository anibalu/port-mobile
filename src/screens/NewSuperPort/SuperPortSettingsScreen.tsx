// import TagCard from '@components/Reusable/Cards/TagCard';
import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import {useColors} from '@components/colorGuide';
import {GradientScreenView} from '@components/GradientScreenView';
import ExpandableLocalPermissionsCard from '@components/PermissionsCards/ExpandableLocalPermissionsCard';
import {Spacing, Width} from '@components/spacingGuide';
import TopBarDescription from '@components/Text/TopBarDescription';

import {defaultPermissions} from '@configs/constants';

import {NewSuperPortStackParamList} from '@navigation/AppStack/NewSuperPortStack/NewSuperPortStackTypes';

import {checkNotificationPermission} from '@utils/AppPermissions';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';

import {ToastType, useToast} from 'src/context/ToastContext';

import PortLabelAndLimitCard from './components/PortLabelAndLimitCard';
import { useSuperPortDispatch, useSuperPortState } from './context/SuperPortContext';


type Props = NativeStackScreenProps<
  NewSuperPortStackParamList,
  'SuperPortSettingsScreen'
>;

const SuperPortSettingsScreen = ({navigation}: Props) => {
  console.log('[Rendering NewPortScreenSettingsScreen]');
  const color = useColors();
  const styles = styling(color);
  const {showToast} = useToast();
  // Set up superport context
  const superPortActions = useSuperPortDispatch();
  const superPortState = useSuperPortState();

  // sets name/label of the port
  const [portName, setPortName] = useState<string>(superPortState.label || '');
  const [limit, setLimit] = useState<number>(superPortState.limit || 0);

  //set permissions for the port
  const [permissions, setPermissions] = useState<PermissionsStrict>(
    superPortState.permissions ? {...superPortState.permissions} : {...defaultPermissions},
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
      if (superPortState.port) {
        if (portName !== superPortState.label) {
          await superPortState.port.updateSuperPortName(portName);
          superPortActions({
            payload: portName,
            type: 'SET_LABEL',
          })      
        }
        if (limit !== superPortState.limit) {
          await superPortState.port.updateSuperPortLimit(limit);
          superPortActions({
            payload: limit,
            type: 'SET_LIMIT',
          })          
        }
        // Check if permissions have changed by comparing individual properties
        if (
          JSON.stringify(permissions) !== JSON.stringify(superPortState.permissions)
        ) {
          await superPortState.port.updateSuperPortPermissions({...permissions});
          superPortActions({
            payload: {...permissions},
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
      if (superPortState.port) {
        await superPortState.port.clean();
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
            <PortLabelAndLimitCard
              portName={portName}
              setPortName={setPortName}
              limit={limit}
              setLimit={setLimit}
              connectionsMade={superPortState.connectionsMade || 0}
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
