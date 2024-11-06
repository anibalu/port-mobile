import {PortSpacing} from '@components/ComponentUtils';
import React, {useMemo, useState, useEffect} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import CardTile from './CardTile';
import {FolderInfoWithUnread} from '@utils/Storage/folders';
import FolderCardSkeletonTile from './FolderCardSkeletonTile';

const CardView = ({
  folders,
  toggleOn,
}: {
  folders: FolderInfoWithUnread[];
  toggleOn: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const renderFolderTile = (item: FolderInfoWithUnread) => {
    return <CardTile toggleOn={toggleOn} folder={item} />;
  };

  const numColumns = toggleOn ? 1 : 2; // Adjust columns based on toggleOn state
  const listKey = toggleOn ? 'listView' : 'gridView'; // Change key to force re-render

  const sortedFolders = useMemo(() => {
    const defaultObject = folders.find(item => item.name === 'Default');
    const nonDefaultFolders = folders
      .filter(item => item.name !== 'Default')
      .sort((a, b) => b.unread - a.unread);

    if (defaultObject) {
      nonDefaultFolders.unshift(defaultObject);
    }

    return nonDefaultFolders;
  }, [folders]);

  useEffect(() => {
    if (folders.length > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [folders]);

  return (
    <View style={styles.screen}>
      <FlatList
        key={listKey}
        data={isLoading ? [] : sortedFolders} // Show folder skeleton state if loading
        contentContainerStyle={{
          flexDirection: 'column',
        }}
        showsVerticalScrollIndicator={sortedFolders.length > 0}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={sortedFolders.length > 0}
        numColumns={numColumns}
        keyExtractor={folder => folder.folderId}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.placeholderWrapper}>
              {Array.from({length: 6}).map((_, index) => (
                <FolderCardSkeletonTile key={index} toggleOn={toggleOn} />
              ))}
            </View>
          ) : null
        }
        renderItem={item => renderFolderTile(item.item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    alignContent: 'center',
    marginTop: PortSpacing.tertiary.uniform,
  },
  placeholderWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default CardView;
