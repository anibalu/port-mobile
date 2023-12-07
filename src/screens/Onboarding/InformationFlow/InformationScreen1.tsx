/**
 * This screen allows a user to add a nickname.
 * screen id: 3
 */
import S1 from '@assets/carousels/s1.svg';
import Next from '@assets/navigation/nextButton.svg';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import {
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import store from '@store/appStore';
import React, {useEffect} from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

function InformationScreen1({navigation}: Props) {
  //setting initial state of nickname string to ""

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return null;
      },
    );

    navigation.addListener('beforeRemove', e => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
    });

    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = () => {
    store.dispatch({
      type: 'ONBOARDING_COMPLETE',
      payload: true,
    });
  };

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={styles.basicContainer}>
        <ScrollView
          contentContainerStyle={{
            justifyContent: 'flex-start',
            flex: 1,
            paddingTop: 20,
          }}
          showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={onFinish}
            style={{right: -screen.width / 1.2, top: -20}}>
            <NumberlessRegularText style={{color: PortColors.primary.black}}>
              SKIP
            </NumberlessRegularText>
          </Pressable>
          <View style={{alignItems: 'center'}}>
            <NumberlessSemiBoldText style={styles.titleText}>
              Open and close "ports"
            </NumberlessSemiBoldText>
            <S1 width={screen.width * 0.9} height={screen.height * 0.4} />
            <NumberlessRegularText style={styles.bodyText}>
              Tap, click or scan to open single-use ports without sharing phone
              numbers or handles. Close the port at any point or keep it open
              indifinetly if you've found a meaningful connection.
            </NumberlessRegularText>
          </View>
          <GenericButton
            onPress={() => navigation.navigate('InformationScreen2')}
            Icon={Next}
            buttonStyle={styles.nextButtonContainer}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  basicContainer: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  contentBox: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 98,
    backgroundColor: 'red',
  },
  topBarContainer: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 51,
    alignItems: 'flex-start',
    paddingLeft: '6%',
  },
  titleText: {
    ...FontSizes[21].medium,
    marginBottom: 60,
    color: PortColors.primary.blue.app,
    paddingRight: '8%',
    paddingLeft: '8%',
  },
  titleTextp2: {
    ...FontSizes[21].bold,
    color: PortColors.primary.blue.app,
  },
  topBodyText: {
    marginBottom: 20,
    paddingRight: '8%',
    paddingLeft: '8%',
    fontSize: 15,
  },
  bodyText: {
    marginTop: 40,
    paddingRight: '8%',
    paddingLeft: '8%',
    textAlign: 'center',
  },
  nicknameBox: {
    width: '100%',
    height: 76,
    justifyContent: 'center',
    marginTop: 30,
    paddingLeft: '8%',
    paddingRight: '8%',
  },
  inputText: {
    width: '100%',
    height: '100%',
    color: PortColors.primary.black,
    ...FontSizes[17].bold,
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 16,
  },
  nextButtonContainer: {
    backgroundColor: PortColors.primary.blue.app,
    height: 65,
    width: 65,
    position: 'absolute',
    bottom: 28,
    right: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});

export default InformationScreen1;
