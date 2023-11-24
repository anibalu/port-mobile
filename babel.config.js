module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@components': './src/components',
          '@configs': './src/configs',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@store': './src/store',
          '@utils': './src/utils',
          '@assets': './assets',
        },
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.jsx',
          '.android.jsx',
          '.js',
          '.jsx',
          '.json',
          '.ts',
          '.tsx',
        ],
      },
    ],
  ],
  presets: ['module:metro-react-native-babel-preset'],
};
