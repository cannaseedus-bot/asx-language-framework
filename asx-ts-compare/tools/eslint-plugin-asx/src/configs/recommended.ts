export default {
  plugins: ["asx"],
  rules: {
    "asx/envelope-required": "error",
    "asx/effects-subset": "error",
    "asx/effects-flow": "error",
    "asx/import-hash-bound": "error",
    "asx/forbidden-transitive-imports": "error"
  }
};
