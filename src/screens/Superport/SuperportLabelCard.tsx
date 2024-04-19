import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import IconLabel from '@assets/icons/Bookmark.svg';
import {StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';

const SuperportLabelCard = ({
  label,
  showEmptyLabelError,
  setOpenModal,
}: {
  showEmptyLabelError: boolean;
  label: string;
  setOpenModal: (p: boolean) => void;
}) => {
  return (
    <SimpleCard
      style={{
        paddingVertical: PortSpacing.secondary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
      }}>
      <View style={styles.mainWrapper}>
        <IconLabel width={20} height={20} />
        <NumberlessText
          style={{
            color: PortColors.title,
            marginLeft: PortSpacing.tertiary.left,
          }}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          Label this Superport
        </NumberlessText>
      </View>
      <View style={{marginBottom: PortSpacing.secondary.bottom}}>
        <NumberlessText
          style={{color: PortColors.subtitle}}
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

const styles = StyleSheet.create({
  errorContainer: {
    color: PortColors.primary.red.error,
    paddingTop: 4,
    paddingLeft: PortSpacing.tertiary.left,
  },
  inputcard: {
    borderWidth: 1,
    borderColor: PortColors.primary.red.error,
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
