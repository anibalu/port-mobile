import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import React from 'react';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DynamicColors from '@components/DynamicColors';
import {BottomNavStackParamList} from '@navigation/BottomNavStackTypes';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import SuperportsEducation from './SuperportComponents/SuperportsEducation';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';

type Props = NativeStackScreenProps<BottomNavStackParamList, 'SuperportsStack'>;

const SuperportsEducationScreen = ({navigation}: Props) => {
  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView
        removeOffset={true}
        style={{
          backgroundColor: Colors.primary.background,
        }}>
        <TopBarWithRightIcon
          alignLeft={true}
          heading="Superports Info"
          IconRight={CrossButton}
          onIconRightPress={() => navigation.goBack()}
          bgColor="g"
        />
        <SuperportsEducation />
      </SafeAreaView>
    </>
  );
};

export default SuperportsEducationScreen;
