; Treat class name as a definition
(class_decl
  (identifier) @definition.class)

; Treat identifiers inside exports as references
(exports_section
  (identifier) @reference.class)
