import React, {useState, useEffect, FC} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import emoji from 'emoji-datasource';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import SimpleCard from '../Cards/SimpleCard';
import {EmojiCategories} from '@configs/emojiCategories';
import BasicSearchBar from '../TopBars/BasicSearchBar';
import {wait} from '@utils/Time';
import {SvgProps} from 'react-native-svg';
import DynamicColors from '@components/DynamicColors';

interface Emoji {
  unified: string;
  short_names: string[];
}

interface TabBarProps {
  currentCategory: {symbol: FC<SvgProps> | null; name: string};
  activeCategory: {symbol: FC<SvgProps> | null; name: string};
  onPress: (category: {symbol: FC<SvgProps> | null; name: string}) => void;
}

interface EmojiCellProps {
  emoji: Emoji;
  onPress: () => void;
}

interface EmojiSelectorProps {
  theme?: string;
  isEmojiSelectorVisible: boolean;
  setIsEmojiSelectorVisible: (x: boolean) => void;
  onEmojiSelected: (emoji: string) => void;
  shouldInclude?: (emoji: Emoji) => boolean;
}

const Categories = EmojiCategories;

const charFromUtf16 = (utf16: string): string =>
  String.fromCodePoint(...utf16.split('-').map(u => '0x' + u));
const charFromEmojiObject = (obj: Emoji): string => charFromUtf16(obj.unified);
const filteredEmojis = emoji.filter(e => !e.obsoleted_by);
const emojiByCategory = (category: string) =>
  filteredEmojis.filter(e => e.category === category);
const sortEmoji = (list: Emoji[]) =>
  list.sort((a, b) => a.sort_order - b.sort_order);
const categoryKeys = Object.keys(Categories);

const TabBar: React.FC<TabBarProps> = ({
  currentCategory,
  activeCategory,
  onPress,
}) => {
  const SymbolComponent = currentCategory.symbol;

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <TouchableOpacity
      onPress={() => onPress(currentCategory)}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={StyleSheet.compose(styles.categorySymbol, {
          backgroundColor:
            activeCategory === currentCategory
              ? Colors.primary.lightgrey
              : 'transparent',
        })}>
        <SymbolComponent height={FontSizeType.es} width={FontSizeType.es} />
      </View>
    </TouchableOpacity>
  );
};

const EmojiCell: React.FC<EmojiCellProps> = ({emoji, onPress}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={styles.emojiCellWrapper}
      onPress={onPress}>
      <NumberlessText
        allowFontScaling={false}
        fontSizeType={FontSizeType.es}
        fontType={FontType.rg}>
        {charFromEmojiObject(emoji)}
      </NumberlessText>
    </TouchableOpacity>
  );
};

const storage_key = '@react-native-emoji-selector:HISTORY';

