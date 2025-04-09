import React from 'react';
import {StyleSheet} from 'react-native';

import {screen} from '@components/ComponentUtils';
import Flipper from '@components/FlippingComponents/Flipper';
import Back from '@components/FlippingComponents/QR/Back';
import Front from '@components/FlippingComponents/QR/Front';
import {SafeAreaView} from '@components/SafeAreaView';

const Isolation = () => {
  const onFlipPress = () => console.log('flippedd!!');
  return (
    <SafeAreaView style={styles.screen}>
      <Flipper
        FrontElement={Front}
        onFlipPress={onFlipPress}
        BackElement={Back}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    width: screen.width,
    backgroundColor: '#F2F4F7',
  },
});

export default Isolation;
