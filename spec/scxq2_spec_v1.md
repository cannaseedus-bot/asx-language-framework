# SCXQ2 Specification v1 (Simplified)

This reference implementation encodes arbitrary JSON-serializable data as:

1. `JSON.stringify` the data.
2. Encode the string as UTF-8.
3. Encode the bytes as Base64.
