import {useTheme} from 'src/context/ThemeContext';

const DynamicColors = (theme?: string | null) => {
  const {themeValue} = useTheme();
  const common = {
    red: '#EF4D41',
    secondaryAccentColor: '#B56BFF',
    darkgrey: '#667085',
    mediumgrey: '#98A2B3',
    lightgrey: '#98A2B340',
    green: '#12B76A',
    disabled: '#CFCCD6',
    accent: '#6A35FF', //purple
    white: '#FFFFFF',
    genericblack: '#000000',
    accentLight: '#9E82ED',
    accentOverlay: 'rgba(106, 53, 255, 0.24)',
    defaultdark: '#05070b',
    violet: '#730BDC',
    darkGreen: '#469A5F',
    orange: '#EE6337',
    deepSafron: '#F99520',
    tealBlue: '#4A94B0',
    brightRed: '#E20036',
    blue: '#4E75FF',
    lavenderOverlay: '#6A35FF3D',
  };

  const light = {
    primary: {
      surface: '#FFFFFF',
      surface2: '#F3F2F7',
      mainelements: '#1D2939',
      background: '#F3F2F7',
      stroke: '#E8E6EC',
      overlay: '#000000',
      black: '#000000',
      ...common,
    },
    boldAccentColors: {
      violet: '#730BDC',
      darkGreen: '#469A5F',
      orange: '#EE6337',
      deepSafron: '#F99520',
      tealBlue: '#4A94B0',
      brightRed: '#E20036',
      blue: '#4E75FF',
    },
    lowAccentColors: {
      violet: '#730BDC1A',
      darkGreen: '#469A5F1A',
      orange: '#EE63371A',
      deepSafron: '#F995201A',
      tealBlue: '#4A94B01A',
      brightRed: '#E200361A',
      blue: '#4E75FF1A',
      grey: '#F3F3F5',
    },
    search: {
      black: '#FFF',
    },
    text: {
      subtitle: '#65626F',
      primary: '#04000F',
      memberName: '#6A35FF',
      placeholder: '#7E7B84',
    },
    messagebubble: {
      receiver: '#E2D8FF',
      sender: '#F3F2F7',
      reply: '#EDF2FF',
      replyBubbleInner: '#F4F4F5',
      replyBubbleReceive: '#F3F2F7',
      border: '#6A35FF',
      memberName: '#05070B',
    },
    labels: {
      fill: '#F3F3F5',
      stroke: '#FFF6C4',
      text: '#000000',
    },
    progress: {
      container: '#FFFFFF',
      bar: '#6A35FF',
      senderContainer: '#FFFFFF',
      senderBar: '#6A35FF',
    },
    button: {
      black: '#05070B',
      disabled: '#BCB8C7',
      accent: '#6A35FF',
    },
  };
  const dark = {
    primary: {
      surface: '#17181C',
      surface2: '#27272B',
      mainelements: '#FFFFFF',
      background: '#05070b',
      stroke: '#61616B',
      overlay: '#52525b',
      black: '#FFFFFF',
      ...common,
    },
    boldAccentColors: {
      violet: '#730BDC',
      darkGreen: '#469A5F',
      orange: '#EE6337',
      deepSafron: '#F99520',
      tealBlue: '#4A94B0',
      brightRed: '#E20036',
      blue: '#4E75FF',
    },
    lowAccentColors: {
      violet: '#730BDC33',
      darkGreen: '#469A5F33',
      orange: '#EE633733',
      deepSafron: '#F9952033',
      tealBlue: '#4A94B033',
      brightRed: '#E2003633',
      blue: '#4E75FF33',
      grey: '#27272B',
    },
    search: {
      black: '#1D232E',
    },
    text: {
      subtitle: '#CFCCD9',
      primary: '#EAECF0',
      memberName: '#FFFFFF',
      placeholder: '#98A2B3',
    },
    messagebubble: {
      receiver: '#6A35FF',
      sender: '#27272B',
      reply: '#FFFFFF',
      replyBubbleInner: '#9E82ED',
      replyBubbleReceive: '#05070B',
      border: '#EAECF0',
      memberName: '#FFF',
    },
    labels: {
      fill: '#2F343B',
      stroke: '#424857',
      text: '#EAECF0',
    },
    progress: {
      container: '#6A35FF3D',
      bar: '#6A35FF',
      senderContainer: '#9E82ED',
      senderBar: '#FFFFFF',
    },
    button: {
      black: '#6A35FF',
      disabled: '#61616B',
      accent: '#9E82ED',
    },
  };
  return (theme ? theme : themeValue) === 'light' ? light : dark;
};

export default DynamicColors;
