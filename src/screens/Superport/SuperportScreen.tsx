import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import SuperportsInfo from '@assets/miscellaneous/SuperportsInfo.svg';
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
import MoveContacts from './MoveContacts';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FileAttributes} from '@utils/Storage/interfaces';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  defaultFolderInfo,
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
  updateGeneratedSuperportLimit,
} from '@utils/Ports';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import {
  BundleTarget,
  DirectSuperportBundle,
  PortTable,
} from '@utils/Ports/interfaces';
import Share from 'react-native-share';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import {useFocusEffect} from '@react-navigation/native';
import {getAllFolders} from '@utils/ChatFolders';
import EditName from '@components/Reusable/BottomSheets/EditName';
import UsageLimitsBottomSheet from '@components/Reusable/BottomSheets/UsageLimitsBottomSheet';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import {changePausedStateOfSuperport} from '@utils/Ports/superport';
import {useSelector} from 'react-redux';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
type Props = NativeStackScreenProps<AppStackParamList, 'SuperportScreen'>;

const SuperportScreen = ({route, navigation}: Props) => {
  const {portId, name, avatar, selectedFolder} = route.params;

  const scrollViewRef = useRef<ScrollView>(null);

  const processedName: string = name || DEFAULT_NAME;
  const processedAvatar: FileAttributes = avatar || DEFAULT_PROFILE_AVATAR_INFO;
  const [profilePicAttr] = useState(processedAvatar);
  const [displayName] = useState<string>(processedName);
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
  const [initialConnectionLimit, setInitialConnectionLimit] = useState(
    defaultSuperportConnectionsLimit,
  );
  const [openUsageLimitsModal, setOpenUsageLimitsModal] = useState(false);
  const [usageLimitsArray, setUsageLimitsArray] = useState([25, 50, 100, 0]);

  //see if superport is paused
  const [isPaused, setIsPaused] = useState(false);
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);

  //confirm deletion
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  //control folder assigned to superport
  const [chosenFolder, setSelectedFolder] = useState<FolderInfo>(
    selectedFolder
      ? {...selectedFolder}
      : {
          ...defaultFolderInfo,
        },
  );

  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const setFolder = async (folder: FolderInfo) => {
    setSelectedFolder(folder);
    if (qrData?.portId) {
      await updateGeneratedSuperportFolder(qrData.portId, folder.folderId);
    }
  };

  function nearestMultipleOf50(x: number) {
    if (Math.round(x / 50) === 0) {
      return 50;
    } else {
      return Math.round(x / 50) * 50;
    }
  }
  //generates options array
  const generatedUsageLimitsArrsay = (initialLimit: number) => {
    const result = [initialLimit];
    for (let i = 1; i < 3; i++) {
      result.push(nearestMultipleOf50(initialLimit) * 2 * i);
    }
    result.push(0);
    setUsageLimitsArray(result);
  };

  //all available folders
  const [foldersArray, setFoldersArray] = useState<FolderInfo[]>([]);
  //fetches a port
  const fetchPort = async () => {
    if (portId || label) {
      try {
        setIsLoading(true);
        setHasFailed(false);
        const {bundle, superport} = await fetchSuperport(
          portId,
          label,
          defaultSuperportConnectionsLimit,
          chosenFolder.folderId,
        );
        setIsPaused(superport.paused);
        setLabel(superport.label);
        setInitialConnectionLimit(superport.connectionsLimit);
        setConnectionLimit(superport.connectionsLimit);
        setConnectionMade(superport.connectionsMade);
        setSelectedFolder(
          foldersArray.find(
            folder => folder.folderId === superport.folderId,
          ) || {
            ...defaultFolderInfo,
          },
        );
        setQrData(bundle);
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
      await updateGeneratedSuperportLimit(qrData.portId, connectionLimit);
    }
    setOpenUsageLimitsModal(false);
  };

  //saves new label when it changes
  useMemo(() => {
    saveNewLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  //generates initial limits array
  useMemo(() => {
    generatedUsageLimitsArrsay(initialConnectionLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConnectionLimit]);

  //saves new connection limit when it changes
  useMemo(() => {
    saveNewLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionLimit]);

  const fetchFoldersData = async () => {
    const folders = await getAllFolders();
    setFoldersArray(folders);
  };

  //loads up initial data
  useFocusEffect(
    React.useCallback(() => {
      fetchFoldersData();
      if (portId) {
        fetchPort();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
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
      await cleanDeletePort(qrData.portId, PortTable.superport);
    }
    navigation.goBack();
  };

  const pauseSuperport = async () => {
    if (qrData?.portId) {
      await changePausedStateOfSuperport(qrData.portId, !isPaused);
      setIsPaused(!isPaused);
    }
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

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <TopBarWithRightIcon
          onIconRightPress={() => navigation.goBack()}
          IconRight={CrossButton}
          heading={qrData?.portId ? 'Superport' : 'New Superport'}
        />

        <ScrollView ref={scrollViewRef} style={styles.mainContainer}>
          {qrData?.portId ? (
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
            <View
              style={{
                alignItems: 'center',
                paddingHorizontal: PortSpacing.tertiary.uniform,
                gap: PortSpacing.medium.right,

                width: screen.width,
                backgroundColor: Colors.primary.background,
              }}>
              <SuperportsInfo width={260} />
              <NumberlessText
                style={{
                  textAlign: 'center',
                  width: '85%',
                  flex: 1,
                  marginBottom: PortSpacing.secondary.bottom,
                }}
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.l}
                fontType={FontType.rg}>
                Superports are multi-use Ports that let you connect with
                multiple people at once.
              </NumberlessText>
            </View>
          )}

          <View
            style={{
              paddingHorizontal: PortSpacing.secondary.uniform,
              backgroundColor: Colors.primary.background,
            }}>
            <NumberlessText
              style={{
                marginBottom: PortSpacing.medium.bottom,
                marginTop: PortSpacing.intermediate.top,
              }}
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              Customize your Port
            </NumberlessText>
            <View style={{marginBottom: PortSpacing.tertiary.bottom}}>
              <SuperportLabelCard
                showEmptyLabelError={showEmptyLabelError}
                label={label}
                setOpenModal={setOpenLabelModal}
              />
            </View>
            <View style={{marginBottom: PortSpacing.tertiary.bottom}}>
              <SuperportUsageLimit
                connectionsMade={connectionMade}
                onSetUsageLimit={setConnectionLimit}
                connectionLimit={connectionLimit}
                setOpenUsageLimitsModal={setOpenUsageLimitsModal}
                limitsArray={usageLimitsArray}
              />
            </View>
            <View style={{marginBottom: PortSpacing.secondary.bottom}}>
              <MoveContacts
                hideAddFolder={qrData?.portId}
                setSelectedFolder={setFolder}
                selectedFolder={chosenFolder}
                foldersArray={foldersArray}
                onAddNewFolder={() => {
                  if (qrData?.portId) {
                    navigation.navigate('CreateFolder', {
                      setSelectedFolder: setFolder,
                      portId: qrData.portId,
                    });
                  }
                }}
              />
            </View>
            <View
              style={{
                marginBottom: PortSpacing.secondary.bottom,
                gap: PortSpacing.secondary.uniform,
              }}>
              {qrData?.portId ? (
                <>
                  <PrimaryButton
                    primaryButtonColor="r"
                    buttonText="Delete Superport"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    isLoading={false}
                    disabled={false}
                  />
                  <PrimaryButton
                    primaryButtonColor="b"
                    buttonText={
                      isPaused ? 'Unpause Superport' : 'Pause Superport'
                    }
                    onClick={() => setIsPauseConfirmOpen(true)}
                    isLoading={false}
                    disabled={false}
                  />
                </>
              ) : (
                <PrimaryButton
                  primaryButtonColor="b"
                  buttonText={'Create Superport'}
                  onClick={fetchPort}
                  isLoading={isLoading}
                  disabled={false}
                />
              )}
            </View>
          </View>
        </ScrollView>
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
          limitsArray={usageLimitsArray}
          setLimitsArray={setUsageLimitsArray}
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

const styles = StyleSheet.create({
  qrInfoCard: {
    marginBottom: PortSpacing.intermediate.bottom,
  },
  mainContainer: {
    width: '100%',
    paddingBottom: PortSpacing.secondary.bottom,
  },
  qrArea: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    marginTop: 30 + PortSpacing.primary.top, //accounts for profile picture offset
  },
});

export default SuperportScreen;
