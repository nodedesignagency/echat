module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo wires up the react-native-worklets plugin that
  // Reanimated 4 needs, so it must not be listed again here.
  return { presets: ['babel-preset-expo'] };
};
