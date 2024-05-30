import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import NumberPill from '@components/Reusable/Pill/NumberPill';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const SuperportUsageLimit = ({
  connectionsMade,
  onSetUsageLimit,
  connectionLimit,
  setOpenUsageLimitsModal,
  limitsArray,
}: {
  connectionsMade: number;
  onSetUsageLimit: (limit: number) => void;
  connectionLimit: number;
  setOpenUsageLimitsModal: (x: boolean) => void;
  limitsArray: number[];
}) => {
  const Colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'StopWatch',
      light: require('@assets/light/icons/StopWatch.svg').default,
      dark: require('@assets/dark/icons/StopWatch.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const StopWatch = results.StopWatch;
  return (
    <SimpleCard
      style={{
        paddingVertical: PortSpacing.secondary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: PortSpacing.tertiary.bottom,
        }}>
        <StopWatch width={20} height={20} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flex: 1,
          }}>
          <NumberlessText
            style={{
              color: Colors.text.primary,
              marginLeft: PortSpacing.tertiary.left,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            Set up usage limit
          </NumberlessText>
          <NumberlessText
            style={{
              color: Colors.text.primary,
              marginLeft: PortSpacing.tertiary.left,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            {`${connectionsMade}/${connectionLimit}`}
          </NumberlessText>
        </View>
      </View>
      <View style={{marginBottom: PortSpacing.secondary.bottom}}>
        <NumberlessText
          style={{color: Colors.text.subtitle}}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          Set up the maximum number of connections that can be made using this
          Superport.
        </NumberlessText>
      </View>
      <View style={styles.pillrow}>
        {limitsArray.map((number, index) => {
          return (
            <NumberPill
              connectionLimit={connectionLimit}
              isCustom={limitsArray.length - 1 === index}
              key={index}
              value={number}
              onClick={onSetUsageLimit}
              setOpenUsageLimitsModal={setOpenUsageLimitsModal}
            />
          );
        })}
      </View>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  pillrow: {
    flexDirection: 'row',
    rowGap: 12,
    columnGap: 12,
    flexWrap: 'wrap',
  },
});

export default SuperportUsageLimit;
