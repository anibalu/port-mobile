import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import NumberPill from '@components/Reusable/Pill/NumberPill';
import DynamicColors from '@components/DynamicColors';

const SuperportUsageLimit = ({
  connectionsMade,
  connectionLimit,
  setOpenUsageLimitsModal,
  onBadgeClick,
}: {
  onBadgeClick?: () => void;
  connectionsMade: number;
  connectionLimit: number;
  setOpenUsageLimitsModal: (x: boolean) => void;
}) => {
  const Colors = DynamicColors();

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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
          }}>
          <NumberlessText
            textColor={Colors.text.primary}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.l}>
            Setup usage limits
          </NumberlessText>
          <View
            style={{
              marginLeft: PortSpacing.tertiary.left,
              backgroundColor: Colors.primary.surface2,
              paddingHorizontal: PortSpacing.tertiary.uniform,
              paddingVertical: 4,
              borderRadius: PortSpacing.secondary.uniform,
            }}>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.s}>
              {`${connectionsMade}/${connectionLimit}`} used
            </NumberlessText>
          </View>
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
      <Pressable
        onPress={onBadgeClick}
        pointerEvents="box-only"
        style={styles.pillrow}>
        <NumberPill
          connectionLimit={connectionLimit}
          setOpenUsageLimitsModal={setOpenUsageLimitsModal}
        />
      </Pressable>
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
