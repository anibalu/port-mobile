import {PortSpacing} from '@components/ComponentUtils';
import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import CardTile from './CardTile';
import {FolderInfoWithUnread} from '@utils/Storage/folders';

const CardView = ({
  folders,
  toggleOn,
}: {
  folders: FolderInfoWithUnread[];
  toggleOn: boolean;
}) => {
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

  return (
    <View style={styles.screen}>
      <FlatList
        key={listKey}
        data={sortedFolders}
        contentContainerStyle={{
          flexDirection: 'column',
        }}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        numColumns={numColumns}
        keyExtractor={folder => folder.folderId}
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
});

export default CardView;
