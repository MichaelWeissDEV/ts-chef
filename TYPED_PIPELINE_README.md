# Strongly Typed Pipeline System for ts-chef

This document describes the new strongly typed pipeline system that enables arbitrary chaining of operations with full type safety.

## Overview

The new system provides:

1. **Strong Typing**: All operations now have explicit input/output types and argument types
2. **Pipeline Chaining**: Operations can be chained together using a fluent API
3. **Error Handling**: Comprehensive error handling with detailed results
4. **Backwards Compatibility**: Existing code continues to work while new code can use the enhanced types

## New Files Created

- `src/chef/Operation_new.ts` - Enhanced operation base class with generics
- `src/chef/Pipeline_new.ts` - Enhanced pipeline class with type safety
- `src/chef/operations/ToHex_new.ts` - Strongly typed ToHex operation
- `src/chef/operations/FromHex_new.ts` - Strongly typed FromHex operation
- `src/chef/operations/typed-index.ts` - Index of typed operations and utilities
- `src/test/pipeline-typed.test.ts` - Comprehensive tests for the new system

## Key Features

### 1. Strongly Typed Operations

```typescript
// New operation class with explicit types
class MyOperation extends TypedOperation<string, number, [multiplier: number]> {
  constructor() {
    super();
    this.name = "My Operation";
    this.inputType = INPUT_TYPES.STRING;
    this.outputType = INPUT_TYPES.NUMBER;
  }

  run(input: string, args: [number]): number {
    const [multiplier] = args;
    return input.length * multiplier;
  }
}
```

### 2. Operation Arguments with Strong Typing

```typescript
// Create operation with pre-configured arguments
const op = new ToHex().withArgs("Space", 0);

// The withArgs method returns OperationWithArgs which holds both operation and args
const result = await op.run(input); // No need to pass args separately
```

### 3. Pipeline Chaining

#### Method 1: Using `.pipe()`

```typescript
// Chain operations using the pipe method
const pipeline = new FromBase64()
  .withArgs()                  // No args needed
  .pipe(new ToHex())          // Chain next operation
  .pipeWithArgs(new Reverse(), []); // Chain with args

const result = await pipeline.run("SGVsbG8="); // "Hello" in Base64
```

#### Method 2: Using `pipe()` helper function

```typescript
// Functional approach for building pipelines
const pipeline = pipe(
  new FromBase64(),
  new ToHex().withArgs("Colon", 0),
  new Reverse()
);

const result = await pipeline.run(input);
```

#### Method 3: Using Pipeline class (traditional)

```typescript
// Traditional pipeline with improved type safety
const pipeline = Pipeline.of("From Base64")
  .pipe("To Hex", ["Space", 0])
  .pipe("Reverse");

const result = await pipeline.run("SGVsbG8=");
```

#### Method 4: Using Pipeline Builder

```typescript
// Builder pattern for complex pipelines
const pipeline = Pipeline.build(builder => {
  builder.add("From Base64");
  builder.add("To Hex", ["Space", 0]);
  builder.add("Reverse");
});

const result = await pipeline.run(input);
```

### 4. Pipeline Execution with Results

```typescript
// Execute pipeline and get detailed results for each step
const { success, results, finalOutput, errors } = await pipeline.runWithResults(input);

console.log(`Success: ${success}`);
console.log(`Final output: ${finalOutput}`);
console.log(`Errors: ${errors.length}`);

// Inspect each step
results.forEach((stepResult, index) => {
  console.log(`Step ${index}: ${stepResult.operation}`);
  console.log(`  Success: ${stepResult.success}`);
  console.log(`  Duration: ${stepResult.duration}ms`);
  if (stepResult.error) {
    console.log(`  Error: ${stepResult.error.message}`);
  }
});
```

### 5. Error Handling

```typescript
// Each operation can be executed with detailed error handling
const result = await operation.runWithResult(input, args);

if (result.success) {
  console.log(`Operation succeeded: ${result.data}`);
} else {
  console.error(`Operation failed: ${result.error.message}`);
  console.error(`Operation: ${result.operation}`);
  console.error(`Duration: ${result.duration}ms`);
}
```

### 6. Convenience Functions

```typescript
// Pre-configured operation factories
const toHexOp = toHex("Colon", 0);        // ToHex with delimiter=":" and bytesPerLine=0
const fromHexOp = fromHexOp("Space");     // FromHex with delimiter="Space"

// Chain convenience functions
const pipeline = toHex("Space", 0)
  .pipe(fromHexOp("Space"));
```

### 7. Creating Custom Typed Operations

```typescript
// Using the createTypedOperation helper
const StringLengthOp = createTypedOperation<string, number, []>({
  name: "String Length",
  module: "Test",
  description: "Returns the length of a string",
  inputType: INPUT_TYPES.STRING,
  outputType: INPUT_TYPES.NUMBER,
  run: (input: string) => input.length,
});

const op = new StringLengthOp();
const result = op.run("Hello", []); // returns 5
```

## Type Safety Features

### Input/Output Types

All operations now specify their expected input and output types using the `InputType` constants:

```typescript
INPUT_TYPES.STRING        // Text strings
INPUT_TYPES.NUMBER        // Numeric values
INPUT_TYPES.BIGINT        // BigInt values
INPUT_TYPES.BOOLEAN       // Boolean values
INPUT_TYPES.ARRAY_BUFFER  // Raw binary data as ArrayBuffer
INPUT_TYPES.UINT8_ARRAY   // Raw binary data as Uint8Array
INPUT_TYPES.HEX           // Hex encoded strings
INPUT_TYPES.BASE64        // Base64 encoded strings
INPUT_TYPES.BYTE_ARRAY    // Byte arrays (hex or raw bytes)
INPUT_TYPES.JSON          // JSON objects/arrays
INPUT_TYPES.HTML          // HTML content
INPUT_TYPES.FILE          // File objects
INPUT_TYPES.LIST_FILE     // Lists of files
```

