import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {SafeAreaView} from '@components/SafeAreaView';
import React from 'react';
import {StyleSheet} from 'react-native';
import ExampleIcon from '@assets/icons/Example.svg';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import TertiaryButton from '@components/Reusable/LongButtons/TertiaryButton';
import {screen} from '@components/ComponentUtils';

const Isolation = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <PrimaryButton
        primaryButtonColor={'r'}
        buttonText={'Initiate'}
        Icon={ExampleIcon}
        isLoading={true}
        onClick={() => console.log('sdk')}
        disabled={false}
      />
      <SecondaryButton
        secondaryButtonColor={'r'}
        buttonText={'Share image'}
        Icon={ExampleIcon}
        onClick={() => console.log('sdk')}
      />
      <TertiaryButton
        tertiaryButtonColor={'b'}
        buttonText={'Share image'}
        Icon={ExampleIcon}
        onClick={() => console.log('sdk')}
        disabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    gap: 20,
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    marginVertical: 20,
    width: screen.width - 32,
  },
});

export default Isolation;
