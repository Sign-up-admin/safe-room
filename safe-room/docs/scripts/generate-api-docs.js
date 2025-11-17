#!/usr/bin/env node

/**
 * API Documentation Generator for Fitness Gym System
 * Generates comprehensive API documentation from controller annotations and code analysis
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  baseDir: path.join(__dirname, '../../springboot1ngh61a2/src/main/java/com'),
  outputDir: path.join(__dirname, '../api'),
  controllersDir: 'controller',
  entitiesDir: 'entity',
  servicesDir: 'service'
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

/**
 * Extract JSDoc comments from Java files
 */
function extractJavaDoc(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const docs = [];

  // Match class-level documentation
  const classDocRegex = /\/\*\*\s*\n(?:\s*\*\s*(.*?)\s*\n)*\s*\*\/\s*\n\s*(?:@.*\n\s*)?(?:public\s+)?(?:class|interface)\s+(\w+)/g;
  let match;
  while ((match = classDocRegex.exec(content)) !== null) {
    const [, doc, className] = match;
    if (doc) {
      docs.push({
        type: 'class',
        name: className,
        description: doc.trim(),
        file: path.relative(CONFIG.baseDir, filePath)
      });
    }
  }

  // Match method-level documentation
  const methodDocRegex = /\/\*\*\s*\n(?:\s*\*\s*(.*?)\s*\n)*\s*\*\/\s*\n\s*(?:@.*\n\s*)?(?:public\s+)?(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*\{/g;
  while ((match = methodDocRegex.exec(content)) !== null) {
    const [, doc, methodName] = match;
    if (doc) {
      docs.push({
        type: 'method',
        name: methodName,
        description: doc.trim(),
        file: path.relative(CONFIG.baseDir, filePath)
      });
    }
  }

  return docs;
}

/**
 * Parse Spring controller annotations
 */
function parseControllerAnnotations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const endpoints = [];

  // Match @RequestMapping and HTTP method annotations
  const mappingRegex = /@(?:RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\s*\(\s*"([^"]+)"(?:[^)]+)?\)\s*\n\s*(?:@.*\n\s*)?(?:public\s+)?(?:\w+\s+)*(\w+)\s*\([^)]*\)/g;

  let match;
  while ((match = mappingRegex.exec(content)) !== null) {
    const [, path, methodName] = match;

    // Extract method documentation
    const methodDocStart = content.lastIndexOf('/**', mappingRegex.lastIndex);
    const methodDocEnd = content.indexOf('*/', methodDocStart);
    let description = '';

    if (methodDocStart !== -1 && methodDocEnd !== -1) {
      const docBlock = content.substring(methodDocStart + 3, methodDocEnd);
      description = docBlock.replace(/\s*\*\s*/g, ' ').trim();
    }

    // Extract HTTP method from annotation
    const methodAnnotation = content.substring(
      Math.max(0, mappingRegex.lastIndex - 200),
      mappingRegex.lastIndex
    ).match(/@(Get|Post|Put|Delete|Patch)Mapping/);

    const httpMethod = methodAnnotation ? methodAnnotation[1].toUpperCase() : 'GET';

    endpoints.push({
      method: httpMethod,
      path: path,
      handler: methodName,
      description: description,
      file: path.relative(CONFIG.baseDir, filePath)
    });
  }

  return endpoints;
}

/**
 * Analyze entity classes for API models
 */
function analyzeEntities() {
  const entities = [];
  const entityFiles = glob.sync(path.join(CONFIG.baseDir, CONFIG.entitiesDir, '**/*.java'));

  for (const file of entityFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const className = path.basename(file, '.java');

    // Extract field information
    const fields = [];
    const fieldRegex = /(?:private|public|protected)\s+(\w+)\s+(\w+);/g;
    let match;
    while ((match = fieldRegex.exec(content)) !== null) {
      const [, type, name] = match;
      fields.push({ name, type });
    }

    entities.push({
      name: className,
      fields: fields,
      file: path.relative(CONFIG.baseDir, file)
    });
  }

  return entities;
}

/**
 * Generate API documentation
 */
function generateApiDocs() {
  console.log('🔍 Analyzing Java codebase...');

  const controllers = glob.sync(path.join(CONFIG.baseDir, CONFIG.controllersDir, '**/*Controller.java'));
  const allEndpoints = [];
  const allDocs = [];

  // Analyze controllers
  for (const controller of controllers) {
    console.log(`📄 Analyzing controller: ${path.basename(controller)}`);

    const endpoints = parseControllerAnnotations(controller);
    allEndpoints.push(...endpoints);

    const docs = extractJavaDoc(controller);
    allDocs.push(...docs);
  }

  // Analyze entities
  const entities = analyzeEntities();

  // Generate Markdown documentation
  const apiDoc = generateMarkdownApiDoc(allEndpoints, entities, allDocs);

  // Write to file
  const outputFile = path.join(CONFIG.outputDir, 'API_DOCUMENTATION.md');
  fs.writeFileSync(outputFile, apiDoc, 'utf8');

  console.log(`✅ API documentation generated: ${outputFile}`);
  console.log(`📊 Found ${allEndpoints.length} API endpoints, ${entities.length} entities`);

  return {
    endpoints: allEndpoints.length,
    entities: entities.length,
    docs: allDocs.length
  };
}

/**
 * Generate Markdown API documentation
 */
function generateMarkdownApiDoc(endpoints, entities, docs) {
  let markdown = `# Fitness Gym API Documentation

> **Version**: 1.0.0
> **Generated**: ${new Date().toISOString()}
> **Base URL**: \`http://localhost:8080/springboot1ngh61a2\`

## Table of Contents

- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

---

## API Endpoints

`;

  // Group endpoints by controller
  const endpointsByController = {};
  for (const endpoint of endpoints) {
    const controller = endpoint.file.split('/').pop().replace('Controller.java', '');
    if (!endpointsByController[controller]) {
      endpointsByController[controller] = [];
    }
    endpointsByController[controller].push(endpoint);
  }

  // Generate endpoint documentation
  for (const [controller, controllerEndpoints] of Object.entries(endpointsByController)) {
    markdown += `### ${controller} Controller\n\n`;

    for (const endpoint of controllerEndpoints) {
      markdown += `#### ${endpoint.method} ${endpoint.path}\n\n`;
      markdown += `**Handler**: \`${endpoint.handler}\`\n\n`;

      if (endpoint.description) {
        markdown += `**Description**: ${endpoint.description}\n\n`;
      }

      markdown += `**File**: \`${endpoint.file}\`\n\n`;

      // Add example request/response
      markdown += `**Example Request**:\n\`\`\`bash\n`;
      markdown += `curl -X ${endpoint.method} "http://localhost:8080/springboot1ngh61a2${endpoint.path}" \\\n`;
      markdown += `  -H "Content-Type: application/json"\n`;
      markdown += `\`\`\`\n\n`;

      markdown += `**Example Response**:\n\`\`\`json\n`;
      markdown += `{\n  "code": 200,\n  "message": "Success",\n  "data": {}\n}\n`;
      markdown += `\`\`\`\n\n`;

      markdown += `---\n\n`;
    }
  }

  // Generate data models documentation
  markdown += `## Data Models

`;

  for (const entity of entities) {
    markdown += `### ${entity.name}\n\n`;
    markdown += `**File**: \`${entity.file}\`\n\n`;

    if (entity.fields.length > 0) {
      markdown += `**Fields**:\n\n`;
      markdown += `| Field | Type | Description |\n`;
      markdown += `|-------|------|-------------|\n`;

      for (const field of entity.fields) {
        markdown += `| ${field.name} | ${field.type} | |\n`;
      }
      markdown += `\n`;
    }

    markdown += `**Example**:\n\`\`\`json\n{\n`;
    for (const field of entity.fields.slice(0, 3)) {
      markdown += `  "${field.name}": "${field.type === 'String' ? 'example' : 123}",\n`;
    }
    markdown += `  "...": "..."\n}\n\`\`\`\n\n`;
  }

  // Add authentication section
  markdown += `## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login

\`\`\`bash
POST /springboot1ngh61a2/user/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
\`\`\`

### Using JWT Token

Include the JWT token in the Authorization header:

\`\`\`bash
Authorization: Bearer <jwt_token>
\`\`\`

## Error Handling

The API returns standardized error responses:

\`\`\`json
{
  "code": 400,
  "message": "Bad Request",
  "data": null
}
\`\`\`

### Common HTTP Status Codes

- \`200\` - Success
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`403\` - Forbidden
- \`404\` - Not Found
- \`500\` - Internal Server Error

## Code Documentation

Found ${docs.length} documented classes and methods in the codebase.

`;

  // Add documentation summary
  const classDocs = docs.filter(doc => doc.type === 'class');
  const methodDocs = docs.filter(doc => doc.type === 'method');

  markdown += `### Classes: ${classDocs.length}\n`;
  markdown += `### Methods: ${methodDocs.length}\n\n`;

  markdown += `---\n\n`;
  markdown += `*Generated automatically by API documentation generator v1.0.0*\n`;

  return markdown;
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🚀 Starting API documentation generation...');

    const stats = generateApiDocs();

    console.log('✅ API documentation generation completed');
    console.log(`📊 Statistics: ${stats.endpoints} endpoints, ${stats.entities} entities, ${stats.docs} documented items`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating API documentation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateApiDocs,
  extractJavaDoc,
  parseControllerAnnotations,
  analyzeEntities
};