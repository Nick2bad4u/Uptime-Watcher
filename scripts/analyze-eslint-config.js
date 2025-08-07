#!/usr/bin/env node
/**
 * ESLint Configuration Analysis Tool
 * 
 * This script provides an alternative to eslint-find-rules for analyzing
 * the current ESLint configuration in the Uptime-Watcher project.
 * 
 * Usage: node scripts/analyze-eslint-config.js [file-path]
 */

const { ESLint } = require('eslint');
const path = require('path');

async function analyzeConfig(filePath = 'electron/main.ts') {
    try {
        console.log('🔍 Analyzing ESLint configuration for:', filePath);
        console.log('─'.repeat(60));

        const eslint = new ESLint();
        const config = await eslint.calculateConfigForFile(filePath);
        
        // Extract and count rules
        const rules = config.rules || {};
        const ruleNames = Object.keys(rules);
        
        console.log(`📊 Configuration Summary:`);
        console.log(`   • Total rules configured: ${ruleNames.length}`);
        console.log(`   • Parser: ${config.parser || 'default'}`);
        console.log(`   • Plugins: ${Object.keys(config.plugins || {}).join(', ') || 'none'}`);
        console.log('');

        // Categorize rules by status
        const rulesByStatus = {
            error: [],
            warn: [],
            off: []
        };

        ruleNames.forEach(ruleName => {
            const ruleConfig = rules[ruleName];
            const level = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig;
            
            if (level === 'error' || level === 2) {
                rulesByStatus.error.push(ruleName);
            } else if (level === 'warn' || level === 1) {
                rulesByStatus.warn.push(ruleName);
            } else if (level === 'off' || level === 0) {
                rulesByStatus.off.push(ruleName);
            }
        });

        console.log('📋 Rules by Status:');
        console.log(`   🔴 Error (${rulesByStatus.error.length}): ${rulesByStatus.error.length > 0 ? rulesByStatus.error.slice(0, 5).join(', ') + (rulesByStatus.error.length > 5 ? '...' : '') : 'none'}`);
        console.log(`   🟡 Warning (${rulesByStatus.warn.length}): ${rulesByStatus.warn.length > 0 ? rulesByStatus.warn.slice(0, 5).join(', ') + (rulesByStatus.warn.length > 5 ? '...' : '') : 'none'}`);
        console.log(`   ⚪ Disabled (${rulesByStatus.off.length}): ${rulesByStatus.off.length > 0 ? rulesByStatus.off.slice(0, 5).join(', ') + (rulesByStatus.off.length > 5 ? '...' : '') : 'none'}`);
        console.log('');

        // Show TypeScript-specific rules
        const tsRules = ruleNames.filter(name => name.startsWith('@typescript-eslint/'));
        console.log(`🔷 TypeScript Rules (${tsRules.length}):`);
        if (tsRules.length > 0) {
            tsRules.slice(0, 10).forEach(rule => {
                const config = rules[rule];
                const level = Array.isArray(config) ? config[0] : config;
                const indicator = level === 'error' || level === 2 ? '🔴' : 
                                level === 'warn' || level === 1 ? '🟡' : '⚪';
                console.log(`   ${indicator} ${rule}`);
            });
            if (tsRules.length > 10) {
                console.log(`   ... and ${tsRules.length - 10} more`);
            }
        }
        console.log('');

        // Show React-specific rules
        const reactRules = ruleNames.filter(name => 
            name.startsWith('react/') || 
            name.startsWith('react-hooks/') || 
            name.startsWith('@eslint-react/')
        );
        console.log(`⚛️  React Rules (${reactRules.length}):`);
        if (reactRules.length > 0) {
            reactRules.slice(0, 10).forEach(rule => {
                const config = rules[rule];
                const level = Array.isArray(config) ? config[0] : config;
                const indicator = level === 'error' || level === 2 ? '🔴' : 
                                level === 'warn' || level === 1 ? '🟡' : '⚪';
                console.log(`   ${indicator} ${rule}`);
            });
            if (reactRules.length > 10) {
                console.log(`   ... and ${reactRules.length - 10} more`);
            }
        }
        console.log('');

        console.log('💡 Tips:');
        console.log('   • Use "npm run eslint:config-check" to save full config to file');
        console.log('   • Use "npx eslint --print-config <file>" for detailed analysis');
        console.log('   • Check docs/eslint-configuration-guide.md for more information');

    } catch (error) {
        console.error('❌ Error analyzing configuration:', error.message);
        process.exit(1);
    }
}

// Get file path from command line arguments
const filePath = process.argv[2] || 'electron/main.ts';
analyzeConfig(filePath);