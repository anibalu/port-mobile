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
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DefaultLoader from '@components/Reusable/Loaders/DefaultLoader';

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
  const [pendingRequestsLength, setPendingRequestsLength] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const getDisplayLength = () => {
    if (pendingRequestsLength === 0) {
      return '';
    } else {
      return '(' + pendingRequestsLength.toString() + ')';
    }
  };
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setPendingRequests(await getPendingRequests());
      setPendingRequestsLength(await numberOfPendingRequests());
      setIsLoading(false);
    })();
  }, [reloadTrigger]);

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={{backgroundColor: PortColors.background}}>
        <BackTopbar
          title={`Pending Ports ${getDisplayLength()}`}
          bgColor="w"
          onBackPress={() => navigation.goBack()}
        />
        <View
          style={{
            width: '100%',
            paddingTop: PortSpacing.secondary.top,
            flex: 1,
          }}>
          {pendingRequests.length > 0 ? (
            <FlatList
              data={pendingRequests}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              keyExtractor={item => item.portId}
              renderItem={element => renderPendingRequest(element.item)}
            />
          ) : (
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}>
              {isLoading ? (
                <View style={{marginBottom: 50}}>
                  <DefaultLoader />
                </View>
              ) : (
                <View style={{marginBottom: 50}}>
                  <NumberlessText
                    textColor={PortColors.subtitle}
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.m}>
                    No pending ports
                  </NumberlessText>
                </View>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default PendingRequests;
