import GroupsImage from '@assets/backgrounds/groups.svg';
import BackTopbar from '@components/BackTopBar';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
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
        <NumberlessText
          fontSizeType={FontSizeType.xl}
          fontType={FontType.sb}
          style={{textAlign: 'center', marginBottom: 25}}
          textColor={PortColors.text.title}>
          Welcome to groups
        </NumberlessText>
        {/* <NumberlessSemiBoldText style={style.title}></NumberlessSemiBoldText> */}

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
            height: 60,
            maxHeight: 60,
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
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});
export default GroupOnboarding;
