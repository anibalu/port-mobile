import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const SuperportLabelCard = ({
  label,
  showEmptyLabelError,
  setOpenModal,
}: {
  showEmptyLabelError: boolean;
  label: string;
  setOpenModal: (p: boolean) => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'FilterIcon',
      light: require('@assets/light/icons/Label.svg').default,
      dark: require('@assets/dark/icons/Label.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const FilterIcon = results.FilterIcon;
  return (
    <SimpleCard
      style={{
        paddingVertical: PortSpacing.secondary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
      }}>
      <View style={styles.mainWrapper}>
        <FilterIcon width={20} height={20} />
        <NumberlessText
          style={{
            color: Colors.text.primary,
            marginLeft: PortSpacing.tertiary.left,
          }}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          Label this Superport
        </NumberlessText>
      </View>
      <View style={{marginBottom: PortSpacing.secondary.bottom}}>
        <NumberlessText
          style={{color: Colors.text.subtitle}}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          Adding a label to this Superport makes it easy to recognize it in your
          Superports tab.
        </NumberlessText>
      </View>
      <View>
        <View style={showEmptyLabelError && styles.inputcard}>
          <EditableInputCard
            setOpenModal={setOpenModal}
            text={label}
            placeholder={'Ex. "My Website superport"'}
          />
        </View>
        {showEmptyLabelError && (
          <NumberlessText
            style={styles.errorContainer}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            This field is mandatory.
          </NumberlessText>
        )}
      </View>
    </SimpleCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    errorContainer: {
      color: color.primary.red,
      paddingTop: 4,
      paddingLeft: PortSpacing.tertiary.left,
    },
    inputcard: {
      borderWidth: 1,
      borderColor: color.primary.red,
      borderRadius: 16,
      overflow: 'hidden',
    },
    mainWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: PortSpacing.tertiary.bottom,
    },
  });

export default SuperportLabelCard;
