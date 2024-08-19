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
  cleanDeletePort,
  fetchSuperport,
  getBundleClickableLink,
  updateGeneratedSuperportFolder,
  updateGeneratedSuperportLabel,
} from '@utils/Ports';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import {DirectSuperportBundle} from '@utils/Ports/interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {PortTable} from '@utils/Storage/DBCalls/ports/interfaces';
import Share from 'react-native-share';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {addNewFolder} from '@utils/ChatFolders';
import {getAllFolders} from '@utils/Storage/folders';
import EditName from '@components/Reusable/BottomSheets/EditName';
import UsageLimitsBottomSheet from '@components/Reusable/BottomSheets/UsageLimitsBottomSheet';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import {
  changePausedStateOfSuperport,
  updateGeneratedSuperportLimit,
} from '@utils/Ports/superport';
import {useSelector} from 'react-redux';
import DynamicColors from '@components/DynamicColors';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import LinkToFolderBottomSheet from '@screens/Home/LinkToFolderBottomSheet';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {useFocusEffect} from '@react-navigation/native';
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

  //see if superport is paused
  const [isPaused, setIsPaused] = useState(false);
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);

  //confirm deletion
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [savedFolderPermissions, setSavedFolderPermissions] =
    useState<PermissionsStrict>({...defaultPermissions});

  //control folder assigned to superport
  const [chosenFolder, setChosenFolder] = useState<FolderInfo>(
    selectedFolder
      ? {...selectedFolder}
      : {
          ...defaultFolderInfo,
        },
  );

  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const onSaveDetails = (folderPermissions: PermissionsStrict) => {
    setSavedFolderPermissions(folderPermissions);
    navigation.goBack();
  };

  const onEditFolder = () => {
    navigation.navigate('CreateFolder', {
      setSelectedFolder: setFolder,
      portId: qrData?.portId ? qrData.portId : '',
      superportLabel: label,
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
    const folder = await addNewFolder(label, savedFolderPermissions);
    fetchPort(folder);
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
        setConnectionLimit(superport.connectionsLimit);
        setConnectionMade(superport.connectionsMade);
        setChosenFolder(folder ? folder : chosenFolder);
        setIsLoading(false);
      } catch (error) {
        console.log('Failed to fetch superport: ', error);
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
    setOpenLabelModal(false);
  };

  const saveNewLimit = async () => {
    if (qrData?.portId) {
      try {
        await updateGeneratedSuperportLimit(
          qrData.portId,
          connectionLimit,
          connectionMade,
        );
      } catch (error) {
        console.error('Error setting new limit for superport', error);
      }
    }
    setOpenUsageLimitsModal(false);
  };

  //saves new label when it changes
  useMemo(() => {
    saveNewLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  //saves new connection limit when it changes
  useMemo(() => {
    saveNewLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionLimit]);

  const fetchFoldersData = async () => {
    const folders = await getAllFolders();
    setFoldersArray(folders);
  };

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await fetchFoldersData();
        if (portId) {
          await fetchPort();
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portId]),
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
    if (qrData?.portId) {
      try {
        await cleanDeletePort(qrData.portId, PortTable.superport);
        navigation.goBack();
      } catch (error) {
        console.error('Error deleting superport', error);
      }
    }
  };

  const pauseSuperport = async () => {
    if (qrData?.portId) {
      try {
        await changePausedStateOfSuperport(qrData.portId, !isPaused);
        setIsPaused(!isPaused);
      } catch (error) {
        console.error('Error pausing or resuming superport', error);
      }
    }
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
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
                profileUri={profilePicAttr.fileUri}
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
                Customize your port
              </NumberlessText>
              <SuperportLabelCard
                permissionsArray={savedFolderPermissions}
                autoFolderCreateToggle={!qrData ? true : false}
                onEditFolder={onEditFolder}
                chosenFolder={chosenFolder}
                onChooseFolder={() => {
                  setOpenLinkToFolder(true);
                }}
                showEmptyLabelError={showEmptyLabelError}
                setShowEmptyLabelError={setShowEmptyLabelError}
                label={label}
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
          </View>
        </ScrollView>
        <View
          style={{
            margin: PortSpacing.secondary.bottom,
            gap: PortSpacing.secondary.uniform,
          }}>
          {portId ? (
            <>
              <PrimaryButton
                primaryButtonColor="r"
                buttonText="Delete Superport"
                onClick={() => setIsDeleteConfirmOpen(true)}
                isLoading={false}
                disabled={false}
              />
              <SecondaryButton
                secondaryButtonColor="black"
                buttonText={isPaused ? 'Unpause Superport' : 'Pause Superport'}
                onClick={() => setIsPauseConfirmOpen(true)}
                isLoading={false}
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
          title="Edit Superport label"
          description="Choose a label that describes the purpose or destination for the Superport."
          onClose={() => setOpenLabelModal(false)}
          visible={openLabelModal}
          setName={setLabel}
          name={label}
        />
        <UsageLimitsBottomSheet
          title="Custom usage limit"
          connectionsMade={connectionMade}
          visible={openUsageLimitsModal}
          setNewLimit={setConnectionLimit}
          onClose={() => setOpenUsageLimitsModal(false)}
          newLimit={connectionLimit}
          description="Set up the maximum number of connections that can be made using this Superport"
        />
        <ConfirmationBottomSheet
          visible={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={async () => await deleteSuperport()}
          title="Are you sure you want to delete this Superport?"
          description="Deleting this Superport will prevent new connections from forming using this Superport.
          Connections already formed using this Superport will remain unaffected."
          buttonText="Delete Superport"
          buttonColor="r"
        />
        <LinkToFolderBottomSheet
          title="Link it to an existing folder"
          subtitle="When you move a chat to a chat folder, its initial settings will be
        inherited from the settings set for the folder."
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
          onConfirm={async () => await pauseSuperport()}
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
      backgroundColor: colors.primary.background,
      gap: PortSpacing.secondary.uniform,
    },
    qrArea: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.primary.top,
    },
  });

export default SuperportScreen;
