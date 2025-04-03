import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import React, {useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';

import DynamicColors from '@components/DynamicColors';
import SimpleInput from '../Inputs/SimpleInput';
import {TagColors} from '@components/TagColors';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {generateRandomHexId} from '@utils/IdGenerator';

const TagBottomsheet = ({
  visible,
  setVisible,
  setNewTag,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  setNewTag: (tag: any) => void;
}) => {
  const [tagName, setTagName] = useState('');
  const [tagColors, setTagColors] = useState(TagColors[0]);
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <PrimaryBottomSheet
      showClose={false}
      visible={visible}
      bgColor="w"
      onClose={() => setVisible(false)}>
      <NumberlessText
        textColor={Colors.text.primary}
        fontSizeType={FontSizeType.xl}
        fontType={FontType.sb}>
        Add a tag{' '}
      </NumberlessText>

      <View style={styles.line} />
      <LineSeparator />
      <SimpleInput
        setText={setTagName}
        text={tagName}
        placeholderText="Enter your tag name"
      />

      <NumberlessText
        style={{
          alignSelf: 'flex-start',
          marginTop: PortSpacing.secondary.uniform,
        }}
        textColor={Colors.text.subtitle}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        Give your tag a name that speaks to you!
      </NumberlessText>
      <NumberlessText
        style={{
          alignSelf: 'flex-start',
          marginTop: PortSpacing.primary.uniform,
        }}
        textColor={Colors.text.primary}
        fontSizeType={FontSizeType.xl}
        fontType={FontType.sb}>
        Tag color{' '}
      </NumberlessText>

      <View style={styles.colorsTab}>
        <FlatList
          data={TagColors}
          contentContainerStyle={{gap: PortSpacing.tertiary.uniform}}
          horizontal={true}
          keyExtractor={(item: any) => item.index}
          renderItem={item => {
            return (
              <Pressable
                onPress={() => setTagColors(item.item)}
                style={{
                  backgroundColor: item.item.boldAccentColor,
                  width: 28,
                  height: 28,
                  borderRadius: PortSpacing.secondary.uniform,
                }}
              />
            );
          }}
        />
      </View>

      <PrimaryButton
        buttonText="Create Tag"
        disabled={tagName.length === 0}
        onClick={() => {
          setNewTag(p => [
            ...p,
            {
              title: tagName,
              boldAccentColor: tagColors.boldAccentColor,
              lowAccentColor: tagColors.lowAccentColor,
              index: generateRandomHexId(),
            },
          ]);
          setTagName('');
          setTagColors(TagColors[0]);
          setVisible(p => !p);
        }}
        isLoading={false}
      />
    </PrimaryBottomSheet>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    cardWrapper: {
      maxHeight: 250,
      width: '100%',
      paddingVertical: PortSpacing.tertiary.uniform,
      ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
    },
    optionContainer: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      height: 40,
    },
    optionWrapper: {
      flexDirection: 'row',
      paddingVertical: PortSpacing.tertiary.uniform,
      alignItems: 'center',
      flex: 1,
    },
    textContainer: {
      paddingRight: 5,
      flexDirection: 'column',
      flex: 1,
    },
    line: {
      borderBottomColor: Colors.primary.stroke,
      borderBottomWidth: 0.5,
      height: 1,
      width: screen.width,
      marginVertical: PortSpacing.tertiary.uniform,
    },
    colorsTab: {
      borderColor: Colors.primary.stroke,
      borderWidth: 0.5,
      borderRadius: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      padding: PortSpacing.secondary.uniform,
      marginVertical: PortSpacing.secondary.uniform,
    },
  });

export default TagBottomsheet;
