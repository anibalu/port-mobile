import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {useNavigation} from '@react-navigation/native';
import React, {ReactElement, useEffect, useState} from 'react';
import ContactCard from './ContactCard';
import {FlatList, View} from 'react-native';
import {useSelector} from 'react-redux';
import {PendingCardInfo} from '@utils/Ports/interfaces';
import {getPendingRequests, numberOfPendingRequests} from '@utils/Ports';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

//rendered chat tile of a connection
function renderPendingRequest(pendingRequest: PendingCardInfo): ReactElement {
  return <ContactCard {...pendingRequest} />;
}

const PendingRequests = () => {
  const navigation = useNavigation();
  const reloadTrigger = useSelector(
    state => state.triggerPendingRequestsReload.change,
  );
  const [pendingRequests, setPendingRequests] = useState<PendingCardInfo[]>([]);
  const [pendingRequestsLength, setPendingRequestsLength] = useState(0);
  useEffect(() => {
    (async () => {
      setPendingRequests(await getPendingRequests());
      setPendingRequestsLength(await numberOfPendingRequests());
    })();
  }, [reloadTrigger]);
  return (
    <SafeAreaView>
      <ChatBackground />
      <GenericTopBar
        onBackPress={() => navigation.goBack()}
        title={`Pending Requests (${pendingRequestsLength})`}
      />
      {pendingRequests.length > 0 ? (
        <FlatList
          style={{
            width: '100%',
          }}
          contentContainerStyle={{
            marginTop: 16,
          }}
          data={pendingRequests}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          keyExtractor={item => item.portId}
          renderItem={element => renderPendingRequest(element.item)}
        />
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}>
          <View
            style={{
              borderRadius: 8,
              width: 150,
              borderWidth: 1,
              borderColor: '#DBDBDB',
            }}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.md}
              textColor="#555555"
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
              No pending requests
            </NumberlessText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PendingRequests;
