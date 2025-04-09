import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import TagBottomsheet from '../BottomSheets/TagBottomsheet';

import SimpleCard from './SimpleCard';

/**
 * Tag Card component
 *
 * @returns {React.ReactElement}
 */
const TagCard = () => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const [openTagBottomsheet, setOpenTagBottomsheet] = useState(false);
  const tags = [
    {
      index: 1,
      title: 'Work',
      boldAccentColor: '#EE6337',
      lowAccentColor: '#EE633733',
    },
    {
      index: 2,
      title: 'Networking',
      boldAccentColor: '#4A94B0',
      lowAccentColor: '#4A94B033',
    },
  ];
  // state to store the new tags
  const [newTags, setNewTags] = useState(tags);

  const svgArray = [
    {
      assetName: 'Plus',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Plus = results.Plus;

  return (
    <SimpleCard style={styles.card}>
      <NumberlessText
        textColor={Colors.text.primary}
        fontSizeType={FontSizeType.l}
        fontType={FontType.md}>
        Add a tag
      </NumberlessText>
      <View style={styles.tagView}>
        {newTags.map(tag => {
          return (
            <View
              key={tag.index}
              style={StyleSheet.compose(styles.tag, {
                backgroundColor: tag.lowAccentColor,
              })}>
              <NumberlessText
                textColor={tag.boldAccentColor}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                {tag.title}
              </NumberlessText>
            </View>
          );
        })}
        <Pressable
          onPress={() => setOpenTagBottomsheet(p => !p)}
          style={styles.plus}>
          <Plus />
        </Pressable>
      </View>
      <TagBottomsheet
        setNewTag={setNewTags}
        setVisible={setOpenTagBottomsheet}
        visible={openTagBottomsheet}
      />
    </SimpleCard>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    card: {
      padding: PortSpacing.secondary.uniform,
      gap: PortSpacing.tertiary.uniform,
      marginVertical: PortSpacing.secondary.uniform,
    },
    tag: {
      borderRadius: PortSpacing.secondary.uniform,
      padding: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      justifyContent: 'center',
    },
    tagView: {
      flexDirection: 'row',
      gap: PortSpacing.tertiary.uniform,
      flexWrap: 'wrap',
    },
    plus: {
      borderRadius: PortSpacing.primary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
      backgroundColor: Colors.primary.surface2,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
  });

export default TagCard;
