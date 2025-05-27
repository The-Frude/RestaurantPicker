module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@app': './app',
            '@features': './features',
            '@lib': './lib',
            '@providers': './providers',
            '@assets': './assets'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
