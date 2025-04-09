import {useMemo} from 'react';

import {useTheme} from 'src/context/ThemeContext';

interface SVGOptions {
  assetName: string;
  light: any;
  dark: any;
}

/**
 * Dynamically retrieves SVG assets based on the current theme.
 * @param svgArray An array of objects containing SVG asset information.
 * @param forceTheme Optional parameter to force a specific theme.
 * @returns An object mapping SVG asset names to their corresponding SVG content based on the current theme.
 */

function useSVG(svgArray: SVGOptions[], forceTheme?: 'light' | 'dark'): any {
  const {themeValue} = useTheme();

  return useMemo(() => {
    console.log('Changing SVGs based on theme: ', themeValue, forceTheme);
    const resultsObj: any = {};
    svgArray.forEach(item => {
      resultsObj[item.assetName] =
        item[
          forceTheme
            ? forceTheme
            : themeValue && themeValue === 'light'
            ? 'light'
            : 'dark'
        ];
    });
    return resultsObj;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeValue, forceTheme]);
}

export default useSVG;
