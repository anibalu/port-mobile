import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useColorScheme} from 'react-native';

import {ThemeType, getTheme, saveTheme} from '@utils/Themes';

type ModalContextType = {
  handleThemeChange: (theme: ThemeType) => void;
  themeValue: 'light' | 'dark';
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
  const colorScheme = useColorScheme();
  const [themeValue, setThemeValue] = useState<'light' | 'dark'>(
    (colorScheme as 'light' | 'dark' | null | undefined) || 'dark',
  );

  /**
   * this util wraps around 2 seperate utils, save theme and set theme value
   */
  const handleThemeChange = useCallback(
    async (theme: ThemeType) => {
      setThemeValue(
        theme === ThemeType.default ? colorScheme || 'dark' : theme,
      );
      await saveTheme(theme);
    },
    [colorScheme],
  );

  useEffect(() => {
    (async () => {
      const currentTheme = await getTheme();
      setThemeValue(
        currentTheme === ThemeType.default
          ? colorScheme || 'dark'
          : currentTheme,
      );
    })();
  }, [colorScheme]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      themeValue,
      handleThemeChange,
    }),
    [themeValue, handleThemeChange],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
