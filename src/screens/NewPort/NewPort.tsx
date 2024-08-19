/**
 * This screen displays a new port to connect over
 */
import {SafeAreaView} from '@components/SafeAreaView';
import React, {ReactNode, useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {PortSpacing, screen} from '@components/ComponentUtils';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  defaultFolderInfo,
  safeModalCloseDuration,
} from '@configs/constants';
import {
  generateBundle,
  getBundleClickableLink,
  getGeneratedPortData,
} from '@utils/Ports';
import {PortBundle} from '@utils/Ports/interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {PortData} from '@utils/Storage/DBCalls/ports/myPorts';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import SharePortLink from '@components/Reusable/BottomSheets/SharePortLink';
import {wait} from '@utils/Time';
import {useSelector} from 'react-redux';
import Share from 'react-native-share';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import SavePortBottomsheet from '@components/Reusable/BottomSheets/SavePortBottomsheet';
import RotatingPortCard from './RotatingPortCard';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {getDefaultPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {getPermissions} from '@utils/Storage/permissions';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {getAllFolders} from '@utils/Storage/folders';

type Props = NativeStackScreenProps<AppStackParamList, 'NewPortScreen'>;

function NewPortScreen({route, navigation}: Props): ReactNode {
  //profile information
  const profile = useSelector(state => state.profile.profile);
  const {name, avatar} = useMemo(() => {
    return {
      name: profile?.name || DEFAULT_NAME,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  //we get user name and profile picture from route params
  const {folder} = route.params;
  //display name shown on the Port card
  const displayName: string = name || DEFAULT_NAME;
  //display picture shown on the Port card
  const profilePicAttr: FileAttributes = avatar || DEFAULT_PROFILE_AVATAR_INFO;
  //the folder the formed connection should go to.
  const [taggedFolder, setTaggedFolder] = useState(folder || defaultFolderInfo);
  //the folder the formed connection should go to.
  const [folders, setFolders] = useState<FolderInfo[]>([]);

  //state of qr code generation
  const [isLoading, setIsLoading] = useState(true);
  //whether qr code generation has failed
  const [hasFailed, setHasFailed] = useState(false);
  //qr code data to display
  const [qrData, setQrData] = useState<PortBundle | null>(null);
  //link to share
  const [linkData, setLinkData] = useState<string | null>(null);
  //whether is link is being generated
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  //whether is share bottom sheet should open
  const [openShareModal, setOpenShareModal] = useState(false);
  //whether is error bottom sheet should open
  const [openErrorModal, setOpenErrorModal] = useState(false);
  //whether we should ask the user if the port needs to be kept.
  const [openShouldKeepPortModal, setOpenShouldKeepPortModal] = useState(false);

  const [shareContactName, setShareContactName] = useState('');
  const [permissions, setPermissions] = useState<PermissionsStrict>(
    getDefaultPermissions(ChatType.direct),
  );
  const [permissionId, setPermissionId] = useState<string | null | undefined>(
    null,
  );

  //checks latest new connection
  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const fetchFolders = async () => {
    try {
      setFolders(await getAllFolders());
    } catch (error) {
      console.log('Failed to fetch folders');
    }
  };

  //fetches a port and its associated permissions
  const fetchPort = async () => {
    try {
      setIsLoading(true);
      setHasFailed(false);
      const bundle: PortBundle = await generateBundle(
        BundleTarget.direct,
        undefined,
        undefined,
        undefined,
        undefined,
        taggedFolder.folderId,
      );
      const generatedPort = await getGeneratedPortData(bundle.portId);
      const assignedPermissions = await getPermissions(
        generatedPort.permissionsId,
      );
      if (bundle) {
        setPermissionId(generatedPort.permissionsId);
        setPermissions(assignedPermissions);
        setQrData(bundle);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Failed to fetch port: ', error);
      setHasFailed(true);
      setIsLoading(false);
      setQrData(null);
    }
  };

  //converts qr bundle into link.
  const fetchLinkData = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openErrorModal) {
      setOpenErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsLoadingLink(true);
      if (qrData && qrData.portId) {
        const generatedPort: PortData = await getGeneratedPortData(
          qrData.portId,
        );
        const link = await getBundleClickableLink(
          BundleTarget.direct,
          qrData.portId,
          JSON.stringify(qrData),
        );
        setLinkData(link);
        setIsLoadingLink(false);
        if (
          generatedPort.label &&
          generatedPort.label !== '' &&
          generatedPort.label !== DEFAULT_NAME
        ) {
          try {
            const shareContent = {
              title: `Share a one-time use link with ${generatedPort.label}`,
              message:
                `Click the link to connect with ${displayName} on Port.\n` +
                linkData,
            };
            await Share.open(shareContent);
          } catch (error) {
            console.log('Link not shared', error);
          }
        } else {
          setOpenShareModal(true);
        }
        return;
      }
      throw new Error('No qr data');
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsLoadingLink(false);
      setLinkData(null);
      setOpenErrorModal(true);
    }
  };

  useEffect(() => {
    fetchPort();
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //navigates to home screen if latest new connection Id matches port Id
  useEffect(() => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (qrData && !linkData) {
          if (qrData.portId === latestUsedConnectionLinkId) {
            //todo - test that this leads to the correct folder tab
            navigation.navigate('HomeTab', {
              selectedFolder: {...taggedFolder},
            });
            return;
          }
        }
      }
    } catch (error) {
      console.log('error autoclosing modal: ', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  const closeAction = async () => {
    if (linkData && qrData) {
      const generatedPort: PortData = await getGeneratedPortData(qrData.portId);
      if (
        generatedPort.label &&
        generatedPort.label !== '' &&
        generatedPort.label !== DEFAULT_NAME
      ) {
        navigation.goBack();
        return true;
      }
    }
    if (qrData) {
      //ask user if they want to save the port.
      setOpenShouldKeepPortModal(true);
      return true;
    }
    navigation.goBack();
    return true;
  };

  const Colors = DynamicColors();
  const svgArray = [
    // 1.CrossButton
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
    {
      assetName: 'ScanIcon',
      light: require('@assets/icons/scanBlue.svg').default,
      dark: require('@assets/dark/icons/scanBlue.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;
  // const ScanIcon = results.ScanIcon;

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={styles.screen}>
        <TopBarWithRightIcon
          onIconRightPress={closeAction}
          IconRight={CrossButton}
          heading={'New Port'}
        />
        <ScrollView
          style={{
            width: '100%',
            backgroundColor: Colors.primary.background,
          }}>
          <View style={styles.qrArea}>
            <RotatingPortCard
              isLoading={isLoading}
              isLinkLoading={isLoadingLink}
              hasFailed={hasFailed}
              title={displayName}
              profileUri={
                permissions.displayPicture ? profilePicAttr.fileUri : null
              }
              qrData={qrData}
              onShareLinkClicked={fetchLinkData}
              onTryAgainClicked={fetchPort}
              chosenFolder={taggedFolder}
              permissionsArray={permissions}
              setPermissionsArray={setPermissions}
              folder={taggedFolder}
              setFolder={setTaggedFolder}
              permissionsId={permissionId}
              portId={qrData?.portId}
              foldersArray={folders}
            />
          </View>
        </ScrollView>
        <ErrorBottomSheet
          visible={openErrorModal}
          title={'Link could not be created'}
          description={
            "Please ensure you're connected to the internet to create a one-time use link."
          }
          onClose={() => setOpenErrorModal(false)}
          onTryAgain={fetchLinkData}
        />
        <SharePortLink
          visible={openShareModal}
          onClose={() => setOpenShareModal(false)}
          title={'Share one-time use link'}
          description={
            'Enter the name of the contact to whom you are sending the Port.'
          }
          contactName={shareContactName}
          setContactName={setShareContactName}
          userName={displayName}
          linkData={linkData}
          qrData={qrData}
        />
        <SavePortBottomsheet
          visible={openShouldKeepPortModal}
          onClose={() => setOpenShouldKeepPortModal(false)}
          contactName={shareContactName}
          setContactName={setShareContactName}
          qrData={qrData}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
  },
  qrArea: {
    justifyContent: 'space-between',
    paddingHorizontal: PortSpacing.secondary.uniform,
    gap: PortSpacing.secondary.uniform,
    paddingTop: PortSpacing.secondary.uniform,
    height: screen.height,
  },
  subtitle: {
    alignSelf: 'center',
    marginTop: PortSpacing.tertiary.top,
    marginBottom: PortSpacing.intermediate.bottom,
    textAlign: 'center',
  },
});

export default NewPortScreen;
