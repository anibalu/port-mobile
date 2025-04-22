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
import PortLabelAndLimitCard from '@components/Reusable/PortLabelAndLimit/PortLabelAndLimitCard';
import {Spacing} from '@components/spacingGuide';
import TopBarDescription from '@components/Text/TopBarDescription';

import {defaultFolderId, defaultPermissions} from '@configs/constants';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';

import {checkNotificationPermission} from '@utils/AppPermissions';
import { jsonToUrl } from '@utils/JsonToUrl';
import { Port } from '@utils/Ports/SingleUsePorts/Port';
import { SuperPort } from '@utils/Ports/SuperPorts/SuperPort';
import { getProfileName } from '@utils/Profile';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';

import { ToastType, useToast } from 'src/context/ToastContext';


type Props = NativeStackScreenProps<AppStackParamList, 'NewPortScreen'>;

const NewPortScreen = ({navigation}: Props) => {
  console.log('[Rendering NewPortScreen]');
  const color = useColors();
  const {showToast} = useToast();
  // sets port resuable status
  const [portReusable, setPortReusable] = useState<boolean>(false);
  // sets name/label of the port
  const [portName, setPortName] = useState<string>('');
  // sets limit of a resuable port
  const [limit, setLimit] = useState<number>(0);

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
          isLoading={loading}
          onClick={async () => {
            setLoading(true);
            if (portReusable && limit > 0) {
              try {
                const superPortClass = await SuperPort.generator.create(portName, limit, defaultFolderId, permissions);
                const name = await getProfileName();
                const bundle = await superPortClass.getShareableBundle(name);
                const link = jsonToUrl(bundle as any);
                (navigation as any).replace('NewSuperPortStack', {
                  screen: 'SuperPortQRScreen',
                  params: {
                    superPortClass: superPortClass,
                    bundle: bundle,
                    link: link || '',
                  },
                });
              } catch (error) {
                console.error('Error fetching port data:', error);
                showToast('Error creating re-usable port. Check network connection and try again', ToastType.error);
                return;
              }
            }
            else if (!portReusable) {
              try {
                const portClass = await Port.generator.create(portName, defaultFolderId, permissions);
                const name = await getProfileName();
                const bundle = await portClass.getShareableBundle(name);
                const link = jsonToUrl(bundle as any);
                (navigation as any).replace('NewPortStack', {
                  screen: 'PortQRScreen',
                  params: {
                    portClass: portClass,
                    bundle: bundle,
                    link: link || '',
                  },
                });
              } catch (error) {
                console.error('Error fetching port data:', error);
                showToast('Error creating port. Check network connection and try again', ToastType.error);
                return;
              }
            }
            setLoading(false);
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
