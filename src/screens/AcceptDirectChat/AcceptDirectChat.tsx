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
import {useColors} from '@components/colorGuide';
import {GradientScreenView} from '@components/GradientScreenView';
import ExpandableLocalPermissionsCard from '@components/PermissionsCards/ExpandableLocalPermissionsCard';
import PortLabelCard from '@components/Reusable/PortLabel/PortLabelAndLimitCard';
import {Spacing} from '@components/spacingGuide';
import TopBarDescription from '@components/Text/TopBarDescription';

import {defaultFolderId, defaultPermissions, defaultPermissionsId} from '@configs/constants';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';

import {checkNotificationPermission} from '@utils/AppPermissions';
import { acceptBundle, processReadBundles } from '@utils/Ports';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import { getPermissions } from '@utils/Storage/permissions';


type Props = NativeStackScreenProps<AppStackParamList, 'AcceptDirectChat'>;

const AcceptedDirectChat = ({navigation, route}: Props) => {
  console.log('[Rendering AcceptedDirectChat screen]');
  const {bundle} = route.params;
  const color = useColors();
  // sets name of the contact
  const [portName, setPortName] = useState<string>(bundle.name || '');

  // when port is being created
  const [loading, setLoading] = useState<boolean>(false);

  //set permissions for the port
  const [permissions, setPermissions] = useState<PermissionsStrict>({
    ...defaultPermissions,
  });
  // sets the boolean need to view more permissions
  const [seeMoreClicked, setSeeMoreClicked] = useState<boolean>(false);

  // handles back navigation on backpress
  const onBackPress = () => {
    navigation.goBack();
  };

  const [notificationPermission, setNotificationPermission] = useState(true);

  // Define the permission check function with useCallback
  const checkPermissions = useCallback(async () => {
    const permissions = await getPermissions(defaultPermissionsId);
    setPermissions(permissions);
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

  const styles = styling(color);

  return (
    <GradientScreenView
      color={color}
      title="Add a new contact"
      onBackPress={onBackPress}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={color.black}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContainer}>
          <TopBarDescription
            theme={color.theme}
            description="Once you add this contact, an end-to-end encrypted chat is formed with them."
          />
          <View style={styles.scrollableElementsParent}>
            <PortLabelCard
              portName={portName}
              setPortName={setPortName}
            />
            <ExpandableLocalPermissionsCard
              heading={'New Contact can'}
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
        <PrimaryButton
          theme={color.theme}
          text="Save contact"
          disabled={portName.length === 0}
          isLoading={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await acceptBundle(bundle, permissions, defaultFolderId);
              //try to use read bundles
              await processReadBundles();
            } catch (error) {
              console.error('Error adding contact:', error);
            }
            setLoading(false);
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeTab'}],
            });
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
    },
  });

export default AcceptedDirectChat;
