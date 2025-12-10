/**
 * Unified Skills Orchestrator - Configuration Types
 */

export interface OrchestratorConfig {
  skills: SkillDefinition[];
  activationThreshold: number;
  maxActiveSkills: number;
  conflictResolution: ConflictStrategy;
}

export interface SkillDefinition {
  name: string;
  category: SkillCategory;
  activationPatterns: string[];
  priority: number;
  dependencies: string[];
  conflicts: string[];
}

export enum SkillCategory {
  FOUNDATIONAL = 'foundational',
  DOMAIN = 'domain',
  SPECIALIZED = 'specialized'
}

export enum ConflictStrategy {
  PRIORITY = 'priority',
  FIRST_MATCH = 'first_match',
  MERGE = 'merge'
}

export interface ActivationResult {
  activeSkills: string[];
  skippedSkills: SkippedSkill[];
  conflicts: ConflictRecord[];
}

export interface SkippedSkill {
  name: string;
  reason: 'low_priority' | 'conflict' | 'threshold' | 'max_reached';
}

export interface ConflictRecord {
  skills: string[];
  resolution: string;
  winner: string;
}
