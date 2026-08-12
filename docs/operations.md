# Operations reference

ts-chef exposes 479 registered operations across encodings, ciphers, cryptography, hashing, compression, serialization, images, charts, public-key formats, code, text, arithmetic, networking, and general utilities.

Use the {doc}`operation-catalog` for the complete generated list and exact pipeline display names. This page explains how to find, configure, compose, and validate operations.

## Find an operation

The **Operations** sidebar and Pipeline Editor search lightweight registry metadata. Search by a visible name such as:

- `From Base64`, `To Base64`, `From Hex`, or `To hex`;
- `JSON Beautify`, `YAML to JSON`, or `XML Beautify`;
- `SHA2`, `BLAKE3`, `AES Encrypt`, or `JWT Decode`;
- `Gunzip`, `From Hexdump`, or `Detect File Type`;
- `Entropy`, `Strings`, `Extract URLs`, or `Parse URI`.

Search does not load implementation code. The relevant lazy chunk is loaded only when arguments are opened or the operation is run.

## Configure arguments

Expand an operation in Recipe or select it in the Pipeline Editor. Controls are generated from its current argument descriptors and include defaults, choice lists, booleans, numeric fields, and strings as appropriate.

In text pipeline syntax, use named arguments where possible:

```text
To hex(Delimiter=Space)
```

The editor is the authoritative way to inspect exact argument names and supported values. Invalid data may be rejected by an operation even when the pipeline itself parses correctly.

## Common composition patterns

### Decode and format

```text
From Base64 | JSON Beautify
```

### Normalize and hash

```text
Remove whitespace | SHA2
```

### Decode a compressed representation

```text
From Base64 | Gunzip | Strings
```

The correct sequence depends on the actual input. Use hover analysis or Deep Analysis to inspect candidates before applying a destructive replacement.

## Input and output types

The operation engine represents data through `Dish` and `Ingredient` abstractions so text, byte arrays, numbers, and structured values can move between compatible steps. Most conversions are automatic, but a semantically incompatible sequence can still fail or produce unintended text. Test representative input and inspect intermediate graph branches when composing a complex workflow.

## Expensive and side-effecting operations

Some operations are networked, random, file-oriented, computationally expensive, or intended for security analysis. The Pipeline Editor excludes them from automatic live preview and requires an explicit run. This classification protects responsiveness and prevents accidental repetition; it does not remove the operation from normal explicit execution.

## Errors

When execution fails:

1. Identify the first failing step or graph node.
2. Verify input encoding and required arguments.
3. Run that operation alone with a minimal sample.
4. Add preceding transformations back one at a time.
5. Check the implementation link in the catalog for low-level behavior or open a reproducible issue.

## Complete catalog

The generated {doc}`operation-catalog` groups every registered display name by module and links to its TypeScript implementation. Developers must run `npm run docs:catalog` whenever the registry changes.
