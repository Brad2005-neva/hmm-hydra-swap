const { ProvidePlugin } = require("webpack");
const path = require("path");
module.exports = function (config, env) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(m?js|ts|tsx)$/,
          enforce: "pre",
          use: ["source-map-loader"],
        },
      ],
    },
    plugins: [
      ...config.plugins,
      new ProvidePlugin({
        process: "process/browser",
      }),
    ],
    resolve: {
      ...config.resolve,
      fallback: {
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
        stream: require.resolve("stream-browserify"),
        crypto: false,
      },
      alias: {
        ...config.resolve.alias,
        "@ui": path.resolve(__dirname, "src/ui"),
        "@components": path.resolve(__dirname, "src/components"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@types": path.resolve(__dirname, "src/types"),
        "@assets": path.resolve(__dirname, "src/assets"),
      },
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};
