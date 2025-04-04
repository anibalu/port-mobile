import PortLabelAndLimitCard from '@components/Reusable/PortLabelAndLimit/PortLabelAndLimitCard';
// import TagCard from '@components/Reusable/Cards/TagCard';
import PrimaryButton from '@components/Buttons/PrimaryButton';
import {defaultFolderInfo, defaultPermissions} from '@configs/constants';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';
import {Spacing} from '@components/spacingGuide';
import TopBarDescription from '@components/Text/TopBarDescription';
import {useColors} from '@components/colorGuide';
import {GradientScreenView} from '@components/GradientScreenView';
import ExpandableLocalPermissionsCard from '@components/PermissionsCards/ExpandableLocalPermissionsCard';
import {checkNotificationPermission} from '@utils/AppPermissions';

type Props = NativeStackScreenProps<AppStackParamList, 'NewPortScreen'>;

const NewPortScreen = ({navigation}: Props) => {
  console.log('[Rendering NewPortScreen]');
  const color = useColors();
  // sets port resuable status
  const [portReusable, setPortReusable] = useState<boolean>(false);
  // sets name/label of the port
  const [portName, setPortName] = useState<string>('');
  // sets limit of a resuable port
  const [limit, setLimit] = useState<number>(0);

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
      title="Create a new Port"
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
              setPortName={setPortName}
              portName={portName}
              setPortReusable={setPortReusable}
              portReusable={portReusable}
              setLimit={setLimit}
              limit={limit}
            />
            <ExpandableLocalPermissionsCard
              heading={portReusable ? 'New Contacts can' : 'New Contact can'}
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
          text="Create Port"
          disabled={
            portReusable
              ? portName.length === 0 || limit <= 0
              : portName.length === 0
          }
          isLoading={false}
          onClick={() => {
            if (portReusable && limit > 0) {
              navigation.navigate('NewSuperPortStack', {
                screen: 'SuperPortQRScreen',
                params: {
                  folderId: defaultFolderInfo.folderId,
                  label: portName,
                  limit: limit,
                  permissions: {...permissions},
                },
              });
            } else if (!portReusable) {
              navigation.navigate('NewPortStack', {
                screen: 'PortQRScreen',
                params: {
                  contactName: portName,
                  permissions: {...permissions},
                  folderId: defaultFolderInfo.folderId,
                },
              });
            }
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

export default NewPortScreen;
