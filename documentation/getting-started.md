# Getting Started with @XJSON Atomic Languages

## Introduction

Welcome to the @XJSON Atomic Languages ecosystem! This guide will help you understand and start using the ASX-R Atomic Execution Language and ATOMIC COMPRESSION framework.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14+ recommended)
- **Python** (v3.8+ for some tools)
- **Basic JavaScript knowledge**
- **Familiarity with JSON**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mistral-ai/mistral-vibe.git
cd mistral-vibe/@XJSON
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (if needed)
pip install -r requirements.txt
```

### 3. Verify Setup

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Run basic test
node JSON_OS/kernel/execute_plan.js --help
```

## Understanding Atomic Languages

### ASX-R Atomic Execution Language

ASX-R is a deterministic, single-authority execution language with:

- **7 Atomic Operations**: Fixed pipeline
- **Deterministic Execution**: Reproducible results
- **Single-Authority**: No parallel conflicts
- **Canonical JSON**: Consistent format

### ATOMIC COMPRESSION Framework

ATOMIC COMPRESSION unifies:

- **Tokenizers**: Linguistic processing
- **Brains**: Cognitive systems
- **Compression**: Efficiency optimization

## Running Your First Atomic Program

### 1. Hello World Example

```bash
# Navigate to examples
cd @XJSON_atomics/examples/basic

# Create hello-world.json
cat > hello-world.json << 'EOF'
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
      "validation": {"type": "string", "max_length": 100}
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
      "parameters": {"language": "english"}
    },
    {
      "operation": "|⚛|.emit",
      "format": "text",
      "parameters": {}
    }
  ]
}
EOF
```

### 2. Execute the Pipeline

```bash
# Run the atomic execution
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

### 3. Validate the Plan

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

## Key Concepts

### Atomic Pipeline

```
|⚛|.accept → |⚛|.algebra → |⚛|.geometry → |⚛|.cc → |⚛|.pi → |⚛|.tokenize → |⚛|.emit
```

### Operation Breakdown

1. **`|⚛|.accept`**: Input validation and acceptance
2. **`|⚛|.algebra`**: Algebraic computations
3. **`|⚛|.geometry`**: Geometric processing
4. **`|⚛|.cc`**: Compression calculus
5. **`|⚛|.pi`**: Matrix operations
6. **`|⚛|.tokenize`**: Response tokenization
7. **`|⚛|.emit`**: Output emission

## Development Workflow

### 1. Create Atomic Plan

```json
{
  "@atomic_exec": {
    "@id": "asx://atomic_exec/%7C%E2%9A%9B%7C.v1",
    "@name": "|⚛|",
    "@version": "1.0.0"
  },
  "pipeline": [
    {
      "operation": "|⚛|.accept",
      "input": "Your input here",
      "validation": {}
    },
    {
      "operation": "|⚛|.algebra",
      "function": "your_function",
      "parameters": {}
    },
    {
      "operation": "|⚛|.geometry",
      "function": "your_function",
      "parameters": {}
    },
    {
      "operation": "|⚛|.cc",
      "algorithm": "scxq2",
      "parameters": {"level": "high"}
    },
    {
      "operation": "|⚛|.pi",
      "matrix": "identity",
      "parameters": {}
    },
    {
      "operation": "|⚛|.tokenize",
      "format": "text",
      "parameters": {"language": "english"}
    },
    {
      "operation": "|⚛|.emit",
      "format": "text",
      "parameters": {}
    }
  ]
}
```

### 2. Validate Plan

```bash
node JSON_OS/tools/validator.js your-plan.json
```

### 3. Execute Plan

```bash
node JSON_OS/kernel/execute_plan.js your-plan.json
```

### 4. Test and Debug

```bash
# Run conformance tests
npm test

# Check specific operation
node JSON_OS/tools/debugger.js your-plan.json --operation |⚛|.algebra
```

## Advanced Topics

### Using Compression

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

### Matrix Operations

```json
{
  "operation": "|⚛|.pi",
  "matrix": "rotation",
  "parameters": {
    "angle": 45,
    "axis": "z"
  }
}
```

### Multi-Lingual Support

```json
{
  "operation": "|⚛|.tokenize",
  "format": "text",
  "parameters": {
    "language": "javascript",
    "context": "code"
  }
}
```

## Troubleshooting

### Common Issues

1. **Invalid Atomic Plan**
   - Check JSON syntax
   - Validate operation sequence
   - Ensure all required fields present

2. **Execution Errors**
   - Check input validation
   - Verify operation parameters
   - Review error messages

3. **Performance Issues**
   - Optimize compression settings
   - Reduce pipeline complexity
   - Check memory usage

### Debugging Commands

```bash
# Validate plan structure
node JSON_OS/tools/validator.js your-plan.json

# Check specific operation
node JSON_OS/tools/debugger.js your-plan.json --operation |⚛|.algebra

# View execution trace
node JSON_OS/kernel/execute_plan.js your-plan.json --trace

# Check conformance
npm test -- your-plan.json
```

## Best Practices

### 1. Plan Structure
- Keep plans focused and modular
- Use clear operation naming
- Include comprehensive metadata
- Maintain consistent formatting

### 2. Performance
- Optimize compression levels
- Minimize unnecessary operations
- Use appropriate data formats
- Cache repeated computations

### 3. Error Handling
- Validate all inputs
- Handle edge cases gracefully
- Provide meaningful error messages
- Implement fallback strategies

### 4. Documentation
- Comment complex operations
- Document parameters and expectations
- Include usage examples
- Maintain version history

## Learning Resources

### Official Documentation
- [ASX-R Specification](../specifications/ASX-R/INDEX.md)
- [ATOMIC COMPRESSION Framework](../specifications/ATOMIC_COMPRESSION/INDEX.md)
- [Atomic Language Analysis](../../JSON_OS/ATOMIC_LANGUAGE_ANALYSIS.md)

### Examples
- [Hello World Example](../examples/basic/hello-world.md)
- [Image Processing Example](../examples/advanced/image-processing.md)
- [Advanced Pipeline Example](../examples/advanced/advanced-pipeline.md)

### Community
- [GitHub Issues](https://github.com/json-os/issues)
- [JSON-OS Discussions](https://github.com/json-os/discussions)
- [Documentation](https://docs.json-os.org)

## Next Steps

1. **Explore Examples**: Try different example plans
2. **Read Specifications**: Understand ASX-R and ATOMIC COMPRESSION
3. **Experiment**: Create your own atomic plans
4. **Contribute**: Share your creations with the community
5. **Join Community**: Participate in discussions and development

## Support

For help and support:

- **GitHub Issues**: [json-os/issues](https://github.com/json-os/issues)
- **Community Forum**: [JSON-OS Discussions](https://github.com/json-os/discussions)
- **Email**: support@json-os.org
- **Documentation**: [JSON-OS Docs](https://docs.json-os.org)

---

**Last Updated**: 2026-01-06
**Version**: 1.0
**Status**: Active Development
**Maintainer**: @XJSON Atomic Team
**Contact**: atomic@xjson.org

*"Start your atomic journey today!"* 🚀