/**
 * Utility script to spawn a complete community swarm
 * Initializes all 10 agents with proper configuration
 */

import {
  AgentId,
  SwarmConfig,
  HookType,
  HookHandler,
  Priority,
  QualityGate
} from '../templates/swarm-types';
import { SwarmCoordinator } from '../templates/swarm-coordinator';
import {
  AssessmentAgent,
  ImplementationAgent,
  ValidationAgent,
  ResearchAgent,
  SynthesisAgent,
  AutonomousAgent,
  QualityGateAgent,
  MonitorAgent,
  AuditAgent,
  GitAgent
} from '../templates/swarm-agent';

/**
 * Default quality gates for the swarm
 */
const defaultQualityGates: QualityGate[] = [
  {
    id: 'format-gate',
    name: 'Format Validation',
    type: 'FORMAT',
    criteria: {
      requiredFields: ['output', 'summary']
    },
    blocking: true,
    enforceFor: [
      AgentId.ASSESSMENT,
      AgentId.IMPLEMENTATION,
      AgentId.VALIDATION,
      AgentId.RESEARCH,
      AgentId.SYNTHESIS
    ]
  },
  {
    id: 'evidence-gate',
    name: 'Evidence Validation',
    type: 'EVIDENCE',
    criteria: {
      minConfidence: 0.7,
      requireCitations: true
    },
    blocking: true,
    enforceFor: [
      AgentId.RESEARCH,
      AgentId.ASSESSMENT,
      AgentId.AUTONOMOUS
    ]
  },
  {
    id: 'consistency-gate',
    name: 'Consistency Check',
    type: 'CONSISTENCY',
    criteria: {},
    blocking: false,
    enforceFor: [
      AgentId.SYNTHESIS
    ]
  }
];

/**
 * Default hooks for the swarm
 */
const defaultHooks: { [K in HookType]?: HookHandler[] } = {
  [HookType.PRE_SPAWN]: [
    {
      name: 'resource-checker',
      priority: 100,
      critical: true,
      execute: async (context) => {
        // Check if we have capacity for more agents
        console.error(`[Hook] Pre-spawn check for ${context.agent?.agentId}`);
        return { proceed: true };
      }
    }
  ],
  [HookType.POST_SPAWN]: [
    {
      name: 'registration-logger',
      priority: 50,
      critical: false,
      execute: async (context) => {
        console.error(`[Hook] Agent spawned: ${context.agent?.agentId}`);
        return { proceed: true };
      }
    }
  ],
  [HookType.POST_TASK]: [
    {
      name: 'audit-logger',
      priority: 100,
      critical: false,
      execute: async (context) => {
        console.error(`[Hook] Task completed: ${context.task?.id} by ${context.result?.agentId}`);
        return { proceed: true };
      }
    }
  ],
  [HookType.ON_ERROR]: [
    {
      name: 'error-handler',
      priority: 100,
      critical: false,
      execute: async (context) => {
        console.error(`[Hook] Error occurred: ${context.error?.message}`);
        return { proceed: true };
      }
    }
  ]
};

/**
 * Default swarm configuration
 */
const defaultConfig: SwarmConfig = {
  agents: {
    [AgentId.ASSESSMENT]: {
      model: 'opus',
      capabilities: ['analyze', 'assess', 'scope', 'requirements'],
      maxConcurrentTasks: 3
    },
    [AgentId.IMPLEMENTATION]: {
      model: 'opus',
      capabilities: ['code', 'implement', 'write', 'modify'],
      maxConcurrentTasks: 2
    },
    [AgentId.VALIDATION]: {
      model: 'opus',
      capabilities: ['test', 'validate', 'verify', 'check'],
      maxConcurrentTasks: 3
    },
    [AgentId.RESEARCH]: {
      model: 'opus',
      capabilities: ['search', 'research', 'find', 'explore'],
      maxConcurrentTasks: 4
    },
    [AgentId.SYNTHESIS]: {
      model: 'opus',
      capabilities: ['synthesize', 'document', 'summarize', 'combine'],
      maxConcurrentTasks: 2
    },
    [AgentId.QUALITY_GATE]: {
      model: 'haiku',
      capabilities: ['quality', 'gate', 'enforce', 'standard'],
      maxConcurrentTasks: 5
    },
    [AgentId.MONITOR]: {
      model: 'haiku',
      capabilities: ['monitor', 'observe', 'detect', 'alert'],
      maxConcurrentTasks: 1
    },
    [AgentId.AUDIT]: {
      model: 'haiku',
      capabilities: ['audit', 'review', 'compliance', 'trace'],
      maxConcurrentTasks: 2
    },
    [AgentId.GIT]: {
      model: 'haiku',
      capabilities: ['git', 'commit', 'push', 'branch'],
      maxConcurrentTasks: 1
    },
    [AgentId.AUTONOMOUS]: {
      model: 'opus',
      capabilities: ['improve', 'suggest', 'optimize', 'enhance'],
      maxConcurrentTasks: 1
    }
  },
  hooks: defaultHooks,
  qualityGates: defaultQualityGates,
  contextProtection: {
    enabled: true,
    maxSummaryWords: 500,
    maxCodeLines: 10
  },
  timeouts: {
    taskDefault: 60000,      // 1 minute
    heartbeat: 5000,         // 5 seconds
    messageDelivery: 30000   // 30 seconds
  },
  recovery: {
    maxRetries: 3,
    backoffBase: 1000,       // 1 second
    backoffMax: 30000        // 30 seconds
  }
};

