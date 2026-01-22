import effectsSubsetRule from "./rules/effects-subset.js";
import effectsFlowRule from "./rules/effects-flow.js";
import envelopeRequiredRule from "./rules/envelope-required.js";
import importHashBoundRule from "./rules/import-hash-bound.js";
import forbiddenTransitiveRule from "./rules/forbidden-transitive-imports.js";
import recommended from "./configs/recommended.js";

export const configs = { recommended };

export const rules = {
  "effects-subset": effectsSubsetRule,
  "effects-flow": effectsFlowRule,
  "envelope-required": envelopeRequiredRule,
  "import-hash-bound": importHashBoundRule,
  "forbidden-transitive-imports": forbiddenTransitiveRule
};

export default {
  rules,
  configs
};
