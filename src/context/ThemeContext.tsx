import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';

import {ThemeType, getTheme, saveTheme} from '@utils/Themes';
import {useColorScheme} from 'react-native';

type ModalContextType = {
  handleThemeChange: (theme: ThemeType) => void;
  themeValue: ThemeType | null;
};

const ThemeContext = createContext<ModalContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ModalProvider');
  }
  return context;
};

type ModalProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ModalProviderProps> = ({children}) => {
  const [themeValue, setThemeValue] = useState<ThemeType>(ThemeType.dark);
  const appearance = useColorScheme();

  /**
   * this util wraps around 2 seperate utils, save theme and set theme value
   */
  const handleThemeChange = useCallback(
    async (theme: ThemeType) => {
      await saveTheme(theme);
      setThemeValue(theme === 'default' ? appearance : theme);
    },
    [appearance],
  );

  useEffect(() => {
    (async () => {
      const currentTheme = await getTheme();
      setThemeValue(currentTheme === 'default' ? appearance : currentTheme);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ThemeContext.Provider
      value={{
        handleThemeChange,
        themeValue,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};
