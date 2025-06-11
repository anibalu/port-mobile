import React from 'react';
import {StyleSheet,View} from 'react-native';

import {useColors} from '@components/colorGuide';
import {Spacing} from '@components/spacingGuide';

/**
 * Card with a gradient border.
 * @param children - The children of the card.
 * @param style - The style of the card.
 * @param pointerEvents - The pointer events of the card.
 * @param edge1Color - The first edge color of the gradient.
 * @param edge2Color - The second edge color of the gradient.
 * @param forceDark - Whether to force the card to be dark.
 * @returns A card with a gradient border.
 */
const GradientCard = ({
  children,
  style,
  pointerEvents,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  edge1Color = 'rgba(255, 255, 255, 0.25)',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  edge2Color = 'rgba(255, 255, 255, 0)',
  forceTheme,
}: {
  children?: any;
  style?: any;
  pointerEvents?: 'auto' | 'box-none' | 'none' | 'box-only';
  edge1Color?: string;
  edge2Color?: string;
  forceTheme?: 'light' | 'dark';
}) => {
  const Colors = useColors(forceTheme);
  return (
    <View
      style={StyleSheet.compose(styles.cardContainer, {
        backgroundColor: Colors.surface,
        ...style,
        borderRadius: style && style.borderRadius ? style.borderRadius : 16,
        borderWidth: 0.5,
        borderColor: Colors.stroke,
      })}
      pointerEvents={pointerEvents}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: Spacing.s,
  },
});

export default GradientCard;
