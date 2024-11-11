import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {AVATAR_ARRAY} from '@configs/constants';
import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import RetryIcon from '@assets/icons/Retry.svg';
import DynamicColors from '@components/DynamicColors';
import {PortBundle} from '@utils/Ports/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useTheme} from 'src/context/ThemeContext';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import QrWithLogo from '@components/Reusable/QR/QrWithLogo';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import Flipper from '@components/FlippingComponents/Flipper';
import FolderAndAccessCard from './FolderAndAccessCard';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import SimplePermissionsCard from '@components/Reusable/PermissionCards/SimplePermissionsCard';
import PencilCircleAccent from '@assets/icons/PencilCircleAccent.svg';
import CheckGreen from '@assets/icons/CheckGreen.svg';
import CrossRed from '@assets/icons/CrossRed.svg';
import {
  getFolderPermissions,
  updatePermissions,
} from '@utils/Storage/permissions';
import {updatePortData} from '@utils/Storage/myPorts';
import LinkToFolderBottomSheet from '@components/Reusable/BottomSheets/LinkToFolderBottomSheet';

const RotatingPortCard = ({
  isLoading,
  onCopyLink,
  hasFailed,
  profileUri = AVATAR_ARRAY[0],
  isCopyLinkLoading,
  title,
  qrData,
  onShareLinkClicked,
  onTryAgainClicked,
  chosenFolder,
  permissionsArray,
  setPermissionsArray,
  isLoadingLink,
  permissionsId,
  portId,
  folder,
  setFolder,
  foldersArray,
}: {
  isLoadingLink: boolean;
  isCopyLinkLoading: boolean;
  onCopyLink: () => Promise<void>;
  isLoading: boolean;
  hasFailed: boolean;
  profileUri?: string | null;
  title: string;
  qrData: PortBundle | null;
  onShareLinkClicked: () => void;
  onTryAgainClicked: () => Promise<void>;
  chosenFolder: FolderInfo;
  permissionsArray: PermissionsStrict;
  setPermissionsArray: (x: PermissionsStrict) => void;
  permissionsId?: string | null;
  portId?: string | null;
  folder: FolderInfo;
  setFolder: (x: FolderInfo) => void;
  foldersArray: FolderInfo[];
}) => {
  return (
    <Flipper
      FrontElement={props => (
        <DisplayPortCard
          isLoading={isLoading}
          isLoadingLink={isLoadingLink}
          isCopyLinkLoading={isCopyLinkLoading}
          hasFailed={hasFailed}
          title={title}
          onCopyLink={onCopyLink}
          profileUri={profileUri}
          qrData={qrData}
          onShareLinkClicked={onShareLinkClicked}
          onTryAgainClicked={onTryAgainClicked}
          flipCard={props.flipCard}
          chosenFolder={chosenFolder}
          permissionsArray={permissionsArray}
        />
      )}
      BackElement={props => (
        <EditSettings
          permissionsArray={permissionsArray}
          setPermissionsArray={setPermissionsArray}
          permissionsId={permissionsId}
          portId={portId}
          folder={folder}
          folders={foldersArray}
          setFolder={setFolder}
          flipCard={props.flipCard}
        />
      )}
    />
  );
};

