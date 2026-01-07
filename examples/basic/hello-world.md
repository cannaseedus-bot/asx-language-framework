# Hello World Atomic Example

This example demonstrates a basic ASX-R atomic execution pipeline.

## Atomic Plan Structure

```json
{
  "@atomic_exec": {
    "@id": "asx://atomic_exec/%7C%E2%9A%9B%7C.v1",
    "@name": "|⚛|",
    "@status": "FROZEN",
    "@version": "1.0.0"
  },
  "pipeline": [
    {
      "operation": "|⚛|.accept",
      "input": "Hello, Atomic World!",
      "validation": {
        "type": "string",
        "max_length": 100
      }
    },
    {
      "operation": "|⚛|.algebra",
      "function": "identity",
      "parameters": {}
    },
    {
      "operation": "|⚛|.geometry",
      "function": "passthrough",
      "parameters": {}
    },
    {
      "operation": "|⚛|.cc",
      "algorithm": "none",
      "parameters": {}
    },
    {
      "operation": "|⚛|.pi",
      "matrix": "identity",
      "parameters": {}
    },
    {
      "operation": "|⚛|.tokenize",
      "format": "text",
      "parameters": {
        "language": "english"
      }
    },
    {
      "operation": "|⚛|.emit",
      "format": "text",
      "parameters": {}
    }
  ],
  "metadata": {
    "description": "Basic hello world example",
    "author": "Atomic Team",
    "timestamp": "2026-01-06T00:00:00Z",
    "hash": "a1b2c3d4e5f6..."
  }
}
```

## Execution Flow

### 1. Accept Operation
```javascript
// |⚛|.accept - Input validation
const input = "Hello, Atomic World!";
const validated = validateInput(input, {
  type: "string",
  max_length: 100
});
// Output: { valid: true, data: "Hello, Atomic World!" }
```

### 2. Algebra Operation
```javascript
// |⚛|.algebra - Identity function
const result = identityFunction(validated.data);
// Output: "Hello, Atomic World!"
```

### 3. Geometry Operation
```javascript
// |⚛|.geometry - Passthrough
const geometricResult = passthrough(result);
// Output: "Hello, Atomic World!"
```

### 4. Compression Operation
```javascript
// |⚛|.cc - No compression
const compressed = noCompression(geometricResult);
// Output: "Hello, Atomic World!"
```

### 5. Matrix Operation
```javascript
// |⚛|.pi - Identity matrix
const matrixResult = identityMatrix(compressed);
// Output: "Hello, Atomic World!"
```

### 6. Tokenize Operation
```javascript
// |⚛|.tokenize - Text tokenization
const tokens = tokenizeText(matrixResult, {
  language: "english"
});
// Output: ["Hello", ",", " ", "Atomic", " ", "World", "!"]
```

### 7. Emit Operation
```javascript
// |⚛|.emit - Output emission
const output = emitText(tokens);
// Output: "Hello, Atomic World!"
```

## Complete Execution

```bash
# Run the atomic pipeline
node ../../../JSON_OS/kernel/execute_plan.js hello-world.json

# Expected output:
# {
#   "result": "Hello, Atomic World!",
#   "hash": "a1b2c3d4e5f6...",
#   "operations": 7,
#   "time": "25ms",
#   "status": "success"
# }
```

## Verification

```bash
# Validate the atomic plan
node ../../../JSON_OS/tools/validator.js hello-world.json

# Expected output:
# {
#   "valid": true,
#   "operations": 7,
#   "hash": "a1b2c3d4e5f6...",
#   "warnings": 0,
#   "errors": 0
# }
```

## Key Concepts Demonstrated

1. **Deterministic Pipeline**: Fixed sequence of 7 operations
2. **Single-Authority**: Linear execution without parallel conflicts
3. **Input Validation**: Strict validation in accept operation
4. **Operation Chaining**: Output of each operation feeds next
5. **Metadata Tracking**: Complete execution metadata
6. **Hash Verification**: Cryptographic integrity checking

## Advanced Variations

### With Compression
```json
{
  "operation": "|⚛|.cc",
  "algorithm": "scxq2",
  "parameters": {
    "level": "high",
    "quality": 0.95
  }
}
```

### With Matrix Transformation
```json
{
  "operation": "|⚛|.pi",
  "matrix": "rotation",
  "parameters": {
    "angle": 0,
    "axis": "identity"
  }
}
```

### With Different Output Format
```json
{
  "operation": "|⚛|.emit",
  "format": "json",
  "parameters": {
    "pretty": true
  }
}
```

## Performance Characteristics

- **Execution Time**: ~25ms (target <30ms)
- **Memory Usage**: ~5MB (target <10MB)
- **Operations**: 7 atomic operations
- **Deterministic**: Same hash on repeated execution

## Related Examples

- [Image Processing Example](../advanced/image-processing.md)
- [Advanced Pipeline Example](../advanced/advanced-pipeline.md)
- [Error Handling Example](../advanced/error-handling.md)

---

**Status**: Working Example
**Complexity**: Basic
**Category**: Hello World
**Last Updated**: 2026-01-06