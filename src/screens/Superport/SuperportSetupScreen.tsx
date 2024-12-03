import {PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, ScrollView, Animated} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DashedLine from '@assets/miscellaneous/DashedLine.svg';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {defaultPermissions} from '@configs/constants';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {addNewFolder, deleteFolder} from '@utils/ChatFolders';
import {getAllFolders} from '@utils/Storage/folders';
import EditName from '@components/Reusable/BottomSheets/EditName';
import {createNewSuperport} from '@utils/Ports/superport';
import DynamicColors from '@components/DynamicColors';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {ToastType, useToast} from 'src/context/ToastContext';
import LinkToFolderBottomSheet from '@components/Reusable/BottomSheets/LinkToFolderBottomSheet';
import SuperportLabelCard from './SuperportComponents/SuperportLabelCard';
import SuperportCreationStepBadge from './SuperportComponents/SuperportCreationStepBadge';
import SuperportLinkedFolderCard from './SuperportComponents/SuperportLinkedFolderCard';
type Props = NativeStackScreenProps<AppStackParamList, 'SuperportSetupScreen'>;

// Define SlideInCard component outside of SuperportSetupScreen
const SlideInCard = ({
  children,
  triggerAnimation,
}: {
  children: ReactNode;
  triggerAnimation: boolean;
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current; // Initial position is off-screen

  useEffect(() => {
    if (triggerAnimation) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to its natural position
        duration: 400, // Animation duration
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerAnimation]);

  return (
    <Animated.View
      style={{
        transform: [{translateY: slideAnim}],
        opacity: slideAnim.interpolate({
          inputRange: [-100, 0],
          outputRange: [0, 1], // Fade in as it slides in
        }),
      }}>
      {children}
    </Animated.View>
  );
};

const SuperportSetupScreen = ({route, navigation}: Props) => {
  const {portId, selectedFolder} = route.params;
  const scrollViewRef = useRef<ScrollView>(null);
  const {showToast} = useToast();
  const Colors = DynamicColors();
  const styles = styling(Colors);

  //for superport name/label
  const [superportName, setSuperportName] = useState<string>('');

  //for superport usage limit
  const [usageLimit, setUsageLimit] = useState<number | null>(null);

  //for editing both superport label, name and usage limit
  const [openLabelModal, setOpenLabelModal] = useState<boolean>(false);

  //clicked step label out of three, name || limit || folder
  const [clickedLabel, setClickedLabel] = useState<'name' | 'limit' | string>(
    '',
  );

  //user chosen linked folder, default is the selected folder
  const [linkedFolder, setLinkedFolder] = useState<FolderInfo | undefined>(
    selectedFolder,
  );

  //loading state when we are creating superport
  const [creatingSuperport, setCreatingSuperport] = useState<boolean>(false);

  //user create folder from linked folder bottomsheet
  const [createdFolderName, setCreatedFolderName] = useState<string>('');

  //user create folder permissions from linked folder bottomsheet
  const [createdFolderPermissions, setCreatedFolderPermissions] =
    useState<PermissionsStrict>({...defaultPermissions});

  //modal for linking a folder
  const [openLinkToFolderModal, setOpenLinkToFolderModal] =
    useState<boolean>(false);

  //array of all folders
  const [allFolders, setAllFolders] = useState<FolderInfo[]>([]);

  const editNameBottomsheetNameProps = {
    title: 'Add Superport name',
    description:
      'Adding a name to this Superport makes it easy to recognize it in your Superports tab.',
    placeholderText: 'Ex. Social Media Applicants',
    onClose: () => {
      setOpenLabelModal(false);
      setClickedLabel('');
    },
    visible: openLabelModal,
    setName: setSuperportName,
    name: superportName,
    onSave: () => setOpenLabelModal(false),
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
    setName: setUsageLimit,
    name: usageLimit,
    onSave: () => setOpenLabelModal(false),
    keyboardType: 'numeric',
  };

  // Conditionally choose props for bottomsheet based on which label card is clicked
  const editNameProps = useMemo(() => {
    return clickedLabel === 'limit'
      ? editNameBottomsheetUsageLimitProps
      : editNameBottomsheetNameProps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickedLabel]);

  //triggers on click of the non-editable input box label (ex. superport name)
  const onLabelInputClick = (labelName: string) => {
    setClickedLabel(labelName);
    setOpenLabelModal(true);
  };

  //triggers on saving new created folder details
  const onSaveFolderDetails = (
    folderPermissions: PermissionsStrict,
    folderName: string,
  ) => {
    setCreatedFolderName(folderName);
    setCreatedFolderPermissions(folderPermissions);
    setLinkedFolder(undefined);
    navigation.goBack();
  };

  //triggers on creating new folder
  const onCreateFolder = () => {
    setOpenLinkToFolderModal(false);
    setLinkedFolder(undefined);
    // todo:navigation sending functions in params is bad practise
    navigation.push('CreateFolder', {
      setSelectedFolder: setLinkedFolder,
      superportLabel: superportName,
      saveDetails: true,
      onSaveDetails: onSaveFolderDetails,
      savedFolderPermissions: createdFolderPermissions,
    });
  };

  //creates a superport, and a folder if necessary
  const createFolderAndSuperport = async () => {
    if (createdFolderName) {
      const folder = await addNewFolder(
        createdFolderName,
        createdFolderPermissions,
      );
      fetchPort(folder);
    } else {
      fetchPort();
    }
  };

  //fetches a port
  const fetchPort = async (folder?: FolderInfo) => {
    try {
      setCreatingSuperport(true);
      //create new superport
      const newSuperport = await createNewSuperport(
        superportName,
        usageLimit,
        folder ? folder?.folderId : linkedFolder?.folderId,
      );
      setCreatingSuperport(false);
      navigation.replace('SuperportQRScreen', {
        superportId: newSuperport.bundle.portId,
        selectedFolder: folder ? folder : linkedFolder,
      });
    } catch (error) {
      console.log('Failed to fetch superport: ', error);
      //delete created folder if superport creation fails.
      folder && (await deleteFolder(folder.folderId));
      showToast(
        'Superport could not be created! Please check your internet connection and try again.',
        ToastType.error,
      );
      setCreatingSuperport(false);
    }
  };

  useEffect(() => {
    //scroll to end after saving limit when linked folder card is visible and after saving folder when create superport button is enabled
    scrollViewRef?.current?.scrollToEnd({animated: true});
  }, [usageLimit, linkedFolder, createdFolderName]);

  useEffect(() => {
    //fetches all folder data
    const fetchAllFoldersData = async () => {
      const fetchedFolders = await getAllFolders();
      setAllFolders(fetchedFolders);
    };
    fetchAllFoldersData();
  }, [openLinkToFolderModal]);

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
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            justifyContent: 'space-between',
            flexGrow: 1,
          }}>
          <View style={styles.infoContainer}>
            <View>
              <NumberlessText
                style={{
                  marginBottom: PortSpacing.tertiary.bottom,
                  paddingLeft: PortSpacing.secondary.left,
                }}
                textColor={Colors.text.primary}
                fontType={FontType.sb}
                fontSizeType={FontSizeType.xl}>
                Let’s get you started!
              </NumberlessText>
              <NumberlessText
                style={{
                  marginBottom: PortSpacing.medium.bottom,
                  paddingLeft: PortSpacing.secondary.left,
                }}
                textColor={Colors.text.primary}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.m}>
                Follow the steps below to create your Superport
              </NumberlessText>
            </View>
            <View style={{height: 'auto', overflow: 'hidden'}}>
              <View
                style={{
                  position: 'absolute',
                  left: PortSpacing.primary.left - 2,
                  top: 20,
                }}>
                <DashedLine />
              </View>

              <SuperportCreationStepBadge stepCount={'01'} />
              <SuperportLabelCard
                title={'Superport name'}
                subtitle={
                  'This name is only visible to you to help you organize your Superports better.'
                }
                label={superportName}
                onLabelInputClick={() => onLabelInputClick('name')}
                setOpenModal={setOpenLabelModal}
                placeholder={'Ex. Social Media Applicants'}
              />

              {superportName && (
                <SlideInCard triggerAnimation={!!superportName}>
                  <SuperportCreationStepBadge stepCount={'02'} />
                  <SuperportLabelCard
                    onLabelInputClick={() => onLabelInputClick('limit')}
                    title={'Setup usage limits'}
                    subtitle={
                      'Setup the maximum number of connections that can be made using this Superport.'
                    }
                    label={usageLimit}
                    setOpenModal={setOpenLabelModal}
                    placeholder={'Ex. 50'}
                  />
                </SlideInCard>
              )}

              {superportName && usageLimit && (
                <SlideInCard triggerAnimation={!!usageLimit}>
                  <SuperportCreationStepBadge stepCount={'03'} />
                  <SuperportLinkedFolderCard
                    showFolderRedirectionIcon={false}
                    selectedFolder={linkedFolder}
                    title={'Link it to a folder'}
                    subtitle={
                      'All new connections formed using this Superport is automatically moved to the linked folder. These connections inherit the folder’s permissions.'
                    }
                    label={linkedFolder?.name || createdFolderName}
                    setOpenModal={setOpenLinkToFolderModal}
                  />
                </SlideInCard>
              )}
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: PortSpacing.secondary.uniform,
              paddingVertical: PortSpacing.intermediate.uniform,
            }}>
            <PrimaryButton
              disabled={
                !(
                  superportName &&
                  usageLimit &&
                  (linkedFolder || createdFolderName)
                )
              }
              primaryButtonColor="b"
              buttonText={'Create Superport'}
              onClick={createFolderAndSuperport}
              isLoading={creatingSuperport}
            />
          </View>
        </ScrollView>
        <EditName {...editNameProps} />
        <LinkToFolderBottomSheet
          createfolder={true}
          title="Link it to an folder"
          subtitle="All new connections formed using this Superport is automatically moved to the linked folder. These connections inherit the folder’s permissions."
          currentFolder={linkedFolder}
          foldersArray={allFolders}
          onClose={() => setOpenLinkToFolderModal(false)}
          setSelectedFolderData={setLinkedFolder}
          visible={openLinkToFolderModal}
          onCreateFolder={onCreateFolder}
        />
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    infoContainer: {
      paddingTop: PortSpacing.intermediate.top,
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingBottom: PortSpacing.tertiary.uniform,
      backgroundColor: colors.primary.background,
    },
  });

export default SuperportSetupScreen;
