// tree-sitter-matrix/grammar.js
// MATRIX grammar focused on:
// - @@directives
// - @blocks / @keys
// - scalar values, arrays, objects
// - sealed includes: {{ ... }}
//
// Notes:
// - Treats indentation as insignificant.
// - Supports comments: # ... and // ...

module.exports = grammar({
  name: "matrix",

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._stmt),

    comment: _ => token(choice(
      seq("#", /.*/),
      seq("//", /.*/),
    )),

    _stmt: $ => choice(
      $.directive_stmt,
      $.pair_stmt,
      $.block_stmt,
      $.blankline
    ),

    blankline: _ => token(/\n+/),

    // @@schema.control  or @@schema~"Name"
    directive_stmt: $ => seq(
      $.directive,
      optional($.inline_kv_tail),
      repeat(choice($.pair_stmt, $.block_stmt)),
    ),

    directive: _ => token(seq("@@", /[A-Za-z_][A-Za-z0-9._~-]*/)),

    // tail like: name: "X"  @types ...
    inline_kv_tail: $ => repeat1(choice(
      $.pair_stmt,
      $.block_stmt
    )),

    // key: value
    pair_stmt: $ => seq(
      field("key", $.key),
      ":",
      field("value", $._value),
      optional($._line_end)
    ),

    // key <newline> indented children (indent ignored, but structurally: key { ... } is supported too)
    block_stmt: $ => choice(
      seq(
        field("key", $.key),
        optional($._line_end),
        field("body", $.block_body)
      ),
      seq(
        field("key", $.key),
        field("body", $.braced_block)
      )
    ),

    block_body: $ => repeat1(choice($.pair_stmt, $.block_stmt)),
    braced_block: $ => seq("{", repeat(choice($.pair_stmt, $.block_stmt)), "}"),

    key: $ => choice(
      $.at_key,
      $.identifier,
      $.string
    ),

    at_key: _ => token(seq("@", /[A-Za-z_][A-Za-z0-9._-]*/)),

    _line_end: _ => token(/\n+/),

    _value: $ => choice(
      $.include,
      $.string,
      $.number,
      $.boolean,
      $.null,
      $.array,
      $.object,
      $.bareword
    ),

    // sealed include: {{ asx-r.schema.xjson }}
    include: $ => seq("{{", optional($.wsp), field("target", $.include_target), optional($.wsp), "}}"),

    include_target: $ => choice(
      $.schema_ref,
      $.uri_ref
    ),

    schema_ref: _ => token(seq(
      /[A-Za-z_][A-Za-z0-9_-]*/,
      repeat(seq(".", /[A-Za-z_][A-Za-z0-9_-]*/)),
      ".schema.xjson"
    )),

    uri_ref: _ => token(seq(
      choice("asx", "mx2lex", "file"),
      "://",
      /[A-Za-z0-9._\/-]+/
    )),

    array: $ => seq(
      "[",
      optional(seq($._value, repeat(seq(",", $._value)))),
      optional(","),
      "]"
    ),

    object: $ => seq(
      "{",
      optional(seq($.pair_inline, repeat(seq(",", $.pair_inline)))),
      optional(","),
      "}"
    ),

    pair_inline: $ => seq(
      field("key", choice($.identifier, $.string)),
      ":",
      field("value", $._value)
    ),

    string: _ => token(choice(
      seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
      seq("'", repeat(choice(/[^'\\]/, /\\./)), "'")
    )),

    number: _ => token(choice(
      /-?\d+\.\d+/, 
      /-?\d+/
    )),

    boolean: _ => token(choice("true", "false")),
    null: _ => token("null"),

    identifier: _ => token(/[A-Za-z_][A-Za-z0-9_-]*/),
    bareword: _ => token(/[A-Za-z0-9._~:+-]+/),

    wsp: _ => token(/[ \t\r\n]+/),
  }
});
