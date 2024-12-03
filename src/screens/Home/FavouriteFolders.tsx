import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  FolderInfoWithUnread,
  getFavouriteFoldersWithUnreadCount,
} from '@utils/Storage/folders';
import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useBottomNavContext} from 'src/context/BottomNavContext';

const FavouriteFolders = () => {
  const Colors = DynamicColors();
  const navigation = useNavigation();
  const [favoriteFolders, setFavoriteFolders] = useState<
    FolderInfoWithUnread[]
  >([]);
  const {setSelectedFolderData} = useBottomNavContext();
  const updateFavoriteFolderData = async () => {
    console.log('Updating favorite folder data');
    setFavoriteFolders(await getFavouriteFoldersWithUnreadCount());
  };
  /**
   * Every time someone returns to screen containing this component
   * we MUST update it since they may have changed settings for a folder
   */
  useFocusEffect(
    useCallback(() => {
      updateFavoriteFolderData();
    }, []),
  );

  /**
   * Every time there's a ping to redraw we MUST update this component in case things have changed
   */
  const ping: any = useSelector(state => state.ping.ping);
  useEffect(() => {
    updateFavoriteFolderData();
  }, [ping]);

  const styles = styling(Colors);
  // Filter folders by unread count > 0
  const foldersToDisplay = favoriteFolders.filter(item => item.unread > 0);
  return (
    <View style={styles.row}>
      {foldersToDisplay.map((item, index) => {
        return (
          <Pressable
            key={index}
            onPress={() => {
              setSelectedFolderData(item);
              navigation.replace('HomeTab', {
                screen: 'FolderStack',
                params: {
                  screen: 'FolderChats',
                  params: {
                    folder: item,
                  },
                },
              });
            }}>
            <View key={index} style={styles.pill}>
              <NumberlessText
                style={{
                  maxWidth: (screen.width - 50) / 3,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
                textColor={Colors.text.subtitle}
                fontType={FontType.sb}
                fontSizeType={FontSizeType.m}>
                {item.name}
              </NumberlessText>
              <View style={styles.unread}>
                <NumberlessText
                  textColor={Colors.primary.white}
                  fontType={FontType.sb}
                  fontSizeType={FontSizeType.s}>
                  {item.unread > 9 ? '9+' : item.unread}
                </NumberlessText>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    pill: {
      paddingVertical: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      borderRadius: 100,
      borderColor: colors.primary.stroke,
      borderWidth: 0.5,
      flexDirection: 'row',
      gap: 4,
    },
    row: {
      flexDirection: 'row',
      paddingHorizontal: PortSpacing.secondary.uniform,
      gap: PortSpacing.tertiary.uniform,
      flexWrap: 'wrap',
    },
    unread: {
      height: 16,
      paddingLeft: 5,
      paddingRight: 5,
      borderRadius: 100,
      alignItems: 'center',
      backgroundColor: colors.primary.accent,
    },
  });

export default FavouriteFolders;
