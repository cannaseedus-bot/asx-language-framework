# XJSON Specification v1

XJSON extends JSON with tagged objects. A tagged object is any object that has a key that
starts with `@`, such as `@block`, `@if`, `@then`, `@else`.

The runtime MUST treat plain JSON data as-is and only apply special semantics to tagged
objects it understands.