const DisplayPortCard = ({
  isLoading,
  isCopyLinkLoading,
  hasFailed,
  onCopyLink,
  profileUri = AVATAR_ARRAY[0],
  title,
  qrData,
  onShareLinkClicked,
  isLoadingLink,
  onTryAgainClicked,
  flipCard,
  chosenFolder,
  permissionsArray,
}: {
  isLoadingLink: boolean;
  isCopyLinkLoading: boolean;
  onCopyLink: () => Promise<void>;
  isLoading: boolean;
  hasFailed: boolean;
  profileUri?: string | null;
  title: string;
  qrData: PortBundle | null;
  onShareLinkClicked: () => Promise<void>;
  onTryAgainClicked: () => Promise<void>;
  flipCard: () => void;
  chosenFolder: FolderInfo;
  permissionsArray: PermissionsStrict;
}) => {
  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'Eye',
      light: require('@assets/icons/BlueEye.svg').default,
      dark: require('@assets/dark/icons/BlueEye.svg').default,
    },
    {
      assetName: 'LinkIcon',
      light: require('@assets/light/icons/LinkGrey.svg').default,
      dark: require('@assets/dark/icons/LinkGrey.svg').default,
    },
    {
      assetName: 'ShareIcon',
      light: require('@assets/light/icons/ShareGrey.svg').default,
      dark: require('@assets/dark/icons/ShareGrey.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const ShareIcon = results.ShareIcon;
  const LinkIcon = results.LinkIcon;
  const {themeValue} = useTheme();
  const styles = styling(Colors);

  return (
    <SimpleCard style={styles.cardWrapper}>
      <View style={styles.contentBox}>
        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: PortSpacing.intermediate.uniform,
            marginBottom: PortSpacing.medium.uniform,
            backgroundColor:
              themeValue === 'dark'
                ? Colors.primary.accent
                : Colors.lowAccentColors.violet,
          }}>
          <NumberlessText
            textColor={
              themeValue === 'dark'
                ? Colors.primary.white
                : Colors.primary.accent
            }
            fontType={FontType.sb}
            fontSizeType={FontSizeType.s}>
            {'One-time use QR'}
          </NumberlessText>
        </View>
      </View>
      <QrWithLogo
        qrData={qrData}
        profileUri={profileUri}
        isLoading={isLoading}
        hasFailed={hasFailed}
      />
      <NumberlessText
        style={{marginTop: PortSpacing.tertiary.top}}
        fontType={FontType.md}
        textColor={Colors.text.primary}
        fontSizeType={FontSizeType.xl}>
        {title}
      </NumberlessText>
      {hasFailed && (
        <View style={styles.errorBox}>
          <NumberlessText
            style={{
              textAlign: 'center',
              color: Colors.primary.red,
              marginBottom: PortSpacing.secondary.bottom,
              paddingHorizontal: PortSpacing.tertiary.uniform,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            You've reached your offline Port limit of 10. Connect to the
            internet to generate new Ports.
          </NumberlessText>
          <SecondaryButton
            buttonText={'Try Again'}
            secondaryButtonColor={'black'}
            Icon={RetryIcon}
            iconSize={'s'}
            onClick={onTryAgainClicked}
          />
        </View>
      )}
      {!hasFailed && !isLoading && (
        <View style={styles.shareBox}>
          <NumberlessText
            style={{
              textAlign: 'center',
              marginBottom: PortSpacing.secondary.bottom,
              paddingHorizontal: PortSpacing.tertiary.uniform,
            }}
            fontType={FontType.rg}
            textColor={Colors.text.subtitle}
            fontSizeType={FontSizeType.s}>
            Show this Port or share it as a one-time {`\n`}use link to form a
            new chat.
          </NumberlessText>
          <View
            style={{
              flexDirection: 'row',
              gap: PortSpacing.medium.uniform,
              marginBottom: PortSpacing.secondary.bottom,
            }}>
            <Pressable
              disabled={isCopyLinkLoading}
              onPress={onCopyLink}
              style={{
                flexDirection: 'row',
                flex: 1,
                height: 50,
                gap: PortSpacing.tertiary.left,
                borderRadius: PortSpacing.medium.uniform,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.primary.surface2,
              }}>
              {isCopyLinkLoading ? (
                <ActivityIndicator
                  color={
                    themeValue === 'light'
                      ? Colors.primary.darkgrey
                      : Colors.text.primary
                  }
                />
              ) : (
                <LinkIcon height={20} width={20} />
              )}
              <NumberlessText
                style={{
                  textAlign: 'center',
                  color:
                    themeValue === 'light'
                      ? Colors.primary.darkgrey
                      : Colors.text.primary,
                }}
                fontType={FontType.sb}
                fontSizeType={FontSizeType.l}>
                Copy Link
              </NumberlessText>
            </Pressable>
            <Pressable
              disabled={isLoadingLink}
              onPress={onShareLinkClicked}
              style={{
                flexDirection: 'row',
                flex: 1,
                height: 50,
                gap: PortSpacing.tertiary.left,
                borderRadius: PortSpacing.medium.uniform,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.primary.surface2,
              }}>
              {isLoadingLink ? (
                <ActivityIndicator
                  color={
                    themeValue === 'light'
                      ? Colors.primary.darkgrey
                      : Colors.text.primary
                  }
                />
              ) : (
                <ShareIcon height={20} width={20} />
              )}

              <NumberlessText
                style={{
                  textAlign: 'center',
                  color:
                    themeValue === 'light'
                      ? Colors.primary.darkgrey
                      : Colors.text.primary,
                }}
                fontType={FontType.sb}
                fontSizeType={FontSizeType.l}>
                Share Link
              </NumberlessText>
            </Pressable>
          </View>
          <FolderAndAccessCard
            chosenFolder={chosenFolder}
            permissionsArray={permissionsArray}
            onEditClick={flipCard}
          />
        </View>
      )}
    </SimpleCard>
  );
};

const EditSettings = ({
  permissionsArray,
  setPermissionsArray,
  permissionsId,
  portId,
  folder,
  setFolder,
  folders,
  flipCard,
}: {
  permissionsArray: PermissionsStrict;
  setPermissionsArray: (x: PermissionsStrict) => void;
  permissionsId?: string | null;
  portId?: string | null;
  folder: FolderInfo;
  setFolder: (x: FolderInfo) => void;
  folders: FolderInfo[];
  flipCard: () => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const {themeValue} = useTheme();
  //local value of permissions
  const [permissions, setPermissions] =
    useState<PermissionsStrict>(permissionsArray);
  //local value of folder info
  const [taggedFolder, setTaggedFolder] = useState(folder);
  //opens folder selection botton sheet
  const [openLinkToFolder, setOpenLinkToFolder] = useState<boolean>(false);

  const onSave = async () => {
    if (portId && permissionsId) {
      setPermissionsArray(permissions);
      setFolder(taggedFolder);
      await updatePortData(portId, {folderId: taggedFolder.folderId});
      await updatePermissions(permissionsId, permissions);
    }
    flipCard();
  };

  const onDiscard = () => {
    setPermissions(permissionsArray);
    setTaggedFolder(folder);
    flipCard();
  };

  const onFolderEdit = () => {
    setOpenLinkToFolder(true);
  };

  useMemo(() => {
    (async () => {
      setPermissions(await getFolderPermissions(taggedFolder.folderId));
    })();
  }, [taggedFolder]);

  return (
    <SimpleCard style={styles.settingsCardWrapper}>
      <View style={{alignItems: 'flex-start'}}>
        <NumberlessText
          style={{
            paddingBottom: PortSpacing.medium.uniform,
            paddingHorizontal: PortSpacing.secondary.uniform,
          }}
          textColor={Colors.labels.text}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          Formed contact will be added to
        </NumberlessText>
        <View
          style={{
            flexDirection: 'row',
            gap: PortSpacing.tertiary.uniform,
            alignItems: 'center',
            marginHorizontal: PortSpacing.secondary.uniform,
            marginBottom: PortSpacing.secondary.uniform,
          }}>
          <Pressable
            onPress={onFolderEdit}
            style={{
              paddingVertical: PortSpacing.tertiary.uniform,
              gap: 4,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: PortSpacing.intermediate.uniform,
              backgroundColor:
                themeValue === 'dark'
                  ? Colors.primary.accent
                  : Colors.lowAccentColors.violet,
            }}>
            <NumberlessText
              textColor={
                themeValue === 'dark'
                  ? Colors.primary.white
                  : Colors.primary.accent
              }
              fontType={FontType.sb}
              fontSizeType={FontSizeType.s}>
              {taggedFolder.name}
            </NumberlessText>
            <PencilCircleAccent />
          </Pressable>
          <NumberlessText
            textColor={Colors.text.subtitle}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.s}>
            Tap to edit
          </NumberlessText>
        </View>
      </View>
      <SimplePermissionsCard
        permissions={permissions}
        setPermissions={setPermissions}
      />
      <View
        style={{
          marginTop: PortSpacing.medium.top,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: PortSpacing.tertiary.uniform,
        }}>
        <TouchableOpacity
          onPress={onSave}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
            width: 40,
            borderRadius: 40,
            borderWidth: 0.5,
            borderColor: Colors.boldAccentColors.darkGreen,
            backgroundColor: Colors.lowAccentColors.darkGreen,
          }}>
          <CheckGreen width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDiscard}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
            width: 40,
            borderRadius: 40,
            borderWidth: 0.5,
            borderColor: Colors.boldAccentColors.brightRed,
            backgroundColor: Colors.lowAccentColors.brightRed,
          }}>
          <CrossRed width={20} height={20} />
        </TouchableOpacity>
      </View>
      <LinkToFolderBottomSheet
        title="Link it to an existing folder"
        subtitle="When you move a chat to a chat folder, its initial settings will be
        inherited from the settings set for the folder."
        currentFolder={taggedFolder}
        foldersArray={folders}
        onClose={() => setOpenLinkToFolder(false)}
        setSelectedFolderData={setTaggedFolder}
        visible={openLinkToFolder}
      />
    </SimpleCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    cardWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: PortSpacing.secondary.uniform, //overrides simple card default padding
      paddingHorizontal: PortSpacing.secondary.uniform,
      width: '100%',
      borderWidth: 0.5,
      borderColor: color.primary.stroke,
    },
    contentBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginBottom: PortSpacing.secondary.bottom,
    },
    errorBox: {
      width: '100%',
      marginTop: PortSpacing.secondary.uniform,
    },
    shareBox: {
      width: '100%',
      marginTop: PortSpacing.tertiary.uniform,
    },
    settingsCardWrapper: {
      paddingVertical: PortSpacing.secondary.uniform, //overrides simple card default padding
      width: '100%',
      borderWidth: 0.5,
      borderColor: color.primary.stroke,
    },
  });

export default RotatingPortCard;
