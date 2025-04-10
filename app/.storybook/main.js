const path = require("path");
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  webpackFinal: async (config, { configType }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@ui": path.resolve(__dirname, "../src/ui"),
      "@components": path.resolve(__dirname, "../src/components"),
      "@utils": path.resolve(__dirname, "../src/utils"),
      "@types": path.resolve(__dirname, "../src/types"),
      "@assets": path.resolve(__dirname, "../src/assets"),
    };
    return config;
  },
};
