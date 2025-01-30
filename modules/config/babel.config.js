module.exports = {
  targets: "node 16.0",
  presets: [
    // Order is important!
    "@babel/preset-env",
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
};