### Generic Operation Types

```typescript
// Base operation class with generics
abstract class Operation<TInput = PipelineData, TOutput = PipelineData, TArgs extends unknown[] = unknown[]> {
  abstract run(input: TInput, args: TArgs): TOutput | Promise<TOutput>;
}

// Typed operation helper (optional, for better type inference)
abstract class TypedOperation<TInput, TOutput, TArgs extends unknown[]> 
  extends Operation<TInput, TOutput, TArgs> {
  // Same as Operation but with explicit types
}
```

### Common Type Aliases

```typescript
// String to String operations
type StringOperation = Operation<string, string, unknown[]>;

// String to Bytes operations
type StringToBytesOperation = Operation<string, number[], unknown[]>;

// Bytes to String operations
type BytesToStringOperation = Operation<number[] | Uint8Array, string, unknown[]>;

// Generic transformation
type TransformOperation<T extends PipelineData = PipelineData> = Operation<T, T, unknown[]>;
```

## Migration Guide

### For Existing Operations

To migrate an existing operation to use the new system:

**Before:**
```typescript
import { Operation, AnyInput } from "../Operation";

export class ToHex extends Operation {
  constructor() {
    super();
    this.name = "To hex";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Delimiter", type: "option", value: DELIM_OPTIONS },
      { name: "Bytes per line", type: "number", value: 0 },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const delimOpt = args[0] as string;
    const bytesPerLine = args[1] as number;
    // ... implementation
  }
}
```

**After:**
```typescript
import { TypedOperation, INPUT_TYPES } from "../Operation_new";
import { PipelineData, toUint8Array } from "../types";

export class ToHex extends TypedOperation<PipelineData, string, [delimiter: string, bytesPerLine: number]> {
  constructor() {
    super();
    this.name = "To hex";
    this.inputType = INPUT_TYPES.ARRAY_BUFFER;
    this.outputType = INPUT_TYPES.STRING;
    this.args = [
      { name: "Delimiter", type: "option", value: DELIM_OPTIONS },
      { name: "Bytes per line", type: "number", value: 0 },
    ];
  }

  run(input: PipelineData, args: [string, number]): string {
    const [delimOpt, bytesPerLine] = args;
    const bytes = toUint8Array(input);
    // ... implementation with proper types
  }
}
```

### Key Changes:

1. Import from `Operation_new` instead of `Operation`
2. Extend `TypedOperation` with explicit generic types
3. Use `INPUT_TYPES` constants instead of strings
4. Use tuple types for `args` parameter
5. Use `PipelineData` type for flexible input handling
6. Use utility functions like `toUint8Array()` for type conversion

## Benefits

1. **Type Safety**: Catch errors at compile time rather than runtime
2. **Better IDE Support**: Autocomplete and type hints for operation arguments
3. **Pipeline Chaining**: Clean, fluent API for building complex pipelines
4. **Error Handling**: Detailed error information with timestamps and durations
5. **Backwards Compatibility**: Existing code continues to work
6. **Testability**: Strong types make it easier to write reliable tests

## Example: Complete Pipeline

```typescript
import { 
  Pipeline, 
  ToHex, 
  FromHex, 
  FromBase64,
  pipe 
} from "./chef/operations/typed-index";

// Example 1: Decode Base64 and convert to Hex
async function decodeAndHex(base64Input: string): Promise<string> {
  const pipeline = Pipeline.of("From Base64")
    .pipe("To Hex", ["Space", 0]);
  
  return pipeline.run(base64Input);
}

// Example 2: Hex round-trip with type safety
async function hexRoundTrip(text: string): Promise<Uint8Array> {
  const pipeline = pipe(
    new ToHex().withArgs("Space", 0),
    new FromHex().withArgs("Space")
  );
  
  const bytes = await pipeline.run(text);
  return new Uint8Array(bytes as number[]);
}

// Example 3: Complex pipeline with error handling
async function processData(input: string): Promise<{
  success: boolean;
  result?: string;
  error?: string;
}> {
  const pipeline = new FromBase64()
    .withArgs()
    .pipe(new ToHex().withArgs("Colon", 16))
    .pipeWithArgs(new Reverse(), []);
  
  try {
    const result = await pipeline.runWithResults(input);
    
    if (result.success) {
      return { success: true, result: String(result.finalOutput) };
    } else {
      return { 
        success: false, 
        error: result.errors[0]?.message || "Unknown error" 
      };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

## Testing

Run the tests to verify the new system:

```bash
npm test -- --grep "Typed Pipeline System"
```

The tests cover:
- Basic operation typing
- Operation with arguments
- Pipeline chaining
- Error handling
- Pipeline execution
- Custom operation creation

## Future Work

1. Migrate all existing operations to use the new system
2. Add more utility functions for common type conversions
3. Enhance the pipeline visualization and debugging tools
4. Add support for parallel pipeline execution
5. Implement pipeline optimization (e.g., merging consecutive operations)

## Conclusion

The new strongly typed pipeline system provides a modern, type-safe way to build and execute complex data transformation pipelines. It maintains full backwards compatibility while offering significant improvements in developer experience and code reliability.
