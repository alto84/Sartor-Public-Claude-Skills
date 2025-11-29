/**
 * Enhanced Multi-Agent Orchestration Configuration Template
 *
 * This template provides a complete configuration structure for setting up
 * an enhanced orchestration system with 8 specialized agents, context protection,
 * and autonomous improvement capabilities.
 */

import { OrchestrationConfig, AgentConfig, QualityGate, CommunicationConfig } from '../types';

export const orchestrationConfigTemplate: OrchestrationConfig = {
  // ==========================================
  // System-Level Configuration
  // ==========================================
  system: {
    name: 'enhanced-orchestration-system',
    version: '1.0.0',
    environment: 'development', // 'development' | 'staging' | 'production'
    maxConcurrentAgents: 12,
    resourceLimits: {
      maxMemoryMB: 2048,
      maxCPUPercent: 80,
      maxNetworkMBps: 100
    }
  },

  // ==========================================
  // Context Protection Settings
  // ==========================================
  contextProtection: {
    enabled: true,
    orchestratorLimits: {
      maxTokens: 8000,
      maxSummaryWords: 500,
      maxKeyFindings: 5,
      maxMetricsPerMessage: 10
    },
    summaryGeneration: {
      strategy: 'EXTRACTIVE', // 'EXTRACTIVE' | 'ABSTRACTIVE' | 'HYBRID'
      compression: true,
      preservePriority: ['CRITICAL', 'HIGH']
    },
    progressiveDisclosure: {
      enabled: true,
      levels: [
        { name: 'orchestrator', maxWords: 500 },
        { name: 'supervisor', maxWords: 2000 },
        { name: 'peer', maxWords: 5000 },
        { name: 'full', maxWords: null }
      ]
    },
    monitoring: {
      checkInterval: 1000, // ms
      warningThreshold: 0.8,
      criticalThreshold: 0.95,
      autoShedding: true
    }
  },

  // ==========================================
  // Agent Configurations
  // ==========================================
  agents: {
    // 1. Orchestrator Agent - Context Protected
    orchestrator: {
      id: 'orchestrator-main',
      type: 'ORCHESTRATOR',
      config: {
        contextLimit: 8000,
        summaryOnly: true,
        decisionStrategy: 'EVIDENCE_BASED', // 'CONSENSUS' | 'EVIDENCE_BASED' | 'WEIGHTED'
        escalation: {
          enabled: true,
          conditions: ['CRITICAL_ERROR', 'DEADLOCK', 'TIMEOUT'],
          target: 'HUMAN' // 'HUMAN' | 'PARENT_ORCHESTRATOR'
        }
      },
      capabilities: ['coordination', 'decision-making', 'task-distribution'],
      priority: 'CRITICAL'
    },

    // 2. Assessment Agent - Evidence-Based Validation
    assessment: {
      id: 'assessment-agent',
      type: 'ASSESSMENT',
      config: {
        evidenceRequired: true,
        minCitations: 3,
        validationDepth: 'COMPREHENSIVE', // 'BASIC' | 'STANDARD' | 'COMPREHENSIVE'
        severityThresholds: {
          critical: 0.9,
          high: 0.7,
          medium: 0.5,
          low: 0.3
        },
        categories: [
          'SECURITY',
          'PERFORMANCE',
          'CODE_QUALITY',
          'DOCUMENTATION',
          'TESTING',
          'ARCHITECTURE'
        ]
      },
      capabilities: ['review', 'validation', 'assessment', 'scoring'],
      priority: 'HIGH'
    },

    // 3. Implementation Agent - Code Changes
    implementation: {
      id: 'implementation-agent',
      type: 'IMPLEMENTATION',
      config: {
        dryRun: false, // Set to true for testing
        atomicOperations: true,
        rollbackEnabled: true,
        changeTracking: {
          enabled: true,
          granularity: 'LINE', // 'FILE' | 'LINE' | 'CHARACTER'
          history: true
        },
        safety: {
          backupBeforeChange: true,
          testBeforeCommit: true,
          maxFilesPerOperation: 50,
          dangerousPatterns: ['rm -rf', 'DROP TABLE', 'DELETE FROM']
        }
      },
      capabilities: ['create', 'update', 'delete', 'refactor', 'migrate'],
      priority: 'HIGH'
    },

    // 4. Validation Agent - Cross-Validation
    validation: {
      id: 'validation-agent',
      type: 'VALIDATION',
      config: {
        strictMode: true,
        validationStages: [
          {
            name: 'syntax',
            enabled: true,
            blocking: true,
            tools: ['eslint', 'prettier', 'tsc']
          },
          {
            name: 'semantic',
            enabled: true,
            blocking: true,
            checks: ['types', 'interfaces', 'contracts']
          },
          {
            name: 'security',
            enabled: true,
            blocking: true,
            scanners: ['semgrep', 'snyk', 'dependabot']
          },
          {
            name: 'performance',
            enabled: true,
            blocking: false,
            thresholds: { latency: 100, memory: 100000000 }
          },
          {
            name: 'tests',
            enabled: true,
            blocking: true,
            requirements: { coverage: 0.8, passing: 1.0 }
          }
        ],
        crossValidation: {
          enabled: true,
          validators: ['specification', 'implementation', 'documentation']
        }
      },
      capabilities: ['validate', 'test', 'verify', 'certify'],
      priority: 'HIGH'
    },

    // 5. Research Agent - Exploration and Discovery
    research: {
      id: 'research-agent',
      type: 'RESEARCH',
      config: {
        searchStrategies: [
          'BREADTH_FIRST',
          'DEPTH_FIRST',
          'PATTERN_MATCH',
          'SEMANTIC_SEARCH',
          'DEPENDENCY_TRACE'
        ],
        searchLimits: {
          maxDepth: 5,
          maxFiles: 1000,
          maxTime: 60000, // ms
          maxMemory: 500000000 // bytes
        },
        parallelization: {
          enabled: true,
          maxWorkers: 4,
          distribution: 'DYNAMIC' // 'ROUND_ROBIN' | 'DYNAMIC' | 'WEIGHTED'
        },
        caching: {
          enabled: true,
          ttl: 300000, // 5 minutes
          maxEntries: 1000
        }
      },
      capabilities: ['search', 'explore', 'analyze', 'discover', 'trace'],
      priority: 'NORMAL'
    },

    // 6. Synthesis Agent - Combining and Pattern Recognition
    synthesis: {
      id: 'synthesis-agent',
      type: 'SYNTHESIS',
      config: {
        mergingStrategy: 'INTELLIGENT', // 'SIMPLE' | 'WEIGHTED' | 'INTELLIGENT'
        conflictResolution: 'EVIDENCE', // 'CONSENSUS' | 'MAJORITY' | 'EVIDENCE' | 'EXPERT'
        patternRecognition: {
          enabled: true,
          minOccurrences: 2,
          confidence: 0.7,
          types: ['structural', 'behavioral', 'temporal', 'causal']
        },
        contradictionHandling: {
          strategy: 'REPORT_ALL', // 'IGNORE' | 'REPORT_ALL' | 'RESOLVE'
          resolution: 'EVIDENCE_BASED'
        },
        output: {
          format: 'STRUCTURED', // 'NARRATIVE' | 'STRUCTURED' | 'HYBRID'
          maxLength: 5000,
          includeSources: true,
          includeConfidence: true
        }
      },
      capabilities: ['merge', 'synthesize', 'identify-patterns', 'resolve-conflicts'],
      priority: 'NORMAL'
    },

    // 7. Autonomous Action Agent - Self-Improvement
    autonomous: {
      id: 'autonomous-agent',
      type: 'AUTONOMOUS_ACTION',
      config: {
        enabled: true,
        monitoring: {
          continuous: true,
          interval: 1000, // ms
          metrics: [
            'performance',
            'quality',
            'efficiency',
            'redundancy',
            'opportunities'
          ]
        },
        suggestion: {
          enabled: true,
          threshold: 0.6, // 0.0-1.0 confidence required
          maxPerMinute: 5,
          types: [
            'OPTIMIZATION',
            'ENHANCEMENT',
            'CORRECTION',
            'OPPORTUNITY',
            'WARNING'
          ]
        },
        learning: {
          enabled: true,
          strategy: 'REINFORCEMENT', // 'SUPERVISED' | 'REINFORCEMENT' | 'HYBRID'
          feedbackLoop: true,
          historySize: 1000,
          adaptationRate: 0.1
        },
        triggers: [
          {
            type: 'PERFORMANCE_DEGRADATION',
            threshold: 1.5, // 1.5x expected time
            action: 'SUGGEST_OPTIMIZATION'
          },
          {
            type: 'QUALITY_ISSUE',
            threshold: 0.7, // quality score < 0.7
            action: 'SUGGEST_CORRECTION'
          },
          {
            type: 'REDUNDANT_WORK',
            threshold: 0.8, // 80% similarity
            action: 'SUGGEST_CONSOLIDATION'
          },
          {
            type: 'MISSING_CAPABILITY',
            threshold: null,
            action: 'SUGGEST_NEW_AGENT'
          }
        ],
        approval: {
          strategy: 'ORCHESTRATOR', // 'AUTO' | 'ORCHESTRATOR' | 'CONSENSUS' | 'HUMAN'
          autoApproveBelow: 0.3, // impact threshold
          requireEvidenceAbove: 0.7
        }
      },
      capabilities: ['monitor', 'analyze', 'suggest', 'learn', 'optimize'],
      priority: 'LOW' // Runs in background
    },

    // 8. Git Operations Agent - Version Control
    git: {
      id: 'git-agent',
      type: 'GIT_OPERATIONS',
      config: {
        repository: {
          path: './',
          remote: 'origin',
          defaultBranch: 'main'
        },
        commit: {
          conventional: true,
          types: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
          sign: false,
          verify: true
        },
        workflow: {
          createBranch: true,
          branchNaming: 'feature/{task-id}',
          pushAfterCommit: false,
          createPR: false,
          autoMerge: false
        },
        safety: {
          preventForceSupport: true,
          requireCleanTree: true,
          backupBeforeDangerous: true,
          allowedBranches: ['feature/*', 'fix/*', 'chore/*']
        }
      },
      capabilities: ['commit', 'branch', 'merge', 'tag', 'push', 'pull'],
      priority: 'NORMAL'
    }
  },

  // ==========================================
  // Quality Gates Configuration
  // ==========================================
  qualityGates: [
    // Research to Assessment Gate
    {
      id: 'gate-research-assessment',
      name: 'Research to Assessment',
      from: 'research-agent',
      to: 'assessment-agent',
      enabled: true,
      blocking: true,
      checks: [
        {
          name: 'minimum-sources',
          type: 'THRESHOLD',
          field: 'sources.length',
          operator: 'GTE',
          value: 3,
          required: true,
          message: 'Insufficient sources for assessment'
        },
        {
          name: 'source-reliability',
          type: 'THRESHOLD',
          field: 'sources.avgReliability',
          operator: 'GTE',
          value: 0.7,
          required: false,
          message: 'Source reliability below threshold'
        },
        {
          name: 'coverage',
          type: 'THRESHOLD',
          field: 'coverage',
          operator: 'GTE',
          value: 0.8,
          required: false,
          message: 'Incomplete coverage of scope'
        }
      ],
      strategy: 'ALL_REQUIRED', // 'ALL' | 'ALL_REQUIRED' | 'MAJORITY' | 'WEIGHTED'
      retryPolicy: {
        enabled: true,
        maxRetries: 2,
        backoff: 'EXPONENTIAL'
      }
    },

    // Assessment to Implementation Gate
    {
      id: 'gate-assessment-implementation',
      name: 'Assessment to Implementation',
      from: 'assessment-agent',
      to: 'implementation-agent',
      enabled: true,
      blocking: true,
      checks: [
        {
          name: 'no-critical-unresolved',
          type: 'CONDITION',
          condition: 'criticalIssues.filter(i => !i.resolved).length === 0',
          required: true,
          message: 'Critical issues must be resolved before implementation'
        },
        {
          name: 'approval-score',
          type: 'THRESHOLD',
          field: 'approvalScore',
          operator: 'GTE',
          value: 0.7,
          required: true,
          message: 'Assessment score too low for implementation'
        }
      ],
      strategy: 'ALL',
      retryPolicy: {
        enabled: false
      }
    },

    // Implementation to Validation Gate
    {
      id: 'gate-implementation-validation',
      name: 'Implementation to Validation',
      from: 'implementation-agent',
      to: 'validation-agent',
      enabled: true,
      blocking: true,
      checks: [
        {
          name: 'syntax-valid',
          type: 'VALIDATION',
          validator: 'SYNTAX_CHECK',
          required: true,
          message: 'Syntax errors detected'
        },
        {
          name: 'tests-exist',
          type: 'CONDITION',
          condition: 'tests.length > 0',
          required: false,
          message: 'No tests provided'
        },
        {
          name: 'no-dangerous-patterns',
          type: 'VALIDATION',
          validator: 'SECURITY_SCAN',
          required: true,
          message: 'Dangerous patterns detected'
        }
      ],
      strategy: 'WEIGHTED',
      weights: {
        'syntax-valid': 1.0,
        'tests-exist': 0.5,
        'no-dangerous-patterns': 1.0
      },
      passingScore: 0.75,
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        backoff: 'LINEAR'
      }
    },

    // Validation to Git Gate
    {
      id: 'gate-validation-git',
      name: 'Validation to Git',
      from: 'validation-agent',
      to: 'git-agent',
      enabled: true,
      blocking: true,
      checks: [
        {
          name: 'all-tests-pass',
          type: 'CONDITION',
          condition: 'tests.every(t => t.passed)',
          required: true,
          message: 'All tests must pass before commit'
        },
        {
          name: 'no-security-issues',
          type: 'CONDITION',
          condition: 'securityIssues.filter(i => i.severity === "HIGH").length === 0',
          required: true,
          message: 'High severity security issues detected'
        },
        {
          name: 'coverage-threshold',
          type: 'THRESHOLD',
          field: 'coverage',
          operator: 'GTE',
          value: 0.8,
          required: false,
          message: 'Test coverage below 80%'
        }
      ],
      strategy: 'ALL_REQUIRED',
      retryPolicy: {
        enabled: false // No retry for git operations
      }
    }
  ],

  // ==========================================
  // Communication Configuration
  // ==========================================
  communication: {
    protocol: {
      type: 'ENHANCED_MCP',
      version: '2.0',
      features: ['routing', 'acknowledgment', 'compression', 'encryption']
    },

    routing: {
      strategy: 'SEMANTIC_INTENT', // 'DIRECT' | 'BROADCAST' | 'SEMANTIC_INTENT' | 'CAPABILITY_BASED'
      cache: {
        enabled: true,
        ttl: 60000,
        maxEntries: 100
      },
      fallback: 'BROADCAST'
    },

    messageQueue: {
      type: 'PRIORITY',
      maxSize: 1000,
      priorities: ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'],
      overflow: 'REJECT_LOWEST', // 'DROP' | 'REJECT_LOWEST' | 'COMPRESS' | 'OFFLOAD'
      persistence: {
        enabled: false,
        storage: 'MEMORY' // 'MEMORY' | 'DISK' | 'DATABASE'
      }
    },

    delivery: {
      acknowledgment: {
        required: true,
        timeout: 5000,
        retries: 3
      },
      reliability: 'AT_LEAST_ONCE', // 'BEST_EFFORT' | 'AT_LEAST_ONCE' | 'EXACTLY_ONCE'
      ordering: 'CAUSAL', // 'NONE' | 'FIFO' | 'TOTAL' | 'CAUSAL'
      compression: {
        enabled: true,
        threshold: 1000, // bytes
        algorithm: 'GZIP'
      }
    },

    channels: [
      {
        name: 'orchestration',
        type: 'CONTROL',
        subscribers: ['orchestrator-main'],
        priority: 'CRITICAL'
      },
      {
        name: 'progress',
        type: 'STATUS',
        subscribers: ['orchestrator-main', 'autonomous-agent'],
        priority: 'NORMAL'
      },
      {
        name: 'suggestions',
        type: 'IMPROVEMENT',
        subscribers: ['orchestrator-main'],
        priority: 'LOW'
      },
      {
        name: 'data',
        type: 'SHARED',
        subscribers: '*', // All agents
        priority: 'NORMAL'
      }
    ]
  },

  // ==========================================
  // Monitoring and Telemetry
  // ==========================================
  monitoring: {
    enabled: true,
    metrics: {
      collect: true,
      interval: 5000,
      export: {
        enabled: false,
        endpoint: 'http://localhost:9090/metrics',
        format: 'PROMETHEUS'
      }
    },
    logging: {
      level: 'INFO', // 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
      destinations: ['CONSOLE', 'FILE'],
      format: 'JSON',
      rotation: {
        enabled: true,
        maxSize: '100MB',
        maxFiles: 10
      }
    },
    tracing: {
      enabled: false,
      sampling: 1.0,
      exporter: 'JAEGER'
    }
  },

  // ==========================================
  // Error Handling and Recovery
  // ==========================================
  errorHandling: {
    strategy: 'GRACEFUL', // 'FAIL_FAST' | 'GRACEFUL' | 'RETRY' | 'ESCALATE'
    recovery: {
      automatic: true,
      checkpointInterval: 30000,
      rollbackEnabled: true
    },
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      timeout: 30000,
      halfOpenRequests: 3
    },
    deadlockDetection: {
      enabled: true,
      checkInterval: 10000,
      resolution: 'RESTART_YOUNGEST' // 'ABORT' | 'RESTART_YOUNGEST' | 'ESCALATE'
    }
  }
};

