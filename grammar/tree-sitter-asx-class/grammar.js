// Tree-sitter grammar for ASX Class Blocks
// Scope: structural class declarations only
// No execution, no projection authority

module.exports = grammar({
  name: "asx_class",

  extras: $ => [
    /\s/,
    $.comment
  ],

  rules: {
    source_file: $ => repeat($.class_decl),

    class_decl: $ => seq(
      "@@class.",
      $.class_kind,
      $.identifier,
      "{",
      repeat($.class_section),
      "}"
    ),

    class_kind: _ => choice(
      "atomic",
      "micronaut",
      "engine",
      "control",
      "schema",
      "projection"
    ),

    class_section: $ => choice(
      $.meta_section,
      $.state_section,
      $.lifecycle_section,
      $.exports_section,
      $.vectors_section,
      $.renderer_section,
      $.invariants_section,
      $.includes_section
    ),

    meta_section: $ => seq(
      "meta",
      "{",
      repeat($.meta_field),
      "}"
    ),

    meta_field: $ => seq(
      $.identifier,
      ":",
      $.value
    ),

    state_section: $ => seq(
      "state",
      "{",
      repeat($.state_field),
      "}"
    ),

    state_field: $ => seq(
      $.identifier,
      ":",
      $.type
    ),

    lifecycle_section: $ => seq(
      "lifecycle",
      "{",
      "states",
      ":",
      $.array,
      "transitions",
      ":",
      $.array,
      "}"
    ),

    exports_section: $ => seq(
      "exports",
      "{",
      repeat($.identifier),
      "}"
    ),

    vectors_section: $ => seq(
      "vectors",
      "{",
      repeat($.vector_field),
      "}"
    ),

    vector_field: $ => seq(
      $.identifier,
      ":",
      $.array
    ),

    renderer_section: $ => seq(
      "renderer",
      "{",
      repeat($.renderer_field),
      "}"
    ),

    renderer_field: $ => seq(
      $.identifier,
      ":",
      $.value
    ),

    invariants_section: $ => seq(
      "invariants",
      "{",
      repeat($.string),
      "}"
    ),

    includes_section: $ => seq(
      "includes",
      $.array
    ),

    // ---- primitives ----

    type: _ => choice(
      "string",
      "number",
      "boolean",
      "array",
      "object"
    ),

    value: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.array,
      $.object
    ),

    array: $ => seq(
      "[",
      optional(seq($.value, repeat(seq(",", $.value)))),
      "]"
    ),

    object: $ => seq(
      "{",
      repeat(seq($.identifier, ":", $.value)),
      "}"
    ),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9._-]*/,

    string: _ => /"([^"\\]|\\.)*"/,
    number: _ => /-?\d+(\.\d+)?/,
    boolean: _ => choice("true", "false"),

    comment: _ => token(choice(
      seq("//", /.*/),
      seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
    ))
  }
});
