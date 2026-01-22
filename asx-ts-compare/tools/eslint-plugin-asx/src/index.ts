import effectsSubsetRule from "./rules/effects-subset.js";
import envelopeRequiredRule from "./rules/envelope-required.js";

export const rules = {
  "effects-subset": effectsSubsetRule,
  "envelope-required": envelopeRequiredRule
};

export default {
  rules
};
