#!/usr/bin/env node

/**
 * Script to migrate existing operations to the new strongly typed system
 * Improved version with better pattern matching
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OPERATIONS_DIR = path.join(__dirname, '..', 'src', 'chef', 'operations');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'chef', 'operations', 'typed');
const TEST_DIR = path.join(__dirname, '..', 'src', 'test', 'operations');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

// Type mappings for input/output types
const TYPE_MAPPINGS = {
  'string': 'INPUT_TYPES.STRING',
  'byteArray': 'INPUT_TYPES.BYTE_ARRAY',
  'ArrayBuffer': 'INPUT_TYPES.ARRAY_BUFFER',
  'number': 'INPUT_TYPES.NUMBER',
  'bigint': 'INPUT_TYPES.BIGINT',
  'boolean': 'INPUT_TYPES.BOOLEAN',
  'JSON': 'INPUT_TYPES.JSON',
  'html': 'INPUT_TYPES.HTML',
  'base64': 'INPUT_TYPES.BASE64',
  'hex': 'INPUT_TYPES.HEX',
  'Uint8Array': 'INPUT_TYPES.UINT8_ARRAY',
  'file': 'INPUT_TYPES.FILE',
  'list_file': 'INPUT_TYPES.LIST_FILE',
};

// Common argument type patterns
const ARG_TYPE_PATTERNS = {
  'string': ['string', 'text', 'binaryString', 'toggleString', 'editableOption'],
  'number': ['number'],
  'boolean': ['boolean'],
  'option': ['option', 'editableOption'],
};

/**
 * Extract the class name from a file
 */
function extractClassName(fileContent) {
  const classMatch = fileContent.match(/export\s+class\s+(\w+)\s+/);
  if (classMatch) {
    return classMatch[1];
  }
  const defaultExportMatch = fileContent.match(/class\s+(\w+)\s+/);
  if (defaultExportMatch) {
    return defaultExportMatch[1];
  }
  return null;
}

/**
 * Extract the base class (Operation or extended)
 */
function extractBaseClass(fileContent) {
  const extendsMatch = fileContent.match(/extends\s+(\w+)/);
  return extendsMatch ? extendsMatch[1] : 'Operation';
}

/**
 * Extract imports
 */
function extractImports(fileContent) {
  const imports = [];
  const importRegex = /import\s+(?:\{[^}]+\}\s+from\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Extract constructor metadata
 */
function extractMetadata(fileContent) {
  const metadata = {};
  
  // Extract simple string assignments
  const assignments = [
    'name', 'module', 'description', 'infoURL', 'inputType', 'outputType', 'presentType'
  ];
  
  for (const prop of assignments) {
    // Match single line string
    const match = fileContent.match(new RegExp(`this\\.${prop}\\s*=\\s*["']([^"']+)["']`));
    if (match) {
      metadata[prop] = match[1];
      continue;
    }
    
    // Match template literal (backtick)
    const templateRegex = new RegExp(`this\\.${prop}\\s*=\\s*[\\x60]([\\\\s\\\\S]*?)[\\x60]`);
    const templateMatch = fileContent.match(templateRegex);
    if (templateMatch) {
      metadata[prop] = templateMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }
  
  // Extract flowControl and manualBake
  if (fileContent.includes('this.flowControl = true') || fileContent.includes('this.flowControl\s*=\s*true')) {
    metadata.flowControl = true;
  }
  if (fileContent.includes('this.manualBake = true') || fileContent.includes('this.manualBake\s*=\s*true')) {
    metadata.manualBake = true;
  }
  
  // Extract args - try to parse the this.args array
  const argsMatch = fileContent.match(/this\.args\s*=\s*(\[[\s\S]*?\]);/);
  if (argsMatch) {
    try {
      // Safe evaluation
      const argsStr = argsMatch[1];
      // Replace common patterns to make it valid JSON
      const cleaned = argsStr
        .replace(/\btrue\b/g, 'true')
        .replace(/\bfalse\b/g, 'false')
        .replace(/\bnull\b/g, 'null')
        .replace(/([a-zA-Z_$][\w$]*)\s*:/g, '"$1":')
        .replace(/'/g, '"');
      metadata.args = JSON.parse(cleaned);
    } catch (e) {
      // If parsing fails, try a simpler approach
      metadata.args = [];
      const argMatches = fileContent.matchAll(/\{([^}]+)\}/g);
      for (const argMatch of argMatches) {
        if (argMatch[0].includes('name:') && argMatch[0].includes('type:')) {
          metadata.args.push(eval(`(${argMatch[0]})`));
        }
      }
    }
  }
  
  // Extract checks
  const checksMatch = fileContent.match(/this\.checks\s*=\s*(\[[\s\S]*?\]);/);
  if (checksMatch) {
    metadata.checks = checksMatch[1];
  }
  
  return metadata;
}

/**
 * Extract the run method signature (improved version)
 */
function extractRunSignature(fileContent) {
  // Try to find run method with various patterns
  // Pattern 1: run(input: type, args: type): returnType
  // Pattern 2: async run(input: type, args: type): Promise<returnType>
  // Pattern 3: run(input, args): returnType (multi-line)
  
  // Match run method declaration
  const runMatch = fileContent.match(/run\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*([^\n{;]+))?/);
  if (runMatch) {
    const params = runMatch[1] || '';
    const returnType = runMatch[2] ? runMatch[2].trim() : null;
    return { params, returnType };
  }
  
  // Try to find run method with JSDoc style
  const jsdocMatch = fileContent.match(/\*\s*@param\s+\{([^}]+)\}\s+input\s*[\s\S]*?\*\s*@returns\s+\{([^}]+)\}/);
  if (jsdocMatch) {
    return { params: '', returnType: jsdocMatch[2] };
  }
  
  return null;
}

