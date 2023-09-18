import {useRoute} from '@react-navigation/native';
import React from 'react';
import {SafeAreaView, View, Image, StyleSheet} from 'react-native';
import Topbar from './Topbar';

export default function ImageView() {
  const route = useRoute();
  const {imageURI, title} = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <Topbar title={title} />
      {/* The image itself */}
      <View style={styles.imageContainer}>
        <Image source={{uri: imageURI}} style={styles.image} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
    flexDirection: 'column',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
    //paddingTop: 51,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
