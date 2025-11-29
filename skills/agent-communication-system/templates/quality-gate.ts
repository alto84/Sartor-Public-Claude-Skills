/**
 * Quality Gate System
 * Automated validation and quality control for agent outputs
 */

import {
  QualityGate,
  GateCriteria,
  GateResult,
  ValidationResult,
  AgentResult,
  StepResult
} from './message-types';

/**
 * Interface for custom validators
 */
export interface Validator {
  name: string;
  validate(output: any): ValidationResult;
}

/**
 * Interface for peer reviewer
 */
export interface PeerReviewer {
  agentId: string;
  capabilities: string[];
  review(output: any): Promise<ReviewResult>;
}

/**
 * Result from peer review
 */
export interface ReviewResult {
  approved: boolean;
  reviewer: string;
  comments?: string;
  suggestedImprovements?: string[];
  confidence?: number;
}

/**
 * JSON Schema type (simplified)
 */
export interface JSONSchema {
  type?: string;
  properties?: { [key: string]: any };
  required?: string[];
  additionalProperties?: boolean;
  items?: any;
  minItems?: number;
  maxItems?: number;
}

/**
 * Main quality gate system class
 */
export class QualityGateSystem {
  private validators: Map<string, Validator> = new Map();
  private reviewers: Map<string, PeerReviewer> = new Map();
  private gateHistory: Map<string, GateResult[]> = new Map();

  constructor() {
    this.registerDefaultValidators();
  }

