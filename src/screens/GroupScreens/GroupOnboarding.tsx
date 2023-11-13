import React from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import GroupsImage from '../../../assets/backgrounds/groups.svg';
import {useNavigation} from '@react-navigation/native';
import Topbar from './Topbar';

// start point of groups
const GroupOnboarding = () => {
  const navigation = useNavigation();
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Topbar title={''} />
      <View style={style.mainContainer}>
        <Text style={style.title}>Welcome to groups</Text>
        <GroupsImage width="100%" height="65%" />
        <Text style={style.subtitle}>
          Build your tribe with Groups with fun control options
        </Text>
        <Pressable
          style={style.button}
          onPress={() => navigation.navigate('NewGroup')}>
          <Text style={style.buttonText}> Create Now</Text>
        </Pressable>
      </View>
    </>
  );
};

const style = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 20,
    width: '100%',
    backgroundColor: 'white',
    height: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    alignSelf: 'center',
    color: '#547CEF',
    marginBottom: 25,
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 17,
    alignSelf: 'center',
    color: '#ACACAC',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#547CEF',
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 15,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
export default GroupOnboarding;
