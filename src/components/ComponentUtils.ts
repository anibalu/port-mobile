import {Dimensions, Platform} from 'react-native';

export const PortColors = {
  primary: {
    blue: {
      app: '#547CEF',
      light: '#88A9FF',
      dull: '#AFCCE4',
    },
    white: '#FFFFFF',
    black: '#000000',
    red: '#EE786B',
    grey: {
      light: '#F6F6F6',
      medium: '#C9C9C9',
      dark: '#868686',
    },
    yellow: {
      dull: '#FEB95A',
    },
  },
};

export const FontSizes = {
  24: {
    bold: {
      fontFamily: 'Rubik-Bold',
      fontSize: 24,
    },
  },
  21: {
    bold: {
      fontFamily: 'Rubik-Bold',
      fontSize: 21,
    },
    semibold: {
      fontFamily: 'Rubik-Semibold',
      fontSize: 21,
    },
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 21,
    },
  },
  17: {
    bold: {
      fontFamily: 'Rubik-Bold',
      fontSize: 17,
    },
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 17,
    },
    regular: {
      fontFamily: 'Rubik-Regular',
      fontSize: 17,
    },
  },
  15: {
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 15,
    },
    regular: {
      fontFamily: 'Rubik-Regular',
      fontSize: 15,
    },
  },
  12: {
    bold: {
      fontFamily: 'Rubik-Bold',
      fontSize: 12,
    },
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 12,
    },
    regular: {
      fontFamily: 'Rubik-Regular',
      fontSize: 12,
    },
  },
};

export const screen = Dimensions.get('window');
export const isIOS = Platform.OS == 'ios';
