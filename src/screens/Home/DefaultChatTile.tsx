/**
 * Default chat tile displayed when there are no connections
 */
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import DefaultImage from '../../../assets/avatars/avatar.png';
import {NumberlessItalicText} from '../../components/NumberlessText';

function DefaultChatTile() {
  const navigation = useNavigation();
  const handleNavigate = () => {
    navigation.navigate('ConnectionCentre');
  };
  return (
    <Pressable style={styles.defaultTileContainer} onPress={handleNavigate}>
      <Image
        source={{uri: Image.resolveAssetSource(DefaultImage).uri}}
        style={styles.picture}
      />
      <NumberlessItalicText style={styles.defaultTileText}>
        Click here to add a new contact
      </NumberlessItalicText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    flex: 1,
    marginTop: 7,
    borderRadius: 14,
    shadowOpacity: 13,
    shadowOffset: {
      width: 14,
      height: 8,
    },
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 15,
  },
  picture: {
    width: 50,
    height: 50,
    borderRadius: 17,
    opacity: 0.3,
  },
  defaultTileText: {
    color: '#A1A1A1',
  },
  newIcon: {
    width: 50,
    height: 50,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
});

export default DefaultChatTile;
