import React, { ReactNode } from 'react';

import { useSelector } from 'react-redux';

/**
 * DeveloperBox is a component that displays a box of information for developers.
 * It only renders if the developer mode is turned on.
 * To turn on developer mode, tap the version number 5 times. tap 5 times again to turn it off.
 * 
 * @param children - The children of the component.
 */

interface DeveloperModeState {
  developerMode: {
    developerMode: boolean;
  };
}

interface DeveloperBoxProps {
  children: ReactNode;
}

const DeveloperBox: React.FC<DeveloperBoxProps> = ({ children }) => {
  const isDeveloperMode = useSelector((state: DeveloperModeState) => state.developerMode.developerMode);

  if (!isDeveloperMode) {
    return null;
  }
  return <>{children}</>;
};

export default DeveloperBox;
