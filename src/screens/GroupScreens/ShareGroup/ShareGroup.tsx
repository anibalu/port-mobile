import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import ConnectionDisplay from './ConnectionDisplay';

import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';

type Props = NativeStackScreenProps<AppStackParamList, 'ShareGroup'>;

function ShareGroup({route, navigation}: Props) {
  const {groupId} = route.params;
  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <GenericTopBar
        title={'Group Invite'}
        onBackPress={() => {
          navigation.navigate('HomeTab');
        }}
      />
      <ScrollView>
        <View style={styles.mainBox}>
          <ConnectionDisplay groupId={groupId} />
          <View style={styles.educationBox}>
            <NumberlessMediumText style={styles.titleText}>
              Frequently Asked Questions
            </NumberlessMediumText>
            <NumberlessRegularText style={styles.educationText}>
              Lorem ipsum dolor sit amet consectetur. Magna eget faucibus
              pellentesque sit fusce fames vel. Neque placerat.
            </NumberlessRegularText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  mainBox: {
    flex: 1,
    paddingBottom: 40,
    alignItems: 'center',
  },
  educationBox: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 30,
  },
  titleText: {
    fontSize: 13,
    marginBottom: 20,
    width: '100%',
  },
  educationText: {
    fontSize: 13,
    width: '100%',
  },
});

export default ShareGroup;
