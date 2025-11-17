#!/usr/bin/env node

/**
 * Deployment Documentation Generator for Fitness Gym System
 * Generates deployment configuration and status documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Get Docker information
 */
function getDockerInfo() {
  const dockerInfo = {};

  try {
    // Get Docker images
    const imagesOutput = execSync('docker images --format "table {{.Repository}}:{{.Tag}}\\t{{.Size}}\\t{{.CreatedAt}}"', { encoding: 'utf8' });
    dockerInfo.images = imagesOutput;
  } catch (error) {
    dockerInfo.images = 'Unable to retrieve Docker images information';
  }

  try {
    // Get Docker containers
    const containersOutput = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', { encoding: 'utf8' });
    dockerInfo.containers = containersOutput;
  } catch (error) {
    dockerInfo.containers = 'Unable to retrieve Docker containers information';
  }

  return dockerInfo;
}

/**
 * Get Docker Compose configuration
 */
function getDockerComposeConfig() {
  const composeConfig = {};

  try {
    const configOutput = execSync('docker-compose config', { encoding: 'utf8' });
    composeConfig.raw = configOutput;
  } catch (error) {
    composeConfig.raw = 'Unable to retrieve Docker Compose configuration';
  }

  return composeConfig;
}

/**
 * Get environment variables
 */
function getEnvironmentInfo() {
  const envInfo = {};

  // Read .env file if it exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n')
      .filter(line => line.includes('='))
      .map(line => line.split('=')[0])
      .filter(varName => varName && !varName.startsWith('#'));

    envInfo.variables = envVars;
    envInfo.fileExists = true;
  } else {
    envInfo.variables = [];
    envInfo.fileExists = false;
  }

  return envInfo;
}

/**
 * Get deployment history
 */
function getDeploymentHistory() {
  const history = {};

  try {
    // Get Git commit history related to deployment
    const gitLog = execSync('git log --oneline -20 --grep="deploy\\|release\\|version"', { encoding: 'utf8' });
    history.git = gitLog || 'No deployment-related commits found';
  } catch (error) {
    history.git = 'Unable to retrieve Git history';
  }

  try {
    // Get recent file modifications
    const recentFiles = execSync('find . -name "*.yml" -o -name "*.yaml" -o -name "docker-compose*" -o -name ".env*" | head -10', { encoding: 'utf8' });
    history.recentFiles = recentFiles.split('\n').filter(Boolean);
  } catch (error) {
    history.recentFiles = [];
  }

  return history;
}

/**
 * Get system information
 */
