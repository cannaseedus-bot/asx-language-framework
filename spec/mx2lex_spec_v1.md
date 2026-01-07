# MX2LEX Schemas v1

MX2LEX provides a deterministic grammar compiler, packager, oracle, and weight-bias binding
pipeline. The following canonical schema definitions capture the JSON structure required for
each stage. All schemas are designed for offline, deterministic use and avoid executable or
external references.

## Grammar (`lex.grammar.v1`)

```json
{
  "@id": "asx://schema/lex.grammar.v1",
  "@type": "asx.schema.v1",
  "@schema": "xjson://schema/core/v1",
  "@status": "FROZEN",
  "@version": "1.0.0",
  "@rules": {
    "deterministic": true,
    "offline": true,
    "no_external_schema_urls": true,
    "no_exec": true,
    "closed_normalization": true
  },
  "@doc": {
    "name": "LEX Grammar",
    "purpose": "Define a grammar + normalization rules that MX2LEX can compile into a legality oracle (finite automaton) deterministically."
  },
  "required": [
    "@type",
    "@meta",
    "tokens",
    "nonterminals",
    "start",
    "productions",
    "constraints"
  ],
  "properties": {
    "@type": { "const": "lex.grammar.v1" },
    "@meta": {
      "type": "object",
      "required": ["id", "lang", "semver", "canon"],
      "properties": {
        "id": { "type": "string", "description": "Grammar identifier" },
        "lang": { "type": "string", "description": "Target language name (e.g., GGL, KUHUL-ES, etc.)" },
        "semver": { "type": "string", "description": "Grammar semantic version" },
        "canon": {
          "type": "object",
          "required": ["ordering", "case", "unicode_nf"],
          "properties": {
            "ordering": { "const": "lexicographic_keys" },
            "case": { "enum": ["preserve", "lower", "upper"] },
            "unicode_nf": { "enum": ["NFC", "NFKC"] }
          }
        },
        "notes": { "type": "string" }
      }
    },
    "tokens": {
      "type": "array",
      "description": "Terminal tokens. IDs MUST be unique and stable.",
      "items": {
        "type": "object",
        "required": ["id", "name", "kind"],
        "properties": {
          "id": { "type": "integer", "minimum": 1 },
          "name": { "type": "string" },
          "kind": { "enum": ["literal", "regex", "class", "special"] },
          "literal": { "type": "string" },
          "regex": {
            "type": "string",
            "description": "Regex *pattern string*; execution environment decides engine; only used for tokenization, not execution."
          },
          "class": {
            "type": "object",
            "description": "Character class spec (engine-agnostic).",
            "properties": {
              "ranges": { "type": "array", "items": { "type": "array" } },
              "chars": { "type": "string" }
            }
          },
          "flags": {
            "type": "object",
            "properties": {
              "skip": { "type": "boolean", "description": "Ignored by parser (e.g., whitespace/comments)" },
              "eof": { "type": "boolean" }
            }
          }
        }
      }
    },
    "nonterminals": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Nonterminal symbols (names)."
    },
    "start": {
      "type": "string",
      "description": "Start nonterminal name."
    },
    "productions": {
      "type": "array",
      "description": "Production rules. Each rule expands a nonterminal into a sequence of symbols.",
      "items": {
        "type": "object",
        "required": ["id", "lhs", "rhs"],
        "properties": {
          "id": { "type": "integer", "minimum": 1, "description": "Stable production id" },
          "lhs": { "type": "string" },
          "rhs": {
            "type": "array",
            "description": "Sequence of symbols: {t: 'T', v: tokenId} or {t:'N', v: nonterminalName}",
            "items": {
              "type": "object",
              "required": ["t", "v"],
              "properties": {
                "t": { "enum": ["T", "N"] },
                "v": { "type": ["integer", "string"] }
              }
            }
          },
          "prec": { "type": "integer", "description": "Optional precedence (higher wins)" },
          "assoc": { "enum": ["left", "right", "none"], "description": "Optional associativity" }
        }
      }
    },
    "constraints": {
      "type": "object",
      "description": "Hard legality constraints applied during parse/validation.",
      "required": ["limits", "ban"],
      "properties": {
        "limits": {
          "type": "object",
          "required": ["max_tokens", "max_depth", "max_nodes"],
          "properties": {
            "max_tokens": { "type": "integer", "minimum": 1 },
            "max_depth": { "type": "integer", "minimum": 1 },
            "max_nodes": { "type": "integer", "minimum": 1 }
          }
        },
        "ban": {
          "type": "array",
          "description": "Banned patterns at grammar level (symbol sequences).",
          "items": {
            "type": "object",
            "required": ["id", "reason", "seq"],
            "properties": {
              "id": { "type": "string" },
              "reason": { "type": "string" },
              "seq": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["t", "v"],
                  "properties": { "t": { "enum": ["T", "N"] }, "v": { "type": ["integer", "string"] } }
                }
              }
            }
          }
        },
        "require": {
          "type": "array",
          "description": "Required tokens/nonterminals that must appear at least once (optional).",
          "items": {
            "type": "object",
            "required": ["t", "v"],
            "properties": { "t": { "enum": ["T", "N"] }, "v": { "type": ["integer", "string"] } }
          }
        }
      }
    },
    "normalization": {
      "type": "object",
      "description": "Deterministic normalization rules applied before tokenization/parsing.",
      "properties": {
        "trim": { "type": "boolean" },
        "collapse_ws": { "type": "boolean" },
        "newline": { "enum": ["lf", "crlf", "preserve"] },
        "tab_width": { "type": "integer", "minimum": 1 },
        "replace": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["from", "to"],
            "properties": { "from": { "type": "string" }, "to": { "type": "string" } }
          }
        }
      }
    }
  }
}
```

