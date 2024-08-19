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
import {getProfilePhotosOfChatsInFolder} from '@utils/Storage/connections';
import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Superport from '@assets/icons/GreySuperport.svg';
import {PhotoComponent} from './PhotoComponent';
import {folderIdToHex} from '@utils/Folders/folderIdToHex';
import {FolderInfoWithUnread} from '@utils/Storage/folders';

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
  const styles = styling(Colors);
  const [chatProfilePhotos, setChatProfilePhotos] = useState<
    (string | null | undefined)[]
  >([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setChatProfilePhotos(
          await getProfilePhotosOfChatsInFolder(folder.folderId),
        );
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const folderColor = folderIdToHex(folder.folderId, Colors.boldAccentColors);
  return (
    <Pressable
      onPress={() => {
        navigation.navigate('FolderChats', {folder: folder});
      }}>
      <SimpleCard
        style={StyleSheet.compose(styles.tile, {
          height: toggleOn ? 110 : 170,
          width: toggleOn
            ? screen.width - PortSpacing.primary.uniform
            : screen.width / 2 - 20,
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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.l}
              fontType={FontType.sb}>
              {folder.name}
            </NumberlessText>
            <ShowUnreadCount unread={folder.unread} />
          </View>
          {folder.folderId === defaultFolderId && (
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              By default, all your chats are saved to this folder.
            </NumberlessText>
          )}

          <View style={styles.row}>
            <View style={styles.rowItems}>
              <Superport />
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.l}
                fontType={FontType.sb}>
                {folder.superportCount}
              </NumberlessText>
            </View>
            {folder.connectionsCount === 0 ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('MoveToFolder', {
                    selectedFolder: folder,
                  })
                }
                style={styles.button}>
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

const styling = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: '100%',
      alignContent: 'center',
      marginTop: PortSpacing.tertiary.uniform,
    },
    tileWrapper: {
      padding: PortSpacing.medium.uniform,
      paddingLeft: 10,
      flex: 1,
      justifyContent: 'space-between',
    },
    tile: {
      overflow: 'hidden',
      padding: 0,
      paddingVertical: 0,
      marginBottom: PortSpacing.tertiary.uniform,
      marginRight: 10,
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
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 35,
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
