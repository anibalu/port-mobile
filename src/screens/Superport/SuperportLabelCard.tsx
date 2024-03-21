import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import IconLabel from '@assets/icons/Bookmark.svg';
import {View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';

const SuperportLabelCard = ({
  label,
  setOpenModal,
}: {
  label: string;
  setOpenModal: (p: boolean) => void;
}) => {
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
        <EditableInputCard
          setOpenModal={setOpenModal}
          text={label}
          placeholder={'Ex. "My Website superport"'}
        />
      </View>
    </SimpleCard>
  );
};

export default SuperportLabelCard;
