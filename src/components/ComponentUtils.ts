import {Dimensions, Platform} from 'react-native';

/**
 * All app colors, use colors defined here only.
 */
export const PortColors = {
  stroke: '#EAECF0',
  subtitle: '#667085',
  background: '#F2F4F7',
  title: '#1D2939',
  text: {
    title: '#547CEF',
    primary: '#000000',
    secondary: '#868686',
    labels: '#C9C9C9',
    primaryWhite: '#FFFFFF',
    backgroundGrey: '#3B3B3B',
    greenLabel: '#00340B',
    alertGreen: '#6FC960',
    delete: '#EE786B',
    messageBubble: {
      senderTimestamp: '#868686',
      receiverTimestamp: '#71899C',
      profileName: '#7C7C7C',
      infoText: '#00340B',
      dateBoundary: '#71899C',
    },
  },
  primary: {
    body: '#98A2B3',
    notch: '#D9D9D9',
    blue: {
      app: '#547CEF',
      light: '#88A9FF',
      dull: '#AFCCE4',
      overlay: '#BAD0E3',
    },
    white: '#FFFFFF',
    black: '#000000',
    red: {error: '#EE786B', light: '#FFE6E6'},
    grey: {
      light: '#F6F6F6',
      medium: '#C9C9C9',
      dark: '#868686',
      bold: '#717171',
    },
    yellow: {
      dull: '#FEB95A',
    },
    success: '#6FC960',
    border: {
      dullGrey: '#e5e5e5',
      separatorGrey: '#F4F4F4',
    },
    messageBubble: {
      dateBoundary: {
        background: '#FFFFFF',
        border: '#E5E5E5',
      },
      data: {
        blobBackground: '#EFFEE0',
        blobBorder: '#D7E3CA',
      },
      receiver: {
        blobBackground: '#D4EBFF',
        blobBorder: '#C5DDF1',
      },
      sender: {
        blobBorder: '#E5E5E5',
        blobBackground: '#FFFFFF',
      },
      selected: {
        blobBackground: '#81C2FF',
        blobBorder: '#547CEF',
      },
    },
  },
};

/**
 * All fonts used in the app. Always use this object to define font sizes, if you ever need to.
 */
export const FontSizes = {
  24: {
    bold: {
      fontFamily: 'Rubik-Bold',
      fontSize: 24,
    },
  },
  21: {
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 21,
      fontWeight: '500',
    },
  },
  17: {
    bold: {
      fontFamily: 'Rubik-Bold',
      fontSize: 17,
      fontWeight: '700',
    },
    semibold: {
      fontFamily: 'Rubik-SemiBold',
      fontSize: 17,
      fontWeight: '600',
    },
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 17,
      fontWeight: '500',
    },
    regular: {
      fontFamily: 'Rubik-Regular',
      fontSize: 17,
      fontWeight: '400',
    },
  },
  15: {
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 15,
      fontWeight: '500',
    },
    regular: {
      fontFamily: 'Rubik-Regular',
      fontSize: 15,
      fontWeight: '400',
    },
  },
  16: {
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 16,
      fontWeight: '500',
    },
    regular: {
      fontFamily: 'Rubik-Regular',
      fontSize: 16,
      fontWeight: '400',
    },
  },
  12: {
    semibold: {
      fontFamily: 'Rubik-SemiBold',
      fontSize: 12,
      fontWeight: '600',
    },
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 12,
      fontWeight: '500',
    },
    regular: {
      fontFamily: 'Rubik-Regular',
      fontSize: 12,
      fontWeight: '400',
    },
  },
  10: {
    medium: {
      fontFamily: 'Rubik-Medium',
      fontSize: 10,
      fontWeight: '500',
    },
  },
};

export const screen = Dimensions.get('window');
export const isIOS = Platform.OS == 'ios';
