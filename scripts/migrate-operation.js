#!/usr/bin/env node

/**
 * Script to migrate existing operations to the new strongly typed system
 * This script analyzes existing operation files and generates typed versions
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
  'JSON': 'INPUT_TYPES.JSON',
  'html': 'INPUT_TYPES.HTML',
  'boolean': 'INPUT_TYPES.BOOLEAN',
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
 * Extract constructor metadata (name, module, description, etc.)
 */
function extractMetadata(fileContent) {
  const metadata = {};
  
  // Extract simple string assignments
  const assignments = [
    'name', 'module', 'description', 'infoURL', 'inputType', 'outputType', 'presentType'
  ];
  
  for (const prop of assignments) {
    const match = fileContent.match(new RegExp(`this\.${prop}\s*=\s*["']([^"']+)["']`));
    if (match) {
      metadata[prop] = match[1];
    }
    
    // Also check for multi-line strings (template literals)
    const templateRegex = new RegExp(`this\\.${prop}\\s*=\\s*[\\x60]([\\\\s\\\\S]*?)[\\x60]`);
    const templateMatch = fileContent.match(templateRegex);
    if (templateMatch) {
      metadata[prop] = templateMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }
  
  // Extract flowControl and manualBake
  if (fileContent.includes('this.flowControl\s*=\s*true')) {
    metadata.flowControl = true;
  }
  if (fileContent.includes('this.manualBake\s*=\s*true')) {
    metadata.manualBake = true;
  }
  
  // Extract args
  const argsMatch = fileContent.match(/this\.args\s*=\s*(\[[\\s\\S]*?\]);/);
  if (argsMatch) {
    try {
      // Simple evaluation - be careful with this in production
      const argsStr = argsMatch[1];
      metadata.args = eval(`(${argsStr})`);
    } catch (e) {
      metadata.args = [];
    }
  }
  
  return metadata;
}

/**
 * Extract the run method signature
 */
function extractRunSignature(fileContent) {
  // Match run method with various patterns
  // Pattern 1: run(input: type, args: type): returnType
  // Pattern 2: async run(input: type, args: type): Promise<returnType>
  // Pattern 3: run(input, args): returnType
  const runMatch = fileContent.match(/run\s*(?:async\s+)?\([^)]*\)\s*(?::\s*([^\n{]+))?/);
  if (runMatch && runMatch[1]) {
    return runMatch[1].trim();
  }
  
  // Try simpler pattern
  const simpleMatch = fileContent.match(/run\s*\([^)]*\)[^:]*:\s*([^\n{;]+)/);
  if (simpleMatch) {
    return simpleMatch[1].trim();
  }
  
  return null;
}

/**
 * Extract the run method body
 */
function extractRunBody(fileContent) {
  const runMatch = fileContent.match(/run\s*\([^)]*\)[^{]*\{([\\s\\S]*?)\}/);
  if (runMatch) {
    return runMatch[1].trim();
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
    const type = arg.type || 'unknown';
    
    if (ARG_TYPE_PATTERNS.option.includes(type)) {
      return 'string'; // Options are typically strings
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
    
    return 'unknown';
  });
}

/**
 * Infer input type from the run method signature
 */
function inferInputType(runSignature) {
  if (!runSignature) return 'PipelineData';
  
  const inputMatch = runSignature.match(/run\s*\(([^,)]+)/);
  if (inputMatch) {
    const inputType = inputMatch[1].trim().split(':')[1];
    if (inputType) {
      if (inputType === 'number[]') return 'number[]';
      if (inputType === 'ArrayBuffer') return 'ArrayBuffer';
      if (inputType === 'string') return 'string';
      return inputType;
    }
  }
  
  return 'PipelineData';
}

/**
 * Infer output type from the run method signature
 */
function inferOutputType(runSignature) {
  if (!runSignature) return 'PipelineData';
  
  const outputMatch = runSignature.match(/:\s*([^\n{]+)/);
  if (outputMatch) {
    const outputType = outputMatch[1].trim().split('|')[0].trim();
    if (outputType === 'number[]') return 'number[]';
    if (outputType === 'ArrayBuffer') return 'ArrayBuffer';
    if (outputType === 'string') return 'string';
    if (outputType === 'Promise<string>') return 'string';
    if (outputType.startsWith('Promise<')) {
      const innerType = outputType.slice(8, -1);
      return innerType;
    }
    return outputType;
  }
  
  return 'PipelineData';
}

/**
 * Generate the typed operation code
 */
function generateTypedOperation(className, metadata, runSignature, runBody, baseClass, imports, fileContent) {
  const inputType = metadata.inputType ? TYPE_MAPPINGS[metadata.inputType] || `INPUT_TYPES.${metadata.inputType.toUpperCase()}` : 'INPUT_TYPES.STRING';
  const outputType = metadata.outputType ? TYPE_MAPPINGS[metadata.outputType] || `INPUT_TYPES.${metadata.outputType.toUpperCase()}` : 'INPUT_TYPES.STRING';
  
  const argsConfig = metadata.args || [];
  const argTypes = inferArgTypes(argsConfig);
  
  // Build the args tuple type
  const argsTuple = argTypes.map((type, i) => `${type}`).join(', ');
  
  // Determine if it's async
  const isAsync = runSignature.includes('async') || runBody.includes('await');
  const returnType = isAsync ? `Promise<${inferOutputType(runSignature)}>` : inferOutputType(runSignature);
  
  // Build the generic parameters
  const genericParams = [];
  genericParams.push(inferInputType(runSignature) || 'PipelineData');
  genericParams.push(inferOutputType(runSignature) || 'PipelineData');
  if (argsConfig.length > 0) {
    genericParams.push(`[${argTypes.join(', ')}]`);
  } else {
    genericParams.push('unknown[]');
  }
  
  // Build the extends clause
  const extendsClause = baseClass === 'Operation' ? 'TypedOperation' : baseClass;
  
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
  newCode += `import { TypedOperation, HighlightPos, HighlightResult, INPUT_TYPES } from "../Operation_new";\n`;
  newCode += `import { PipelineData } from "../types";\n`;
  
  // Add other imports from original file (excluding Operation)
  const otherImports = imports.filter(imp => !imp.includes('Operation'));
  otherImports.forEach(imp => {
    newCode += `import ${imp};\n`;
  });
  newCode += `\n`;
  
  // Add the class
  newCode += `export class ${className} extends TypedOperation<${genericParams.join(', ')}> {\n`;
  newCode += `  constructor() {\n`;
  newCode += `    super();\n`;
  
  // Add metadata
  if (metadata.name) {
    newCode += `    this.name = "${metadata.name}";\n`;
  }
  if (metadata.module) {
    newCode += `    this.module = "${metadata.module}";\n`;
  }
  if (metadata.description) {
    newCode += `    this.description = ${JSON.stringify(metadata.description)};\n`;
  }
  if (metadata.infoURL) {
    newCode += `    this.infoURL = ${JSON.stringify(metadata.infoURL)};\n`;
  }
  
  newCode += `    this.inputType = ${inputType};\n`;
  newCode += `    this.outputType = ${outputType};\n`;
  
  if (metadata.presentType) {
    newCode += `    this.presentType = ${TYPE_MAPPINGS[metadata.presentType] || `INPUT_TYPES.${metadata.presentType.toUpperCase()}`};\n`;
  }
  if (metadata.flowControl) {
    newCode += `    this.flowControl = true;\n`;
  }
  if (metadata.manualBake) {
    newCode += `    this.manualBake = true;\n`;
  }
  
  // Add args
  if (metadata.args && metadata.args.length > 0) {
    newCode += `    this.args = [\n`;
    metadata.args.forEach((arg, index) => {
      const argName = arg.name || `arg${index}`;
      const argType = arg.type || 'string';
      const argValue = JSON.stringify(arg.value || '');
      newCode += `      { name: "${argName}", type: "${argType}", value: ${argValue} },\n`;
    });
    newCode += `    ];\n`;
  } else {
    newCode += `    this.args = [];\n`;
  }
  
  // Add checks if present
  const checksMatch = fileContent.match(/this\.checks\s*=\s*(\[[\\s\\S]*?\]);/);
  if (checksMatch) {
    newCode += `    this.checks = ${checksMatch[1]};\n`;
  }
  
  newCode += `  }\n\n`;
  
  // Add highlight and highlightReverse methods if present
  const highlightMatch = fileContent.match(/highlight\s*\([^)]*\)[^{]*\{[\\s\\S]*?\}\s*highlightReverse/);
  if (highlightMatch) {
    newCode += `  highlight(pos: HighlightPos, args: [${argTypes.join(', ')}]): HighlightResult {\n`;
    newCode += `    return super.highlight(pos, args);\n`;
    newCode += `  }\n\n`;
    newCode += `  highlightReverse(pos: HighlightPos, args: [${argTypes.join(', ')}]): HighlightResult {\n`;
    newCode += `    return super.highlightReverse(pos, args);\n`;
    newCode += `  }\n\n`;
  }
  
  // Add the run method with proper typing
  newCode += `  run(input: ${inferInputType(runSignature)}, args: [${argTypes.join(', ')}]): ${returnType} {\n`;
  
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
function generateTestFile(className, metadata, argTypes) {
  const testCode = `/**\n`;
  testCode += ` * @fileoverview Tests for ${className} operation\n`;
  testCode += ` * @package test\n`;
  testCode += ` * @license Apache-2.0\n`;
  testCode += ` * @author Michael Weiss\n`;
  testCode += ` */\n\n`;
  
  testCode += `import { expect } from "chai";\n`;
  testCode += `import "mocha";\n\n`;
  
  testCode += `import { ${className} } from "../../chef/operations/typed/${className}";\n`;
  testCode += `import { INPUT_TYPES } from "../../chef/types";\n\n`;
  
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
  testCode += `      expect(op.inputType).to.equal(${metadata.inputType ? `INPUT_TYPES.${metadata.inputType.toUpperCase()}` : 'INPUT_TYPES.STRING'});\n`;
  testCode += `      expect(op.outputType).to.equal(${metadata.outputType ? `INPUT_TYPES.${metadata.outputType.toUpperCase()}` : 'INPUT_TYPES.STRING'});\n`;
  testCode += `    });\n\n`;
  testCode += `  });\n\n`;
  
  // Test run method
  testCode += `  describe("run()", () => {\n`;
  
  // Generate basic tests based on input/output types
  if (metadata.inputType === 'string' && metadata.outputType === 'byteArray') {
    testCode += `    it("should convert string input to byte array", () => {\n`;
    testCode += `      const op = new ${className}();\n`;
    testCode += `      // Add test implementation based on operation\n`;
    testCode += `      // Example: const result = op.run(input, args);\n`;
    testCode += `      // expect(result).to.be.an("array");\n`;
    testCode += `    });\n\n`;
  } else if (metadata.inputType === 'byteArray' && metadata.outputType === 'string') {
    testCode += `    it("should convert byte array input to string", () => {\n`;
    testCode += `      const op = new ${className}();\n`;
    testCode += `      // Add test implementation\n`;
    testCode += `    });\n\n`;
  } else if (metadata.inputType === 'string' && metadata.outputType === 'string') {
    testCode += `    it("should process string input and return string", () => {\n`;
    testCode += `      const op = new ${className}();\n`;
    testCode += `      // Add test implementation\n`;
    testCode += `    });\n\n`;
  }
  
  // Test withArgs
  if (argTypes.length > 0) {
    testCode += `    it("should accept arguments via withArgs", () => {\n`;
    testCode += `      const op = ${className}.withArgs(${argTypes.map(t => `test${t}`).join(', ')});\n`;
    testCode += `      expect(op).to.have.property('operation');\n`;
    testCode += `      expect(op).to.have.property('args');\n`;
    testCode += `    });\n\n`;
  }
  
  testCode += `  });\n\n`;
  
  // Test pipeline compatibility
  testCode += `  describe("Pipeline Compatibility", () => {\n`;
  testCode += `    it("should be chainable with other operations", () => {\n`;
  testCode += `      const op1 = new ${className}();\n`;
  testCode += `      // This should type check correctly\n`;
  testCode += `      // const pipeline = op1.pipe(new OtherOperation());\n`;
  testCode += `    });\n\n`;
  
  testCode += `    it("should execute with runWithResult", async () => {\n`;
  testCode += `      const op = new ${className}();\n`;
  testCode += `      // Test implementation\n`;
  testCode += `      // const result = await op.runWithResult(input, args);\n`;
  testCode += `      // expect(result).to.have.property('success');\n`;
  testCode += `    });\n\n`;
  testCode += `  });\n\n`;
  
  testCode += `});\n`;
  
  return testCode;
}

/**
 * Main migration function
 */
function migrateOperation(filePath) {
  const fileName = path.basename(filePath);
  const className = fileName.replace('.ts', '');
  
  // Skip already migrated files and special files
  if (fileName.endsWith('_new.ts') || fileName === 'index.ts' || fileName === 'typed-index.ts') {
    return { skipped: true, reason: 'Already migrated or special file' };
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
    
    if (!runSignature) {
      return { skipped: true, reason: 'No run method found' };
    }
    
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
    const testCode = generateTestFile(extractedClassName, metadata, argTypes);
    
    // Write files
    const outputPath = path.join(OUTPUT_DIR, `${extractedClassName}.ts`);
    const testPath = path.join(TEST_DIR, `${extractedClassName}.test.ts`);
    
    fs.writeFileSync(outputPath, typedCode);
    fs.writeFileSync(testPath, testCode);
    
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
      stack: error.stack
    };
  }
}

/**
 * Get all operation files
 */
function getOperationFiles() {
  return fs.readdirSync(OPERATIONS_DIR)
    .filter(file => file.endsWith('.ts') && !file.endsWith('_new.ts') && file !== 'index.ts')
    .map(file => path.join(OPERATIONS_DIR, file));
}

/**
 * Main execution
 */
function main() {
  const files = getOperationFiles();
  const results = [];
  
  console.log(`Found ${files.length} operation files to migrate...\n`);
  
  for (const file of files) {
    const result = migrateOperation(file);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Migrated: ${result.className}`);
    } else if (result.skipped) {
      console.log(`⏭️  Skipped: ${path.basename(file)} (${result.reason})`);
    } else {
      console.log(`❌ Failed: ${file}`);
      console.log(`   Error: ${result.error}`);
    }
  }
  
  // Summary
  console.log('\n--- Summary ---');
  const successCount = results.filter(r => r.success).length;
  const skipCount = results.filter(r => r.skipped).length;
  const failCount = results.filter(r => !r.success && !r.skipped).length;
  
  console.log(`Total: ${files.length}`);
  console.log(`Migrated: ${successCount}`);
  console.log(`Skipped: ${skipCount}`);
  console.log(`Failed: ${failCount}`);
  
  // Write results to JSON
  fs.writeFileSync(
    path.join(__dirname, 'migration-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\nResults saved to migration-results.json`);
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
  generateTypedOperation,
  generateTestFile,
  TYPE_MAPPINGS,
  OPERATIONS_DIR,
  OUTPUT_DIR,
  TEST_DIR
};
