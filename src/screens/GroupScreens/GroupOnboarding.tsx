import GroupsImage from '@assets/backgrounds/groups.svg';
import BackTopbar from '@components/BackTopBar';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessSemiBoldText,
  NumberlessText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';

// start point of groups
const GroupOnboarding = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={style.container}>
      <BackTopbar />
      <View style={style.mainContainer}>
        <NumberlessSemiBoldText style={style.title}>
          Welcome to groups
        </NumberlessSemiBoldText>

        <GroupsImage height={screen.height / 1.8} />

        <NumberlessText
          fontSizeType={FontSizeType.l}
          fontType={FontType.rg}
          textColor={PortColors.text.labels}
          style={{textAlign: 'center', marginTop: 21}}>
          Build your tribe with Groups with fun control options
        </NumberlessText>

        <GenericButton
          onPress={() => navigation.navigate('NewGroup')}
          buttonStyle={{
            flex: 1,
            top: 52,
            height: 70,
            maxHeight: 70,
          }}>
          Create Now
        </GenericButton>
      </View>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: 'white',
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
