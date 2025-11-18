# KLH Specification v1 (Simplified)

KLH maintains:

- a set of `hives`, each with a name and connection info,
- a set of `jobs`, each bound to a hive and handler function.

The API exposes `registerHive`, `registerJob`, and `route`.