// ==========================================
// Helper Functions for Configuration
// ==========================================

/**
 * Validate configuration completeness and consistency
 */
export function validateConfiguration(config: OrchestrationConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check agent references in gates
  config.qualityGates.forEach(gate => {
    if (!config.agents[gate.from]) {
      errors.push(`Gate '${gate.name}' references unknown source agent: ${gate.from}`);
    }
    if (!config.agents[gate.to]) {
      errors.push(`Gate '${gate.name}' references unknown target agent: ${gate.to}`);
    }
  });

  // Check for orchestrator
  const hasOrchestrator = Object.values(config.agents).some(a => a.type === 'ORCHESTRATOR');
  if (!hasOrchestrator) {
    errors.push('Configuration must include at least one ORCHESTRATOR agent');
  }

  // Check for context protection with orchestrator
  if (hasOrchestrator && !config.contextProtection.enabled) {
    warnings.push('Orchestrator present but context protection disabled');
  }

  // Check autonomous agent configuration
  const autonomousAgent = Object.values(config.agents).find(a => a.type === 'AUTONOMOUS_ACTION');
  if (autonomousAgent && !autonomousAgent.config.monitoring.continuous) {
    warnings.push('Autonomous agent present but continuous monitoring disabled');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate minimal configuration for quick start
 */
export function generateMinimalConfig(): OrchestrationConfig {
  return {
    system: {
      name: 'minimal-orchestration',
      version: '1.0.0',
      environment: 'development'
    },
    contextProtection: {
      enabled: true,
      orchestratorLimits: {
        maxTokens: 8000,
        maxSummaryWords: 500
      }
    },
    agents: {
      orchestrator: {
        id: 'orchestrator',
        type: 'ORCHESTRATOR',
        config: { contextLimit: 8000, summaryOnly: true }
      },
      worker: {
        id: 'worker',
        type: 'WORKER',
        config: {}
      }
    },
    qualityGates: [],
    communication: {
      protocol: { type: 'BASIC' },
      routing: { strategy: 'DIRECT' }
    }
  };
}

// Export for use
export default orchestrationConfigTemplate;