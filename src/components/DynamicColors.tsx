import {useTheme} from 'src/context/ThemeContext';

const DynamicColors = () => {
  const {themeValue} = useTheme();
  const common = {
    red: '#EF4D41',
    darkgrey: '#667085',
    mediumgrey: '#98A2B3',
    lightgrey: '#98A2B340',
    green: '#12B76A',
    disabled: '#CFCCD6',
    accent: '#6A35FF', //purple
    white: '#FFFFFF',
    genericblack: '#000000',
    accentOverlay: 'rgba(106, 53, 255, 0.24)',
    defaultdark: '#05070b',
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
    search: {
      black: '#FFF',
    },
    text: {
      subtitle: '#65626F',
      primary: '#04000F',
    },
    messagebubble: {
      receiver: '#E2D8FF',
      sender: '#FFFFFF',
      reply: '#EDF2FF',
      replyBubbleInner: '#F4F4F5',
    },
    labels: {
      fill: '#FFFCEB',
      stroke: '#FFF6C4',
      text: '#000000',
    },
    progress: {
      container: '#F6F6F6',
      bar: '#4E75FF',
    },
    button: {
      black: '#05070B',
      disabled: '#BCB8C7',
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
    search: {
      black: '#1D232E',
    },
    text: {
      subtitle: '#D0D5DD',
      primary: '#EAECF0',
    },
    messagebubble: {
      receiver: '#6A35FF',
      sender: '#1D232E',
      reply: '#FFFFFF',
      replyBubbleInner: '#9E82ED',
    },
    labels: {
      fill: '#2F343B',
      stroke: '#424857',
      text: '#EAECF0',
    },
    progress: {
      container: '#9E82ED',
      bar: 'white',
    },
    button: {
      black: '#6A35FF',
      disabled: '#61616B',
    },
  };
  return themeValue === 'light' ? light : dark;
};

export default DynamicColors;