## Pack (`mx2lex.pack.v1`)

```json
{
  "@id": "asx://schema/mx2lex.pack.v1",
  "@type": "asx.schema.v1",
  "@schema": "xjson://schema/core/v1",
  "@status": "FROZEN",
  "@version": "1.0.0",
  "@rules": {
    "deterministic_build": true,
    "stable_ids": true,
    "offline": true,
    "no_external_schema_urls": true
  },
  "@doc": {
    "name": "MX2LEX Pack",
    "purpose": "A compiled, normalized artifact: grammar + symbol table + FA export + hashes, used by oracle runtimes in JS/Python/Java."
  },
  "required": [
    "@type",
    "@meta",
    "input",
    "canon",
    "symbols",
    "fa",
    "hashes"
  ],
  "properties": {
    "@type": { "const": "mx2lex.pack.v1" },
    "@meta": {
      "type": "object",
      "required": ["id", "semver", "built_by", "built_ts"],
      "properties": {
        "id": { "type": "string", "description": "Pack id (namespaced)" },
        "semver": { "type": "string" },
        "built_by": { "type": "string", "description": "Tool identifier (e.g., mx2lex-cli@1.0.0)" },
        "built_ts": { "type": "integer", "description": "Unix ms timestamp" }
      }
    },
    "input": {
      "type": "object",
      "required": ["grammar_ref", "grammar_hash"],
      "properties": {
        "grammar_ref": { "type": "string", "description": "asx://schema/lex.grammar.v1 instance reference (path or id)" },
        "grammar_hash": { "type": "string", "description": "sha256:<hex> of canonicalized grammar instance" }
      }
    },
    "canon": {
      "type": "object",
      "required": ["ordering", "unicode_nf", "stable_sort"],
      "properties": {
        "ordering": { "const": "lexicographic_keys" },
        "unicode_nf": { "enum": ["NFC", "NFKC"] },
        "stable_sort": {
          "type": "object",
          "required": ["tokens", "productions", "nonterminals"],
          "properties": {
            "tokens": { "enum": ["by_id_then_name"] },
            "productions": { "enum": ["by_lhs_then_id"] },
            "nonterminals": { "enum": ["lexicographic"] }
          }
        }
      }
    },
    "symbols": {
      "type": "object",
      "required": ["tokens", "nonterminals", "start"],
      "properties": {
        "tokens": {
          "type": "array",
          "description": "Normalized token table (stable ordering).",
          "items": {
            "type": "object",
            "required": ["id", "name", "kind", "flags"],
            "properties": {
              "id": { "type": "integer" },
              "name": { "type": "string" },
              "kind": { "enum": ["literal", "regex", "class", "special"] },
              "spec": { "type": "object", "description": "Token spec body normalized (literal/regex/class)" },
              "flags": { "type": "object", "properties": { "skip": { "type": "boolean" }, "eof": { "type": "boolean" } } }
            }
          }
        },
        "nonterminals": { "type": "array", "items": { "type": "string" } },
        "start": { "type": "string" }
      }
    },
    "fa": {
      "type": "object",
      "description": "Deterministic finite automaton export for legality checks.",
      "required": ["type", "alphabet", "states", "start_state", "accepting", "transitions"],
      "properties": {
        "type": { "enum": ["DFA"] },
        "alphabet": { "type": "array", "items": { "type": "integer" }, "description": "Token ids used as symbols" },
        "states": { "type": "array", "items": { "type": "integer" }, "description": "State ids" },
        "start_state": { "type": "integer" },
        "accepting": { "type": "array", "items": { "type": "integer" } },
        "transitions": {
          "type": "array",
          "description": "Stable transition list (sorted by from, symbol).",
          "items": {
            "type": "object",
            "required": ["from", "sym", "to"],
            "properties": { "from": { "type": "integer" }, "sym": { "type": "integer" }, "to": { "type": "integer" } }
          }
        }
      }
    },
    "hashes": {
      "type": "object",
      "required": ["pack_self", "fa_hash", "symbols_hash"],
      "properties": {
        "pack_self": { "type": "string", "description": "sha256:SELF (computed by verifier)" },
        "fa_hash": { "type": "string", "description": "sha256:<hex> of FA canonical form" },
        "symbols_hash": { "type": "string", "description": "sha256:<hex> of symbols canonical form" }
      }
    },
    "policy": {
      "type": "object",
      "description": "Optional bounded policy for oracle usage (trace caps, etc.)",
      "properties": {
        "trace": {
          "type": "object",
          "properties": {
            "max_steps": { "type": "integer", "minimum": 1 },
            "max_errors": { "type": "integer", "minimum": 1 }
          }
        }
      }
    }
  }
}
```

