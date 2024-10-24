import React, {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  defaultPermissions,
  safeModalCloseDuration,
} from '@configs/constants';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {wait} from '@utils/Time';
import DynamicColors from '@components/DynamicColors';
import {AppStackParamList} from '@navigation/AppStackTypes';
import Share from 'react-native-share';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {DirectSuperportBundle} from '@utils/Ports/interfaces';
import {
  changePausedStateOfSuperport,
  cleanDeleteSuperport,
  fetchCreatedSuperportBundle,
  updateGeneratedSuperportLimit,
} from '@utils/Ports/superport';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import PortCard from '@components/Reusable/ConnectionCards/PortCard';
import SuperportUsageLimit from './SuperportComponents/SuperportUsageLimit';
import SuperportLabelCard from './SuperportComponents/SuperportLabelCard';
import {getFolderPermissions} from '@utils/Storage/permissions';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {useSelector} from 'react-redux';
import {
  getBundleClickableLink,
  updateGeneratedSuperportLabel,
} from '@utils/Ports';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {ToastType, useToast} from 'src/context/ToastContext';
import {SuperportData} from '@utils/Storage/DBCalls/ports/superPorts';
import SuperportLinkedFolderCard from './SuperportComponents/SuperportLinkedFolderCard';
import Clipboard from '@react-native-clipboard/clipboard';
import EditName from '@components/Reusable/BottomSheets/EditName';
import LinkToFolderBottomSheet from '@components/Reusable/BottomSheets/LinkToFolderBottomSheet';
import {getAllFolders} from '@utils/Storage/folders';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';

type Props = NativeStackScreenProps<AppStackParamList, 'SuperportQRScreen'>;