/**
 * Extract the run method body
 */
function extractRunBody(fileContent) {
  // Find run method and extract body
  const runMatch = fileContent.match(/run\s*(?:async\s+)?\([^)]*\)\s*[^{]*\{([\s\S]*?^\s*}\s*$)/m);
  if (runMatch) {
    return runMatch[1].trim();
  }
  
  // Try alternative pattern
  const altMatch = fileContent.match(/run\s*\([^)]*\)[^{]*\{([\s\S]*?)\}/);
  if (altMatch) {
    return altMatch[1].trim();
  }
  
  return null;
}

/**
 * Infer argument types from args configuration
 */
function inferArgTypes(argsConfig) {
  if (!argsConfig || !Array.isArray(argsConfig)) {
    return [];
  }
  
  return argsConfig.map(arg => {
    const type = arg.type || arg.value || 'unknown';
    
    if (typeof type === 'string') {
      if (ARG_TYPE_PATTERNS.option.includes(type)) {
        return 'string';
      }
      if (ARG_TYPE_PATTERNS.string.includes(type)) {
        return 'string';
      }
      if (ARG_TYPE_PATTERNS.number.includes(type)) {
        return 'number';
      }
      if (ARG_TYPE_PATTERNS.boolean.includes(type)) {
        return 'boolean';
      }
    }
    
    if (Array.isArray(type)) {
      return 'string'; // Options arrays
    }
    
    return 'unknown';
  });
}

/**
 * Infer input type from run method
 */
function inferInputType(metadata, runSignature) {
  // Prefer metadata if available
  if (metadata.inputType) {
    return metadata.inputType;
  }
  
  if (!runSignature || !runSignature.params) {
    return 'PipelineData';
  }
  
  // Extract from params
  const params = runSignature.params.split(',').map(p => p.trim());
  for (const param of params) {
    const typeMatch = param.match(/:\s*(\w+)/);
    if (typeMatch) {
      return typeMatch[1];
    }
    const typeMatch2 = param.match(/^(\w+)/);
    if (typeMatch2 && typeMatch2[1] !== 'input' && typeMatch2[1] !== 'args') {
      return typeMatch2[1];
    }
  }
  
  return 'PipelineData';
}

/**
 * Infer output type from run method
 */