## Oracle (`mx2lex.oracle.v1`)

```json
{
  "@id": "asx://schema/mx2lex.oracle.v1",
  "@type": "asx.schema.v1",
  "@schema": "xjson://schema/core/v1",
  "@status": "FROZEN",
  "@version": "1.0.0",
  "@rules": {
    "bounded": true,
    "deterministic": true,
    "offline": true,
    "no_exec": true,
    "no_external_schema_urls": true
  },
  "@doc": {
    "name": "MX2LEX Legality Oracle",
    "purpose": "Given (pack + input text OR token stream), decide legality and provide a bounded trace explaining the first failure (or acceptance)."
  },
  "required": ["@type", "@meta", "abi", "input", "output"],
  "properties": {
    "@type": { "const": "mx2lex.oracle.v1" },
    "@meta": {
      "type": "object",
      "required": ["id", "semver", "pack_ref", "pack_hash", "policy"],
      "properties": {
        "id": { "type": "string" },
        "semver": { "type": "string" },
        "pack_ref": { "type": "string" },
        "pack_hash": { "type": "string", "description": "sha256:<hex> of mx2lex.pack canonical form" },
        "policy": {
          "type": "object",
          "required": ["trace_max_steps", "trace_max_errors", "max_tokens"],
          "properties": {
            "trace_max_steps": { "type": "integer", "minimum": 1 },
            "trace_max_errors": { "type": "integer", "minimum": 1 },
            "max_tokens": { "type": "integer", "minimum": 1 }
          }
        }
      }
    },
    "abi": {
      "type": "object",
      "description": "ABI binding rules that stop drift across JS/Python/Java.",
      "required": ["id", "hash_algo", "bind"],
      "properties": {
        "id": { "const": "asx://abi/mx2lex.oracle.abi.v1" },
        "hash_algo": { "enum": ["sha256"] },
        "bind": {
          "type": "array",
          "description": "Field paths that must be included in ABI hash computation (ordered).",
          "items": { "type": "string" }
        }
      }
    },
    "input": {
      "type": "object",
      "required": ["mode", "payload"],
      "properties": {
        "mode": { "enum": ["text", "tokens"] },
        "payload": {
          "type": "object",
          "description": "If mode=text: {text, normalize:true/false}. If mode=tokens: {tokens:[tokenId...]}.",
          "properties": {
            "text": { "type": "string" },
            "normalize": { "type": "boolean" },
            "tokens": { "type": "array", "items": { "type": "integer" } }
          }
        }
      }
    },
    "output": {
      "type": "object",
      "required": ["ok", "decision", "trace"],
      "properties": {
        "ok": { "type": "boolean", "description": "Oracle executed successfully (not same as decision)" },
        "decision": { "enum": ["PASS", "FAIL"] },
        "trace": {
          "type": "object",
          "required": ["steps", "errors", "summary"],
          "properties": {
            "steps": {
              "type": "array",
              "description": "Bounded list of DFA steps (token -> next state).",
              "items": {
                "type": "object",
                "required": ["i", "state", "token", "next"],
                "properties": {
                  "i": { "type": "integer", "minimum": 0 },
                  "state": { "type": "integer" },
                  "token": { "type": "integer" },
                  "next": { "type": "integer" }
                }
              }
            },
            "errors": {
              "type": "array",
              "description": "Bounded list; first error is the canonical failure point.",
              "items": {
                "type": "object",
                "required": ["i", "state", "token", "code", "msg"],
                "properties": {
                  "i": { "type": "integer" },
                  "state": { "type": "integer" },
                  "token": { "type": "integer" },
                  "code": { "enum": ["TOKENIZE_FAIL", "NO_TRANSITION", "LIMIT_EXCEEDED", "NONCANONICAL_INPUT"] },
                  "msg": { "type": "string" }
                }
              }
            },
            "summary": {
              "type": "object",
              "required": ["accepted", "tokens_seen", "final_state"],
              "properties": {
                "accepted": { "type": "boolean" },
                "tokens_seen": { "type": "integer" },
                "final_state": { "type": "integer" }
              }
            }
          }
        },
        "hashes": {
          "type": "object",
          "description": "Optional binding outputs (SELF hash, abi hash).",
          "properties": {
            "abi_hash": { "type": "string" },
            "oracle_self": { "type": "string" }
          }
        }
      }
    }
  }
}
```

