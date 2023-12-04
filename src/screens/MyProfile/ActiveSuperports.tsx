import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {getTimeAndDateStamp} from '@utils/Time';

import {GeneratedDirectConnectionBundle} from '@utils/Bundles/interfaces';
import {NumberlessRegularText} from '@components/NumberlessText';
import AGAccordion from './AGAccordion';
//import AGIcon from '@../assets/icons/AGIcon.svg';
import {loadGeneratedSuperports} from '@utils/Bundles/directSuperport';
import {useNavigation} from '@react-navigation/native';

export default function ActiveSuperports() {
  const [data, setData] = useState<Array<GeneratedDirectConnectionBundle>>([]);
  //dummy effect to pass lint checks
  useEffect(() => {
    const fetchData = async () => {
      const result = await loadGeneratedSuperports();
      setData(result);
    };
    fetchData();
  }, []);
  const navigation = useNavigation();
  return (
    <View style={styles.mainContainer}>
      <AGAccordion title="Active Superports" dataLength={data.length}>
        {data.length > 0 ? (
          <FlatList
            data={data}
            horizontal={true}
            renderItem={({item}) => (
              <Pressable
                style={styles.item}
                onPress={() => {
                  navigation.navigate('NewSuperport', {
                    superportId: item.data.linkId,
                  });
                }}>
                <View style={styles.columnStyles}>
                  {/* <AGIcon style={styles.image} /> */}
                  <Text style={styles.itemLabel}>
                    {item?.label ? item?.label : 'unlabeled'}
                  </Text>
                  <View style={styles.bluebox}>
                    <Text style={styles.itemTime}>Created </Text>
                    <Text style={styles.itemTime}>
                      {getTimeAndDateStamp(item?.timestamp)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        ) : (
          <NumberlessRegularText style={styles.noContacts}>
            No Active Superports
          </NumberlessRegularText>
        )}
      </AGAccordion>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 10,
    marginTop: 20,
    maxHeight: 175,
  },
  columnStyles: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    // marginLeft: 5,
  },
  image: {
    marginTop: 10,
    marginBottom: 10,
  },
  bluebox: {
    backgroundColor: '#547CEF',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F6F6F6',
    shadowOpacity: 13,
    shadowOffset: {
      width: 14,
      height: 8,
    },
    marginTop: 10,
  },
  itemLabel: {
    paddingLeft: 10,
    fontWeight: '500',
    fontSize: 17,
    color: 'black',
  },
  itemTime: {
    fontWeight: '500',
    fontSize: 12,
    color: 'white',
  },
  popUpArea: {
    backgroundColor: '#0005',
    width: '100%',
    height: '100%',
  },
  popupPosition: {
    position: 'absolute',
    bottom: 0,
  },
  iconStyles: {
    width: 100,
    height: 100,
  },
  pendingStyles: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    marginTop: 15,
    marginLeft: 10,
  },
  noContacts: {
    marginTop: 10,
  },
});