  /**
   * Evaluate a quality gate against agent output
   */
  async evaluateGate(gate: QualityGate, agentOutput: any): Promise<GateResult> {
    const startTime = Date.now();
    console.error(`[QualityGate] Evaluating gate: ${gate.name} (${gate.type})`);

    try {
      let result: GateResult;

      switch (gate.type) {
        case 'CITATION_CHECK':
          result = this.checkCitations(gate.criteria, agentOutput);
          break;

        case 'PEER_REVIEW':
          result = await this.conductPeerReview(gate.criteria, agentOutput);
          break;

        case 'FORMAT_VALIDATION':
          result = this.validateFormat(gate.criteria, agentOutput);
          break;

        case 'CONFIDENCE_THRESHOLD':
          result = this.checkConfidence(gate.criteria, agentOutput);
          break;

        case 'CUSTOM':
          result = this.runCustomValidation(gate.criteria, agentOutput);
          break;

        default:
          result = {
            passed: false,
            gateName: gate.name,
            reason: `Unknown gate type: ${gate.type}`,
            evaluatedAt: new Date(),
            evaluationTime: 0
          };
      }

      // Add gate name and timing
      result.gateName = gate.name;
      result.evaluationTime = Date.now() - startTime;

      // Store in history
      if (!this.gateHistory.has(gate.name)) {
        this.gateHistory.set(gate.name, []);
      }
      this.gateHistory.get(gate.name)!.push(result);

      console.error(`[QualityGate] Gate ${gate.name} ${result.passed ? 'PASSED' : 'FAILED'}: ${result.reason || 'OK'}`);
      return result;

    } catch (error) {
      console.error(`[QualityGate] Error evaluating gate ${gate.name}: ${error}`);
      return {
        passed: false,
        gateName: gate.name,
        reason: `Gate evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        evaluatedAt: new Date(),
        evaluationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check citation requirements
   */
  checkCitations(criteria: GateCriteria, output: any): GateResult {
    const citations = this.extractCitations(output);

    // Check minimum citation count
    if (criteria.minCitations !== undefined) {
      if (citations.length < criteria.minCitations) {
        return {
          passed: false,
          reason: `Insufficient citations: found ${citations.length}, required ${criteria.minCitations}`,
          suggestedAction: `Add at least ${criteria.minCitations - citations.length} more citations to support your claims`,
          details: {
            found: citations.length,
            required: criteria.minCitations,
            citations
          },
          evaluatedAt: new Date(),
          evaluationTime: 0
        };
      }
    }

    // Check citation types
    if (criteria.citationTypes && criteria.citationTypes.length > 0) {
      const missingTypes: string[] = [];

      for (const requiredType of criteria.citationTypes) {
        const hasType = citations.some(citation =>
          this.getCitationType(citation) === requiredType
        );

        if (!hasType) {
          missingTypes.push(requiredType);
        }
      }

      if (missingTypes.length > 0) {
        return {
          passed: false,
          reason: `Missing required citation types: ${missingTypes.join(', ')}`,
          suggestedAction: `Include citations from these sources: ${missingTypes.join(', ')}`,
          details: {
            missingTypes,
            foundCitations: citations,
            foundTypes: citations.map(c => this.getCitationType(c))
          },
          evaluatedAt: new Date(),
          evaluationTime: 0
        };
      }
    }

    // Check for duplicate citations
    const uniqueCitations = new Set(citations);
    if (uniqueCitations.size < citations.length) {
      return {
        passed: false,
        reason: `Duplicate citations detected: ${citations.length - uniqueCitations.size} duplicates`,
        suggestedAction: 'Remove duplicate citations',
        details: {
          totalCitations: citations.length,
          uniqueCitations: uniqueCitations.size,
          duplicates: this.findDuplicates(citations)
        },
        evaluatedAt: new Date(),
        evaluationTime: 0
      };
    }

    return {
      passed: true,
      reason: 'All citation requirements met',
      details: {
        citationCount: citations.length,
        citationTypes: citations.map(c => this.getCitationType(c))
      },
      evaluatedAt: new Date(),
      evaluationTime: 0
    };
  }

  /**
   * Conduct peer review with multiple reviewers
   */
  async conductPeerReview(criteria: GateCriteria, output: any): Promise<GateResult> {
    const minReviewers = criteria.minReviewers || 1;
    const reviewerCapabilities = criteria.reviewerCapabilities || [];

    // Select eligible reviewers
    const eligibleReviewers = this.selectReviewers(reviewerCapabilities, minReviewers);

    if (eligibleReviewers.length < minReviewers) {
      return {
        passed: false,
        reason: `Insufficient reviewers available: found ${eligibleReviewers.length}, required ${minReviewers}`,
        suggestedAction: 'Wait for more reviewers to become available or adjust requirements',
        details: {
          availableReviewers: eligibleReviewers.length,
          requiredReviewers: minReviewers,
          requiredCapabilities: reviewerCapabilities
        },
        evaluatedAt: new Date(),
        evaluationTime: 0
      };
    }

    // Conduct reviews in parallel
    const reviewPromises = eligibleReviewers.map(reviewer => reviewer.review(output));
    const reviews = await Promise.all(reviewPromises);

    // Count approvals
    const approvals = reviews.filter(r => r.approved).length;
    const rejections = reviews.filter(r => !r.approved);

    if (approvals < minReviewers) {
      const rejectionReasons = rejections
        .map(r => `${r.reviewer}: ${r.comments || 'No comment'}`)
        .join('; ');

      return {
        passed: false,
        reason: `Peer review failed: ${approvals}/${eligibleReviewers.length} approved (need ${minReviewers})`,
        suggestedAction: 'Address reviewer feedback and resubmit',
        details: {
          reviews,
          approvals,
          rejections: rejections.length,
          feedback: rejectionReasons
        },
        evaluatedAt: new Date(),
        evaluationTime: 0
      };
    }

    // Calculate average confidence
    const avgConfidence = reviews
      .filter(r => r.confidence !== undefined)
      .reduce((sum, r) => sum + r.confidence!, 0) / reviews.length || 0;

    return {
      passed: true,
      reason: `Peer review passed: ${approvals}/${eligibleReviewers.length} approved`,
      details: {
        reviews,
        approvals,
        averageConfidence: avgConfidence
      },
      evaluatedAt: new Date(),
      evaluationTime: 0
    };
  }

  /**
   * Validate output format against schema
   */
  validateFormat(criteria: GateCriteria, output: any): GateResult {
    // Check required fields
    if (criteria.requiredFields && criteria.requiredFields.length > 0) {
      const missingFields: string[] = [];

      for (const field of criteria.requiredFields) {
        if (!this.hasField(output, field)) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        return {
          passed: false,
          reason: `Missing required fields: ${missingFields.join(', ')}`,
          suggestedAction: `Add the following fields to the output: ${missingFields.join(', ')}`,
          details: {
            missingFields,
            foundFields: Object.keys(output || {})
          },
          evaluatedAt: new Date(),
          evaluationTime: 0
        };
      }
    }

    // Validate against JSON schema if provided
    if (criteria.schema) {
      const schemaValidation = this.validateAgainstSchema(output, criteria.schema);
      if (!schemaValidation.valid) {
        return {
          passed: false,
          reason: `Format validation failed: ${schemaValidation.errors.join('; ')}`,
          suggestedAction: 'Correct the output format according to the schema',
          details: {
            schemaErrors: schemaValidation.errors,
            schema: criteria.schema
          },
          evaluatedAt: new Date(),
          evaluationTime: 0
        };
      }
    }

    // Check output is not empty
    if (this.isEmpty(output)) {
      return {
        passed: false,
        reason: 'Output is empty or null',
        suggestedAction: 'Provide valid output content',
        evaluatedAt: new Date(),
        evaluationTime: 0
      };
    }

    return {
      passed: true,
      reason: 'Format validation passed',
      details: {
        validatedFields: criteria.requiredFields || [],
        schemaValidated: !!criteria.schema
      },
      evaluatedAt: new Date(),
      evaluationTime: 0
    };
  }

  /**
   * Check confidence threshold
   */
  checkConfidence(criteria: GateCriteria, output: any): GateResult {
    const minConfidence = criteria.minConfidence || 0.7;
    const confidence = this.extractConfidence(output);

    if (confidence < minConfidence) {
      return {
        passed: false,
        reason: `Confidence below threshold: ${(confidence * 100).toFixed(1)}% < ${(minConfidence * 100).toFixed(1)}%`,
        suggestedAction: 'Improve data quality or gather more evidence to increase confidence',
        details: {
          actualConfidence: confidence,
          requiredConfidence: minConfidence,
          difference: minConfidence - confidence
        },
        evaluatedAt: new Date(),
        evaluationTime: 0
      };
    }

    return {
      passed: true,
      reason: `Confidence meets threshold: ${(confidence * 100).toFixed(1)}%`,
      details: {
        confidence,
        threshold: minConfidence
      },
      evaluatedAt: new Date(),
      evaluationTime: 0
    };
  }

  /**
   * Run custom validation function
   */
  private runCustomValidation(criteria: GateCriteria, output: any): GateResult {
    if (!criteria.validationFunction) {
      return {
        passed: false,
        reason: 'No custom validation function provided',
        evaluatedAt: new Date(),
        evaluationTime: 0
      };
    }

    try {
      const validationResult = criteria.validationFunction(output);
      return {
        passed: validationResult.passed,
        reason: validationResult.reason,
        suggestedAction: validationResult.suggestedAction,
        details: validationResult.details,
        evaluatedAt: new Date(),
        evaluationTime: 0
      };
    } catch (error) {
      return {
        passed: false,
        reason: `Custom validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        evaluatedAt: new Date(),
        evaluationTime: 0
      };
    }
  }

