import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import matter from 'gray-matter';

/**
 * Read a file and return its content
 */
export function readFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return readFileSync(filePath, 'utf-8');
}

/**
 * Read a markdown file with frontmatter parsing
 */
export function readMarkdownWithFrontmatter(filePath) {
  const content = readFile(filePath);
  const { data, content: body } = matter(content);
  return { frontmatter: data, body };
}

/**
 * Check if a file exists
 */
export function fileExists(filePath) {
  return existsSync(filePath);
}

/**
 * Read all files in a directory recursively
 */
export function readDirectory(dirPath, options = {}) {
  const { recursive = false, extensions = null } = options;
  const files = [];

  function traverse(currentPath) {
    if (!existsSync(currentPath)) {
      return;
    }

    const items = readdirSync(currentPath);
    for (const item of items) {
      const fullPath = join(currentPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && recursive) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        if (!extensions || extensions.includes(extname(item))) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dirPath);
  return files;
}

/**
 * Read JSON file
 */
export function readJSON(filePath) {
  const content = readFile(filePath);
  return JSON.parse(content);
}
