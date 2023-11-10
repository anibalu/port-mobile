import React from 'react';
import {SafeAreaView} from '../../../components/SafeAreaView';
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Topbar from './TopBar';
import ConnectionDisplay from './ConnectionDisplay';
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '../../../components/NumberlessText';
import {useNavigation, useRoute} from '@react-navigation/native';

function ShareGroup() {
  const navigation = useNavigation();
  const route = useRoute();
  const {groupId} = route.params;
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ImageBackground
        source={require('../../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <ScrollView style={styles.scrollView}>
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
      <View style={styles.topBox}>
        <Topbar
          onBackPress={() => {
            navigation.navigate('Home');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
    overflow: 'hidden',
  },
  topBox: {
    position: 'absolute',
    width: '100%',
  },
  scrollView: {
    width: '100%',
  },
  mainBox: {
    height: '100%',
    width: '100%',
    paddingTop: 51,
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
