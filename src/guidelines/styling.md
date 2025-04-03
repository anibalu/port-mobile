# Component Styling Guidelines

## Spacing guide

- Please use the attributes available in `components/spacingGuide.ts`
- When describing paddings, margins and gaps, please import and use `Spacing.*`
- When describing heights and widths of components, please use `Height.*` and  `Width.*`
- Ex:
```
import { Spacing, Height, Width } from '@components/spacingGuide';

const styles = {
    padding: Spacing.l,
    height: Height.topbar,
    width: Width.screen
}
```

## Color guide

- Please use the attributes available in `components/colorGuide.ts`
- When describing colors for components or screens dependent on theme, use the hook `useColors()`
- When describing colors for components or screens not dependent on theme (theme is forced to dark or light), use the hook `useThemeColors(theme)`

```
import { Colors, useColors } from '@components/colorGuide';

const NewComponent = () => {
    const color = useColors();
    return (
        <View style={{backgroundColor: color.background}}/>
    );
}

const styles = {
    backgroundColor: Colors.light.background,
    borderColor: Colors.common.white,
    backgroundColor: Colors.dark.background
}
```

## Responsiveness guide

- It is very important that the app remains responsive. Currently, our responsiveness is optimized only for potrait mode and thus the app forces potrait mode.
- Use flex as much as possible
- Ensure components are not fixed width
- Test with system display and font sizes enlarged
- Wrap screen with `CustomStatusBar` and `SafeAreaView`
- Try not to add much styling to SafeAreaView
```
 <>
    <CustomStatusBar theme={colors.theme} backgroundColor={colors.background}/>
    <SafeAreaView backgroundColor={colors.background}>
    <SafeAreaView/>
 </>
``` 

## asset usage guide

- We use SVGs as the preferred type for almost all of visual our assets.
- If you require SVGs that change based on theme, please use `useDynamicSVG(svgArray)` in svgGuide.ts
```
// ... inside a component
  const svgArray = [
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
    {
      assetName: 'AudioCallIcon',
      light: require('@assets/light/icons/AudioCall.svg').default,
      dark: require('@assets/dark/icons/AudioCall.svg').default,
    },
    {
      assetName: 'VideoCallIcon',
      light: require('@assets/light/icons/VideoCall.svg').default,
      dark: require('@assets/dark/icons/VideoCall.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const CloseIcon = results.CloseIcon
```
- If you require SVGs that don't change based on theme, directly import the SVG
```
import Icon from '@assets/dark/icons/Icon.svg';
```
- Ensure new SVG assets are added to the following folders. Capitalise asset files.
  ```
  assets/
  ├── light/
  │   ├── icons/
  │         ├── Icon.svg
  ├── dark/
  │   ├── icons/
  │         ├── Icon.svg
  ```