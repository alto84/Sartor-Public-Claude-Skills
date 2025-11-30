/**
 * Basic Community Swarm Usage Example
 * Demonstrates spawning a swarm and delegating a simple task
 */

import {
  AgentId,
  SwarmTask,
  Priority,
  Evidence
} from '../templates/swarm-types';
import { SwarmCoordinator } from '../templates/swarm-coordinator';

/**
 * Example: Basic swarm usage with delegation pattern
 *
 * This example shows:
 * 1. Creating a swarm coordinator with default configuration
 * 2. Registering agents
 * 3. Delegating a task (orchestrator never executes directly)
 * 4. Handling results with evidence
 */
async function basicSwarmExample(): Promise<void> {
  console.log('=== Basic Community Swarm Example ===\n');

  // Step 1: Create coordinator with minimal configuration
  const coordinator = new SwarmCoordinator({
    agents: {
      [AgentId.ASSESSMENT]: {
        model: 'opus',
        capabilities: ['analyze', 'assess'],
        maxConcurrentTasks: 2
      },
      [AgentId.RESEARCH]: {
        model: 'opus',
        capabilities: ['search', 'research'],
        maxConcurrentTasks: 3
      }
    },
    hooks: {},
    qualityGates: [
      {
        id: 'evidence-gate',
        name: 'Evidence Validation',
        type: 'EVIDENCE',
        criteria: {
          minConfidence: 0.6,  // Configure based on your needs
          requireCitations: true
        },
        blocking: true,
        enforceFor: [AgentId.RESEARCH]
      }
    ],
    contextProtection: {
      enabled: true,
      maxSummaryWords: 500,  // Configurable - adjust based on your context limits
      maxCodeLines: 10
    },
    timeouts: {
      taskDefault: 60000,   // Example: 1 minute - adjust based on task complexity
      heartbeat: 5000,      // Example: 5 seconds - adjust for your latency requirements
      messageDelivery: 30000
    },
    recovery: {
      maxRetries: 3,
      backoffBase: 1000,
      backoffMax: 30000
    }
  });

  console.log('Coordinator created with context protection enabled');

  // Step 2: Register agents (simulated)
  // In a real implementation, agents would be spawned as subprocesses
  await coordinator.registerAgent({
    agentId: AgentId.ASSESSMENT,
    capabilities: ['analyze', 'assess'],
    model: 'opus',
    status: 'READY' as any
  });

  await coordinator.registerAgent({
    agentId: AgentId.RESEARCH,
    capabilities: ['search', 'research'],
    model: 'opus',
    status: 'READY' as any
  });

  console.log('Agents registered and ready\n');

  // Step 3: Create and delegate a task
  // CRITICAL: The orchestrator NEVER executes tasks - only delegates
  const task: SwarmTask = {
    id: `task-${Date.now()}`,
    type: 'assessment',
    description: 'Analyze the project structure and identify potential improvements',
    priority: Priority.NORMAL,
    dependencies: [],
    inputs: {
      targetPath: '/project/src',
      focus: ['code-quality', 'architecture']
    },
    expectedOutputs: ['analysis-report', 'recommendations'],
    qualityGates: ['evidence-gate'],
    metadata: {
      createdAt: new Date(),
      createdBy: AgentId.ORCHESTRATOR
    }
  };

  console.log(`Delegating task: ${task.id}`);
  console.log(`Description: ${task.description}`);
  console.log(`Assigned to: ${AgentId.ASSESSMENT}`);
  console.log('\n[Orchestrator is NOT executing this task - only delegating]\n');

  // Step 4: Delegate the task
  task.assignedTo = AgentId.ASSESSMENT;
  const taskId = await coordinator.delegateTask(task);
  console.log(`Task delegated successfully: ${taskId}`);

  // Step 5: Share data between agents
  const evidence: Evidence = {
    citations: ['project-structure-analysis'],
    confidence: 0.8,  // Calculate based on actual evidence, not hardcoded
    sources: ['file-system-scan']
  };

  coordinator.shareData(
    'initial-analysis',
    { files: 42, modules: 8, complexity: 'moderate' },
    AgentId.ASSESSMENT,
    evidence,
    ['analysis', 'project']
  );

  console.log('\nData shared to pool for other agents to access');

  // Step 6: Another agent retrieves the data
  const sharedData = coordinator.getData('initial-analysis', AgentId.RESEARCH);
  console.log(`Research agent retrieved: ${JSON.stringify(sharedData)}`);

  // Step 7: Check swarm status
  const status = coordinator.getStatus();
  console.log('\n=== Swarm Status ===');
  console.log(`Health: ${status.health}`);
  console.log(`Active agents: ${status.agents.length}`);
  console.log(`Data pool entries: ${status.dataPool.entries}`);

  console.log('\n=== Example Complete ===');
}

// Run the example
basicSwarmExample().catch(console.error);