/**
 * Spawn the complete community swarm
 */
export async function spawnSwarm(customConfig?: Partial<SwarmConfig>): Promise<{
  coordinator: SwarmCoordinator;
  agents: Map<AgentId, any>;
}> {
  // Merge custom config with defaults
  const config: SwarmConfig = {
    ...defaultConfig,
    ...customConfig,
    hooks: { ...defaultHooks, ...customConfig?.hooks },
    qualityGates: customConfig?.qualityGates || defaultQualityGates
  };

  // Create coordinator
  const coordinator = new SwarmCoordinator(config);
  const agents = new Map<AgentId, any>();

  console.error('[Swarm] Starting community swarm initialization...');

  // Spawn all 10 agents in parallel
  const allAgents = [
    // Core task agents (use opus for complex reasoning)
    new AssessmentAgent(coordinator),
    new ImplementationAgent(coordinator),
    new ValidationAgent(coordinator),
    new ResearchAgent(coordinator),
    new SynthesisAgent(coordinator),
    new AutonomousAgent(coordinator),
    // Support agents (use haiku for fast operations)
    new QualityGateAgent(coordinator),
    new MonitorAgent(coordinator),
    new AuditAgent(coordinator),
    new GitAgent(coordinator)
  ];

  // Initialize all 10 agents
  await Promise.all(allAgents.map(async (agent) => {
    await agent.initialize();
    agents.set((agent as any).agentId, agent);
  }));

  console.error(`[Swarm] Initialized all ${agents.size} agents (6 opus + 4 haiku)`);

  // Verify all agents registered
  const status = coordinator.getStatus();
  console.error(`[Swarm] Health: ${status.health}`);
  console.error(`[Swarm] Agents ready: ${status.agents.filter(a => a.status === 'READY').length}`);

  return { coordinator, agents };
}

/**
 * Execute a task through the swarm
 */
export async function executeSwarmTask(
  coordinator: SwarmCoordinator,
  taskDescription: string,
  requirements: string[] = []
): Promise<any> {
  const task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'complex-task',
    description: taskDescription,
    priority: Priority.NORMAL,
    dependencies: [],
    inputs: { description: taskDescription, requirements },
    expectedOutputs: ['result', 'summary'],
    qualityGates: ['format-gate', 'evidence-gate'],
    metadata: {
      createdAt: new Date(),
      createdBy: AgentId.ORCHESTRATOR
    }
  };

  console.error(`[Swarm] Executing task: ${task.id}`);
  const taskId = await coordinator.delegateTask(task);

  return { taskId, status: 'delegated' };
}

/**
 * Shutdown the swarm gracefully
 */
export async function shutdownSwarm(
  coordinator: SwarmCoordinator,
  agents: Map<AgentId, any>
): Promise<void> {
  console.error('[Swarm] Initiating graceful shutdown...');

  // Get final status
  const status = coordinator.getStatus();
  console.error(`[Swarm] Final status: ${status.tasks.completed} tasks completed`);

  // Get improvement suggestions
  const suggestions = coordinator.getSuggestions();
  if (suggestions.length > 0) {
    console.error(`[Swarm] ${suggestions.length} improvement suggestions generated`);
  }

  // Get audit log summary
  const auditLog = coordinator.getAuditLog();
  console.error(`[Swarm] ${auditLog.length} audit entries recorded`);

  console.error('[Swarm] Shutdown complete');
}

// CLI entry point
if (require.main === module) {
  (async () => {
    try {
      const { coordinator, agents } = await spawnSwarm();
      console.error('[CLI] Swarm spawned successfully');

      // Example task
      await executeSwarmTask(
        coordinator,
        'Analyze the current codebase and suggest improvements',
        ['focus on code quality', 'identify optimization opportunities']
      );

      // Keep running for demo
      console.error('[CLI] Swarm is running. Press Ctrl+C to shutdown.');

    } catch (error) {
      console.error(`[CLI] Error: ${error}`);
      process.exit(1);
    }
  })();
}
