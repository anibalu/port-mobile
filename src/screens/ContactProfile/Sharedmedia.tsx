import ChatBackground from '@components/ChatBackground';
import {GenericButton} from '@components/GenericButton';
import GenericTopBar from '@components/GenericTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ViewPhotosVideos from './ViewPhotosVideos';
import ViewFiles from './ViewFiles';
import {PortColors} from '@components/ComponentUtils';
import {FontSizeType} from '@components/NumberlessText';
type Props = NativeStackScreenProps<AppStackParamList, 'SharedMedia'>;

const SharedMedia = ({navigation, route}: Props) => {
  const {chatId} = route.params;
  const [selectedItem, setSelectedItem] = useState('ViewPhotosVideos');
  const isSelected = (item: string) => selectedItem === item;

  const getButtonStyle = (item: string) =>
    isSelected(item) ? styles.buttonactive : styles.buttoninactive;

  const getTextStyle = (item: string) =>
    isSelected(item) ? styles.buttonactivetext : styles.buttoninactivetext;
  return (
    <SafeAreaView>
      <ChatBackground />
      <GenericTopBar
        onBackPress={() => navigation.goBack()}
        title="Shared Media"
      />
      <View style={styles.tabcontainer}>
        <GenericButton
          buttonStyle={getButtonStyle('ViewPhotosVideos')}
          textStyle={getTextStyle('ViewPhotosVideos')}
          onPress={() => setSelectedItem('ViewPhotosVideos')}>
          Gallery
        </GenericButton>
        <GenericButton
          buttonStyle={getButtonStyle('ViewFiles')}
          textStyle={getTextStyle('ViewFiles')}
          onPress={() => setSelectedItem('ViewFiles')}>
          Files
        </GenericButton>
      </View>
      {selectedItem === 'ViewPhotosVideos' ? (
        <ViewPhotosVideos chatId={chatId} />
      ) : (
        <ViewFiles chatId={chatId} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabcontainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  buttonactive: {
    backgroundColor: PortColors.primary.blue.app,
    borderRadius: 8,
    width: '48%',
  },
  buttonactivetext: {
    color: PortColors.text.primaryWhite,
    fontWeight: '400',
    fontSize: FontSizeType.m,
  },
  buttoninactive: {
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 8,
    width: '48%',
  },
  buttoninactivetext: {
    color: PortColors.text.secondary,
    fontWeight: '400',
    fontSize: FontSizeType.m,
  },
});
export default SharedMedia;
