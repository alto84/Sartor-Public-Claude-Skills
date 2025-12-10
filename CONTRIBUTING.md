# Contributing to Sartor Claude Skills Library

Thank you for your interest in contributing to the Sartor Claude Skills Library!

## Skill Structure Requirements

Every skill must follow this structure to pass validation:

```
skill-name/
├── SKILL.md              # Required: Main skill definition
├── VALIDATION.md         # Required: Validation procedures
├── reference/            # Recommended: Reference materials
├── templates/            # Recommended: Code templates
├── scripts/              # Recommended: Utility scripts
└── examples/             # Recommended: Usage examples
```

### Required Files

#### SKILL.md
The main skill definition file must include:
- Clear skill name and description
- When to use this skill
- When NOT to use this skill
- Core components and features
- Integration with other skills (if applicable)

#### VALIDATION.md
Documents validation procedures:
- Core requirements checklist
- Anti-patterns to avoid
- Test cases
- Usage examples (valid and invalid)

**Note:** Include this disclaimer if your skill contains numeric thresholds:
> All numeric thresholds and performance targets are EXAMPLE configurations, not guarantees.

### TypeScript Skills

If your skill includes TypeScript files:

1. Add `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node"]
  },
  "include": ["templates/**/*.ts"]
}
```

2. Add `package.json`:
```json
{
  "name": "@sartor/your-skill-name",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Core Principles

All skills must adhere to these principles:

### 1. Evidence-Based Assessment
- Never fabricate metrics or scores
- All claims must be backed by measurable data
- Use dynamic calculations, not hardcoded values

### 2. Anti-Fabrication Protocol
- Mark speculative content as such
- Include confidence levels derived from evidence
- Provide sources and citations

### 3. Let Claude Be Claude
- Allow creative latitude within evidence constraints
- Don't over-constrain agent behavior
- Suggestions should be advisory, not mandatory

## Validation

Before submitting, run the validation script:

```bash
npm run validate
```

All skills must pass validation (11/11 valid).

## Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/new-skill-name`
3. **Develop** your skill following the structure requirements
4. **Validate** using `npm run validate`
5. **Test** TypeScript builds: `npm run build`
6. **Submit** a pull request

## Commit Message Format

Use conventional commits:

```
feat: Add new skill for X
fix: Resolve issue with Y in skill Z
docs: Update README for skill W
```

## Integration Guidelines

When creating skills that integrate with existing ones:

1. Reference the skill in your SKILL.md
2. Add to the compatibility matrix in your VALIDATION.md
3. Update `skills/community-swarm/reference/skill-integration.md` if applicable

## Questions?

- Open an issue for questions or suggestions
- Check existing skills for examples of good structure
- Review the `unified-skills-orchestrator` for coordination patterns

---

*Part of the Sartor Public Claude Skills Library*
