import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {useNavigation} from '@react-navigation/native';
import React, {ReactElement, useEffect, useState} from 'react';
import ContactCard from './ContactCard';
import {FlatList, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {PendingCardInfo} from '@utils/Ports/interfaces';
import {getPendingRequests, numberOfPendingRequests} from '@utils/Ports';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortColors} from '@components/ComponentUtils';

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

      <FlatList
        style={{width: '100%'}}
        contentContainerStyle={{marginTop: 12}}
        data={pendingRequests}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        keyExtractor={item => item.portId}
        renderItem={element => renderPendingRequest(element.item)}
        ListEmptyComponent={
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.sb}
            textColor={PortColors.text.secondary}
            style={{flex: 1, textAlign: 'center'}}>
            No pending requests
          </NumberlessText>
        }
      />
      <Text>{pendingRequestsLength}</Text>
    </SafeAreaView>
  );
};

export default PendingRequests;
