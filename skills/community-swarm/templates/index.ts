/**
 * Community Swarm - Main Entry Point
 * Exports all types, coordinator, and agent classes
 */

// Export all types
export * from './swarm-types';

// Export coordinator
export { SwarmCoordinator } from './swarm-coordinator';

// Export all agent classes
export {
  SwarmAgent,
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
} from './swarm-agent';

// Re-export commonly used types for convenience
export type {
  SwarmMessage,
  SwarmTask,
  TaskResult,
  Evidence,
  SwarmConfig,
  SwarmStatus,
  QualityGate,
  QualityGateResult,
  HookHandler,
  HookContext,
  ImprovementSuggestion,
  AuditEntry
} from './swarm-types';

/**
 * Quick-start function to create a fully configured swarm
 */
export async function createSwarm(config?: Partial<import('./swarm-types').SwarmConfig>) {
  const { spawnSwarm } = await import('../scripts/spawn-swarm');
  return spawnSwarm(config);
}
