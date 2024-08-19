/**
 * Default chat tile displayed when there are no connections
 */
import {PortSpacing, screen} from '@components/ComponentUtils';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import FolderPlaceholderQuickActions from './FolderPlaceholderQuickActions';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';

function FolderScreenPlaceholder({
  name,
  profilePicAttr,
  selectedFolderData,
}: {
  name: string;
  profilePicAttr: FileAttributes;
  selectedFolderData: FolderInfo;
}): ReactNode {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.headingWrapper}>
        <FolderPlaceholderQuickActions
          selectedFolder={selectedFolderData}
          name={name}
          avatar={profilePicAttr}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: screen.height / 2,
    flexDirection: 'column',
    marginTop: PortSpacing.primary.top,
    justifyContent: 'flex-end',
    flex: 1,
  },
  headingWrapper: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: PortSpacing.primary.bottom,
  },
});

export default FolderScreenPlaceholder;