function getSystemInfo() {
  const systemInfo = {};

  try {
    // Get OS information
    const osInfo = execSync('uname -a 2>/dev/null || ver', { encoding: 'utf8' });
    systemInfo.os = osInfo.trim();
  } catch (error) {
    systemInfo.os = 'Unable to determine OS';
  }

  try {
    // Get available memory
    const memInfo = execSync('free -h 2>/dev/null || systeminfo | findstr Memory', { encoding: 'utf8' });
    systemInfo.memory = memInfo;
  } catch (error) {
    systemInfo.memory = 'Unable to retrieve memory information';
  }

  try {
    // Get available disk space
    const diskInfo = execSync('df -h 2>/dev/null || wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
    systemInfo.disk = diskInfo;
  } catch (error) {
    systemInfo.disk = 'Unable to retrieve disk information';
  }

  return systemInfo;
}

/**
 * Generate deployment documentation
 */
function generateDeploymentDocs() {
  console.log('🔍 Gathering deployment information...');

  const dockerInfo = getDockerInfo();
  const composeConfig = getDockerComposeConfig();
  const envInfo = getEnvironmentInfo();
  const history = getDeploymentHistory();
  const systemInfo = getSystemInfo();

  const deploymentDoc = generateMarkdownDeploymentDoc(dockerInfo, composeConfig, envInfo, history, systemInfo);

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../deployment');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  const outputFile = path.join(outputDir, 'DEPLOYMENT_CONFIG.md');
  fs.writeFileSync(outputFile, deploymentDoc, 'utf8');

  console.log(`✅ Deployment documentation generated: ${outputFile}`);

  return {
    dockerImages: dockerInfo.images?.split('\n').length || 0,
    containers: dockerInfo.containers?.split('\n').length || 0,
    envVars: envInfo.variables?.length || 0
  };
}

/**
 * Generate Markdown deployment documentation
 */
function generateMarkdownDeploymentDoc(dockerInfo, composeConfig, envInfo, history, systemInfo) {
  let markdown = `# Deployment Configuration Documentation

> **Generated**: ${new Date().toISOString()}
> **System**: ${systemInfo.os}

## Table of Contents

- [System Information](#system-information)
- [Docker Configuration](#docker-configuration)
- [Environment Variables](#environment-variables)
- [Deployment History](#deployment-history)
- [Docker Compose Configuration](#docker-compose-configuration)

---

## System Information

### Operating System
\`\`\`
${systemInfo.os}
\`\`\`

### Memory Information
\`\`\`
${systemInfo.memory}
\`\`\`

### Disk Space
\`\`\`
${systemInfo.disk}
\`\`\`

---

## Docker Configuration

### Docker Images
\`\`\`
${dockerInfo.images || 'No Docker images information available'}
\`\`\`

### Running Containers
\`\`\`
${dockerInfo.containers || 'No containers information available'}
\`\`\`

---

## Environment Variables

**Environment file**: \`${envInfo.fileExists ? 'Present (.env)' : 'Not found'}\`

`;

  if (envInfo.variables && envInfo.variables.length > 0) {
    markdown += `### Configured Variables

The following environment variables are configured:

`;

    // Group variables by category
    const categories = {
      'Database': envInfo.variables.filter(v => v.includes('DB_') || v.includes('POSTGRES')),
      'Redis': envInfo.variables.filter(v => v.includes('REDIS')),
      'MinIO': envInfo.variables.filter(v => v.includes('MINIO')),
      'JWT': envInfo.variables.filter(v => v.includes('JWT')),
      'Server': envInfo.variables.filter(v => v.includes('SERVER_') || v.includes('PORT')),
      'Other': envInfo.variables.filter(v =>
        !v.includes('DB_') && !v.includes('POSTGRES') &&
        !v.includes('REDIS') && !v.includes('MINIO') &&
        !v.includes('JWT') && !v.includes('SERVER_') && !v.includes('PORT')
      )
    };

    for (const [category, vars] of Object.entries(categories)) {
      if (vars.length > 0) {
        markdown += `#### ${category}\n\n`;
        vars.forEach(variable => {
          markdown += `- \`${variable}\`\n`;
        });
        markdown += `\n`;
      }
    }

    markdown += `**Total configured variables**: ${envInfo.variables.length}\n\n`;
  } else {
    markdown += `No environment variables configured or .env file not found.\n\n`;
  }

  markdown += `---

## Deployment History

### Recent Git Commits
\`\`\`
${history.git || 'No deployment history available'}
\`\`\`

`;

  if (history.recentFiles && history.recentFiles.length > 0) {
    markdown += `### Recently Modified Configuration Files
${history.recentFiles.map(file => `- \`${file}\``).join('\n')}

`;
  }

  markdown += `---

## Docker Compose Configuration

\`\`\`yaml
${composeConfig.raw || 'Unable to retrieve Docker Compose configuration'}
\`\`\`

---

## Deployment Status

### Current Status
- **Docker Images**: ${dockerInfo.images ? 'Available' : 'Not available'}
- **Running Containers**: ${dockerInfo.containers ? 'Present' : 'None'}
- **Environment Configuration**: ${envInfo.fileExists ? 'Complete' : 'Missing'}

### Health Checks

To verify deployment health, run:

\`\`\`bash
# Check all services
docker-compose ps

# Check service health
curl http://localhost:8080/springboot1ngh61a2/actuator/health

# View logs
docker-compose logs -f
\`\`\`

### Common Deployment Issues

1. **Port conflicts**: Ensure ports 5432, 6379, 8080, 9000 are available
2. **Environment variables**: Verify .env file contains all required variables
3. **Database connection**: Check PostgreSQL is running and accessible
4. **Memory limits**: Ensure sufficient memory for all services

### Troubleshooting Commands

\`\`\`bash
# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up --build -d

# View detailed logs
docker-compose logs --tail=100

# Clean up and restart
docker-compose down -v
docker-compose up -d
\`\`\`

---

*Generated automatically by deployment documentation generator*
*Last updated: ${new Date().toISOString()}*

`;

  return markdown;
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🚀 Starting deployment documentation generation...');

    const stats = generateDeploymentDocs();

    console.log('✅ Deployment documentation generation completed');
    console.log(`📊 Statistics: ${stats.dockerImages} Docker images, ${stats.containers} containers, ${stats.envVars} environment variables`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating deployment documentation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateDeploymentDocs,
  getDockerInfo,
  getDockerComposeConfig,
  getEnvironmentInfo,
  getDeploymentHistory,
  getSystemInfo
};