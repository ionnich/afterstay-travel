const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const origResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, react-native-maps can't resolve — return empty module
  if (
    platform === 'web' &&
    (moduleName === 'react-native-maps' || moduleName.includes('react-native-maps/'))
  ) {
    return { type: 'empty' };
  }

  // react-native-get-random-values ships no `main`/`exports` field; Metro's
  // package-exports resolution (on by default since RN 0.79) can't find its
  // entry, leaving aws-amplify's lazy require unresolved at runtime.
  if (moduleName === 'react-native-get-random-values') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('react-native-get-random-values/index.js'),
    };
  }

  return origResolve
    ? origResolve(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
