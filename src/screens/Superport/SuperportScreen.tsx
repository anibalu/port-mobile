import {PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import SuperportLabelCard from './SuperportLabelCard';
import SuperportUsageLimit from './SuperportUsageLimit';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  defaultFolderInfo,
  defaultPermissions,
  defaultSuperportConnectionsLimit,
  safeModalCloseDuration,
} from '@configs/constants';
import PortCard from '@components/Reusable/ConnectionCards/PortCard';
import {wait} from '@utils/Time';
import {
  fetchSuperport,
  getBundleClickableLink,
  updateGeneratedSuperportFolder,
  updateGeneratedSuperportLabel,
} from '@utils/Ports';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import {DirectSuperportBundle} from '@utils/Ports/interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import Share from 'react-native-share';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {addNewFolder, deleteFolder} from '@utils/ChatFolders';
import {getAllFolders} from '@utils/Storage/folders';
import EditName from '@components/Reusable/BottomSheets/EditName';
import UsageLimitsBottomSheet from '@components/Reusable/BottomSheets/UsageLimitsBottomSheet';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import {
  changePausedStateOfSuperport,
  cleanDeleteSuperport,
  updateGeneratedSuperportLimit,
} from '@utils/Ports/superport';
import {useSelector} from 'react-redux';
import DynamicColors from '@components/DynamicColors';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {useFocusEffect} from '@react-navigation/native';
import {ToastType, useToast} from 'src/context/ToastContext';
import LinkToFolderBottomSheet from '@components/Reusable/BottomSheets/LinkToFolderBottomSheet';
import {getFolderPermissions} from '@utils/Storage/permissions';
type Props = NativeStackScreenProps<AppStackParamList, 'SuperportScreen'>;

