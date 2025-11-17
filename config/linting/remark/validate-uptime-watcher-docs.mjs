/**
 * Custom validation for Uptime Watcher documentation patterns
 */
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Heading} Heading
 * @typedef {import('mdast').Code} Code
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').Text} Text
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('unist').Position} Position
 */

/**
 * Check if a character is an emoji using comprehensive Unicode ranges
 * @param {string} char - Single character to check
 * @returns {boolean} True if character is emoji
 */
function isEmoji(char) {
  const code = char.codePointAt(0);
  if (!code) return false;
  
  return (
    // Main emoji blocks
    (code >= 0x1F600 && code <= 0x1F64F) || // Emoticons
    (code >= 0x1F300 && code <= 0x1F5FF) || // Misc Symbols and Pictographs
    (code >= 0x1F680 && code <= 0x1F6FF) || // Transport and Map Symbols
    (code >= 0x1F1E0 && code <= 0x1F1FF) || // Regional indicators (flags)
    (code >= 0x1F700 && code <= 0x1F77F) || // Alchemical Symbols
    (code >= 0x1F780 && code <= 0x1F7FF) || // Geometric Shapes Extended
    (code >= 0x1F800 && code <= 0x1F8FF) || // Supplemental Arrows-C
    (code >= 0x1F900 && code <= 0x1F9FF) || // Supplemental Symbols and Pictographs
    (code >= 0x1FA00 && code <= 0x1FA6F) || // Chess Symbols
    (code >= 0x1FA70 && code <= 0x1FAFF) || // Symbols and Pictographs Extended-A
    // Additional ranges
    (code >= 0x2600 && code <= 0x26FF) ||   // Miscellaneous Symbols
    (code >= 0x2700 && code <= 0x27BF) ||   // Dingbats
    (code >= 0x2300 && code <= 0x23FF) ||   // Miscellaneous Technical
    (code >= 0x2B00 && code <= 0x2BFF) ||   // Miscellaneous Symbols and Arrows
    // Specific commonly used symbols
    code === 0x203C ||  // ‼️
    code === 0x2049 ||  // ⁉️
    code === 0x2122 ||  // ™️
    code === 0x2139 ||  // ℹ️
    code === 0x2194 ||  // ↔️
    code === 0x2195 ||  // ↕️
    code === 0x2196 ||  // ↖️
    code === 0x2197 ||  // ↗️
    code === 0x2198 ||  // ↘️
    code === 0x2199 ||  // ↙️
    code === 0x21A9 ||  // ↩️
    code === 0x21AA    // ↪️
  );
}

/**
 * Check if a string starts with a capital letter or emoji
 * @param {string} text - Text to check
 * @returns {boolean} True if starts with capital letter or emoji
 */
function startsWithCapitalOrEmoji(text) {
  if (!text || text.length === 0) return false;
  
  // Remove any markdown formatting first
  const cleanText = text.replace(/^\*\*([^*]+)\*\*/, '$1').trim();
  
  if (cleanText.length === 0) return false;
  
  const firstChar = cleanText.charAt(0);
  
  // Check if first character is emoji
  if (isEmoji(firstChar)) {
    return true;
  }
  
  // Check if starts with capital letter
  return /^[A-Z]/.test(cleanText);
}

/**
 * Create a proper remark message with position information
 * @param {VFile} file - Virtual file
 * @param {string} message - Error message
 * @param {Position} position - Node position
 * @param {string} ruleId - Rule identifier
 */
function createMessage(file, message, position, ruleId) {
  const msg = file.message(message, position);
  msg.ruleId = ruleId;
  msg.source = 'remark-lint';
  return msg;
}

/**
 * Check if file is in ignored patterns for certain rules
 * @param {string} filePath - File path
 * @param {string[]} patterns - Patterns to check against
 * @returns {boolean} True if file matches any pattern
 */
function isIgnoredFile(filePath, patterns) {
  if (!filePath) return false;
  return patterns.some(pattern => filePath.includes(pattern));
}

/**
 * Remark plugin to validate Uptime Watcher specific documentation patterns
 * @returns {function(Root, VFile): void}
 */
