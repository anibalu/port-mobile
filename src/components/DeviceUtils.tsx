import {isIOS} from './ComponentUtils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * @deprecated
 * Utility file for platform and inset checks
 */

export const useInsetChecks = () => {
  const insets = useSafeAreaInsets();

  //if device is IOS and it has top inset
  const hasIosTopInset = isIOS && insets.top > 0;
  //if device is IOS and it has extra top inset
  const hasIosLargeTopInset = isIOS && insets.bottom > 30;
  //if device is IOS and it has bottom notch
  const hasIosBottomNotch = isIOS && insets.bottom > 0;
  //if device is IOS and it has extra bottom inset(caused by bottom notch)
  const hasIosLargeBottomInset = isIOS && insets.bottom > 30;

  return {
    hasIosTopInset,
    hasIosLargeTopInset,
    hasIosBottomNotch,
    hasIosLargeBottomInset,
  };
};
