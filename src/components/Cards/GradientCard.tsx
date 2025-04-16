import React from 'react';
import {StyleSheet,View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

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
  edge1Color = 'rgba(255, 255, 255, 0.25)',
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
  return Colors.theme === 'dark' ? (
    <LinearGradient
      colors={[edge1Color, edge2Color, edge1Color]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      useAngle={true}
      angle={135}
      angleCenter={{x: 0.5, y: 0.5}}
      style={{
        borderRadius: style && style.borderRadius ? style.borderRadius : 16,
      }}>
      <View
        style={StyleSheet.compose(styles.cardContainer, {
          backgroundColor: Colors.surface,
          ...style,
          borderRadius: style && style.borderRadius ? style.borderRadius : 16,
          margin: 1,
        })}
        pointerEvents={pointerEvents}>
        {children}
      </View>
    </LinearGradient>
  ) : (
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
