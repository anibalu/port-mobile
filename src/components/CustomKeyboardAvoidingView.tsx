import React from 'react';
import {KeyboardAvoidingView, KeyboardAvoidingViewProps} from 'react-native';

import {isIOS} from './ComponentUtils';

interface CustomKeyboardAvoidingViewProps extends KeyboardAvoidingViewProps {
  children: React.ReactNode;
}

/**
 * CustomKeyboardAvoidingView is a wrapper around the KeyboardAvoidingView component that automatically adjusts the keyboard offset based on the platform.
 * @param props - The props for the KeyboardAvoidingView component.
 * @returns A KeyboardAvoidingView component with the appropriate behavior and keyboard offset.
 */
function CustomKeyboardAvoidingView({
  children,
  ...props
}: CustomKeyboardAvoidingViewProps) {
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={isIOS ? 'padding' : 'height'}
      keyboardVerticalOffset={isIOS ? 54 : 0}
      {...props}>
      {children}
    </KeyboardAvoidingView>
  );
}

export default CustomKeyboardAvoidingView;
