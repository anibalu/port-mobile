/**
 * Styled back button
 */
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

export const BackButton: React.FC<TouchableOpacityProps> = ({
  onPress,
  style,
  ...rest
}) => {
  const svgArray = [
    {
      assetName: 'BackIcon',
      light: require('@assets/light/icons/navigation/ArrowLeft.svg').default,
      dark: require('@assets/dark/icons/navigation/ArrowLeft.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const BackIcon = results.BackIcon;

  return (
    <TouchableOpacity
      style={StyleSheet.compose(styles.backIcon, style)}
      onPress={onPress}
      {...rest}>
      <BackIcon width={24} height={24} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backIcon: {
    paddingTop: 16,
    alignItems: 'flex-end',
    width: 50,
    height: 51,
  },
});
