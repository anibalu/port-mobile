import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import BlockedContactTile from '@components/BlockedContactTile';
import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {SafeAreaView} from '@components/SafeAreaView';

import {getAllBlockedUsers} from '@utils/Storage/blockUsers';
import {BlockedUser} from '@utils/Storage/DBCalls/blockUser';

const BlockedContacts = () => {
  const navigation = useNavigation();
  const [blockedContactsList, setBlockedContactsList] = useState<
    BlockedUser[] | []
  >([]);
  useEffect(() => {
    (async () => {
      setBlockedContactsList(await getAllBlockedUsers());
    })();
  }, []);

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const renderSelectedContact = (item: any) => {
    const isLast = blockedContactsList.length - 1 === item.index;

    return <BlockedContactTile {...item.item} isLast={isLast} />;
  };
  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={styles.screen}>
        <BackTopbar
          onBackPress={() => navigation.goBack()}
          title="Blocked contacts"
          bgColor="w"
        />
        <View style={styles.mainComponent}>
          {blockedContactsList.length > 0 ? (
            <SimpleCard style={{width: '100%'}}>
              <FlatList
                style={{width: '100%'}}
                data={blockedContactsList}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                renderItem={renderSelectedContact}
              />
            </SimpleCard>
          ) : (
            <View
              style={{
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{translateX: 0}, {translateY: -50}],
              }}>
              <NumberlessText
                style={{textAlign: 'center'}}
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.rg}
                textColor={Colors.text.primary}>
                No blocked contacts found
              </NumberlessText>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styling = colors =>
  StyleSheet.create({
    screen: {
      alignItems: 'center',
      backgroundColor: colors.primary.background,
    },

    mainComponent: {
      flex: 1,
      width: screen.width,
      backgroundColor: colors.primary.background,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: PortSpacing.secondary.bottom,
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.secondary.top,
    },
  });
export default BlockedContacts;
