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
import QuestionMark from '@assets/icons/QuestionMarkAccent.svg';
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
import PortInfoBottomsheet from '@screens/Home/PortInfoBottomsheet';
import {ToastType, useToast} from 'src/context/ToastContext';
import Clipboard from '@react-native-clipboard/clipboard';
import ShareLinkRouteBottomsheet from '@components/Reusable/BottomSheets/ShareLinkRouteBottomsheet';

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
  //weather link to copy is being fetched
  const [isCopyLinkLoading, setIsCopyLinkLoading] = useState(false);
  //whether we should ask the user if the port needs to be kept.
  const [openShouldKeepPortModal, setOpenShouldKeepPortModal] = useState(false);
  //to show port info bottomsheet
  const [showPortInfo, setShowPortInfo] = useState<boolean>(false);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);
  const [isLinkShared, setIsLinkShared] = useState<boolean>(false);
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

  const onSharelinkClicked = () => {
    setOpenShareModal(true);
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

  const {showToast} = useToast();

  //converts qr bundle into link and copies
  const onFetchAndCopyLink = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openErrorModal) {
      setOpenErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsCopyLinkLoading(true);
      if (qrData && qrData.portId) {
        const link = await getBundleClickableLink(
          BundleTarget.direct,
          qrData.portId,
          JSON.stringify(qrData),
        );
        setIsCopyLinkLoading(false);
        Clipboard.setString(link);
      }
      setIsCopyLinkLoading(false);
      setIsLinkCopied(true);
      showToast('Link copied to clipboard!', ToastType.success);
    } catch (error) {
      console.log('Link not shared', error);
      showToast(
        'Could not copy link. Please check you internet and try again.',
        ToastType.error,
      );
      setIsCopyLinkLoading(false);
    }
    return;
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
        setIsLinkShared(true);
        if (generatedPort.label && generatedPort.label !== '' && link) {
          try {
            const shareContent = {
              title: `Share a one-time use link with ${generatedPort.label}`,
              message:
                `Click the link to connect with ${displayName} on Port.\n` +
                link,
            };
            await Share.open(shareContent);
            setOpenShareModal(false);
          } catch (error) {
            setOpenShareModal(false);
            console.log('Link not shared', error);
          }
        }
        return;
      }
      throw new Error('No qr data');
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsLoadingLink(false);
      setLinkData(null);
      setOpenShareModal(false);
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
    if (isLinkCopied || isLinkShared) {
      navigation.goBack();
    } else if (linkData && qrData) {
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
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;

  const onClosePortInfoBottomsheet = async () => {
    setShowPortInfo(false);
    await wait(safeModalCloseDuration);
  };

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={styles.screen}>
        <TopBarWithRightIcon
          onHeadingPress={() => setShowPortInfo(true)}
          onIconRightPress={closeAction}
          IconRight={CrossButton}
          heading="New Port"
          HeadingIcon={QuestionMark}
        />
        <ScrollView
          style={{
            width: '100%',
            backgroundColor: Colors.primary.background,
          }}>
          <View style={styles.qrArea}>
            <RotatingPortCard
              onCopyLink={onFetchAndCopyLink}
              isCopyLinkLoading={isCopyLinkLoading}
              isLoading={isLoading}
              hasFailed={hasFailed}
              title={displayName}
              isLoadingLink={isLoadingLink}
              profileUri={
                permissions.displayPicture ? profilePicAttr.fileUri : null
              }
              qrData={qrData}
              onShareLinkClicked={onSharelinkClicked}
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
        <ShareLinkRouteBottomsheet
          isLoadingLink={isLoadingLink}
          onShareLinkClicked={fetchLinkData}
          visible={openShareModal}
          onClose={() => setOpenShareModal(false)}
        />
        <SavePortBottomsheet
          visible={openShouldKeepPortModal}
          onClose={() => setOpenShouldKeepPortModal(false)}
          qrData={qrData}
        />
        <PortInfoBottomsheet
          buttonText="Okay, got it!"
          onClick={onClosePortInfoBottomsheet}
          visible={showPortInfo}
          onClose={() => setShowPortInfo(false)}
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
