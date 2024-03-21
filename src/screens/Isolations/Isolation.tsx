import {SafeAreaView} from '@components/SafeAreaView';
import React from 'react';
import {StyleSheet} from 'react-native';

import {screen} from '@components/ComponentUtils';
import FolderPlaceholderQuickActions from '@screens/Home/FolderPlaceholderQuickActions';

const Isolation = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <FolderPlaceholderQuickActions />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    width: screen.width,
    backgroundColor: '#F2F4F7',
  },
});

export default Isolation;