function inferOutputType(metadata, runSignature) {
  // Prefer metadata if available
  if (metadata.outputType) {
    return metadata.outputType;
  }
  
  if (!runSignature || !runSignature.returnType) {
    return 'PipelineData';
  }
  
  let returnType = runSignature.returnType;
  
  // Remove Promise<> wrapper
  if (returnType.startsWith('Promise<')) {
    returnType = returnType.slice(8, -1);
  }
  
  // Remove array notation for simplicity in generic params
  if (returnType === 'number[]') return 'number[]';
  if (returnType === 'ArrayBuffer') return 'ArrayBuffer';
  if (returnType === 'Uint8Array') return 'Uint8Array';
  
  return returnType || 'PipelineData';
}

/**
 * Convert type string to INPUT_TYPES constant
 */
function toInputTypeConstant(type) {
  if (!type) return 'INPUT_TYPES.STRING';
  const upperType = type.toUpperCase();
  if (TYPE_MAPPINGS[type]) {
    return TYPE_MAPPINGS[type];
  }
  return `INPUT_TYPES.${upperType}`;
}

/**
 * Generate TypeScript type from runtime type
 */
function toTypeScriptType(type) {
  if (!type) return 'PipelineData';
  
  const typeMap = {
    'string': 'string',
    'byteArray': 'number[] | Uint8Array',
    'ArrayBuffer': 'ArrayBuffer',
    'number': 'number',
    'bigint': 'bigint',
    'boolean': 'boolean',
    'JSON': 'object',
    'html': 'string',
    'base64': 'string',
    'hex': 'string',
    'Uint8Array': 'Uint8Array',
    'file': 'object',
    'list_file': 'object[]',
    'number[]': 'number[]',
  };
  
  return typeMap[type.toLowerCase()] || 'PipelineData';
}

/**
 * Generate the typed operation code
 */
