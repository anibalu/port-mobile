import BackTopbar from '@components/BackTopBar';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import GroupsImage from '@assets/backgrounds/groups.svg';
import {SafeAreaView} from '@components/SafeAreaView';
import {
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';

// start point of groups
const GroupOnboarding = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={style.container}>
      <BackTopbar />
      <View style={style.mainContainer}>
        <ScrollView style={style.scroll} showsVerticalScrollIndicator={false}>
          <NumberlessSemiBoldText style={style.title}>
            Welcome to groups
          </NumberlessSemiBoldText>

          <GroupsImage height={screen.height - 300} />

          <NumberlessRegularText style={style.subtitle}>
            Build your tribe with Groups with fun control options
          </NumberlessRegularText>

          <GenericButton
            onPress={() => navigation.navigate('NewGroup')}
            buttonStyle={{
              width: '100%',
              top: 0,
              marginTop: 10,
              height: 70,
            }}>
            Create Now
          </GenericButton>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 20,
    width: '100%',
    backgroundColor: 'white',
    height: '100%',
    flexDirection: 'column',
  },
  scroll: {
    height: '110%',
    width: '100%',
  },
  container: {
    height: '100%',
    flexDirection: 'column',
    backgroundColor: 'red',
  },
  image: {
    width: '100%',
    height: '60%',
  },
  title: {
    ...FontSizes[24].bold,
    textAlign: 'center',
    color: PortColors.primary.blue.app,
    marginBottom: 25,
  },
  subtitle: {
    ...FontSizes[17].regular,
    textAlign: 'center',
    marginTop: 20,
    color: PortColors.primary.grey.medium,
  },
  button: {
    backgroundColor: '#547CEF',
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    marginBottom: 30,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 30,
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