## Weight Bias Binding (`mx2lex.weights.bind.v1`)

```json
{
  "@id": "asx://schema/mx2lex.weights.bind.v1",
  "@type": "asx.schema.v1",
  "@schema": "xjson://schema/core/v1",
  "@status": "FROZEN",
  "@version": "1.0.0",
  "@rules": {
    "no_exec": true,
    "deterministic": true,
    "append_only_minor": true,
    "hash_anchored": true,
    "bounded": true
  },
  "@doc": {
    "name": "MX2LEX Weight Bias Binding",
    "purpose": "Map lex symbols/classes into stable bias channels used by training/inference (logit bias, constraint bias, structural reward) without changing model weights here."
  },
  "required": [
    "@type",
    "@meta",
    "bind",
    "channels",
    "hashes"
  ],
  "properties": {
    "@type": { "const": "mx2lex.weights.bind.v1" },
    "@meta": {
      "type": "object",
      "required": ["id", "semver", "pack_ref", "pack_hash", "canon"],
      "properties": {
        "id": { "type": "string" },
        "semver": { "type": "string" },
        "pack_ref": { "type": "string" },
        "pack_hash": { "type": "string", "description": "sha256:<hex> of mx2lex.pack canonical form" },
        "canon": {
          "type": "object",
          "required": ["ordering"],
          "properties": { "ordering": { "const": "lexicographic_keys" } }
        }
      }
    },
    "channels": {
      "type": "array",
      "description": "Stable channel definitions. IDs are immutable.",
      "items": {
        "type": "object",
        "required": ["id", "name", "mode", "range"],
        "properties": {
          "id": { "type": "integer", "minimum": 1 },
          "name": { "type": "string" },
          "mode": { "enum": ["logit_bias", "reward", "penalty", "mask"] },
          "range": {
            "type": "object",
            "required": ["min", "max"],
            "properties": { "min": { "type": "number" }, "max": { "type": "number" } }
          },
          "notes": { "type": "string" }
        }
      }
    },
    "bind": {
      "type": "array",
      "description": "Bindings from symbols/classes to channels. Deterministic ordering required.",
      "items": {
        "type": "object",
        "required": ["id", "target", "channel", "value"],
        "properties": {
          "id": { "type": "string", "description": "Stable binding id" },
          "target": {
            "type": "object",
            "required": ["kind", "ref"],
            "properties": {
              "kind": { "enum": ["token", "token_name", "nonterminal", "production", "class"] },
              "ref": { "type": ["integer", "string"] },
              "scope": { "enum": ["global", "prefix", "suffix", "position"], "description": "Optional binding scope" }
            }
          },
          "channel": { "type": "integer", "description": "Channel id" },
          "value": { "type": "number", "description": "Value applied within channel range" },
          "when": {
            "type": "object",
            "description": "Optional gating conditions (bounded).",
            "properties": {
              "only_if_legal": { "type": "boolean" },
              "only_if_illegal": { "type": "boolean" },
              "dfa_state": { "type": "integer" }
            }
          }
        }
      }
    },
    "hashes": {
      "type": "object",
      "required": ["bind_self", "channels_hash", "bind_hash"],
      "properties": {
        "bind_self": { "type": "string", "description": "sha256:SELF (computed by verifier)" },
        "channels_hash": { "type": "string" },
        "bind_hash": { "type": "string" }
      }
    },
    "limits": {
      "type": "object",
      "description": "Hard caps to prevent runaway bindings.",
      "properties": {
        "max_channels": { "type": "integer", "minimum": 1 },
        "max_bindings": { "type": "integer", "minimum": 1 },
        "max_abs_value": { "type": "number", "minimum": 0 }
      }
    }
  }
}
```
