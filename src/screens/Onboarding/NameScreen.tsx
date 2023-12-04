/**
 * This screen allows a user to add a nickname.
 * screen id: 3
 */
import Next from '@assets/navigation/nextButton.svg';
import {FontSizes, PortColors} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {processName} from '@utils/Profile';
import React, {useEffect, useState} from 'react';
import {BackHandler, ScrollView, StyleSheet, View} from 'react-native';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

function NameScreen({navigation}: Props) {
  //setting initial state of nickname string to ""

  const [name, setName] = useState('');

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

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={styles.basicContainer}>
        <ScrollView
          //   style={styles.container}
          contentContainerStyle={{
            justifyContent: 'space-between',
            flex: 1,
            // backgroundColor: 'red',
          }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.contentBox}>
            <NumberlessMediumText style={styles.titleText}>
              Share a name but
            </NumberlessMediumText>
            <NumberlessMediumText style={styles.titleTextp2}>
              not a number
            </NumberlessMediumText>

            <NumberlessRegularText style={styles.bodyText}>
              We like to keep things simple. We don't require any data to set up
              your portfolio. Just a name will do.{'\n\n'} And even this is
              optional.
            </NumberlessRegularText>
            <GenericInput
              wrapperStyle={{paddingHorizontal: '8%'}}
              placeholder="Name (Optional)"
              text={name}
              setText={setName}
            />
          </View>
          <GenericButton
            onPress={() =>
              navigation.navigate('PermissionsScreen', {
                name: processName(name),
              })
            }
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
    marginTop: 20,
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
    marginBottom: 10,
    marginTop: 60,
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
    marginRight: 25,
    marginBottom: 28,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});

export default NameScreen;
