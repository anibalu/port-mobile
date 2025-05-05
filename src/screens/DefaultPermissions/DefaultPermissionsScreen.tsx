import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import {useColors} from '@components/colorGuide';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import ExpandableLocalPermissionsCard from '@components/PermissionsCards/ExpandableLocalPermissionsCard';
import {SafeAreaView} from '@components/SafeAreaView';
import {Height, Spacing} from '@components/spacingGuide';
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';

import {defaultPermissions, defaultPermissionsId} from '@configs/constants';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';

import {
  checkAndAskNotificationPermission,
  checkNotificationPermission,
} from '@utils/AppPermissions';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';

type Props = NativeStackScreenProps<
  AppStackParamList,
  'DefaultPermissionsScreen'
>;

const DefaultPermissionsScreen = ({navigation, route}: Props) => {
  const {isFromOnboarding} = route.params || {};

  const [isLoading, setIsLoading] = useState(false);

  const [permissions, setPermissions] = useState<PermissionsStrict>({
    ...defaultPermissions,
  });
  const [editedPermissions, setEditedPermissions] = useState<PermissionsStrict>(
    {
      ...defaultPermissions,
    },
  );

  const didPermissionsChange = useMemo(() => {
    if (isFromOnboarding) {
      return true;
    }
    return JSON.stringify(permissions) !== JSON.stringify(editedPermissions);
  }, [permissions, editedPermissions, isFromOnboarding]);

  const [permissionRequestFailed, setPermissionRequestFailed] = useState(false);

  const [notificationPermission, setNotificationPermission] = useState(false);

  const color = useColors();

  const onNavigateOut = () => {
    if (isFromOnboarding) {
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeTab'}],
      });
    } else {
      navigation.goBack();
    }
  };

  const onBackPress = () => {
    onNavigateOut();
  };

  //simply saves the permissions. does not check for notification permission
  const onSave = async () => {
    setIsLoading(true);
    setPermissions(editedPermissions);
    await updatePermissions(defaultPermissionsId, editedPermissions);
    setIsLoading(false);
    if(!isFromOnboarding) {
      navigation.goBack();
    }
  };

  //proceeds with the save and checks for notification permission
  const onProceed = async () => {
    setIsLoading(true);
    try {
      const notificationPermission = await checkAndAskNotificationPermission();
      setNotificationPermission(notificationPermission);
      if (!notificationPermission) {
        throw new Error('Notification permission not granted');
      }
      setPermissions(editedPermissions);
      await updatePermissions(defaultPermissionsId, editedPermissions);
      setIsLoading(false);
      onNavigateOut();
    } catch (error) {
      setPermissionRequestFailed(true);
      setIsLoading(false);
    }
  };

  //proceeds with the save and does not check for notification permission
  const onProceedAnyway = async () => {
    setIsLoading(true);
    setPermissions(editedPermissions);
    await updatePermissions(defaultPermissionsId, editedPermissions);
    setIsLoading(false);
    onNavigateOut();
  };

  const styles = styling(color);

  useEffect(() => {
    (async () => {
      const permissions = await getPermissions(defaultPermissionsId);
      setPermissions(permissions);
      setEditedPermissions(permissions);
      if (!isFromOnboarding) {
        //check notification permission if not from onboarding
        const notificationPermission = await checkNotificationPermission();
        if (!notificationPermission) {
          setNotificationPermission(false);
          setPermissionRequestFailed(true);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update UI based on permission changes
  useEffect(() => {
    if (notificationPermission) {
      setPermissionRequestFailed(false);
    }
  }, [notificationPermission]);

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
    <>
      <CustomStatusBar theme={color.theme} backgroundColor={color.background} />
      <SafeAreaView backgroundColor={color.background}>
        <GenericBackTopBar
          onBackPress={isFromOnboarding ? undefined : onBackPress}
          theme={color.theme}
          backgroundColor={color.background}
        />
        <ScrollView contentContainerStyle={styles.mainContainer}>
          <View style={{gap: Spacing.m, marginBottom: Spacing.xl}}>
            <NumberlessText
              textColor={color.text.title}
              fontWeight={FontWeight.sb}
              fontSizeType={FontSizeType.es}>
              {'Set up default permissions'}
            </NumberlessText>
            <NumberlessText
              textColor={color.text.subtitle}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.l}>
              These permissions are used as the default template for all new
              contacts and Ports.
            </NumberlessText>
          </View>
          <ExpandableLocalPermissionsCard
            heading={'New Contact can'}
            permissions={editedPermissions}
            setPermissions={setEditedPermissions}
            expandable={false}
            bottomText={
              'You can change these permissions individually for each contact and Port later.'
            }
            appNotificationPermissionNotGranted={permissionRequestFailed}
          />
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            isLoading={isLoading}
            theme={color.theme}
            text={
              isFromOnboarding
                ? permissionRequestFailed
                  ? 'Proceed anyway'
                  : 'Proceed'
                : 'Save'
            }
            disabled={!didPermissionsChange}
            onClick={
              isFromOnboarding
                ? permissionRequestFailed
                  ? onProceedAnyway
                  : onProceed
                : onSave
            }
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    topBarContainer: {
      height: Height.topbar,
      marginTop: Spacing.l,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mainContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
    },
    footer: {
      backgroundColor: Colors.surface,
      padding: Spacing.l,
      flexDirection: 'row',
    },
  });
export default DefaultPermissionsScreen;
