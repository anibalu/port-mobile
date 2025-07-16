/**
 * Provides a context for displaying toast messages popup.
 *
 * This module defines:
 * - ToastType: Enum for toast message types.
 * - useToast: Hook to access the Toast context.
 * - ToastProvider: Provider component to wrap around the application.
 */

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { ERROR_MODAL_VALIDITY_TIMEOUT } from '@configs/constants';


/**
 * Enum for Toast types.
 */
export enum ToastType {
  error = 0,
  success = 1,
  warning = 2,
  hint = 4
}

/**
 * Type definition for a Toast object.
 */
type ToastObject = {
  text: string;
  type: ToastType;
};

/**
 * Type definition for the Toast context.
 */
type ToastContextType = {
  showToast: (text: string, type: ToastType) => void;
  isToastVisible: boolean;
  toastToShow: ToastObject;
  setIsToastVisible:(visible: boolean)=>void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({children}) => {
  const [toastToShow, setToastToShow] = useState<ToastObject>({
    text: '',
    type: ToastType.error,
  });
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  /**
   * Function to show a toast with the specified text and type.
   *
   * @param {string} text - The text to display in the toast.
   * @param {ToastType} [type=ToastType.error] - The type of toast to display.
   */
  const showToast = (text: string, type: ToastType = ToastType.error) => {
    setToastToShow({text, type});
    setIsToastVisible(true);
  };

  useEffect(() => {
    // Set a timer to hide the toast after a specified timeout (3 seconds)
    const timer = setTimeout(() => {
      setIsToastVisible(false);
    }, ERROR_MODAL_VALIDITY_TIMEOUT);

    return () => clearTimeout(timer);
  }, [toastToShow]);

  return (
    <ToastContext.Provider value={{isToastVisible, showToast, toastToShow, setIsToastVisible}}>
      {children}
    </ToastContext.Provider>
  );
};
