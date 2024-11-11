import {usePreventRemove} from '@react-navigation/native';
import {useCallback} from 'react';

/**
 * A custom hook that highjacks the back navigation action based on a given flag and performs given action instead.
 * Works for both OS at hardware back press and gesture.
 * @param {boolean} preventGoingBack - A flag indicating whether to prevent going back.
 * @param {() => void} closeAction - A callback function that is called when the back action is intercepted.
 */

const useGoBackHandler = (
  preventGoingBack: boolean,
  closeAction: () => void,
) => {
  usePreventRemove(
    preventGoingBack,
    useCallback(() => {
      closeAction();
      return true;
    }, [closeAction]),
  );
};

export default useGoBackHandler;