const SuperportQRScreen = ({route, navigation}: Props) => {
  const {superportId, selectedFolder} = route.params;
  const scrollViewRef = useRef<ScrollView>(null);
  const profile = useSelector((state: any) => state.profile.profile);
  const latestNewConnection = useSelector(
    (state: any) => state.latestNewConnection,
  );

  const {displayName, profilePicAttr} = useMemo(() => {
    return {
      displayName: profile?.name || DEFAULT_NAME,
      profilePicAttr: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);

  const {showToast} = useToast();
  const Colors = DynamicColors();

  //superport bundle portId, default is 'superportId' received in route params
  const [portId, setPortId] = useState<string | null>(superportId || null);

  //weather superport fetch has failed
  const [superportFetchFailed, setSuperportFetchFailed] =
    useState<boolean>(false);

  //stores fetched superport data
  const [superportData, setSuperportData] = useState<{
    bundle: DirectSuperportBundle;
    superport: SuperportData;
  } | null>(null);

  //loading state when fetching superport
  const [fetchingSuperport, setFetchingSuperport] = useState<boolean>(false);

  //fetched folder permissions of superport
  const [folderPermissions, setFolderPermissions] = useState<PermissionsStrict>(
    {...defaultPermissions},
  );

  //visible state for preview generation failed error modal
  const [openPreviewImageErrorModal, setOpenPreviewImageErrorModal] =
    useState<boolean>(false);

  //whether sharable QR image is being generated
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  //whether sharable link is being generated
  const [isLinkLoading, setIsLinkLoading] = useState<boolean>(false);

  //whether copiable link is being generated
  const [isCopyLinkLoading, setIsCopyLinkLoading] = useState<boolean>(false);

  //for editing both superport label, name and usage limit
  const [openLabelModal, setOpenLabelModal] = useState<boolean>(false);

  const [openLinkCopyErrorModal, setLinkCopyErrorModal] = useState(false);

  //clicked step label out of three, name || limit || folder
  const [clickedLabel, setClickedLabel] = useState<'name' | 'limit' | string>(
    '',
  );

  //modal for linking a folder
  const [openLinkToFolderModal, setOpenLinkToFolderModal] =
    useState<boolean>(false);

  //Array of all folder
  const [allFolders, setAllFolders] = useState<FolderInfo[]>([]);

  //user chosen linked folder, default is the selected folder
  const [linkedFolder, setLinkedFolder] = useState<FolderInfo | undefined>(
    selectedFolder,
  );

  //loading state for saving edited superport name in bottomsheet
  const [savingNewSuperportName, setSavingNewSuperportName] =
    useState<boolean>(false);

  //for superport name
  const [superportName, setSuperportName] = useState<string>('');

  //for superport connections limit
  const [connectionsLimit, setConnectionsLimit] = useState<number | null>(null);

  //for superport connections made limit
  const [connectionsMade, setConnectionsMade] = useState<number | null>(null);

  //user create folder permissions from linked folder bottomsheet
  const [createdFolderPermissions, setCreatedFolderPermissions] =
    useState<PermissionsStrict>({...defaultPermissions});

  //user create folder from linked folder bottomsheet
  const [createdFolderName, setCreatedFolderName] = useState<string>('');

  //see if superport is paused
  const [isSuperportPaused, setIsSuperportPaused] = useState<boolean>(false);

  //visible state for confirmation bottomsheet for pausing superport
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState<boolean>(false);

  //visible state for confirmation bottomsheet for deleting superport
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState<boolean>(false);

  //weather pausing superport thew error
  const [pauseSuperportError, setPauseSuperportError] =
    useState<boolean>(false);

  //loading state for pausing superport
  const [pauseSuperportLoading, setPauseSuperportLoading] =
    useState<boolean>(false);

  //weather deleting superport thew error
  const [deleteSuperportError, setDeleteSuperportError] =
    useState<boolean>(false);

  //loading state for deleting superport
  const [deleteSuperportLoading, setDeleteSuperportLoading] =
    useState<boolean>(false);

  const onCreateFolder = () => {
    setOpenLinkToFolderModal(false);
    setLinkedFolder(undefined);
    navigation.navigate('CreateFolder', {
      setSelectedFolder: setLinkedFolder,
      superportLabel: superportName,
      saveDetails: true,
      onSaveDetails: onSaveFolderDetails,
      savedFolderPermissions: createdFolderPermissions,
    });
  };

  const onSaveFolderDetails = (
    newFolderPermissions: PermissionsStrict,
    folderName: string,
  ) => {
    setCreatedFolderName(folderName);
    setCreatedFolderPermissions(newFolderPermissions);
    setLinkedFolder(undefined);
    navigation.goBack();
  };

  const onSuperportLimitChange = async (newNumber: string) => {
    setSavingNewSuperportName(true);
    if (portId) {
      try {
        if (connectionsMade !== null) {
          await updateGeneratedSuperportLimit(
            portId,
            Number(newNumber),
            connectionsMade,
          );
          setConnectionsLimit(Number(newNumber));
        }
      } catch {
        showToast(
          'Error editing Superport limit. Please check your internet connection and try again.',
          ToastType.error,
        );
      }
    }
    setOpenLabelModal(false);
    setSavingNewSuperportName(false);
  };

  const onSuperportNameChange = async (newName: string) => {
    setSavingNewSuperportName(true);
    if (portId) {
      try {
        await updateGeneratedSuperportLabel(portId, newName);
        setSuperportName(newName);
      } catch {
        showToast(
          'Error editing Superport name. Check your internet connection and try again.',
          ToastType.error,
        );
      }
    }
    setOpenLabelModal(false);
    setSavingNewSuperportName(false);
  };

  const editNameBottomsheetNameProps = {
    loading: savingNewSuperportName,
    title: 'Edit Superport name',
    description:
      'Name this Superport in a way that makes it easy to recognize in your Superports tab.',
    placeholderText: 'Ex. Social Media Applicants',
    onClose: () => {
      setOpenLabelModal(false);
      setClickedLabel('');
    },
    visible: openLabelModal,
    name: superportName,
    onSave: onSuperportNameChange,
  };

  const editNameBottomsheetUsageLimitProps = {
    title: 'Custom Usage limit',
    description:
      'Set up the maximum number of connections that can be made using this Superport.',
    placeholderText: 'Ex. 50',
    onClose: () => {
      setOpenLabelModal(false);
      setClickedLabel('');
    },
    visible: openLabelModal,
    name: String(connectionsLimit),
    onSave: onSuperportLimitChange,
    keyboardType: 'numeric',
  };

  // Conditionally choose props for bottomsheet based on which label card is clicked
  const editNameProps = useMemo(() => {
    return clickedLabel === 'limit'
      ? editNameBottomsheetUsageLimitProps
      : editNameBottomsheetNameProps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickedLabel]);

  const previewImage = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openPreviewImageErrorModal) {
      setOpenPreviewImageErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsPreviewLoading(true);
      if (superportData && portId) {
        const link = await getBundleClickableLink(
          BundleTarget.superportDirect,
          portId,
          JSON.stringify(superportData?.bundle),
        );
        setIsPreviewLoading(false);
        navigation.navigate('PreviewShareablePort', {
          qrData: superportData.bundle as any,
          linkData: link,
          title: displayName,
          profilePicAttr: profilePicAttr,
        });
        return;
      }
      throw new Error('No qr data');
    } catch (error) {
      console.log('Failed to preview superport: ', error);
      setIsPreviewLoading(false);
      setOpenPreviewImageErrorModal(true);
    }
  };

  //converts qr bundle into link and copies
  const onFetchAndCopyLink = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openLinkCopyErrorModal) {
      setLinkCopyErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsCopyLinkLoading(true);
      if (superportData && portId) {
        const link = await getBundleClickableLink(
          BundleTarget.superportDirect,
          portId,
          JSON.stringify(superportData.bundle),
        );
        setIsLinkLoading(false);
        Clipboard.setString(link);
      }
      setIsCopyLinkLoading(false);
      showToast('Link Copied!', ToastType.success);
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
    if (openLinkCopyErrorModal) {
      setLinkCopyErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsLinkLoading(true);
      if (superportData && portId) {
        const link = await getBundleClickableLink(
          BundleTarget.superportDirect,
          portId,
          JSON.stringify(superportData.bundle),
        );
        setIsLinkLoading(false);
        try {
          const shareContent = {
            title: 'Share a Superport link',
            message:
              `Click the link to connect with ${displayName} on Port.\n` + link,
          };
          await Share.open(shareContent);
        } catch (error) {
          console.log('Link not shared', error);
        }
        return;
      }
      throw new Error('No qr data');
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsLinkLoading(false);
      setLinkCopyErrorModal(true);
    }
  };

  const fetchSuperportAndPermissions = async () => {
    setSuperportFetchFailed(false);
    setFetchingSuperport(true);
    try {
      const fetchedPort = await fetchCreatedSuperportBundle(superportId);
      const fetchedFolderPermissions = await getFolderPermissions(
        fetchedPort.superport.folderId,
      );
      setFolderPermissions(fetchedFolderPermissions);
      setSuperportData(fetchedPort);
      setSuperportName(fetchedPort.superport.label);
      setConnectionsLimit(fetchedPort.superport.connectionsLimit);
      setConnectionsMade(fetchedPort.superport.connectionsMade);
      setPortId(fetchedPort.bundle.portId);
      setIsSuperportPaused(fetchedPort.superport.paused);
    } catch {
      setSuperportFetchFailed(true);
      showToast(
        'Superport could not be created! Please check your internet connection and try again.',
        ToastType.error,
      );
    }
    setFetchingSuperport(false);
  };

  const onLabelInputClick = (labelName: string) => {
    setClickedLabel(labelName);
    setOpenLabelModal(true);
  };

  //runs on deleting superport
  const onDeleteSuperport = async () => {
    setDeleteSuperportLoading(true);
    if (deleteSuperportError) {
      setDeleteSuperportError(false);
      await wait(safeModalCloseDuration);
    }
    if (portId) {
      try {
        await cleanDeleteSuperport(portId);
        navigation.goBack();
      } catch (error) {
        console.error('Error deleting superport', error);
        setIsDeleteConfirmOpen(false);
        await wait(safeModalCloseDuration);
        setDeleteSuperportError(true);
      } finally {
        setDeleteSuperportLoading(false);
      }
    }
  };

  //runs on pausing superport
  const onPauseSuperport = async () => {
    setPauseSuperportLoading(true);
    if (pauseSuperportError) {
      setPauseSuperportError(false);
      await wait(safeModalCloseDuration);
    }
    if (portId) {
      try {
        await changePausedStateOfSuperport(portId, !isSuperportPaused);
        setIsSuperportPaused(!isSuperportPaused);
      } catch (error) {
        console.error('Error pausing or resuming superport', error);
        setIsPauseConfirmOpen(false);
        await wait(safeModalCloseDuration);
        setPauseSuperportError(true);
      } finally {
        setPauseSuperportLoading(false);
      }
    }
  };

  //updates connections made if new connection happens while on superport screen
  const updateConnectionCount = async () => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (portId) {
          if (portId === latestUsedConnectionLinkId) {
            connectionsMade && setConnectionsMade(connectionsMade + 1);
            return;
          }
        }
      }
    } catch (error) {
      console.log('error autoclosing modal: ', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        if (superportId) {
          fetchSuperportAndPermissions();
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [superportId]),
  );

  useEffect(() => {
    const fetchData = async () => {
      const fetchedFolders = await getAllFolders();
      setAllFolders(fetchedFolders);
    };
    fetchData();
  }, [openLinkToFolderModal]);

  useEffect(() => {
    updateConnectionCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  useMemo(() => {
    if (portId && linkedFolder) {
      (async () => {
        setCreatedFolderPermissions(
          await getFolderPermissions(linkedFolder.folderId),
        );
      })();
    }
  }, [portId, linkedFolder]);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView
        style={{
          backgroundColor: Colors.primary.background,
        }}>
        <BackTopbar
          bgColor="w"
          onBackPress={() => navigation.navigate('Superports', {})}
          title={'Superport'}
        />

        <ScrollView ref={scrollViewRef} style={styles.mainContainer}>
          <View>
            <PortCard
              isCopyLinkLoading={isCopyLinkLoading}
              isLoading={fetchingSuperport}
              isLinkLoading={isLinkLoading}
              isPreviewLoading={isPreviewLoading}
              hasFailed={superportFetchFailed}
              isSuperport={true}
              title={displayName}
              profileUri={
                folderPermissions.displayPicture ? profilePicAttr.fileUri : null
              }
              qrData={superportData?.bundle}
              onShareLinkClicked={fetchLinkData}
              onTryAgainClicked={fetchSuperportAndPermissions}
              onPreviewImageClicked={previewImage}
              onCopyLink={onFetchAndCopyLink}
            />
          </View>

          <View style={styles.customizationsContainer}>
            <View
              style={{
                marginTop: PortSpacing.intermediate.top,
              }}>
              <NumberlessText
                style={{
                  marginBottom: PortSpacing.medium.bottom,
                  paddingLeft: PortSpacing.secondary.left,
                }}
                textColor={Colors.text.subtitle}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.m}>
                Customize your Superport
              </NumberlessText>
              <SuperportLabelCard
                title="Superport name"
                subtitle="This name is only visible to you to help you organize your Superports better."
                permissionsArray={folderPermissions}
                autoFolderCreateToggle={!superportData ? true : false}
                showEmptyLabelError={false}
                label={superportName ?? superportData?.superport.label}
                createdFolderName={'hi'}
                setOpenModal={setOpenLabelModal}
                onLabelInputClick={() => onLabelInputClick('name')}
              />
            </View>

            <SuperportUsageLimit
              connectionsMade={
                connectionsMade ?? superportData?.superport.connectionsMade
              }
              connectionLimit={
                connectionsLimit ?? superportData?.superport.connectionsLimit
              }
              setOpenUsageLimitsModal={setOpenLabelModal}
              onBadgeClick={() => onLabelInputClick('limit')}
            />

            <SuperportLinkedFolderCard
              showFolderRedirectionIcon={!!portId}
              allowFolderRedirection={!!portId}
              selectedFolder={linkedFolder}
              title={'Link it to a folder'}
              subtitle={
                'All new connections formed using this Superport is automatically moved to the linked folder. These connections inherit the folder’s permissions.'
              }
              label={linkedFolder?.name || createdFolderName}
              setOpenModal={setOpenLinkToFolderModal}
            />

            {superportData && (
              <View
                style={{
                  marginTop: PortSpacing.secondary.top,
                  marginBottom: PortSpacing.primary.uniform,
                  gap: PortSpacing.medium.uniform,
                }}>
                <SecondaryButton
                  secondaryButtonColor="black"
                  buttonText={
                    isSuperportPaused ? 'Unpause Superport' : 'Pause Superport'
                  }
                  onClick={() => setIsPauseConfirmOpen(true)}
                  isLoading={pauseSuperportLoading}
                />
                <PrimaryButton
                  primaryButtonColor="r"
                  buttonText="Delete Superport"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  isLoading={deleteSuperportLoading}
                  disabled={false}
                />
              </View>
            )}

            <EditName {...editNameProps} />
            <LinkToFolderBottomSheet
              portId={portId}
              createfolder={false}
              title="Link it to an folder"
              subtitle="All new connections formed using this Superport is automatically moved to the linked folder. These connections inherit the folder’s permissions."
              currentFolder={linkedFolder}
              foldersArray={allFolders}
              onClose={() => setOpenLinkToFolderModal(false)}
              setSelectedFolderData={setLinkedFolder}
              visible={openLinkToFolderModal}
              onCreateFolder={onCreateFolder}
            />
            <ConfirmationBottomSheet
              visible={isPauseConfirmOpen}
              onClose={() => setIsPauseConfirmOpen(false)}
              onConfirm={onPauseSuperport}
              title={
                isSuperportPaused
                  ? 'Are you sure you want to unpause this Superport?'
                  : 'Are you sure you want to pause this Superport?'
              }
              description={
                isSuperportPaused
                  ? 'Unpausing this Superport will allow new connections to form using this Superport. You can always pause the Superport anytime.'
                  : 'Pausing this Superport will prevent new connections from forming using this Superport. You can always unpause at anytime.'
              }
              buttonText={
                isSuperportPaused ? 'Unpause Superport' : 'Pause Superport'
              }
              buttonColor="b"
            />
            <ConfirmationBottomSheet
              visible={isDeleteConfirmOpen}
              onClose={() => setIsDeleteConfirmOpen(false)}
              onConfirm={onDeleteSuperport}
              title="Are you sure you want to delete this Superport?"
              description="Deleting this Superport will prevent new connections from forming using this Superport.
          Connections already formed using this Superport will remain unaffected."
              buttonText="Delete Superport"
              buttonColor="r"
            />
            <ErrorBottomSheet
              visible={pauseSuperportError}
              title={'Superport could not be paused'}
              description={
                'Make sure you have an active internet connection to pause the superport'
              }
              onClose={() => setPauseSuperportError(false)}
              onTryAgain={onPauseSuperport}
            />
            <ErrorBottomSheet
              visible={deleteSuperportError}
              title={'Superport could not be deleted'}
              description={
                'Make sure you have an active internet connection to delete the superport'
              }
              onClose={() => setDeleteSuperportError(false)}
              onTryAgain={onDeleteSuperport}
            />
            <ErrorBottomSheet
              visible={openLinkCopyErrorModal}
              title={'Link could not be created'}
              description={
                'Make sure you have an active internet connection to create a link'
              }
              onClose={() => setLinkCopyErrorModal(false)}
              onTryAgain={fetchLinkData}
            />
            <ErrorBottomSheet
              visible={openPreviewImageErrorModal}
              title={'Preview could not be created'}
              description={
                'Make sure you have an active internet connection to create a preview'
              }
              onClose={() => setOpenPreviewImageErrorModal(false)}
              onTryAgain={previewImage}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingTop: PortSpacing.intermediate.uniform,
  },
  customizationsContainer: {
    gap: PortSpacing.secondary.uniform,
  },
});

export default SuperportQRScreen;
