import React, {useEffect, useRef} from 'react';
import {AppState} from 'react-native';

import Modal from 'react-native-modal';
import {useSelector} from 'react-redux';

import {useColors} from '@components/colorGuide';
import {isIOS, screen} from '@components/ComponentUtils';

import store from '@store/appStore';

/**
 * A reusable modal component that provides consistent behavior across the app.
 * Features:
 * - Handles keyboard avoidance
 * - Supports bottom sheet (flex-end) and center positioning
 * - Auto-closes when app goes to background (configurable)
 * - Handles backdrop color customization
 * - Supports theme forcing
 * - Closes automatically when force close is triggered from redux store
 *
 * @param onClose - Function called when modal should close
 * @param visible - Boolean controlling modal visibility
 * @param children - Modal content
 * @param avoidKeyboard - Whether modal should adjust for keyboard
 * @param position - Modal position ('flex-end' or 'center')
 * @param shouldAutoClose - Whether modal auto-closes on app background
 * @param backdropColor - Custom backdrop color
 * @param forceTheme - Override app theme for this modal
 */

const GenericModal = ({
  onClose,
  visible,
  children,
  avoidKeyboard = true,
  position = 'flex-end',
  shouldAutoClose = true, //responsible for closing the modal when app is backgrounded.
  backdropColor,
  forceTheme,
}: {
  onClose: any;
  visible: boolean;
  children: any;
  avoidKeyboard?: boolean;
  position?: 'flex-end' | 'center';
  shouldAutoClose?: boolean;
  backdropColor?: string;
  forceTheme?: 'light' | 'dark';
}) => {
  const forceClose: boolean = useSelector(
    state => state.forceCloseModal.forceClose,
  );
  const Colors = useColors(forceTheme);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // set modalVisible to false if the app goes into background
      if (appState.current.match(/active/) && nextAppState === 'background') {
        if (shouldAutoClose) {
          onClose();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (forceClose) {
      onClose();
      store.dispatch({
        type: 'RESET_MODAL',
        payload: 'RESET',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceClose]);

  return (
    <Modal
      backdropColor={backdropColor ? backdropColor : Colors.overlay}
      backdropOpacity={0.5}
      avoidKeyboard={avoidKeyboard}
      propagateSwipe={true}
      onSwipeComplete={onClose}
      swipeDirection="down"
      backdropTransitionOutTiming={0}
      backdropTransitionInTiming={300}
      animationInTiming={300}
      animationOutTiming={300}
      style={{
        margin: 0,
        flex: 1,
        // On Android, keyboard pushes up the modal by default. In order to prevent this, we absolutely position the element.
        ...(!avoidKeyboard &&
          !isIOS && {
            position: 'absolute',
            height: screen.height,
          }),
        justifyContent: position,
        alignItems: 'center',
      }}
      hideModalContentWhileAnimating={true}
      onBackButtonPress={onClose}
      isVisible={!forceClose && visible}
      onBackdropPress={onClose}>
      {children}
    </Modal>
  );
};

export default GenericModal;
