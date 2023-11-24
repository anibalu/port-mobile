import GenericTopBar from '@components/GenericTopBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Image, SafeAreaView, StyleSheet, View} from 'react-native';

type Props = NativeStackScreenProps<AppStackParamList, 'ImageView'>;

export default function ImageView({navigation, route}: Props) {
  const {imageURI, title} = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <GenericTopBar
        title={title}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
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
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