export default function validateUptimeWatcherDocs() {
  return (tree, file) => {
    const filePath = file.path || '';
    
    visit(tree, 'heading', (node) => {
      const text = toString(node);
      
      // Check for proper heading structure patterns
      if (node.depth === 1 && !startsWithCapitalOrEmoji(text)) {
        createMessage(
          file, 
          `Top-level heading should start with capital letter or emoji: "${text}"`,
          node.position,
          'heading-capitalization'
        );
      }
      
      // Check for excessive nesting
      if (node.depth > 6) {
        createMessage(
          file,
          `Heading nesting too deep (level ${node.depth}). Maximum recommended: 6`,
          node.position,
          'heading-depth-limit'
        );
      }
      
      // Check for consecutive headings of same level without content
      if (node.depth > 1) {
        const siblings = tree.children;
        const currentIndex = siblings.indexOf(node);
        const nextSibling = siblings[currentIndex + 1];
        
        if (nextSibling && nextSibling.type === 'heading' && nextSibling.depth === node.depth) {
          createMessage(
            file,
            `Consider adding content between consecutive headings of same level`,
            node.position,
            'heading-spacing'
          );
        }
      }
      
      // Enforce consistent terminology
      const incorrectTerms = {
        'uptime watcher': 'Uptime Watcher',
        'electron': 'Electron',
        'typescript': 'TypeScript',
        'javascript': 'JavaScript',
        'nodejs': 'Node.js',
        'node js': 'Node.js',
        'github': 'GitHub',
        'vscode': 'VS Code',
        'visual studio code': 'VS Code',
        'api': 'API',
        'json': 'JSON',
        'html': 'HTML',
        'css': 'CSS',
        'sql': 'SQL',
        'xml': 'XML',
        'yaml': 'YAML',
        'npm': 'npm',
        'git': 'Git',
        'docker': 'Docker',
        'webpack': 'Webpack',
        'babel': 'Babel',
        'eslint': 'ESLint',
        'prettier': 'Prettier'
      };
      
      Object.entries(incorrectTerms).forEach(([wrong, correct]) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes(wrong) && !text.includes(correct)) {
          // Only flag if the wrong term appears as a whole word
          const wordBoundaryRegex = new RegExp(`\\b${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (wordBoundaryRegex.test(text)) {
            createMessage(
              file,
              `Use "${correct}" instead of "${wrong}" in heading`,
              node.position,
              'terminology-consistency'
            );
          }
        }
      });
      
      // Check for overly long headings
      if (text.length > 80) {
        createMessage(
          file,
          `Heading is too long (${text.length} characters). Consider shortening to under 80 characters`,
          node.position,
          'heading-length'
        );
      }
    });
    
    visit(tree, 'code', (node) => {
      // Only check substantial code blocks for language specification
      if (node.lang === null && node.value && node.value.length > 20) {
        const hasCodePatterns = /[{}();]|function|class|import|export|const|let|var|if|for|while/.test(node.value);
        if (hasCodePatterns) {
          createMessage(
            file,
            'Code blocks with programming content should specify language',
            node.position,
            'code-language-required'
          );
        }
      }
      
      // Check for overly long code blocks
      if (node.value && node.value.split('\n').length > 100) {
        createMessage(
          file,
          `Code block is very long (${node.value.split('\n').length} lines). Consider breaking into smaller examples`,
          node.position,
          'code-block-length'
        );
      }
      
      // More lenient check for TypeScript examples - only flag if using 'any' excessively
      if ((node.lang === 'typescript' || node.lang === 'ts') && node.value) {
        const anyCount = (node.value.match(/\bany\b/g) || []).length;
        const hasDisableComment = node.value.includes('// eslint-disable') || 
                                 node.value.includes('// @ts-ignore') ||
                                 node.value.includes('// Allow any for') ||
                                 node.value.includes('// TODO: type this properly');
        
        // Only flag if there are multiple 'any' usages without explanation
        if (anyCount > 2 && !hasDisableComment) {
          createMessage(
            file,
            `Consider reducing "any" type usage in TypeScript examples (found ${anyCount} instances)`,
            node.position,
            'typescript-any-usage'
          );
        }
      }
      
      // Check for common security anti-patterns in code examples
      if (node.value) {
        const securityPatterns = [
          { pattern: /password\s*=\s*['"]\w+['"]/, message: 'Avoid hardcoded passwords in examples' },
          { pattern: /api[_-]?key\s*=\s*['"]\w+['"]/, message: 'Avoid hardcoded API keys in examples' },
          { pattern: /secret\s*=\s*['"]\w+['"]/, message: 'Avoid hardcoded secrets in examples' },
          { pattern: /eval\s*\(/, message: 'Avoid using eval() in examples' },
          { pattern: /innerHTML\s*=/, message: 'Consider safer alternatives to innerHTML for XSS prevention' }
        ];
        
        securityPatterns.forEach(({ pattern, message }) => {
          if (pattern.test(node.value)) {
            createMessage(
              file,
              message,
              node.position,
              'security-pattern'
            );
          }
        });
      }
    });
    
    visit(tree, 'link', (node) => {
      if (!node.url) return;
      
      // Check for proper internal link formatting
      if (node.url.startsWith('./') || node.url.startsWith('../')) {
        const urlWithoutHash = node.url.split('#')[0];
        if (urlWithoutHash && !urlWithoutHash.endsWith('.md') && !node.url.includes('#')) {
          createMessage(
            file,
            `Internal link should reference .md file: ${node.url}`,
            node.position,
            'internal-link-format'
          );
        }
      }
      
      // Warn about external links that should be relative
      if (node.url.includes('github.com/Nick2bad4u/Uptime-Watcher')) {
        createMessage(
          file,
          'Use relative links for internal GitHub references',
          node.position,
          'relative-link-preferred'
        );
      }
      
      // Check for broken localhost links
      if (node.url.includes('localhost') && !isIgnoredFile(filePath, ['test', 'example', 'demo'])) {
        createMessage(
          file,
          'Avoid localhost links in documentation (use examples or placeholders)',
          node.position,
          'localhost-link'
        );
      }
      
      // Flag missing link text
      const linkText = toString(node);
      if (!linkText || linkText === node.url) {
        createMessage(
          file,
          'Links should have descriptive text instead of bare URLs',
          node.position,
          'link-text-required'
        );
      }
    });
    
    visit(tree, 'image', (node) => {
      // Check for missing alt text
      if (!node.alt || node.alt.trim() === '') {
        createMessage(
          file,
          'Images should have descriptive alt text for accessibility',
          node.position,
          'image-alt-required'
        );
      }
      
      // Check for generic alt text
      const genericAltTexts = ['image', 'picture', 'photo', 'screenshot'];
      if (node.alt && genericAltTexts.includes(node.alt.toLowerCase().trim())) {
        createMessage(
          file,
          'Images should have specific, descriptive alt text',
          node.position,
          'image-alt-descriptive'
        );
      }
    });
    
    visit(tree, 'list', (node) => {
      // Check for very long lists
      if (node.children && node.children.length > 20) {
        createMessage(
          file,
          `List is very long (${node.children.length} items). Consider breaking into sections`,
          node.position,
          'list-length'
        );
      }
    });
    
    visit(tree, 'table', (node) => {
      // Check for tables without headers
      if (node.children && node.children.length > 0) {
        const firstRow = node.children[0];
        if (firstRow && !firstRow.children.some(cell => cell.type === 'tableCell')) {
          createMessage(
            file,
            'Tables should have header rows for accessibility',
            node.position,
            'table-header-required'
          );
        }
      }
    });
    
    // Check document-level patterns
    visit(tree, 'root', () => {
      const content = toString(tree);
      
      // Ensure architecture docs mention design patterns (more flexible)
      if (filePath.includes('Architecture') && content.length > 500) {
        const hasDesignContent = /\b(pattern|design|architecture|structure|approach|principle)\b/i.test(content);
        if (!hasDesignContent) {
          createMessage(
            file,
            'Architecture documentation should discuss design patterns or architectural approaches',
            tree.position,
            'architecture-content-required'
          );
        }
      }
      
      // Ensure guide documents have practical examples (more flexible)
      if (filePath.includes('Guides') && content.length > 1000) {
        const hasCodeBlocks = tree.children.some(child => child.type === 'code');
        const hasCodeInline = /`[^`]+`/.test(content);
        const hasExamples = /\b(example|demo|sample|usage|how to|tutorial|walkthrough)\b/i.test(content);
        
        if (!hasCodeBlocks && !hasCodeInline && !hasExamples) {
          createMessage(
            file,
            'Guide documentation should include code examples or practical demonstrations',
            tree.position,
            'guide-examples-required'
          );
        }
      }
      
      // Check for TODO/FIXME comments in documentation
      if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(content)) {
        createMessage(
          file,
          'Documentation contains TODO/FIXME comments that should be resolved',
          tree.position,
          'todo-comments'
        );
      }
      
      // Ensure README files have proper structure
      if (filePath.includes('README.md')) {
        const hasInstallation = /\b(install|installation|setup)\b/i.test(content);
        const hasUsage = /\b(usage|how to use|getting started)\b/i.test(content);
        
        if (!hasInstallation || !hasUsage) {
          createMessage(
            file,
            'README files should include installation and usage sections',
            tree.position,
            'readme-structure'
          );
        }
      }
      
      // Check for very short documents that might be incomplete
      if (content.length < 100 && !isIgnoredFile(filePath, ['index', 'template'])) {
        createMessage(
          file,
          'Document appears to be very short. Consider adding more content',
          tree.position,
          'document-length'
        );
      }
    });
  };
}