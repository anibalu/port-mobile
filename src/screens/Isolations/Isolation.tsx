import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import ExampleIcon from '@assets/icons/Example.svg';
import NotificationIcon from '@assets/icons/NotificationOutline.svg';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import TertiaryButton from '@components/Reusable/LongButtons/TertiaryButton';
import {screen} from '@components/ComponentUtils';
import SimpleInput from '@components/Reusable/Inputs/SimpleInput';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithToggle from '@components/Reusable/OptionButtons/OptionWithToggle';
import OptionWithChevron from '@components/Reusable/OptionButtons/OptionWithChevron';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';

const Isolation = () => {
  const [inputVal, setInputVal] = useState('');
  const [isToggleActive, setIsToggleActive] = useState(false);

  const onToggle = () => {
    setIsToggleActive(p => !p);
    if (isToggleActive) {
      console.log('Toggle is Active');
    } else {
      console.log('Toggle is Inactive');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{rowGap: 20}}>
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
        <SimpleInput
          placeholderText={'Name'}
          maxLength={30}
          text={inputVal}
          setText={setInputVal}
        />
        <SimpleCard>
          <OptionWithToggle
            onToggle={onToggle}
            IconLeft={NotificationIcon}
            toggleActiveState={isToggleActive}
            heading={'Contact Sharing'}
          />
          <LineSeparator />
          <OptionWithToggle
            onToggle={onToggle}
            IconLeft={NotificationIcon}
            toggleActiveState={isToggleActive}
            heading={'Contact Sharing'}
            description={'Allow this contact others on Port'}
          />
          <LineSeparator />
          <OptionWithChevron
            onClick={() => console.log('label clicked')}
            IconLeft={NotificationIcon}
            labelActiveState={false}
            heading={'Contact Sharing'}
            labelText={'Never'}
            description={
              'Allow this contact to connect you with others on Port'
            }
          />
        </SimpleCard>
        <OptionWithToggle
          onToggle={onToggle}
          IconLeft={NotificationIcon}
          toggleActiveState={isToggleActive}
          heading={'Contact Sharing'}
          description={'Allow this contact to connect you with others on Port'}
        />
        <OptionWithChevron
          onClick={() => console.log('label clicked')}
          IconLeft={NotificationIcon}
          labelActiveState={false}
          heading={'Contact Sharing'}
          labelText={'Never'}
          description={'Allow thwith others on Port'}
        />
        <SimpleTopbar
          onIconRightPress={() => console.log('right icon pressed')}
          onIconLeftPress={() => console.log('left icon pressed')}
          IconLeft={NotificationIcon}
          IconRight={NotificationIcon}
          heading={'Contact Name'}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    marginVertical: 20,
    width: screen.width - 32,
  },
});

export default Isolation;
