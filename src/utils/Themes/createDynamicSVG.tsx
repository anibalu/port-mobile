import {useTheme} from 'src/context/ThemeContext';

interface SVGOptions {
  assetName: string;
  light: any;
  dark: any;
}

/**
 * Dynamically retrieves SVG assets based on the current theme.
 * @param svgArray An array of objects containing SVG asset information.
 * @returns An object mapping SVG asset names to their corresponding SVG content based on the current theme.
 */

function useDynamicSVG(svgArray: SVGOptions[]): any {
  const {themeValue} = useTheme();
  const resultsObj = {};
  svgArray.forEach(item => {
    resultsObj[item.assetName] = item[themeValue];
  });

  return resultsObj;
}

export default useDynamicSVG;