const SuperportScreen = ({route, navigation}: Props) => {
  const {portId, selectedFolder} = route.params;
  const profile = useSelector(state => state.profile.profile);
  const {displayName, profilePicAttr} = useMemo(() => {
    return {
      displayName: profile?.name || DEFAULT_NAME,
      profilePicAttr: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  const scrollViewRef = useRef<ScrollView>(null);

  const [openLinkToFolder, setOpenLinkToFolder] = useState<boolean>(false);
  //state of qr code generation
  const [isLoading, setIsLoading] = useState(false);
  //whether qr code generation has failed
  const [hasFailed, setHasFailed] = useState(false);
  //qr code data to display
  const [qrData, setQrData] = useState<DirectSuperportBundle | null>(null);
  //whether is link is being generated
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  //whether is sharable image is being generated
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  //whether is error bottom sheet should open
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [openErrorModalPreviewImage, setOpenErrorModalPreviewImage] =
    useState(false);

  //toggle value
  const [autoCreateFolder, setAutoCreateFolder] = useState<boolean>(true);

  //control label assigned to superport
  const [label, setLabel] = useState('');
  const [openLabelModal, setOpenLabelModal] = useState(false);
  const [showEmptyLabelError, setShowEmptyLabelError] = useState(false);

  //control usage limits of superport
  const [connectionMade, setConnectionMade] = useState(0);
  const [connectionLimit, setConnectionLimit] = useState(
    defaultSuperportConnectionsLimit,
  );
  const [openUsageLimitsModal, setOpenUsageLimitsModal] = useState(false);
  const {showToast} = useToast();

  //see if superport is paused
  const [isPaused, setIsPaused] = useState(false);
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);

  //confirm deletion
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [savedFolderPermissions, setSavedFolderPermissions] =
    useState<PermissionsStrict>({...defaultPermissions});

  const [pauseSuperportError, setPauseSuperportError] = useState(false);
  const [pauseSuperportLoading, setPauseSuperportLoading] = useState(false);
  const [deleteSuperportError, setDeleteSuperportError] = useState(false);
  const [deleteSuperportLoading, setDeleteSuperportLoading] = useState(false);
  const [newLimitLoading, setNewLimitLoading] = useState(false);

  //control folder assigned to superport
  const [chosenFolder, setChosenFolder] = useState<FolderInfo>(
    selectedFolder
      ? {...selectedFolder}
      : {
          ...defaultFolderInfo,
        },
  );

  const latestNewConnection = useSelector(state => state.latestNewConnection);
  const [createdFolderName, setCreatedFolderName] = useState<string>('');
  useMemo(() => {
    if (portId) {
      (async () => {
        setSavedFolderPermissions(
          await getFolderPermissions(chosenFolder.folderId),
        );
      })();
    }
  }, [portId, chosenFolder]);

  const onSaveDetails = (
    folderPermissions: PermissionsStrict,
    folderName: string,
  ) => {
    setCreatedFolderName(folderName);
    setSavedFolderPermissions(folderPermissions);
    navigation.goBack();
  };

  const onEditFolder = () => {
    navigation.navigate('CreateFolder', {
      setSelectedFolder: setFolder,
      portId: qrData?.portId ? qrData.portId : '',
      superportLabel: createdFolderName || label,
      saveDetails: true,
      onSaveDetails,
      savedFolderPermissions,
    });
  };

  const setFolder = async (folder: FolderInfo) => {
    setChosenFolder(folder);
    if (qrData?.portId) {
      await updateGeneratedSuperportFolder(qrData.portId, folder.folderId);
    }
  };

  //all available folders
  const [foldersArray, setFoldersArray] = useState<FolderInfo[]>([]);

  const createFolderAndSuperport = async () => {
    const folderLabel = createdFolderName || label;
    if (autoCreateFolder && folderLabel) {
      const folder = await addNewFolder(folderLabel, savedFolderPermissions);
      fetchPort(folder);
    } else {
      fetchPort();
    }
  };

  //fetches a port
  const fetchPort = async (folder?: FolderInfo) => {
    if (portId || label) {
      try {
        setIsLoading(true);
        setHasFailed(false);
        const {bundle, superport} = await fetchSuperport(
          portId,
          label,
          connectionLimit,
          folder ? folder.folderId : chosenFolder.folderId,
        );
        setQrData(bundle);
        setIsPaused(superport.paused);
        setLabel(superport.label);
        setCreatedFolderName(superport.label);
        setConnectionLimit(superport.connectionsLimit);
        setConnectionMade(superport.connectionsMade);
        setChosenFolder(folder ? folder : chosenFolder);
        setIsLoading(false);
      } catch (error) {
        console.log('Failed to fetch superport: ', error);
        //deleting created folder if superport creation fails.
        folder && (await deleteFolder(folder.folderId));
        showToast(
          'Superport could not be created! Please check your internet connection and try again.',
          ToastType.error,
        );
        setHasFailed(true);
        setIsLoading(false);
        setQrData(null);
      }
    } else {
      scrollToTop();
      setShowEmptyLabelError(true);
    }
  };
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: 0, animated: true});
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [qrData?.portId]);

  useEffect(() => {
    setShowEmptyLabelError(false);
  }, [label]);

  //converts qr bundle into link.
  const fetchLinkData = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openErrorModal) {
      setOpenErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsLoadingLink(true);
      if (qrData?.portId) {
        const link = await getBundleClickableLink(
          BundleTarget.superportDirect,
          qrData.portId,
          JSON.stringify(qrData),
        );
        setIsLoadingLink(false);
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
      setIsLoadingLink(false);
      setOpenErrorModal(true);
    }
  };
  const previewImage = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openErrorModalPreviewImage) {
      setOpenErrorModalPreviewImage(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsPreviewLoading(true);
      if (qrData?.portId) {
        const link = await getBundleClickableLink(
          BundleTarget.superportDirect,
          qrData.portId,
          JSON.stringify(qrData),
        );
        setIsPreviewLoading(false);
        navigation.navigate('PreviewShareablePort', {
          qrData: qrData as any,
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
      setOpenErrorModalPreviewImage(true);
    }
  };

  const saveNewLabel = async () => {
    if (qrData?.portId) {
      await updateGeneratedSuperportLabel(qrData.portId, label);
    }
    if (label) {
      setAutoCreateFolder(true);
    }
    setOpenLabelModal(false);
  };

  const saveNewLimit = async (newLocalLimit: number) => {
    if (qrData?.portId) {
      try {
        setNewLimitLoading(true);
        await updateGeneratedSuperportLimit(
          qrData.portId,
          newLocalLimit,
          connectionMade,
        );
        newLocalLimit && setConnectionLimit(newLocalLimit);
      } catch (error) {
        console.error('Error setting new limit for superport', error);
        showToast(
          'New limit could not be set. please check your internet connection and try again',
          ToastType.error,
        );
      } finally {
        setNewLimitLoading(false);
        setOpenUsageLimitsModal(false);
      }
    } else {
      newLocalLimit && setConnectionLimit(newLocalLimit);
      setOpenUsageLimitsModal(false);
    }
  };

  //saves new label when it changes
  useMemo(() => {
    saveNewLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  const fetchFoldersData = async () => {
    const folders = await getAllFolders();
    setFoldersArray(folders);
  };

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await fetchFoldersData();
        selectedFolder && setAutoCreateFolder(false);
        if (portId) {
          await fetchPort();
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portId, selectedFolder]),
  );

  const updateConnectionCount = async () => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (qrData?.portId) {
          if (qrData.portId === latestUsedConnectionLinkId) {
            setConnectionMade(connectionMade + 1);
            return;
          }
        }
      }
    } catch (error) {
      console.log('error autoclosing modal: ', error);
    }
  };

  //updates connections made if new connection happens while on superport screen
  useEffect(() => {
    updateConnectionCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  const deleteSuperport = async () => {
    setDeleteSuperportLoading(true);
    if (deleteSuperportError) {
      setDeleteSuperportError(false);
      await wait(safeModalCloseDuration);
    }
    if (qrData?.portId) {
      try {
        await cleanDeleteSuperport(qrData.portId);
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

  const pauseSuperport = async () => {
    setPauseSuperportLoading(true);
    if (pauseSuperportError) {
      setPauseSuperportError(false);
      await wait(safeModalCloseDuration);
    }
    if (qrData?.portId) {
      try {
        await changePausedStateOfSuperport(qrData.portId, !isPaused);
        setIsPaused(!isPaused);
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

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView
        style={{
          backgroundColor: Colors.primary.background,
        }}>
        <BackTopbar
          bgColor="w"
          onBackPress={() => navigation.goBack()}
          title={portId ? 'Superport' : 'New Superport'}
        />

        <ScrollView ref={scrollViewRef} style={styles.mainContainer}>
          {qrData || portId ? (
            <View style={styles.qrArea}>
              <PortCard
                isLoading={isLoading}
                isLinkLoading={isLoadingLink}
                isPreviewLoading={isPreviewLoading}
                hasFailed={hasFailed}
                isSuperport={true}
                title={displayName}
                profileUri={
                  savedFolderPermissions.displayPicture
                    ? profilePicAttr.fileUri
                    : null
                }
                qrData={qrData}
                onShareLinkClicked={fetchLinkData}
                onTryAgainClicked={fetchPort}
                onPreviewImageClicked={previewImage}
              />
            </View>
          ) : (
            <></>
          )}

          <View style={styles.infoContainer}>
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
                autoCreateFolder={autoCreateFolder}
                setAutoCreateFolder={setAutoCreateFolder}
                permissionsArray={savedFolderPermissions}
                autoFolderCreateToggle={!qrData ? true : false}
                onEditFolder={onEditFolder}
                chosenFolder={chosenFolder}
                onChooseFolder={() => {
                  setOpenLinkToFolder(true);
                }}
                showEmptyLabelError={showEmptyLabelError}
                label={label}
                createdFolderName={createdFolderName}
                setOpenModal={setOpenLabelModal}
              />
            </View>
            <View>
              <SuperportUsageLimit
                connectionsMade={connectionMade}
                connectionLimit={connectionLimit}
                setOpenUsageLimitsModal={setOpenUsageLimitsModal}
              />
            </View>
            {portId || qrData ? (
              <>
                <SecondaryButton
                  secondaryButtonColor="black"
                  buttonText={
                    isPaused ? 'Unpause Superport' : 'Pause Superport'
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
              </>
            ) : (
              <PrimaryButton
                primaryButtonColor="b"
                buttonText={'Create Superport'}
                onClick={createFolderAndSuperport}
                isLoading={isLoading}
                disabled={false}
              />
            )}
          </View>
        </ScrollView>

        <ErrorBottomSheet
          visible={pauseSuperportError}
          title={'Superport could not be paused'}
          description={
            'Make sure you have an active internet connection to pause the superport'
          }
          onClose={() => setPauseSuperportError(false)}
          onTryAgain={pauseSuperport}
        />
        <ErrorBottomSheet
          visible={deleteSuperportError}
          title={'Superport could not be deleted'}
          description={
            'Make sure you have an active internet connection to delete the superport'
          }
          onClose={() => setDeleteSuperportError(false)}
          onTryAgain={deleteSuperport}
        />
        <ErrorBottomSheet
          visible={openErrorModal}
          title={'Link could not be created'}
          description={
            'Make sure you have an active internet connection to create a link'
          }
          onClose={() => setOpenErrorModal(false)}
          onTryAgain={fetchLinkData}
        />
        <ErrorBottomSheet
          visible={openErrorModalPreviewImage}
          title={'Preview could not be created'}
          description={
            'Make sure you have an active internet connection to create a preview'
          }
          onClose={() => setOpenErrorModalPreviewImage(false)}
          onTryAgain={previewImage}
        />
        <EditName
          title="Edit Superport name"
          description="Adding a name to this Superport makes it easy to recognize it in your Superports tab."
          onClose={() => setOpenLabelModal(false)}
          visible={openLabelModal}
          setName={setLabel}
          name={label}
        />
        <UsageLimitsBottomSheet
          title="Custom usage limit"
          connectionsMade={connectionMade}
          visible={openUsageLimitsModal}
          onSave={saveNewLimit}
          newLimitLoading={newLimitLoading}
          onClose={() => setOpenUsageLimitsModal(false)}
          newLimit={connectionLimit}
          description="Set up the maximum number of connections that can be made using this Superport"
        />
        <ConfirmationBottomSheet
          visible={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={deleteSuperport}
          title="Are you sure you want to delete this Superport?"
          description="Deleting this Superport will prevent new connections from forming using this Superport.
          Connections already formed using this Superport will remain unaffected."
          buttonText="Delete Superport"
          buttonColor="r"
        />
        <LinkToFolderBottomSheet
          title="Link it to an existing folder"
          subtitle="New chats from this Superport will form and inherit initial settings from the linked folder."
          portId={portId}
          currentFolder={chosenFolder}
          foldersArray={foldersArray}
          onClose={() => setOpenLinkToFolder(false)}
          setSelectedFolderData={setChosenFolder}
          visible={openLinkToFolder}
        />
        <ConfirmationBottomSheet
          visible={isPauseConfirmOpen}
          onClose={() => setIsPauseConfirmOpen(false)}
          onConfirm={pauseSuperport}
          title={
            isPaused
              ? 'Are you sure you want to unpause this Superport?'
              : 'Are you sure you want to pause this Superport?'
          }
          description={
            isPaused
              ? 'Unpausing this Superport will allow new connections to form using this Superport. You can always pause the Superport anytime.'
              : 'Pausing this Superport will prevent new connections from forming using this Superport. You can always unpause at anytime.'
          }
          buttonText={isPaused ? 'Unpause Superport' : 'Pause Superport'}
          buttonColor="b"
        />
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    qrInfoCard: {
      marginBottom: PortSpacing.intermediate.bottom,
    },
    mainContainer: {
      width: '100%',
      paddingBottom: PortSpacing.secondary.bottom,
    },
    infoContainer: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingBottom: PortSpacing.tertiary.uniform,
      backgroundColor: colors.primary.background,
      gap: PortSpacing.secondary.uniform,
    },
    qrArea: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.primary.top,
    },
  });

export default SuperportScreen;
