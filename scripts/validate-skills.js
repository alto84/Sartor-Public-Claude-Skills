#!/usr/bin/env node
/**
 * Skills Library Validation Script
 * Validates structural consistency across all skills
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const REQUIRED_FILES = ['SKILL.md', 'VALIDATION.md'];
const OPTIONAL_DIRS = ['reference', 'templates', 'scripts', 'examples'];

class SkillValidator {
  constructor() {
    this.results = [];
    this.skillsChecked = 0;
    this.issuesFound = 0;
  }

  /**
   * Validate all skills in the library
   */
  validateAll() {
    console.log('\\x1b[1m=== Sartor Skills Library Validator ===\\x1b[0m\\n');

    const skills = fs.readdirSync(SKILLS_DIR).filter(item => {
      const fullPath = path.join(SKILLS_DIR, item);
      return fs.statSync(fullPath).isDirectory();
    });

    console.log(`Found ${skills.length} skills to validate\\n`);

    skills.forEach(skill => this.validateSkill(skill));

    this.printSummary();
    return this.issuesFound === 0;
  }

  /**
   * Validate a single skill
   */
  validateSkill(skillName) {
    const skillPath = path.join(SKILLS_DIR, skillName);
    const issues = [];
    const findings = [];

    this.skillsChecked++;

    // Check required files
    REQUIRED_FILES.forEach(file => {
      const filePath = path.join(skillPath, file);
      if (!fs.existsSync(filePath)) {
        issues.push(`Missing required file: ${file}`);
      } else {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.trim().length < 100) {
          issues.push(`${file} appears to be too short (${content.length} chars)`);
        }
      }
    });

    // Check optional directories
    let dirsPresent = 0;
    OPTIONAL_DIRS.forEach(dir => {
      const dirPath = path.join(skillPath, dir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        dirsPresent++;
        findings.push(`Has ${dir}/ directory`);
      }
    });

    if (dirsPresent < 2) {
      issues.push(`Sparse structure: only ${dirsPresent} optional directories`);
    }

    // Check for TypeScript files that need tsconfig
    const tsFiles = this.findFiles(skillPath, '.ts');
    if (tsFiles.length > 0) {
      const hasTsConfig = fs.existsSync(path.join(skillPath, 'tsconfig.json'));
      if (hasTsConfig) {
        findings.push(`Has TypeScript (${tsFiles.length} files) with tsconfig`);
      } else {
        issues.push(`Has ${tsFiles.length} TypeScript files but no tsconfig.json`);
      }
    }

    // Check for package.json if TypeScript is present
    if (tsFiles.length > 0) {
      const hasPackageJson = fs.existsSync(path.join(skillPath, 'package.json'));
      if (!hasPackageJson) {
        issues.push('Has TypeScript but no package.json for dependencies');
      }
    }

    // Store results
    this.results.push({
      name: skillName,
      issues,
      findings,
      valid: issues.length === 0
    });

    this.issuesFound += issues.length;
    this.printSkillResult(skillName, issues, findings);
  }

  /**
   * Find files with specific extension
   */
  findFiles(dir, ext, files = []) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (item === 'node_modules' || item === 'dist') return;
      if (fs.statSync(fullPath).isDirectory()) {
        this.findFiles(fullPath, ext, files);
      } else if (item.endsWith(ext)) {
        files.push(fullPath);
      }
    });
    return files;
  }

  /**
   * Print result for a single skill
   */
  printSkillResult(name, issues, findings) {
    const icon = issues.length === 0 ? '\\x1b[32m✓\\x1b[0m' : '\\x1b[33m!\\x1b[0m';
    console.log(`${icon} ${name}`);

    if (findings.length > 0) {
      findings.forEach(f => console.log(`   \\x1b[90m+ ${f}\\x1b[0m`));
    }

    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   \\x1b[33m- ${issue}\\x1b[0m`));
    }
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\\n\\x1b[1m=== Validation Summary ===\\x1b[0m\\n');

    const valid = this.results.filter(r => r.valid).length;
    const invalid = this.results.filter(r => !r.valid).length;

    console.log(`Skills checked: ${this.skillsChecked}`);
    console.log(`\\x1b[32mValid: ${valid}\\x1b[0m`);
    console.log(`\\x1b[33mWith issues: ${invalid}\\x1b[0m`);
    console.log(`Total issues: ${this.issuesFound}`);

    if (this.issuesFound === 0) {
      console.log('\\n\\x1b[32m All skills pass validation! \\x1b[0m');
    } else {
      console.log('\\n\\x1b[33m Some skills need attention \\x1b[0m');
    }
  }
}

// Run validation
const validator = new SkillValidator();
const success = validator.validateAll();
process.exit(success ? 0 : 1);
