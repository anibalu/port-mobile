import Chatting from '@assets/icons/Chatting.svg';
import Connecting from '@assets/icons/Connecting.svg';
import GreyArrowRight from '@assets/icons/GreyArrowRight.svg';
import Groups from '@assets/icons/Groups.svg';
import Others from '@assets/icons/Others.svg';
import SuperPorts from '@assets/icons/SuperPorts.svg';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from '@components/SafeAreaView';
import {FontSizes} from '@components/ComponentUtils';
import {NumberlessRegularText} from '@components/NumberlessText';

type Props = NativeStackScreenProps<AppStackParamList, 'AddCategoryScreen'>;

export default function AddCategoryScreen({navigation}: Props) {
  const categories = [
    {
      index: 1,
      value: 'Chatting',
      Img: Chatting,
      subCategory: [
        {index: '1', content: 'Call/Video chatting'},
        {index: '2', content: 'Contact Sharing'},
        {index: '3', content: 'Voice Messages'},
        {index: '4', content: 'Replying to messages'},
        {index: '5', content: 'Message Permissions'},
        {index: '6', content: 'Sharing Media/Docs/Links'},
        {index: '7', content: 'Forwarding messages'},
      ],
    },
    {
      index: 2,
      value: 'Connecting',
      Img: Connecting,
      subCategory: [
        {index: '1', content: 'Showing a QR code'},
        {index: '2', content: 'Scanning a QR code'},
        {index: '3', content: 'Sending a link'},
        {index: '4', content: 'Clicking a link'},
        {index: '5', content: 'NFC Issues'},
      ],
    },
    {
      index: 3,
      value: 'Superports',
      Img: SuperPorts,
      subCategory: [
        {index: '1', content: 'Creating a superport'},
        {index: '2', content: 'Using a superport'},
        {index: '3', content: 'Deleting a superport'},
      ],
    },
    {
      index: 4,
      value: 'Groups',
      Img: Groups,
      subCategory: [
        {index: '1', content: 'Creating a group'},
        {index: '2', content: 'Joining a group'},
        {index: '3', content: 'Inviting to a group'},
        {index: '4', content: 'Messaging a group'},
        {index: '5', content: 'Leaving a group'},
      ],
    },
    {
      index: 5,
      value: 'Others',
      Img: Others,
      subCategory: [{index: '1', content: 'Others'}],
    },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <GenericTopBar
        titleStyle={{...FontSizes[17].medium}}
        title={'Add Category '}
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <View style={styles.container}>
        {categories.map(category => {
          const {value, Img, subCategory} = category;
          return (
            <Pressable
              style={styles.category}
              onPress={() =>
                navigation.navigate('ReportIssueScreen', {
                  category: value,
                  sections: subCategory,
                  Img: Img,
                })
              }
              key={category.index}>
              <Img style={{marginLeft: 10}} />
              <NumberlessRegularText style={styles.categoryText}>
                {value}
              </NumberlessRegularText>
              <GreyArrowRight />
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  container: {
    marginTop: 10,
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#0000000D',
    opacity: 0.5,
    overflow: 'hidden',
  },
  category: {
    width: '70%',
    height: 70,
    borderRadius: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 15,
  },
  categoryText: {
    color: 'black',
    width: '100%',
    paddingLeft: 10,
  },
});
