import React, {useMemo, useState, useRef, useEffect, useCallback} from 'react';
import {Animated, Easing, Pressable, StyleSheet, View} from 'react-native';
import DynamicColors from '@components/DynamicColors';
import SearchBar from '@components/SearchBar';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  FolderInfoWithUnread,
  getAllFoldersWithUnreadCount,
} from '@utils/Storage/folders';
import CardView from './CardView';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import BackTopbarWithButton from '@components/Reusable/TopBars/BackTopBarWithButton';
import {useBottomNavContext} from 'src/context/BottomNavContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'src/context/ThemeContext';
import {useSelector} from 'react-redux';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

const Folders = () => {
  const ping: any = useSelector(state => state.ping.ping);
  const {folders, setFolders, setSelectedFolderData} = useBottomNavContext();
  const [viewableFolders, setViewableFolders] = useState<
    FolderInfoWithUnread[]
  >([]);
  const [toggleOn, setToggleOn] = useState(false);
  const [searchText, setSearchText] = useState('');

  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'PlusIcon',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
    {
      assetName: 'List',
      light: require('@assets/light/icons/List.svg').default,
      dark: require('@assets/dark/icons/List.svg').default,
    },
    {
      assetName: 'Card',
      light: require('@assets/light/icons/Card.svg').default,
      dark: require('@assets/dark/icons/Card.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const PlusIcon = results.PlusIcon;
  const Card = results.Card;
  const List = results.List;

  const translateXAnim = useRef(new Animated.Value(0)).current;

  const toggleSwitch = () => {
    setToggleOn(prevToggleOn => !prevToggleOn);
    Animated.timing(translateXAnim, {
      toValue: toggleOn ? 0 : 25, // Adjust the value according to the width of your toggle
      duration: 150, // Duration of the animation in milliseconds
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  };

  const {themeValue} = useTheme();

  useEffect(() => {
    (async () => {
      const folders = await getAllFoldersWithUnreadCount();
      setFolders(folders);
      setViewableFolders(folders);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping]);

  useMemo(() => {
    const filteredData = folders.filter(item => {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
    });
    setViewableFolders(filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setSelectedFolderData(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  return (
    <View
      style={{
        backgroundColor: Colors.primary.surface,
        width: screen.width,
        height: isIOS ? screen.height : screen.height + insets.top,
      }}>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView>
        <View style={styles.topRegion}>
          <BackTopbarWithButton
            onButtonPress={() => navigation.navigate('CreateFolder', {})}
            title="Folders"
            bgColor="w"
            buttonName={'Create'}
            Icon={PlusIcon}
          />
          <View style={styles.barWrapper}>
            <SearchBar
              style={styles.search}
              searchText={searchText}
              setSearchText={setSearchText}
              placeholder={'Search for folders'}
            />
          </View>
        </View>
        {viewableFolders.length > 0 ? (
          <View style={styles.container}>
            <Pressable
              onPress={toggleSwitch}
              style={StyleSheet.compose(styles.toggle, {
                borderColor:
                  themeValue === 'light'
                    ? Colors.primary.white
                    : Colors.primary.surface2,
                backgroundColor:
                  themeValue === 'light'
                    ? Colors.primary.stroke
                    : Colors.primary.surface,
              })}>
              <Animated.View
                style={{
                  transform: [{translateX: translateXAnim}],
                }}>
                {toggleOn ? (
                  <List height={24} width={24} />
                ) : (
                  <Card height={24} width={24} />
                )}
              </Animated.View>
            </Pressable>
            <CardView toggleOn={toggleOn} folders={viewableFolders} />
          </View>
        ) : (
          <View
            style={{
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              No matching folders found
            </NumberlessText>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.primary.background,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: PortSpacing.secondary.uniform,
      flex: 1,
    },
    barWrapper: {
      paddingHorizontal: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: PortSpacing.tertiary.bottom,
    },
    topRegion: {
      backgroundColor: colors.primary.surface,
    },
    search: {
      backgroundColor: colors.primary.surface2,
      width: '100%',
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: PortSpacing.tertiary.uniform,
    },
    toggle: {
      borderRadius: PortSpacing.secondary.uniform,
      borderWidth: 1.5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      alignSelf: 'flex-start',
      width: 55,
      marginTop: 16,
      padding: 2,
    },
  });

export default Folders;