const EmojiSelector: React.FC<EmojiSelectorProps> = ({
  theme = '#007AFF',
  onEmojiSelected,
  shouldInclude,
  isEmojiSelectorVisible = false,
  setIsEmojiSelectorVisible,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(Categories.history);
  const [isReady, setIsReady] = useState(false);
  const [history, setHistory] = useState<Emoji[]>([]);
  const [emojiList, setEmojiList] = useState<{[key: string]: Emoji[]} | null>(
    null,
  );

  const handleTabSelect = (selectedCategory: {
    symbol: FC<SvgProps> | null;
    name: string;
  }) => {
    if (isReady) {
      setSearchQuery('');
      setCategory(selectedCategory);
    }
  };

  const handleEmojiSelect = async (emoji: Emoji) => {
    setIsEmojiSelectorVisible(false);
    await wait(1000);

    addToHistoryAsync(emoji);

    onEmojiSelected(charFromEmojiObject(emoji));
  };

  const addToHistoryAsync = async (emoji: Emoji) => {
    let historyData = await AsyncStorage.getItem(storage_key);

    let value = [];
    if (!historyData) {
      let record = {...emoji, count: 1};
      value.push(record);
    } else {
      let json = JSON.parse(historyData);
      let existingIndex = json.findIndex(
        (r: Emoji) => r.unified === emoji.unified,
      );
      if (existingIndex !== -1) {
        // Remove the existing emoji from its current position
        json.splice(existingIndex, 1);
      }
      // Add the emoji to the beginning of the history array
      let record = {...emoji, count: 1};
      value = [record, ...json];
    }

    AsyncStorage.setItem(storage_key, JSON.stringify(value));
    setHistory(value);
  };

  const loadHistoryAsync = async () => {
    let result = await AsyncStorage.getItem(storage_key);
    if (result) {
      let historyData = JSON.parse(result);
      setHistory(historyData);
    }
  };

  const returnSectionData = () => {
    let emojiData = (() => {
      if (category === Categories.all && searchQuery === '') {
        let largeList: Emoji[] = [];
        categoryKeys.forEach(c => {
          const name = Categories[c].name;
          const list =
            name === Categories.history.name
              ? history
              : emojiList && emojiList[name];
          if (c !== 'all' && c !== 'history') {
            largeList = largeList.concat(list || []);
          }
        });

        return largeList.map(emoji => ({key: emoji.unified, emoji}));
      } else {
        let list;
        const hasSearchQuery = searchQuery !== '';
        const name = category.name;
        if (hasSearchQuery) {
          const filtered = emoji.filter(e => {
            let display = false;
            e.short_names.forEach(name => {
              if (name.includes(searchQuery.toLowerCase())) {
                display = true;
              }
            });
            return display;
          });
          list = sortEmoji(filtered);
        } else if (name === Categories.history.name) {
          list = history.slice(0, 36);
        } else {
          list = emojiList && emojiList[name];
        }
        return list ? list.map(emoji => ({key: emoji.unified, emoji})) : [];
      }
    })();

    return shouldInclude
      ? emojiData.filter(e => shouldInclude(e.emoji))
      : emojiData;
  };

  //find number of columns possible
  function calculateColumns() {
    return Math.floor((screen.width - 4 * PortSpacing.secondary.uniform) / 40);
  }

  const prerenderEmojis = () => {
    let emojis: {[key: string]: Emoji[]} = {};
    categoryKeys.forEach(c => {
      let name = Categories[c].name;
      emojis[name] = sortEmoji(emojiByCategory(name));
    });

    setEmojiList(emojis);
    setIsReady(true);
  };

  useEffect(() => {
    loadHistoryAsync();

    prerenderEmojis();
  }, []);

  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const title = searchQuery !== '' ? 'Search Results' : category.name;
  const isListCenterAligned = calculateColumns() > returnSectionData().length;

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <PrimaryBottomSheet
      avoidKeyboard={true}
      bgColor="g"
      showNotch={true}
      showClose={false}
      showLoaderIconLeft={false}
      visible={isEmojiSelectorVisible}
      onClose={() => setIsEmojiSelectorVisible(false)}>
      <View style={styles.mainContainer}>
        <View
          style={{
            marginBottom: PortSpacing.secondary.bottom,
          }}>
          <BasicSearchBar
            onFocus={() => setIsInputFocused(p => !p)}
            bgColor="w"
            autofocus={false}
            searchText={searchQuery}
            setSearchText={setSearchQuery}
          />
        </View>

        {isReady ? (
          <SimpleCard
            style={StyleSheet.compose(styles.cardContainer, {
              height: isInputFocused ? 120 : 260,
            })}>
            <View style={styles.container}>
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.rg}
                textColor={Colors.text.primary}
                style={styles.sectionHeader}>
                {title}
              </NumberlessText>

              <FlatList
                contentContainerStyle={StyleSheet.compose(
                  styles.emojiContainer,
                  {
                    width: isListCenterAligned ? '100%' : 'auto',
                  },
                )}
                data={returnSectionData()}
                renderItem={({item}) => {
                  return (
                    <EmojiCell
                      emoji={item.emoji}
                      onPress={() => handleEmojiSelect(item.emoji)}
                    />
                  );
                }}
                horizontal={false}
                numColumns={calculateColumns()}
                keyboardShouldPersistTaps={'always'}
              />
            </View>
          </SimpleCard>
        ) : (
          <View style={styles.loader}>
            <ActivityIndicator
              size={'large'}
              color={Platform.OS === 'android' ? theme : '#000000'}
            />
          </View>
        )}

        <View style={styles.tabBar}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={categoryKeys.filter(c => c !== 'all')}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            horizontal={true}
            renderItem={({item}) => (
              <TabBar
                currentCategory={Categories[item]}
                activeCategory={category}
                onPress={handleTabSelect}
              />
            )}
          />
        </View>
      </View>
    </PrimaryBottomSheet>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flexDirection: 'column',
      width: '100%',
      marginTop: PortSpacing.intermediate.top,
      ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
    },
    cardContainer: {
      backgroundColor: colors.primary.surface,
      marginBottom: 10,
      paddingBottom: 40,
      overflow: 'hidden',
    },
    emojiContainer: {
      gap: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.tertiary.uniform,
      alignSelf: 'center',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      padding: PortSpacing.tertiary.uniform,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      borderRadius: PortSpacing.secondary.uniform,
    },
    categorySymbol: {
      textAlign: 'center',
      padding: 4,
      marginRight: 4,
      borderRadius: PortSpacing.tertiary.uniform,
    },

    loader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollview: {
      flex: 1,
    },
    search: {
      ...(isIOS && {
        height: 36,
        paddingLeft: PortSpacing.tertiary.left,
        borderRadius: 10,
        backgroundColor: '#E5E8E9',
      }),
      margin: PortSpacing.tertiary.uniform,
    },
    container: {
      flex: 1,
      flexWrap: 'wrap',
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    emojiCellWrapper: {
      width: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionHeader: {
      margin: PortSpacing.tertiary.uniform,
      width: '100%',
    },
  });

export default EmojiSelector;
