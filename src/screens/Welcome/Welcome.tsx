/**
 * This welcome screen shows Port branding and greets the user the first time they open the app.
 * screen id: 1
 */
import Logo from '@assets/miscellaneous/portBranding.svg';
import {FontSizes, PortColors} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import {SafeAreaView} from '@components/SafeAreaView';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, View} from 'react-native';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'RequestPermissions'
>;

function Welcome({navigation}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.blue.app}
      />
      <View style={styles.greeting}>
        <Logo height={175} style={styles.logo} />
      </View>
      <GenericButton
        onPress={() => navigation.navigate('RequestPermissions')}
        textStyle={styles.buttonText}
        buttonStyle={styles.button}>
        Get started
      </GenericButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: PortColors.primary.blue.app,
    height: '100%',

    width: '100%',
  },
  greeting: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingBottom: 50,
  },
  logo: {
    marginBottom: '5%',
  },
  name: {
    marginBottom: '15%',
  },
  button: {
    marginBottom: '10%',
    backgroundColor: '#FFFFFF',
    width: '85%',
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...FontSizes[17].medium,
    color: PortColors.primary.blue.app,
  },
});

export default Welcome;
