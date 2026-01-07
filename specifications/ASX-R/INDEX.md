# ASX-R Specification Index

This directory contains references to the ASX-R Atomic Execution Language specification files.

## Core Specification
- **Location**: `../../../JSON_OS/asx-spec/specification.md`
- **Status**: FROZEN (v1.0.0)
- **Description**: Complete ASX-R language definition

## Operation Specifications

The individual atomic operations are defined in the operations directory:
- **Location**: `../../../JSON_OS/asx-spec/operations/`
- **Operations**: 7 atomic operations in deterministic pipeline

### Operation Files:
1. `accept.md` - Input acceptance and validation
2. `algebra.md` - Algebraic computations
3. `geometry.md` - Geometric processing
4. `cc.md` - Compression calculus
5. `pi.md` - Matrix operations
6. `tokenize.md` - Response tokenization
7. `emit.md` - Output emission

## Syntax Definitions
- **Location**: `../../../JSON_OS/asx-spec/syntax/`
- **Contents**: JSON schema, canonical form, validation rules

## Semantic Rules
- **Location**: `../../../JSON_OS/asx-spec/semantics/`
- **Contents**: Execution model, error handling, determinism guarantees

## Examples
- **Location**: `../../../JSON_OS/asx-spec/examples/`
- **Contents**: Hello world, image processing, advanced pipelines

## Conformance
- **Location**: `../../../JSON_OS/asx-spec/conformance/`
- **Contents**: Test suite, certification process, requirements

## Quick Access

```bash
# View core specification
cat ../../../JSON_OS/asx-spec/specification.md

# List operation specifications
ls ../../../JSON_OS/asx-spec/operations/

# View syntax definitions
ls ../../../JSON_OS/asx-spec/syntax/

# Run conformance tests
cd ../../../JSON_OS && npm test
```

## Reference Implementation
- **Location**: `../../../JSON_OS/kernel/execute_plan.js`
- **Description**: Official ASX-R reference implementation

## Test Suite
- **Location**: `../../../JSON_OS/tests/`
- **Description**: Comprehensive conformance test suite (700+ tests)