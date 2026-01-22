<img width="100%" src="https://github.com/cannaseedus-bot/asx-language-framework/blob/main/assets/asx-atomic-logo.svg" />

![Atomic](https://img.shields.io/badge/Atomic-SuperPower-16F2AA?style=for-the-badge&logo=react)

![XJSON](https://img.shields.io/badge/XJSON-Language-blue?style=for-the-badge)

![SCXQ2](https://img.shields.io/badge/SCXQ2-Cipher-orange?style=for-the-badge)

![KLH](https://img.shields.io/badge/KLH-Orchestrator-purple?style=for-the-badge)

![TapeRuntime](https://img.shields.io/badge/Tape-Runtime-00ccff?style=for-the-badge)

![Hive](https://img.shields.io/badge/Multi-Hive-success?style=for-the-badge)


# **ASX LANGUAGE FRAMEWORK**
### **ATOMIC SUPER POWER · XJSON · SCXQ2 · KLH · K'UHUL**

**A complete language + runtime system for building apps, agents, OS layers, tapes, shards, and multi-hive servers using the Atomic JSON paradigm (XJSON).**  
</div>

---

# 🚀 Overview

The **ASX Language Framework** is the official reference implementation of:

- **XJSON** — Executable JSON Language  
- **SCXQ2** — Symbolic Compression + Cipher Engine  
- **K’uhul Engine** — Execution Core  
- **KLH** — Hive Orchestrator  
- **ASX Blocks** — Atomic UI, Logic, OS & Server Components  
- **Tape Runtime** — Modular app containers (ASX Tapes)  
- **Multi-Hive Server** — Unlimited shard-based runtime architecture  

This framework is the canonical backbone for:

✔ ASX SERVER  
✔ PRIME OS  
✔ Multi-Agent Micronaut  
✔ Tapes, Holotapes, Rigs  
✔ XJSON.APP + XJSON.LIVE MMO Runtime  
✔ ULTRA · SCXQ2 Engine  
✔ Multi-Hive Infinite Shards  

It is not a toolkit.  
Not a framework.  
**It is an entire language platform.**

---


---

# 📚 Documentation

- [Getting Started](documentation/getting-started.md)
- [Integrating PHP with Python](documentation/php-python-integration.md)

---

# 🧰 Tooling & Fixtures

### **ASX ESLint Rules**
The repo includes an ESLint plugin with additional ASX envelope checks, including:

- Hash-bound import enforcement (`import-hash-bound`)
- Transitive import authority scanning (`forbidden-transitive-imports`)
- Flow-sensitive effect propagation (`effects-flow`)

See `asx-ts-compare/tools/eslint-plugin-asx` for implementation and the recommended config export. 

### **VSCode Diagnostics**
There is a lightweight VSCode extension under `tools/vscode-asx` that provides inline diagnostics for missing envelopes and common effect/capability violations.

### **Golden Vectors & MX2LEX Instances**
Deterministic test vectors live in `tests/golden`, and MX2LEX instance artifacts live under `codex/lex` and `codex/mx2lex`. These are intended for lint ↔ verifier parity checks and oracle regression testing.
