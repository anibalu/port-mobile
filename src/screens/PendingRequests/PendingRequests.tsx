import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import ContactCard from './ContactCard';
import {FlatList} from 'react-native';

const PendingRequests = () => {
  const navigation = useNavigation();
  const exampleProps = [
    {
      name: 'Contact Name',
      date: '14/12/2023',
      pendingStatus: 'Pending authentication',
      expiry: 'Expires in 6h',
      chatStatus: 'Initiated',
      isGroup: false,
    },
    {
      name: 'Contact Name',
      date: '14/12/2023',
      pendingStatus: 'Pending authentication',
      expiry: 'Expires in 1h',
      chatStatus: 'Scanned',
      isGroup: false,
    },
    {
      name: 'Contact Name',
      date: '14/12/2023',
      pendingStatus: 'Pending authentication',
      expiry: 'Expires in 1h',
      chatStatus: 'Scanned',
      isGroup: false,
    },
    {
      name: 'Contact Name',
      date: '14/12/2023',
      pendingStatus: 'Pending authentication',
      expiry: 'Expires in 1h',
      chatStatus: 'Scanned',
      isGroup: true,
    },
  ];

  const onDelete = () => console.log('delete comeshere');

  const renderItem = ({item, index}) => (
    <ContactCard contactProps={item} key={index} onDelete={onDelete} />
  );
  return (
    <SafeAreaView>
      <ChatBackground />
      <GenericTopBar
        onBackPress={() => navigation.goBack()}
        title="Pending Requests"
      />
      <FlatList
        style={{width: '100%'}}
        contentContainerStyle={{marginTop: 12}}
        data={exampleProps}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        keyExtractor={item => item.index}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

export default PendingRequests;
