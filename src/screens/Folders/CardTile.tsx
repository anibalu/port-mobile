import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import {defaultFolderId} from '@configs/constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  countOfConnections,
  getProfilePhotosOfChatsInFolder,
} from '@utils/Storage/connections';
import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {PhotoComponent} from './PhotoComponent';
import {folderIdToHex} from '@utils/Folders/folderIdToHex';
import {FolderInfoWithUnread} from '@utils/Storage/folders';
import {useBottomNavContext} from 'src/context/BottomNavContext';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

//Converts the new message count to a display string, with '999+' for counts over 999.
function displayNumber(unread: number): string {
  if (unread > 999) {
    return '999+';
  }
  return unread.toString();
}

function ShowUnreadCount({unread}: {unread: number}) {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  if (unread > 0) {
    return (
      <View style={styles.statusWrapper}>
        <View style={styles.new}>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={PortColors.text.primaryWhite}
            numberOfLines={1}
            allowFontScaling={false}>
            {displayNumber(unread)}
          </NumberlessText>
        </View>
      </View>
    );
  } else {
    return <View style={styles.emptyView} />;
  }
}

const CardTile = ({
  folder,
  toggleOn,
}: {
  folder: FolderInfoWithUnread;
  toggleOn: boolean;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors, toggleOn);
  const [chatProfilePhotos, setChatProfilePhotos] = useState<
    (string | null | undefined)[]
  >([]);
  const navigation = useNavigation();
  const [connectionsCount, setConnectionsCount] = useState(0);
  const {setSelectedFolderData} = useBottomNavContext();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setConnectionsCount(await countOfConnections());
        setChatProfilePhotos(
          await getProfilePhotosOfChatsInFolder(folder.folderId),
        );
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const svgArray = [
    {
      assetName: 'Superport',
      light: require('@assets/light/icons/Superport.svg').default,
      dark: require('@assets/dark/icons/Superport.svg').default,
    },
    {
      assetName: 'GreyChat',
      light: require('@assets/light/icons/GreyChat.svg').default,
      dark: require('@assets/dark/icons/GreyChat.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const GreyChat = results.GreyChat;
  const Superport = results.Superport;

  const folderColor = folderIdToHex(folder.folderId, Colors.boldAccentColors);

  const onClickAddChats = () => {
    if (connectionsCount === 0) {
      setSelectedFolderData(folder);
      navigation.push('FolderStack', {
        screen: 'NoConnectionsScreen',
      });
    } else {
      navigation.push('MoveToFolder', {
        selectedFolder: folder,
      });
    }
  };
  return (
    <Pressable
      onPress={() => {
        navigation.push('FolderChats', {folder: folder});
      }}>
      <SimpleCard
        style={StyleSheet.compose(styles.tile, {
          height: toggleOn ? 127 : 180,
          width: toggleOn
            ? screen.width - PortSpacing.primary.uniform
            : screen.width / 2 - PortSpacing.intermediate.uniform,
        })}>
        <View
          style={StyleSheet.compose(
            styles.tileWrapper,
            folder.folderId !== defaultFolderId && {
              borderLeftWidth: 6,
              borderLeftColor: folderColor,
            },
          )}>
          <View
            style={
              !toggleOn
                ? {
                    gap: 5,
                  }
                : {
                    gap: 5,
                    flex: 1,
                  }
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <NumberlessText
                style={{flex: 1}}
                numberOfLines={2}
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.l}
                fontType={FontType.sb}>
                {folder.name}
              </NumberlessText>
              {!toggleOn && <ShowUnreadCount unread={folder.unread} />}
            </View>
            <View style={styles.rowItems}>
              <Superport width={12} height={12} />
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                {folder.superportCount} linked superports
              </NumberlessText>
            </View>
            <View style={styles.rowItems}>
              <GreyChat width={12} height={12} />
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                {folder.connectionsCount} chats
              </NumberlessText>
            </View>
            {folder.folderId === defaultFolderId && (
              <NumberlessText
                style={toggleOn && {flex: 1}}
                ellipsizeMode="tail"
                numberOfLines={toggleOn ? 2 : 3}
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                By default, all your chats are saved to this folder.
              </NumberlessText>
            )}
          </View>
          <View
            style={StyleSheet.compose(
              styles.row,
              toggleOn && {
                flexDirection: 'column',
                justifyContent: 'space-between',
              },
            )}>
            {toggleOn && <ShowUnreadCount unread={folder.unread} />}
            {folder.connectionsCount === 0 ? (
              <Pressable onPress={onClickAddChats} style={styles.button}>
                <NumberlessText
                  textColor={Colors.primary.white}
                  fontType={FontType.md}
                  fontSizeType={FontSizeType.s}>
                  + Add Chats
                </NumberlessText>
              </Pressable>
            ) : (
              <PhotoComponent
                photos={chatProfilePhotos}
                connectionsCount={folder.connectionsCount}
              />
            )}
          </View>
        </View>
      </SimpleCard>
    </Pressable>
  );
};

const styling = (colors: any, toggleOn: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: '100%',
      alignContent: 'center',
      marginTop: PortSpacing.tertiary.uniform,
    },
    tileWrapper: {
      gap: 5,
      flex: 1,
      paddingVertical: PortSpacing.medium.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingLeft: 10,
      justifyContent: 'space-between',
      flexDirection: toggleOn ? 'row' : 'column',
    },
    tile: {
      overflow: 'hidden',
      padding: 0,
      paddingVertical: 0,
      marginBottom: PortSpacing.tertiary.uniform,
      marginRight: 10,
      borderColor: colors.primary.stroke,
      borderWidth: 0.5,
    },
    button: {
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: colors.button.black,
      height: 35,
      justifyContent: 'center',
      paddingHorizontal: PortSpacing.tertiary.uniform,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    rowItems: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    new: {
      backgroundColor: colors.primary.accent,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      minWidth: 20,
    },
    statusWrapper: {
      paddingLeft: PortSpacing.tertiary.left,
    },
    emptyView: {
      height: 20,
      paddingLeft: PortSpacing.tertiary.left,
    },
  });
export default CardTile;
