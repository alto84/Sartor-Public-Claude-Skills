/**
 * Quality Gate Demo
 * Demonstrates automated quality validation for agent outputs
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface QualityGate {
  name: string;
  type: 'CITATION_CHECK' | 'CONFIDENCE_THRESHOLD' | 'FORMAT_VALIDATION' | 'PEER_REVIEW' | 'CUSTOM';
  criteria: GateCriteria;
  blocking: boolean;
  weight?: number;
}

interface GateCriteria {
  // Citation requirements
  minCitations?: number;
  citationTypes?: string[];
  requirePeerReviewed?: boolean;

  // Confidence scoring
  minConfidence?: number;
  confidenceType?: 'weighted' | 'average' | 'minimum';

  // Format validation
  requiredFields?: string[];
  schema?: any;

  // Peer review
  minReviewers?: number;
  minApprovalScore?: number;
  reviewerCapabilities?: string[];

  // Custom validation
  validationFunction?: (output: any) => Promise<GateResult>;
}

interface GateResult {
  passed: boolean;
  score?: number;
  reason?: string;
  details?: any;
  suggestedActions?: string[];
  canRetry?: boolean;
}

interface AgentOutput {
  title: string;
  abstract: string;
  findings: string[];
  citations: Citation[];
  confidence: number;
  methodology?: string;
  metadata?: any;
}

interface Citation {
  id: string;
  type: string;
  title: string;
  authors?: string[];
  year?: number;
  peerReviewed?: boolean;
}

interface ValidationReport {
  overallPassed: boolean;
  gatesEvaluated: number;
  gatesPassed: number;
  gatesFailed: number;
  details: GateEvaluation[];
  totalTime: number;
  retryCount: number;
}

interface GateEvaluation {
  gateName: string;
  result: GateResult;
  duration: number;
}

// ============================================================================
// Quality Gate System
// ============================================================================

class QualityGateSystem {
  private gates: QualityGate[] = [];
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  /**
   * Add a quality gate to the system
   */
  addGate(gate: QualityGate): void {
    this.gates.push(gate);
    if (this.verbose) {
      console.log(`Added gate: ${gate.name} (${gate.type})`);
    }
  }

  /**
   * Evaluate all gates against an agent output
   */
  async evaluateAll(output: AgentOutput, attempt: number = 1): Promise<ValidationReport> {
    const startTime = Date.now();
    const evaluations: GateEvaluation[] = [];
    let gatesPassed = 0;
    let gatesFailed = 0;
    let overallPassed = true;

    console.log(`\n=== Running Quality Gates${attempt > 1 ? ` (Attempt ${attempt}/3)` : ''} ===\n`);

    for (const gate of this.gates) {
      const gateStart = Date.now();
      const result = await this.evaluateGate(gate, output);
      const duration = Date.now() - gateStart;

      evaluations.push({
        gateName: gate.name,
        result,
        duration
      });

      // Display result
      this.displayGateResult(gate, result);

      if (result.passed) {
        gatesPassed++;
      } else {
        gatesFailed++;
        if (gate.blocking) {
          overallPassed = false;
        }
      }
    }

    return {
      overallPassed,
      gatesEvaluated: this.gates.length,
      gatesPassed,
      gatesFailed,
      details: evaluations,
      totalTime: Date.now() - startTime,
      retryCount: attempt - 1
    };
  }

  /**
   * Evaluate a single gate
   */
  private async evaluateGate(gate: QualityGate, output: AgentOutput): Promise<GateResult> {
    switch (gate.type) {
      case 'CITATION_CHECK':
        return this.checkCitations(gate.criteria, output);

      case 'CONFIDENCE_THRESHOLD':
        return this.checkConfidence(gate.criteria, output);

      case 'FORMAT_VALIDATION':
        return this.validateFormat(gate.criteria, output);

      case 'PEER_REVIEW':
        return await this.conductPeerReview(gate.criteria, output);

      case 'CUSTOM':
        if (gate.criteria.validationFunction) {
          return await gate.criteria.validationFunction(output);
        }
        return { passed: true };

      default:
        return { passed: true };
    }
  }

  /**
   * Citation validation
   */
  private checkCitations(criteria: GateCriteria, output: AgentOutput): GateResult {
    const citations = output.citations || [];

    // Check minimum count
    if (criteria.minCitations && citations.length < criteria.minCitations) {
      return {
        passed: false,
        reason: `Only ${citations.length} citations found (minimum: ${criteria.minCitations})`,
        suggestedActions: ['Add more peer-reviewed sources'],
        canRetry: true
      };
    }

    // Check citation types
    if (criteria.citationTypes) {
      const foundTypes = new Set(citations.map(c => c.type));
      const missingTypes = criteria.citationTypes.filter(t => !foundTypes.has(t));

      if (missingTypes.length > 0) {
        return {
          passed: false,
          reason: `Missing citation types: ${missingTypes.join(', ')}`,
          suggestedActions: [`Add citations from: ${missingTypes.join(', ')}`],
          canRetry: true
        };
      }
    }

    // Check peer review requirement
    if (criteria.requirePeerReviewed) {
      const peerReviewedCount = citations.filter(c => c.peerReviewed).length;
      if (peerReviewedCount === 0) {
        return {
          passed: false,
          reason: 'No peer-reviewed citations found',
          suggestedActions: ['Include at least one peer-reviewed source'],
          canRetry: true
        };
      }
    }

    const citationList = citations.map(c => c.id).join(', ');
    return {
      passed: true,
      score: 1.0,
      reason: `${citations.length} citations found (minimum: ${criteria.minCitations || 0})`,
      details: { sources: citationList }
    };
  }

  /**
   * Confidence threshold validation
   */
  private checkConfidence(criteria: GateCriteria, output: AgentOutput): GateResult {
    const confidence = output.confidence || 0;
    const threshold = criteria.minConfidence || 0.7;

    if (confidence < threshold) {
      return {
        passed: false,
        score: confidence,
        reason: `Confidence ${confidence.toFixed(2)} (minimum: ${threshold})`,
        suggestedActions: ['Gather more evidence to increase confidence'],
        canRetry: true
      };
    }

    return {
      passed: true,
      score: confidence,
      reason: `Confidence ${confidence.toFixed(2)} (minimum: ${threshold})`
    };
  }

  /**
   * Format validation
   */
  private validateFormat(criteria: GateCriteria, output: AgentOutput): GateResult {
    // Check required fields
    if (criteria.requiredFields) {
      const missingFields = criteria.requiredFields.filter(field =>
        !(field in output) || output[field as keyof AgentOutput] === undefined
      );

      if (missingFields.length > 0) {
        return {
          passed: false,
          reason: `Missing required fields: ${missingFields.join(', ')}`,
          suggestedActions: [`Add missing fields: ${missingFields.join(', ')}`],
          canRetry: true
        };
      }
    }

    // Schema validation would go here (simplified for demo)
    const validatedFields = criteria.requiredFields || [];
    return {
      passed: true,
      reason: 'All required fields present',
      details: { fieldsValidated: validatedFields.join(', ') }
    };
  }

  /**
   * Peer review validation
   */
  private async conductPeerReview(criteria: GateCriteria, output: AgentOutput): Promise<GateResult> {
    console.log('  ⏳ Requesting peer review...');

    // Simulate peer review process
    await this.delay(1500);

    const minReviewers = criteria.minReviewers || 2;
    const reviews = [];

    // Simulate reviewer feedback
    for (let i = 1; i <= minReviewers; i++) {
      const score = 0.7 + Math.random() * 0.3; // Random score between 0.7 and 1.0
      reviews.push({
        reviewer: `ValidationAgent-${i}`,
        approved: score >= (criteria.minApprovalScore || 0.7),
        score
      });
      console.log(`  Reviewer ${i} (ValidationAgent-${i}): ${
        reviews[i - 1].approved ? 'Approved' : 'Rejected'
      } with score ${score.toFixed(2)}`);
    }

    const approved = reviews.filter(r => r.approved).length;
    const required = criteria.minReviewers || 1;

    return {
      passed: approved >= required,
      reason: `${approved}/${reviews.length} reviewers approved`,
      details: reviews,
      canRetry: true
    };
  }

  /**
   * Display gate result
   */
  private displayGateResult(gate: QualityGate, result: GateResult): void {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? '\x1b[32m' : '\x1b[31m'; // Green or Red
    const reset = '\x1b[0m';

    console.log(`Gate: ${gate.name}`);
    console.log(`  ${color}${status} ${result.passed ? 'Passed' : 'Failed'}: ${result.reason}${reset}`);

    if (result.details) {
      if (typeof result.details === 'string') {
        console.log(`  ${result.details}`);
      } else if (result.details.sources) {
        console.log(`  Sources: [${result.details.sources}]`);
      } else if (result.details.fieldsValidated) {
        console.log(`  Fields validated: ${result.details.fieldsValidated}`);
      }
    }

    if (!result.passed && result.suggestedActions) {
      console.log(`  Suggested action: ${result.suggestedActions[0]}`);
    }

    console.log('');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Research Agent
// ============================================================================

class ResearchAgent {
  private name: string = 'ResearchAgent';

  /**
   * Generate research output for validation
   */
  async generateOutput(includeAllCitations: boolean = true, highConfidence: boolean = true): Promise<AgentOutput> {
    console.log(`[${this.timestamp()}] ${this.name}: Generating research output...`);
    await this.delay(1000);

    // Generate citations based on parameters
    const citations: Citation[] = includeAllCitations ? [
      { id: 'pubmed:123', type: 'pubmed', title: 'Quantum Effects in Biology', peerReviewed: true },
      { id: 'arxiv:456', type: 'arxiv', title: 'Quantum Computing Survey', peerReviewed: false },
      { id: 'nature:789', type: 'nature', title: 'Quantum Supremacy Achieved', peerReviewed: true },
      { id: 'science:012', type: 'science', title: 'Quantum Error Correction', peerReviewed: true },
      { id: 'ieee:345', type: 'ieee', title: 'Quantum Network Protocols', peerReviewed: true }
    ] : [
      { id: 'blog:001', type: 'blog', title: 'Quantum Computing Explained', peerReviewed: false },
      { id: 'wiki:002', type: 'wiki', title: 'Quantum Mechanics', peerReviewed: false }
    ];

    const output: AgentOutput = {
      title: 'Quantum Computing Applications in Modern Science',
      abstract: 'A comprehensive analysis of quantum computing applications across various scientific domains.',
      findings: [
        'Quantum computing shows promise in drug discovery',
        'Optimization problems can achieve quantum advantage',
        'Error correction remains a significant challenge',
        'Commercial applications emerging in finance and logistics',
        'Hybrid classical-quantum algorithms show practical benefits'
      ],
      citations,
      confidence: highConfidence ? 0.85 : 0.65,
      methodology: 'Systematic literature review with meta-analysis'
    };

    console.log(`[${this.timestamp()}] ${this.name}: Output ready for validation`);
    return output;
  }

  /**
   * Revise output based on feedback
   */
  async reviseOutput(output: AgentOutput, feedback: ValidationReport): Promise<AgentOutput> {
    console.log(`[${this.timestamp()}] ${this.name}: Revising output based on feedback...`);

    // Analyze what failed
    const failedGates = feedback.details.filter(e => !e.result.passed);

    for (const evaluation of failedGates) {
      const gateName = evaluation.gateName;

      if (gateName.includes('citation')) {
        console.log(`[${this.timestamp()}] ${this.name}: Added 3 more citations`);
        output.citations.push(
          { id: 'nature:111', type: 'nature', title: 'Additional Study 1', peerReviewed: true },
          { id: 'science:222', type: 'science', title: 'Additional Study 2', peerReviewed: true },
          { id: 'pubmed:333', type: 'pubmed', title: 'Additional Study 3', peerReviewed: true }
        );
      }

      if (gateName.includes('confidence')) {
        console.log(`[${this.timestamp()}] ${this.name}: Increased confidence through additional validation`);
        output.confidence = 0.78;
      }
    }

    await this.delay(1000);
    return output;
  }

  private timestamp(): string {
    return new Date().toLocaleTimeString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Demo Scenarios
// ============================================================================

async function runScenario(scenario: string = 'pass') {
  console.log('=== Quality Gate System Demo ===');

  // Initialize system
  const qualityGateSystem = new QualityGateSystem();
  console.log(`[${new Date().toLocaleTimeString()}] Initializing quality gates...`);

  // Configure gates based on command line arguments
  const args = process.argv.slice(2);
  const minCitations = parseInt(args.find(a => a.startsWith('--min-citations='))?.split('=')[1] || '3');
  const minConfidence = parseFloat(args.find(a => a.startsWith('--min-confidence='))?.split('=')[1] || '0.7');

  // Add quality gates
  qualityGateSystem.addGate({
    name: 'Citation Check',
    type: 'CITATION_CHECK',
    criteria: {
      minCitations,
      citationTypes: ['pubmed', 'arxiv', 'nature'],
      requirePeerReviewed: false
    },
    blocking: true
  });

  qualityGateSystem.addGate({
    name: 'Confidence Threshold',
    type: 'CONFIDENCE_THRESHOLD',
    criteria: {
      minConfidence
    },
    blocking: true
  });

  qualityGateSystem.addGate({
    name: 'Format Validation',
    type: 'FORMAT_VALIDATION',
    criteria: {
      requiredFields: ['title', 'abstract', 'findings', 'citations', 'methodology']
    },
    blocking: false
  });

  qualityGateSystem.addGate({
    name: 'Peer Review',
    type: 'PEER_REVIEW',
    criteria: {
      minReviewers: 2,
      minApprovalScore: 0.7
    },
    blocking: true
  });

  console.log(`[${new Date().toLocaleTimeString()}] Registered ${qualityGateSystem['gates'].length} quality gates`);

  // Create research agent
  const researchAgent = new ResearchAgent();

  // Generate output based on scenario
  let output: AgentOutput;
  if (scenario === 'fail' || scenario === 'retry') {
    output = await researchAgent.generateOutput(false, false); // Will fail gates
  } else {
    output = await researchAgent.generateOutput(true, true); // Will pass gates
  }

  // Evaluate with retry logic
  let report: ValidationReport;
  let maxAttempts = scenario === 'retry' ? 3 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    report = await qualityGateSystem.evaluateAll(output, attempt);

    if (report.overallPassed) {
      console.log(`\n=== All Gates Passed${attempt > 1 ? ' on Retry' : ''} ===`);
      console.log('Output accepted and workflow continues');
      if (attempt > 1) {
        console.log(`Output accepted after ${attempt - 1} revision${attempt > 2 ? 's' : ''}`);
      }
      break;
    } else if (attempt < maxAttempts) {
      console.log('\n=== Gates Failed - Requesting Revision ===');
      console.log('Sending feedback to ResearchAgent...\n');
      output = await researchAgent.reviseOutput(output, report);
    } else {
      console.log('\n=== Gates Failed - Maximum Retries Reached ===');
      console.log('Output rejected. Manual intervention required.');
    }
  }

  // Display summary
  console.log(`Total validation time: ${(report!.totalTime / 1000).toFixed(1)} seconds`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const scenario = args.find(a => a.startsWith('--scenario='))?.split('=')[1] || 'pass';

  await runScenario(scenario);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

// Export for testing
export { QualityGateSystem, ResearchAgent, QualityGate, GateResult, ValidationReport };