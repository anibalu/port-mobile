import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {SafeAreaView} from '@components/SafeAreaView';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import UserSetupOnboardingChat from './Components/UserSetupOnboardingChat';
import {useTheme} from 'src/context/ThemeContext';
type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'OnboardingSetupScreen'
>;

const OnboardingSetupScreen = ({route}: Props) => {
  const portUrl = route?.params?.portUrl || null;
  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const [screenIndex, setScreenIndex] = useState<number>(1);

  return (
    <>
      <CustomStatusBar
        backgroundColor={
          themeValue === 'dark'
            ? Colors.primary.background
            : Colors.primary.white
        }
      />
      <SafeAreaView
        style={{
          backgroundColor:
            themeValue === 'dark'
              ? Colors.primary.background
              : Colors.primary.white,
        }}>
        <UserSetupOnboardingChat
          portUrl={portUrl}
          screenIndex={screenIndex}
          setScreenIndex={setScreenIndex}
        />
      </SafeAreaView>
    </>
  );
};
export default OnboardingSetupScreen;
