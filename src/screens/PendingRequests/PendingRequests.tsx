import {SafeAreaView} from '@components/SafeAreaView';
import {useNavigation} from '@react-navigation/native';
import React, {ReactElement, useEffect, useState} from 'react';
import ContactCard from './ContactCard';
import {FlatList, View} from 'react-native';
import {useSelector} from 'react-redux';
import {PendingCardInfo,getPendingRequests, numberOfPendingRequests} from '@utils/Ports';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DefaultLoader from '@components/Reusable/Loaders/DefaultLoader';
import Icon from '@assets/icons/NoPendingRequests.svg';
import DynamicColors from '@components/DynamicColors';

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

  const Colors = DynamicColors();

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <BackTopbar
          title={`Pending Ports ${getDisplayLength()}`}
          bgColor="w"
          onBackPress={() => navigation.goBack()}
        />
        <View
          style={{
            width: '100%',
            flex: 1,
            marginTop: PortSpacing.tertiary.top,
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
              }}>
              {isLoading ? (
                <View style={{marginBottom: 50}}>
                  <DefaultLoader />
                </View>
              ) : (
                <View
                  style={{
                    alignSelf: 'center',
                    paddingTop: screen.height / 4,
                    height: screen.height,
                    width: screen.width / 1.5,
                  }}>
                  <Icon style={{alignSelf: 'center'}} />
                  <NumberlessText
                    style={{textAlign: 'center'}}
                    fontSizeType={FontSizeType.xl}
                    fontType={FontType.md}
                    textColor={Colors.text.primary}>
                    No pending Ports
                  </NumberlessText>
                  <NumberlessText
                    style={{
                      textAlign: 'center',
                      marginTop: PortSpacing.tertiary.top,
                    }}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.rg}
                    textColor={Colors.text.subtitle}>
                    When you share a new Port, they will appear here until the
                    connection forms
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
