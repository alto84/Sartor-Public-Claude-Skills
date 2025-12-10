/**
 * Autonomous Action Agent - Suggestion Types
 * Type definitions for improvement suggestions
 */

export interface ImprovementSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  evidence: SuggestionEvidence;
  priority: SuggestionPriority;
  impact: ImpactAssessment;
  createdAt: Date;
}

export enum SuggestionType {
  PERFORMANCE = 'performance',
  CODE_QUALITY = 'code_quality',
  ARCHITECTURE = 'architecture',
  SECURITY = 'security',
  TESTING = 'testing',
  DOCUMENTATION = 'documentation',
  WORKFLOW = 'workflow'
}

export enum SuggestionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SuggestionEvidence {
  sources: string[];
  confidence: number; // 0.0 - 1.0, derived from evidence quality
  observations: string[];
  isSpeculative: boolean;
}

export interface ImpactAssessment {
  estimatedEffort: 'trivial' | 'small' | 'medium' | 'large' | 'unknown';
  affectedAreas: string[];
  risks: string[];
  benefits: string[];
}

export interface SuggestionFeedback {
  suggestionId: string;
  action: 'accepted' | 'rejected' | 'deferred';
  reason?: string;
  timestamp: Date;
}