function generateTypedOperation(className, metadata, runSignature, runBody, baseClass, imports, fileContent) {
  const inputTypeMeta = metadata.inputType || 'string';
  const outputTypeMeta = metadata.outputType || 'string';
  
  const inputTsType = toTypeScriptType(inputTypeMeta);
  const outputTsType = toTypeScriptType(outputTypeMeta);
  const inputTypeConst = toInputTypeConstant(inputTypeMeta);
  const outputTypeConst = toInputTypeConstant(outputTypeMeta);
  
  const argsConfig = metadata.args || [];
  const argTypes = inferArgTypes(argsConfig);
  
  // Determine if it's async
  const isAsync = runBody && (runBody.includes('await') || runBody.includes('return await'));
  const returnType = isAsync ? `Promise<${outputTsType}>` : outputTsType;
  
  // Build generic parameters for TypedOperation
  const genericParams = [
    inputTsType,
    outputTsType,
    argTypes.length > 0 ? `[${argTypes.join(', ')}]` : 'unknown[]'
  ];
  
  // Generate the new code
  let newCode = `/**\n`;
  newCode += ` * @fileoverview ${className} operation - Ported from GCHQ's CyberChef\n`;
  newCode += ` * @package chef/operations\n`;
  newCode += ` * @license Apache-2.0\n`;
  newCode += ` * @author Michael Weiss\n`;
  newCode += ` * @copyright 2024-2026 Michael Weiss\n`;
  newCode += ` * @see {\u0040link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations\n`;
  newCode += ` */\n\n`;
  
  // Add necessary imports
  newCode += `import { TypedOperation, HighlightPos, HighlightResult, OperationWithArgs, INPUT_TYPES } from "../Operation_new";\n`;
  newCode += `import { PipelineData } from "../types";\n`;
  
  // Add other imports from original file (excluding Operation)
  const otherImports = imports.filter(imp => !imp.includes('Operation') && !imp.includes('HighlightPos') && !imp.includes('HighlightResult'));
  otherImports.forEach(imp => {
    // Fix import paths
    let importPath = imp;
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      importPath = importPath.replace(/\.ts$/, '');
    }
    newCode += `import ${imp.includes('/') ? `{${imp.split('/').pop().replace('.ts', '')}}` : ''} from "${importPath}";\n`;
  });
  newCode += `\n`;
  
  // Add the class
  newCode += `export class ${className} extends TypedOperation<${genericParams.join(', ')}> {\n`;
  newCode += `  constructor() {\n`;
  newCode += `    super();\n`;
  
  // Add metadata
  if (metadata.name) {
    newCode += `    this.name = "${metadata.name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";\n`;
  }
  if (metadata.module) {
    newCode += `    this.module = "${metadata.module.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";\n`;
  }
  if (metadata.description) {
    const escapedDesc = metadata.description.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/`/g, '\\`');
    newCode += `    this.description = \`${escapedDesc}\`;\n`;
  }
  if (metadata.infoURL) {
    newCode += `    this.infoURL = "${metadata.infoURL.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";\n`;
  }
  
  newCode += `    this.inputType = ${inputTypeConst};\n`;
  newCode += `    this.outputType = ${outputTypeConst};\n`;
  
  if (metadata.presentType) {
    newCode += `    this.presentType = ${toInputTypeConstant(metadata.presentType)};\n`;
  }
  if (metadata.flowControl) {
    newCode += `    this.flowControl = true;\n`;
  }
  if (metadata.manualBake) {
    newCode += `    this.manualBake = true;\n`;
  }
  
  // Add args
  if (argsConfig.length > 0) {
    newCode += `    this.args = [\n`;
    argsConfig.forEach((arg, index) => {
      const argName = arg.name || `arg${index}`;
      const argType = arg.type || 'string';
      let argValue;
      if (Array.isArray(arg.value)) {
        // Handle array values (like options)
        argValue = JSON.stringify(arg.value);
      } else if (typeof arg.value === 'string') {
        argValue = `"${arg.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      } else if (typeof arg.value === 'number') {
        argValue = String(arg.value);
      } else if (typeof arg.value === 'boolean') {
        argValue = String(arg.value);
      } else if (arg.value === null || arg.value === undefined) {
        argValue = 'null';
      } else {
        argValue = JSON.stringify(arg.value);
      }
      newCode += `      { name: "${argName}", type: "${argType}", value: ${argValue} },\n`;
    });
    newCode += `    ];\n`;
  } else {
    newCode += `    this.args = [];\n`;
  }
  
  // Add checks if present
  if (metadata.checks) {
    newCode += `    this.checks = ${metadata.checks};\n`;
  }
  
  newCode += `  }\n\n`;
  
  // Add highlight and highlightReverse methods if present in original
  if (fileContent.includes('highlight(') && fileContent.includes('highlightReverse(')) {
    // Copy the original methods
    const highlightMatch = fileContent.match(/highlight\s*\(([^)]*)\)[^{]*\{([\s\S]*?)\}/);
    if (highlightMatch) {
      newCode += `  highlight(${highlightMatch[1]}, args: [${argTypes.join(', ')}]): HighlightResult {\n`;
      newCode += highlightMatch[2].trim() + '\n';
      newCode += `  }\n\n`;
    }
    
    const highlightReverseMatch = fileContent.match(/highlightReverse\s*\(([^)]*)\)[^{]*\{([\s\S]*?)\}/);
    if (highlightReverseMatch) {
      newCode += `  highlightReverse(${highlightReverseMatch[1]}, args: [${argTypes.join(', ')}]): HighlightResult {\n`;
      newCode += highlightReverseMatch[2].trim() + '\n';
      newCode += `  }\n\n`;
    }
  }
  
  // Add the run method with proper typing
  newCode += `  run(input: ${inputTsType}, args: [${argTypes.join(', ')}]): ${returnType} {\n`;
  
  // Add the original run body
  if (runBody) {
    newCode += runBody + '\n';
  }
  
  newCode += `  }\n\n`;
  
  // Add convenience factory function
  newCode += `  /**\n`;
  newCode += `   * Convenience method for creating ${className} with pre-configured arguments\n`;
  newCode += `   */\n`;
  newCode += `  static withArgs(...args: [${argTypes.join(', ')}]): OperationWithArgs<${genericParams.join(', ')}> {\n`;
  newCode += `    return new ${className}().withArgs(...args);\n`;
  newCode += `  }\n`;
  
  newCode += `}\n\n`;
  newCode += `export default ${className};\n`;
  
  return newCode;
}

/**
 * Generate test file for an operation
 */
function generateTestFile(className, metadata, argTypes, inputType, outputType) {
  const testCode = `/**\n`;
  testCode += ` * @fileoverview Tests for ${className} operation\n`;
  testCode += ` * @package test\n`;
  testCode += ` * @license Apache-2.0\n`;
  testCode += ` * @author Michael Weiss\n`;
  testCode += ` */\n\n`;
  
  testCode += `import { expect } from "chai";\n`;
  testCode += `import "mocha";\n\n`;
  
  testCode += `import { ${className} } from "../../chef/operations/typed/${className}";\n`;
  testCode += `import { INPUT_TYPES, PipelineData } from "../../chef/types";\n`;
  testCode += `import { OperationWithArgs } from "../../chef/Operation_new";\n\n`;
  
  testCode += `describe("${className}", () => {\n\n`;
  
  // Test constructor
  testCode += `  describe("Constructor", () => {\n`;
  testCode += `    it("should create an instance", () => {\n`;
  testCode += `      const op = new ${className}();\n`;
  testCode += `      expect(op).to.be.instanceOf(${className});\n`;
  testCode += `    });\n\n`;
  
  testCode += `    it("should have correct metadata", () => {\n`;
  testCode += `      const op = new ${className}();\n`;
  if (metadata.name) {
    testCode += `      expect(op.name).to.equal("${metadata.name}");\n`;
  }
  if (metadata.module) {
    testCode += `      expect(op.module).to.equal("${metadata.module}");\n`;
  }
  testCode += `      expect(op.inputType).to.equal(${toInputTypeConstant(inputType)});\n`;
  testCode += `      expect(op.outputType).to.equal(${toInputTypeConstant(outputType)});\n`;
  testCode += `    });\n\n`;
  testCode += `  });\n\n`;
  
  // Test run method with basic inputs
  testCode += `  describe("run()", () => {\n`;
  
  // Generate test based on input/output types
  if (inputType === 'string' && outputType === 'string') {
    testCode += `    it("should process string input and return string", () => {\n`;
    testCode += `      const op = new ${className}();\n`;
    testCode += `      const input = "test";\n`;
    testCode += `      const args: [${argTypes.join(', ')}] = [${argTypes.map((t, i) => getDefaultValue(t, i)).join(', ')}];\n`;
    testCode += `      const result = op.run(input, args);\n`;
    testCode += `      expect(result).to.be.a("string");\n`;
    testCode += `    });\n\n`;
  } else if (inputType === 'string' && (outputType === 'byteArray' || outputType === 'number[]')) {
    testCode += `    it("should convert string input to byte array", () => {\n`;
    testCode += `      const op = new ${className}();\n`;
    testCode += `      const input = "test";\n`;
    testCode += `      const args: [${argTypes.join(', ')}] = [${argTypes.map((t, i) => getDefaultValue(t, i)).join(', ')}];\n`;
    testCode += `      const result = op.run(input, args);\n`;
    testCode += `      expect(result).to.be.an("array");\n`;
    testCode += `    });\n\n`;
  } else if ((inputType === 'byteArray' || inputType === 'number[]') && outputType === 'string') {
    testCode += `    it("should convert byte array input to string", () => {\n`;
    testCode += `      const op = new ${className}();\n`;
    testCode += `      const input = [72, 101, 108, 108, 111]; // "Hello"\n`;
    testCode += `      const args: [${argTypes.join(', ')}] = [${argTypes.map((t, i) => getDefaultValue(t, i)).join(', ')}];\n`;
    testCode += `      const result = op.run(input, args);\n`;
    testCode += `      expect(result).to.be.a("string");\n`;
    testCode += `    });\n\n`;
  } else if ((inputType === 'byteArray' || inputType === 'number[]') && (outputType === 'byteArray' || outputType === 'number[]')) {
    testCode += `    it("should process byte array input and return byte array", () => {\n`;
    testCode += `      const op = new ${className}();\n`;
    testCode += `      const input = [1, 2, 3, 4, 5];\n`;
    testCode += `      const args: [${argTypes.join(', ')}] = [${argTypes.map((t, i) => getDefaultValue(t, i)).join(', ')}];\n`;
    testCode += `      const result = op.run(input, args);\n`;
    testCode += `      expect(result).to.be.an("array");\n`;
    testCode += `    });\n\n`;
  }
  
  // Test withArgs
  if (argTypes.length > 0) {
    testCode += `    it("should accept arguments via withArgs", () => {\n`;
    testCode += `      const args: [${argTypes.join(', ')}] = [${argTypes.map((t, i) => getDefaultValue(t, i)).join(', ')}];\n`;
    testCode += `      const opWithArgs = ${className}.withArgs(...args);\n`;
    testCode += `      expect(opWithArgs).to.be.instanceOf(OperationWithArgs);\n`;
    testCode += `      expect(opWithArgs.operation).to.be.instanceOf(${className});\n`;
    testCode += `      expect(opWithArgs.args).to.deep.equal(args);\n`;
    testCode += `    });\n\n`;
  } else {
    testCode += `    it("should accept no arguments via withArgs", () => {\n`;
    testCode += `      const opWithArgs = ${className}.withArgs();\n`;
    testCode += `      expect(opWithArgs).to.be.instanceOf(OperationWithArgs);\n`;
    testCode += `    });\n\n`;
  }
  
  testCode += `  });\n\n`;
  
  // Test pipeline compatibility
  testCode += `  describe("Pipeline Compatibility", () => {\n`;
  testCode += `    it("should be chainable with other operations", () => {\n`;
  testCode += `      const op1 = new ${className}();\n`;
  testCode += `      // This should type check correctly\n`;
  testCode += `      // Example: const pipeline = op1.pipe(new OtherOperation());\n`;
  testCode += `      expect(op1).to.have.property('pipe');\n`;
  testCode += `      expect(op1).to.have.property('withArgs');\n`;
  testCode += `    });\n\n`;
  
  testCode += `    it("should execute with runWithResult", async () => {\n`;
  testCode += `      const op = new ${className}();\n`;
  testCode += `      const input = ${getSampleInput(inputType)};\n`;
  testCode += `      const args: [${argTypes.join(', ')}] = [${argTypes.map((t, i) => getDefaultValue(t, i)).join(', ')}];\n`;
  testCode += `      const result = await op.runWithResult(input, args);\n`;
  testCode += `      expect(result).to.have.property('success');\n`;
  testCode += `      expect(result).to.have.property('data');\n`;
  testCode += `      expect(result).to.have.property('operation');\n`;
  testCode += `      expect(result.operation).to.equal("${metadata.name || className}");\n`;
  testCode += `    });\n\n`;
  testCode += `  });\n\n`;
  
  testCode += `});\n`;
  
  return testCode;
}

/**
 * Get default value for a type
 */
function getDefaultValue(type, index) {
  switch (type) {
    case 'string': return `'test${index}'`;
    case 'number': return index;
    case 'boolean': return index % 2 === 0;
    default: return 'null';
  }
}

/**
 * Get sample input based on type
 */
function getSampleInput(type) {
  switch (type) {
    case 'string': return '"test input"';
    case 'byteArray':
    case 'number[]': return '[1, 2, 3, 4, 5]';
    case 'ArrayBuffer': return 'new ArrayBuffer(8)';
    case 'number': return '42';
    case 'boolean': return 'true';
    default: return '"test"';
  }
}

/**
 * Main migration function
 */
function migrateOperation(filePath) {
  const fileName = path.basename(filePath);
  const className = fileName.replace('.ts', '');
  
  // Skip already migrated files and special files
  if (fileName.endsWith('_new.ts') || fileName === 'index.ts' || fileName === 'typed-index.ts') {
    return { skipped: true, reason: 'Already migrated or special file', file: filePath };
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract information
    const extractedClassName = extractClassName(fileContent) || className;
    const baseClass = extractBaseClass(fileContent);
    const imports = extractImports(fileContent);
    const metadata = extractMetadata(fileContent);
    const runSignature = extractRunSignature(fileContent);
    const runBody = extractRunBody(fileContent);
    
    if (!runBody) {
      return { skipped: true, reason: 'No run method body found', file: filePath };
    }
    
    // Use metadata for types if available, otherwise infer
    const inputType = inferInputType(metadata, runSignature);
    const outputType = inferOutputType(metadata, runSignature);
    
    // Generate the typed operation
    const typedCode = generateTypedOperation(
      extractedClassName, 
      metadata, 
      runSignature, 
      runBody, 
      baseClass, 
      imports, 
      fileContent
    );
    
    // Generate test file
    const argTypes = metadata.args ? inferArgTypes(metadata.args) : [];
    const testCode = generateTestFile(extractedClassName, metadata, argTypes, inputType, outputType);
    
    // Write files
    const outputPath = path.join(OUTPUT_DIR, `${extractedClassName}.ts`);
    const testPath = path.join(TEST_DIR, `${extractedClassName}.test.ts`);
    
    fs.writeFileSync(outputPath, typedCode, 'utf8');
    fs.writeFileSync(testPath, testCode, 'utf8');
    
    return {
      success: true,
      className: extractedClassName,
      originalFile: filePath,
      typedFile: outputPath,
      testFile: testPath,
      metadata
    };
    
  } catch (error) {
    return {
      success: false,
      file: filePath,
      error: error.message,
      stack: error.stack,
      className: className
    };
  }
}

/**
 * Get all operation files
 */
function getOperationFiles() {
  return fs.readdirSync(OPERATIONS_DIR)
    .filter(file => file.endsWith('.ts') && !file.endsWith('_new.ts') && file !== 'index.ts' && file !== 'typed-index.ts')
    .map(file => path.join(OPERATIONS_DIR, file));
}

/**
 * Process files in batches
 */
function processBatch(fileBatch, batchNumber) {
  console.log(`\nProcessing batch ${batchNumber} (${fileBatch.length} files)...`);
  const results = [];
  
  for (const file of fileBatch) {
    const result = migrateOperation(file);
    results.push(result);
    
    const status = result.success ? '✅' : result.skipped ? '⏭️' : '❌';
    const message = result.success ? `Migrated: ${result.className}` : 
                   result.skipped ? `Skipped: ${path.basename(file)} (${result.reason})` : 
                   `Failed: ${path.basename(file)} - ${result.error}`;
    console.log(`  ${status} ${message}`);
  }
  
  return results;
}

/**
 * Main execution
 */
function main() {
  const files = getOperationFiles();
  const BATCH_SIZE = 50;
  const results = [];
  
  console.log(`Found ${files.length} operation files to migrate...\n`);
  
  // Process in batches
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const batchResults = processBatch(batch, Math.floor(i / BATCH_SIZE) + 1);
    results.push(...batchResults);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('--- Migration Summary ---');
  console.log('='.repeat(50));
  
  const successCount = results.filter(r => r.success).length;
  const skipCount = results.filter(r => r.skipped).length;
  const failCount = results.filter(r => !r.success && !r.skipped).length;
  
  console.log(`Total files: ${files.length}`);
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Skipped: ${skipCount}`);
  console.log(`Failed: ${failCount}`);
  
  // List failures
  if (failCount > 0) {
    console.log(`\nFailed files:`);
    results.filter(r => !r.success && !r.skipped).forEach(r => {
      console.log(`  - ${r.file}: ${r.error}`);
    });
  }
  
  // Write results to JSON
  fs.writeFileSync(
    path.join(__dirname, 'migration-results-v2.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );
  
  console.log(`\nResults saved to migration-results-v2.json`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  migrateOperation,
  getOperationFiles,
  extractClassName,
  extractMetadata,
  extractRunSignature,
  extractRunBody,
  generateTypedOperation,
  generateTestFile,
  processBatch,
  TYPE_MAPPINGS,
  OPERATIONS_DIR,
  OUTPUT_DIR,
  TEST_DIR
};
