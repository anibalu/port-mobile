/**
 * Styled back button
 */
import React, {FC} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

import {SvgProps} from 'react-native-svg';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

interface BackButtonProps extends TouchableOpacityProps {
  Icon?: FC<SvgProps>;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  Icon,
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
  const BackIcon = Icon ? Icon : results.BackIcon;

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