  /**
   * Register a custom validator
   */
  registerValidator(validator: Validator): void {
    this.validators.set(validator.name, validator);
    console.error(`[QualityGate] Registered validator: ${validator.name}`);
  }

  /**
   * Register a peer reviewer
   */
  registerReviewer(reviewer: PeerReviewer): void {
    this.reviewers.set(reviewer.agentId, reviewer);
    console.error(`[QualityGate] Registered reviewer: ${reviewer.agentId}`);
  }

  /**
   * Get gate evaluation history
   */
  getGateHistory(gateName: string): GateResult[] {
    return this.gateHistory.get(gateName) || [];
  }

  /**
   * Get statistics for a gate
   */
  getGateStatistics(gateName: string): {
    totalEvaluations: number;
    passRate: number;
    averageEvaluationTime: number;
    commonFailureReasons: string[];
  } {
    const history = this.getGateHistory(gateName);

    if (history.length === 0) {
      return {
        totalEvaluations: 0,
        passRate: 0,
        averageEvaluationTime: 0,
        commonFailureReasons: []
      };
    }

    const passed = history.filter(r => r.passed).length;
    const totalTime = history.reduce((sum, r) => sum + r.evaluationTime, 0);

    // Count failure reasons
    const failureReasons = new Map<string, number>();
    history
      .filter(r => !r.passed && r.reason)
      .forEach(r => {
        const count = failureReasons.get(r.reason!) || 0;
        failureReasons.set(r.reason!, count + 1);
      });

    // Sort by frequency
    const sortedReasons = Array.from(failureReasons.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason]) => reason);

    return {
      totalEvaluations: history.length,
      passRate: passed / history.length,
      averageEvaluationTime: totalTime / history.length,
      commonFailureReasons: sortedReasons
    };
  }

  // Helper methods

  private extractCitations(output: any): string[] {
    // Handle AgentResult type
    if (output && typeof output === 'object' && 'citations' in output) {
      return output.citations || [];
    }

    // Handle StepResult array
    if (Array.isArray(output)) {
      const allCitations: string[] = [];
      output.forEach(item => {
        if (item.citations) {
          allCitations.push(...item.citations);
        }
      });
      return allCitations;
    }

    // Look for citations field in nested structure
    if (output && typeof output === 'object') {
      for (const key of ['citations', 'sources', 'references']) {
        if (Array.isArray(output[key])) {
          return output[key];
        }
      }
    }

    return [];
  }

  private getCitationType(citation: string): string {
    // Detect citation type from format
    if (citation.startsWith('pubmed:')) return 'pubmed';
    if (citation.startsWith('arxiv:')) return 'arxiv';
    if (citation.startsWith('doi:')) return 'doi';
    if (citation.startsWith('pmid:')) return 'pubmed';
    if (citation.includes('arxiv.org')) return 'arxiv';
    if (citation.includes('pubmed')) return 'pubmed';
    if (citation.includes('doi.org')) return 'doi';
    if (citation.startsWith('http')) return 'web';
    return 'unknown';
  }

  private findDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const item of arr) {
      if (seen.has(item)) {
        duplicates.add(item);
      }
      seen.add(item);
    }

    return Array.from(duplicates);
  }

  private selectReviewers(requiredCapabilities: string[], count: number): PeerReviewer[] {
    const eligible: PeerReviewer[] = [];

    this.reviewers.forEach(reviewer => {
      // Check if reviewer has all required capabilities
      const hasCapabilities = requiredCapabilities.every(cap =>
        reviewer.capabilities.includes(cap)
      );

      if (hasCapabilities) {
        eligible.push(reviewer);
      }
    });

    // Return up to 'count' reviewers
    return eligible.slice(0, count);
  }

  private hasField(obj: any, fieldPath: string): boolean {
    if (!obj) return false;

    const parts = fieldPath.split('.');
    let current = obj;

    for (const part of parts) {
      if (current[part] === undefined) {
        return false;
      }
      current = current[part];
    }

    return true;
  }

  private validateAgainstSchema(data: any, schema: JSONSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic type check
    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      if (actualType !== schema.type) {
        errors.push(`Expected type ${schema.type} but got ${actualType}`);
      }
    }

    // Check required properties
    if (schema.required && schema.properties) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check array constraints
    if (schema.type === 'array' && Array.isArray(data)) {
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        errors.push(`Array has ${data.length} items, minimum required: ${schema.minItems}`);
      }
      if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        errors.push(`Array has ${data.length} items, maximum allowed: ${schema.maxItems}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  private extractConfidence(output: any): number {
    // Handle AgentResult type
    if (output && typeof output === 'object' && 'confidence' in output) {
      return output.confidence || 0;
    }

    // Handle array of results with confidence
    if (Array.isArray(output)) {
      const confidences = output
        .filter(item => item.confidence !== undefined)
        .map(item => item.confidence);

      if (confidences.length > 0) {
        return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
      }
    }

    // Look for confidence field in nested structure
    if (output && typeof output === 'object') {
      for (const key of ['confidence', 'score', 'probability']) {
        if (typeof output[key] === 'number') {
          return output[key];
        }
      }
    }

    // Default to 0 if no confidence found
    return 0;
  }

  private registerDefaultValidators(): void {
    // Register common validators
    this.registerValidator({
      name: 'no-empty-arrays',
      validate: (output: any) => {
        const hasEmptyArrays = this.checkForEmptyArrays(output);
        return {
          passed: !hasEmptyArrays,
          reason: hasEmptyArrays ? 'Output contains empty arrays' : undefined
        };
      }
    });

    this.registerValidator({
      name: 'no-null-values',
      validate: (output: any) => {
        const hasNulls = this.checkForNulls(output);
        return {
          passed: !hasNulls,
          reason: hasNulls ? 'Output contains null values' : undefined
        };
      }
    });
  }

  private checkForEmptyArrays(obj: any, path: string = ''): boolean {
    if (Array.isArray(obj)) {
      if (obj.length === 0) return true;
      return obj.some((item, i) => this.checkForEmptyArrays(item, `${path}[${i}]`));
    }

    if (obj && typeof obj === 'object') {
      return Object.keys(obj).some(key =>
        this.checkForEmptyArrays(obj[key], path ? `${path}.${key}` : key)
      );
    }

    return false;
  }

  private checkForNulls(obj: any, path: string = ''): boolean {
    if (obj === null) return true;

    if (Array.isArray(obj)) {
      return obj.some((item, i) => this.checkForNulls(item, `${path}[${i}]`));
    }

    if (obj && typeof obj === 'object') {
      return Object.keys(obj).some(key =>
        this.checkForNulls(obj[key], path ? `${path}.${key}` : key)
      );
    }

    return false;
  }
}