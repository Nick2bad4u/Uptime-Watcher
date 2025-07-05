#!/usr/bin/env node
/**
 * Codecov Components Validation Script
 * 
 * This script validates the .codecov.yml components configuration
 * and ensures all specified paths exist in the project structure.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.blue}${msg}${colors.reset}`)
};

/**
 * Check if a path pattern exists in the project
 * @param {string} pattern - Path pattern to check
 * @returns {boolean} - Whether the path exists
 */
function checkPathExists(pattern) {
  // Handle glob patterns
  if (pattern.includes('**')) {
    const basePath = pattern.split('**')[0];
    return fs.existsSync(basePath);
  }
  
  // Handle specific files
  if (pattern.endsWith('.ts') || pattern.endsWith('.js')) {
    return fs.existsSync(pattern);
  }
  
  // Handle directory patterns
  const cleanPath = pattern.replace(/\/\*$/, '').replace(/\*\*$/, '');
  return fs.existsSync(cleanPath);
}

/**
 * Get directory size (number of files)
 * @param {string} dirPath - Directory path
 * @returns {number} - Number of files in directory
 */
function getDirectorySize(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) return 1;
    
    const files = fs.readdirSync(dirPath);
    let count = 0;
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileStats = fs.statSync(filePath);
      
      if (fileStats.isDirectory()) {
        count += getDirectorySize(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        count++;
      }
    }
    
    return count;
  } catch (error) {
    return 0;
  }
}

/**
 * Validate components configuration
 */
function validateComponents() {
  log.header('🔍 Validating Codecov Components Configuration');
  
  // Load codecov.yml
  const codecovPath = '.codecov.yml';
  if (!fs.existsSync(codecovPath)) {
    log.error('No .codecov.yml file found');
    return false;
  }
  
  let codecovConfig;
  try {
    const content = fs.readFileSync(codecovPath, 'utf8');
    codecovConfig = yaml.parse(content);
  } catch (error) {
    log.error(`Failed to parse .codecov.yml: ${error.message}`);
    return false;
  }
  
  const componentManagement = codecovConfig.component_management;
  if (!componentManagement) {
    log.error('No component_management section found in .codecov.yml');
    return false;
  }
  
  log.success('Found component_management configuration');
  
  // Validate individual components
  const components = componentManagement.individual_components || [];
  if (components.length === 0) {
    log.warning('No individual components defined');
    return false;
  }
  
  log.info(`Found ${components.length} components to validate`);
  console.log();
  
  let totalValid = 0;
  let totalInvalid = 0;
  let totalFiles = 0;
  
  const componentStats = [];
  
  for (const component of components) {
    const { component_id, name, paths = [], statuses = [] } = component;
    
    log.header(`📦 Component: ${name || component_id}`);
    log.info(`ID: ${component_id}`);
    
    if (paths.length === 0) {
      log.warning('No paths defined for component');
      continue;
    }
    
    let componentFiles = 0;
    let validPaths = 0;
    let invalidPaths = 0;
    
    for (const pathPattern of paths) {
      if (checkPathExists(pathPattern)) {
        log.success(`Path exists: ${pathPattern}`);
        validPaths++;
        
        // Count files in this path
        const cleanPath = pathPattern.replace(/\/\*\*$/, '').replace(/\/\*$/, '');
        const fileCount = getDirectorySize(cleanPath);
        componentFiles += fileCount;
        
        if (fileCount > 0) {
          log.info(`  → ${fileCount} files found`);
        }
      } else {
        log.error(`Path not found: ${pathPattern}`);
        invalidPaths++;
      }
    }
    
    // Validate statuses
    if (statuses.length > 0) {
      log.info(`Coverage targets: ${statuses.length} status(es) defined`);
      for (const status of statuses) {
        const { type, target, threshold } = status;
        log.info(`  → ${type}: ${target} (threshold: ${threshold || 'default'})`);
      }
    } else {
      log.info('Using default coverage targets');
    }
    
    componentStats.push({
      id: component_id,
      name: name || component_id,
      files: componentFiles,
      validPaths,
      invalidPaths,
      totalPaths: paths.length
    });
    
    totalValid += validPaths;
    totalInvalid += invalidPaths;
    totalFiles += componentFiles;
    
    console.log();
  }
  
  // Summary
  log.header('📊 Validation Summary');
  log.info(`Total components: ${components.length}`);
  log.info(`Total paths: ${totalValid + totalInvalid}`);
  log.success(`Valid paths: ${totalValid}`);
  
  if (totalInvalid > 0) {
    log.error(`Invalid paths: ${totalInvalid}`);
  }
  
  log.info(`Total files covered: ${totalFiles}`);
  
  console.log();
  log.header('📈 Component Coverage Breakdown');
  
  // Sort by file count
  componentStats.sort((a, b) => b.files - a.files);
  
  for (const stat of componentStats) {
    const percentage = stat.totalPaths > 0 ? (stat.validPaths / stat.totalPaths * 100).toFixed(1) : 0;
    const status = stat.invalidPaths === 0 ? '✓' : '⚠';
    
    console.log(`${status} ${stat.name}: ${stat.files} files (${percentage}% paths valid)`);
  }
  
  console.log();
  
  if (totalInvalid === 0) {
    log.success('All component paths are valid! 🎉');
    return true;
  } else {
    log.warning(`${totalInvalid} invalid paths found. Please review the configuration.`);
    return false;
  }
}

// Run validation
if (require.main === module) {
  const success = validateComponents();
  process.exit(success ? 0 : 1);
}

module.exports = { validateComponents };
