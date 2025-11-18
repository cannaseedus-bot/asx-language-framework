# XCFE Specification v1

XCFE control-flow nodes have the following structure:

- `@if`: an expression object or variable reference.
- `@then`: a node or list of nodes to evaluate when truthy.
- `@else`: an optional node or list of nodes to evaluate when falsy.
