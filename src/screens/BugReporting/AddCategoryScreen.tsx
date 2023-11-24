import React from 'react';
import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import GreyArrowRight from '../../../assets/icons/GreyArrowRight.svg';
import Chatting from '../../../assets/icons/Chatting.svg';
import Connecting from '../../../assets/icons/Connecting.svg';
import SuperPorts from '../../../assets/icons/SuperPorts.svg';
import Groups from '../../../assets/icons/Groups.svg';
import Others from '../../../assets/icons/Others.svg';

import Topbar from '../MediaView/Topbar';
import {useNavigation} from '@react-navigation/native';

export default function AddCategoryScreen() {
  const navigation = useNavigation();

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
    <View style={styles.screen}>
      <Topbar title={'Add Category'} />
      <StatusBar barStyle="dark-content" backgroundColor="#EEE" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
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
              <Text style={styles.categoryText}>{value}</Text>
              <GreyArrowRight />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
    alignItems: 'center',
  },
  container: {
    marginTop: 20,
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
    marginBottom: 15,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 15,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    width: '100%',
    paddingLeft: 10,
  },
});
