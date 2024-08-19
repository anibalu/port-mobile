import {PortSpacing} from '@components/ComponentUtils';
import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import CardTile from './CardTile';
import {BOTTOMBAR_HEIGHT} from '@configs/constants';
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

  return (
    <View style={styles.screen}>
      <FlatList
        key={listKey} // Dynamically changing the key
        data={folders}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        numColumns={numColumns} // Using numColumns to create a grid
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
    marginBottom: BOTTOMBAR_HEIGHT,
  },
});

export default CardView;
