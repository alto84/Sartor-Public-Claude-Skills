# Monitoring Strategies for Distributed Systems

This document provides monitoring strategies extracted from SKG Agent Prototype 2 implementation, focusing on metrics that help debug distributed system issues.

## Overview

Effective monitoring enables:
- **Early detection**: Find issues before they become critical
- **Root cause analysis**: Provide data for debugging
- **Performance tracking**: Identify degradation trends
- **Capacity planning**: Understand resource needs

Based on SKG metrics-initialization.ts and monitoring implementations.

## Core Metrics to Collect

### Latency Metrics

**What to measure:**

```typescript
// From SKG metrics-initialization.ts
interface LatencyMetrics {
  // Communication latency
  agentToAgent: number;           // Time for agent-to-agent message
  agentToOrchestrator: number;    // Time for agent-orchestrator message
  mcpMessageLatency: number;      // MCP protocol overhead
  taskAssignmentLatency: number;  // Time to assign task to agent

  // Operation latency
  consensusTime: number;          // Time to reach consensus
  discoveryLatency: number;       // Time to discover agents
  responseTime: number;           // End-to-end request time
}
```

**Why these matter:**
- Agent-to-agent latency: Detects network issues between nodes
- Consensus time: Indicates coordination overhead
- Response time: User-visible performance

**Collection strategy:**
```typescript
// Record latency for each operation
function recordLatency(operation: string, startTime: number) {
  const duration = Date.now() - startTime;

  metrics.record({
    metric: `latency.${operation}`,
    value: duration,
    timestamp: Date.now(),
    tags: { operation, nodeId: getNodeId() }
  });
}

// Usage
const startTime = Date.now();
await performConsensus(proposal);
recordLatency('consensus', startTime);
```

**Alert thresholds from SKG:**
```typescript
const alertThresholds = {
  latencySpike: 1000,  // Alert if latency >1 second
  // p95 and p99 thresholds
  p95Threshold: 500,   // 95th percentile should be <500ms
  p99Threshold: 1000   // 99th percentile should be <1s
};
```

### Throughput Metrics

**What to measure:**

```typescript
// From SKG
interface ThroughputMetrics {
  messagesPerSecond: number;      // Message rate
  tasksPerSecond: number;         // Task processing rate
  operationsPerSecond: number;    // General ops rate
  bytesPerSecond: number;         // Network throughput
}
```

**Why these matter:**
- Detect throughput collapse (system can't handle load)
- Identify bottlenecks (which operations are slow)
- Track capacity (how much load can system handle)

**Collection strategy:**
```typescript
// Count operations in sliding window
class ThroughputTracker {
  private operations: number[] = [];
  private windowMs: number = 60000;  // 1 minute window

  recordOperation(timestamp: number = Date.now()) {
    this.operations.push(timestamp);
    this.cleanOldOperations(timestamp);
  }

  private cleanOldOperations(now: number) {
    const cutoff = now - this.windowMs;
    this.operations = this.operations.filter(t => t > cutoff);
  }

  getOperationsPerSecond(): number {
    const now = Date.now();
    this.cleanOldOperations(now);
    return (this.operations.length / this.windowMs) * 1000;
  }
}
```

**From SKG scalability tests:**
```typescript
// Track throughput at different scales
interface ScalabilityMetric {
  agentCount: number;
  messageThroughput: number;  // Messages/second
  taskThroughput: number;     // Tasks/second

  // Expected: Should scale linearly or better
  throughputPerAgent: number;  // Should stay constant
}
```

### Resource Metrics

**What to measure:**

```typescript
// From SKG
interface ResourceMetrics {
  // Memory
  memoryPerAgent: number;        // MB per agent
  totalMemoryUsage: number;      // Total MB
  heapUsed: number;              // JS heap usage

  // CPU
  cpuUtilization: number;        // Percentage
  cpuPerAgent: number;           // CPU per agent

  // Network
  networkUtilization: number;    // Bandwidth usage
  connectionCount: number;       // Active connections
  messageQueueDepth: number;     // Queued messages
}
```

**Why these matter:**
- Memory leaks: memoryPerAgent increasing over time
- CPU bottlenecks: High utilization limiting throughput
- Network saturation: Bandwidth or connection limits
- Queue buildup: Backpressure issues

**Collection strategy:**
```typescript
// From SKG metrics-initialization.ts
function collectResourceMetrics(): ResourceMetrics {
  const memUsage = process.memoryUsage();

  return {
    memoryPerAgent: memUsage.heapUsed / agentCount / 1024 / 1024,
    totalMemoryUsage: memUsage.heapUsed / 1024 / 1024,
    heapUsed: memUsage.heapUsed,

    cpuUtilization: process.cpuUsage().system / 1000000,  // Convert to %
    cpuPerAgent: cpuUtilization / agentCount,

    networkUtilization: getNetworkStats().bytesPerSecond,
    connectionCount: getActiveConnections(),
    messageQueueDepth: getQueueDepth()
  };
}
```

**Alert thresholds:**
```typescript
const alertThresholds = {
  memoryUsage: 512,        // Alert if >512 MB
  cpuUtilization: 80,      // Alert if >80%
  connectionCount: 1000,   // Alert if >1000 connections
  queueDepth: 10000        // Alert if >10k queued messages
};
```

### Error and Reliability Metrics

**What to measure:**

```typescript
// From SKG
interface ErrorMetrics {
  errorRate: number;              // Errors per 1000 operations
  errorCount: number;             // Total errors
  errorsByType: Map<string, number>;  // Categorized errors

  // Distributed system specific
  byzantineDetections: number;    // Byzantine behavior detected
  consensusFailures: number;      // Failed consensus attempts
  timeoutRate: number;            // Operations timing out
  partitionEvents: number;        // Network partition events

  // Recovery metrics
  averageRecoveryTime: number;    // Time to recover from failures
  failedRecoveries: number;       // Recoveries that failed
}
```

**Why these matter:**
- Error rate spikes: Something is failing
- Byzantine detections: Faulty/malicious nodes present
- Timeout rate: Coordination or network issues
- Recovery time: System resilience

**Collection strategy:**
```typescript
// Track errors with categorization
class ErrorTracker {
  private errors: Map<string, number> = new Map();
  private totalOperations: number = 0;

  recordError(errorType: string, context?: any) {
    const count = this.errors.get(errorType) || 0;
    this.errors.set(errorType, count + 1);

    logger.error('Error occurred', {
      errorType,
      count: count + 1,
      context,
      timestamp: Date.now()
    });
  }

  recordOperation() {
    this.totalOperations++;
  }

  getErrorRate(): number {
    const totalErrors = Array.from(this.errors.values())
      .reduce((sum, count) => sum + count, 0);

    return (totalErrors / this.totalOperations) * 1000;  // Per 1000 ops
  }

  getMostCommonErrors(limit: number = 5): Array<[string, number]> {
    return Array.from(this.errors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }
}
```

**From SKG consensus tests:**
```typescript
// Measure Byzantine resistance
interface ConsensusMetrics {
  byzantineResistanceRate: number;  // 0.0 to 1.0
  // Calculated as: (successful consensus) / (total attempts)
  // with Byzantine agents present

  safetyViolationRate: number;      // Should be 0.0
  livenessViolationRate: number;    // How often system makes no progress
}
```

### State and Consistency Metrics

**What to measure:**

```typescript
interface ConsistencyMetrics {
  // State divergence
  stateHashMismatch: number;        // Nodes with different state
  vectorClockDivergence: number;    // Max divergence in vector clocks
  conflictRate: number;             // Concurrent updates requiring resolution

  // Consistency checks
  linearizabilityViolations: number;
  serializabilityViolations: number;
  causalityViolations: number;

  // Synchronization
  avgSyncLag: number;               // Average replication lag
  maxSyncLag: number;               // Maximum replication lag
}
```

**Why these matter:**
- State divergence: Nodes have inconsistent data
- Sync lag: How far behind replicas are
- Violations: Consistency guarantees broken

**Collection strategy:**
```typescript
// Periodically compare state across nodes
async function checkConsistency(nodes: Node[]): Promise<ConsistencyMetrics> {
  const states = await Promise.all(nodes.map(n => n.getState()));
  const hashes = states.map(s => hashState(s));

  // Check for state divergence
  const uniqueHashes = new Set(hashes);
  const stateHashMismatch = uniqueHashes.size > 1 ? uniqueHashes.size - 1 : 0;

  // Check vector clock divergence
  const vectorClocks = states.map(s => s.vectorClock);
  const divergence = calculateMaxDivergence(vectorClocks);

  return {
    stateHashMismatch,
    vectorClockDivergence: divergence,
    // ... other metrics
  };
}
```

## Monitoring Implementation Patterns

### Pattern 1: Baseline and Deviation

**From SKG metrics-initialization.ts:**

```typescript
const MONITORING_CONFIG = {
  baseline: {
    warmupPeriod: 30000,        // 30 seconds to establish baseline
    measurementDuration: 120000, // 2 minutes of measurement
    stabilityThreshold: 0.05,    // 5% variance acceptable
  }
};

class BaselineMonitor {
  private baseline: Metrics | null = null;
  private currentMetrics: Metrics;

  async establishBaseline(): Promise<void> {
    // Warm up system
    await this.warmup(MONITORING_CONFIG.baseline.warmupPeriod);

    // Collect baseline metrics
    const samples = await this.collectSamples(
      MONITORING_CONFIG.baseline.measurementDuration
    );

    this.baseline = this.calculateBaseline(samples);
  }

  checkForDeviation(current: Metrics): Alert[] {
    if (!this.baseline) return [];

    const alerts: Alert[] = [];

    // Check latency deviation
    if (current.latency > this.baseline.latency * 1.5) {
      alerts.push({
        type: 'latency_spike',
        severity: 'high',
        message: `Latency increased ${((current.latency / this.baseline.latency - 1) * 100).toFixed(1)}%`,
        baseline: this.baseline.latency,
        current: current.latency
      });
    }

    // Check throughput deviation
    if (current.throughput < this.baseline.throughput * 0.7) {
      alerts.push({
        type: 'throughput_drop',
        severity: 'high',
        message: `Throughput decreased ${((1 - current.throughput / this.baseline.throughput) * 100).toFixed(1)}%`,
        baseline: this.baseline.throughput,
        current: current.throughput
      });
    }

    return alerts;
  }
}
```

**Usage:**
```typescript
// Establish baseline during normal operation
await monitor.establishBaseline();

// Check for deviations during operation
setInterval(async () => {
  const current = await collectMetrics();
  const alerts = monitor.checkForDeviation(current);

  for (const alert of alerts) {
    logger.warn('Deviation detected', alert);
  }
}, 5000);  // Check every 5 seconds
```

### Pattern 2: Multi-Level Aggregation

**From SKG:**

```typescript
// Collect at multiple granularities
interface AggregatedMetrics {
  // Per-node metrics
  nodeMetrics: Map<string, NodeMetrics>;

  // Per-cluster metrics
  clusterMetrics: ClusterMetrics;

  // Global metrics
  globalMetrics: GlobalMetrics;
}

class MetricsAggregator {
  collectNodeMetrics(nodeId: string): NodeMetrics {
    return {
      nodeId,
      latency: measureNodeLatency(nodeId),
      throughput: measureNodeThroughput(nodeId),
      errorRate: getNodeErrorRate(nodeId),
      resourceUsage: getNodeResources(nodeId)
    };
  }

  aggregateClusterMetrics(cluster: string): ClusterMetrics {
    const nodes = getNodesInCluster(cluster);
    const nodeMetrics = nodes.map(n => this.collectNodeMetrics(n));

    return {
      cluster,
      nodeCount: nodes.length,
      avgLatency: average(nodeMetrics.map(m => m.latency)),
      totalThroughput: sum(nodeMetrics.map(m => m.throughput)),
      maxErrorRate: max(nodeMetrics.map(m => m.errorRate)),
      healthyNodes: nodeMetrics.filter(m => m.healthy).length
    };
  }

  aggregateGlobalMetrics(): GlobalMetrics {
    const clusters = getAllClusters();
    const clusterMetrics = clusters.map(c => this.aggregateClusterMetrics(c));

    return {
      totalNodes: sum(clusterMetrics.map(c => c.nodeCount)),
      systemThroughput: sum(clusterMetrics.map(c => c.totalThroughput)),
      p50Latency: percentile(getAllLatencies(), 0.50),
      p95Latency: percentile(getAllLatencies(), 0.95),
      p99Latency: percentile(getAllLatencies(), 0.99),
      overallHealth: calculateOverallHealth(clusterMetrics)
    };
  }
}
```

### Pattern 3: Health Checks

**Implementation:**

```typescript
// From SKG patterns
class HealthChecker {
  async performHealthCheck(nodeId: string): Promise<HealthStatus> {
    const checks = {
      responsive: await this.checkResponsive(nodeId),
      resourcesOk: await this.checkResources(nodeId),
      noErrors: await this.checkErrorRate(nodeId),
      consensus: await this.checkConsensusParticipation(nodeId),
      synchronized: await this.checkStateSynchronization(nodeId)
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return {
      nodeId,
      healthy: passed === total,
      healthScore: passed / total,
      checks,
      timestamp: Date.now()
    };
  }

  private async checkResponsive(nodeId: string): Promise<boolean> {
    try {
      const start = Date.now();
      await ping(nodeId);
      const latency = Date.now() - start;
      return latency < 1000;  // Should respond within 1s
    } catch {
      return false;
    }
  }

  private async checkConsensusParticipation(nodeId: string): Promise<boolean> {
    const stats = await getConsensusStats(nodeId);
    // Should participate in >90% of consensus votes
    return stats.participationRate > 0.9;
  }
}
```

**Health scoring:**
```typescript
function calculateOverallHealth(nodes: HealthStatus[]): number {
  if (nodes.length === 0) return 0;

  const healthyCount = nodes.filter(n => n.healthy).length;
  const avgHealthScore = average(nodes.map(n => n.healthScore));

  // System is healthy if >70% nodes healthy and avg score >0.8
  if (healthyCount / nodes.length > 0.7 && avgHealthScore > 0.8) {
    return 1.0;  // Fully healthy
  } else if (healthyCount / nodes.length > 0.5) {
    return 0.5;  // Degraded
  } else {
    return 0.0;  // Unhealthy
  }
}
```

### Pattern 4: Real-Time Dashboards

**From SKG monitoring setup:**

```typescript
// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = collectAllMetrics();
  res.json({
    timestamp: Date.now(),
    global: metrics.global,
    clusters: metrics.clusters,
    nodes: metrics.nodes,
    alerts: getActiveAlerts()
  });
});

// Dashboard can poll this endpoint
setInterval(async () => {
  const response = await fetch('/metrics');
  const metrics = await response.json();
  updateDashboard(metrics);
}, 5000);  // Update every 5 seconds
```

**Dashboard layout (from SKG):**
```
+------------------+------------------+------------------+
| Throughput       | Latency (p95)    | Error Rate       |
| 1,234 ops/s      | 45 ms            | 0.02%            |
+------------------+------------------+------------------+
| Active Agents    | Consensus Time   | Byzantine Detect |
| 127 / 150        | 35 ms            | 2                |
+------------------+------------------+------------------+
| Memory Usage     | CPU Usage        | Network Traffic  |
| 2.3 GB / 8 GB    | 45%              | 125 MB/s         |
+------------------+------------------+------------------+

Recent Alerts:
  ⚠️  Node agent-47 high latency (250ms)
  ⚠️  Cluster-B low throughput (down 30%)

Trending Issues:
  📈 Memory usage increasing 5%/hour
  📉 Throughput declining gradually
```

## Alerting Strategies

### Alert Thresholds

**From SKG configuration:**

```typescript
const alertThresholds = {
  // Performance thresholds
  memoryUsage: 512,           // MB
  cpuUtilization: 80,         // Percentage
  latencySpike: 1000,         // ms
  latencyP95: 500,            // ms
  latencyP99: 1000,           // ms

  // Reliability thresholds
  errorRate: 10,              // Errors per 1000 ops
  byzantineDetectionRate: 5,  // Detections per hour
  consensusFailureRate: 0.01, // 1% of consensus attempts
  timeoutRate: 0.05,          // 5% timeout rate

  // Efficiency thresholds (from SKG efficiency targets)
  efficiencyDrop: 0.10,       // Alert if efficiency drops >10%
  throughputDrop: 0.30        // Alert if throughput drops >30%
};
```

### Alert Levels

```typescript
enum AlertSeverity {
  INFO = 'info',        // Informational, no action needed
  WARNING = 'warning',  // Should investigate, not urgent
  HIGH = 'high',        // Requires attention soon
  CRITICAL = 'critical' // Immediate action required
}

interface Alert {
  severity: AlertSeverity;
  type: string;
  message: string;
  timestamp: number;
  nodeId?: string;
  metrics?: any;
  suggestedAction?: string;
}
```

**Alert classification:**

```typescript
function classifyAlert(metric: string, value: number, baseline: number): Alert {
  const deviation = Math.abs(value - baseline) / baseline;

  if (metric === 'errorRate') {
    if (value > 100) return { severity: CRITICAL, message: 'Very high error rate' };
    if (value > 50) return { severity: HIGH, message: 'High error rate' };
    if (value > 10) return { severity: WARNING, message: 'Elevated error rate' };
  }

  if (metric === 'latency') {
    if (value > 5000) return { severity: CRITICAL, message: 'Extreme latency' };
    if (value > 1000) return { severity: HIGH, message: 'High latency' };
    if (value > 500) return { severity: WARNING, message: 'Elevated latency' };
  }

  if (metric === 'consensusFailureRate') {
    if (value > 0.1) return { severity: CRITICAL, message: 'Consensus failing' };
    if (value > 0.05) return { severity: HIGH, message: 'Consensus issues' };
  }

  return { severity: INFO, message: 'Minor deviation' };
}
```

## Performance Analysis Tools

### Complexity Analysis

**From SKG scalability tests:**

```typescript
// Measure how metrics scale with system size
interface ComplexityAnalysis {
  metric: string;
  actualComplexity: string;      // Measured: O(log n), O(n), O(n²)
  expectedComplexity: string;    // Designed for
  rSquared: number;              // Goodness of fit
  recommendation: string;
}

function analyzeComplexity(
  agentCounts: number[],
  metricValues: number[]
): ComplexityAnalysis {
  // Fit to different complexity models
  const fits = {
    'O(1)': fitConstant(agentCounts, metricValues),
    'O(log n)': fitLogarithmic(agentCounts, metricValues),
    'O(n)': fitLinear(agentCounts, metricValues),
    'O(n log n)': fitNLogN(agentCounts, metricValues),
    'O(n²)': fitQuadratic(agentCounts, metricValues)
  };

  // Find best fit
  const bestFit = Object.entries(fits)
    .sort((a, b) => b[1].rSquared - a[1].rSquared)[0];

  return {
    metric: 'discoveryLatency',
    actualComplexity: bestFit[0],
    expectedComplexity: 'O(log n)',
    rSquared: bestFit[1].rSquared,
    recommendation: bestFit[0] === 'O(log n)'
      ? 'Performance scales as expected'
      : `Performance worse than expected. Investigate bottlenecks.`
  };
}
```

**Usage:**
```bash
# From run-scalability-test.ts
./run-scalability-test.ts \
  --min-agents 10 \
  --max-agents 1000 \
  --step 50

# Output includes complexity analysis:
# Discovery Latency: O(log n) (expected O(log n)) ✓
# Message Throughput: O(n) (expected O(n)) ✓
# Memory Usage: O(n²) (expected O(n)) ✗ ← INVESTIGATE
```

## Monitoring Best Practices

### 1. Instrument Early

Add monitoring before you need it. From SKG experience:

```typescript
// Add instrumentation to all critical paths
async function performConsensus(proposal: Proposal): Promise<Result> {
  const startTime = Date.now();
  const traceId = generateTraceId();

  try {
    logger.info('Starting consensus', { traceId, proposalId: proposal.id });

    const result = await consensus.propose(proposal);

    metrics.recordSuccess('consensus', Date.now() - startTime);
    logger.info('Consensus reached', { traceId, duration: Date.now() - startTime });

    return result;
  } catch (error) {
    metrics.recordError('consensus', error);
    logger.error('Consensus failed', { traceId, error, duration: Date.now() - startTime });
    throw error;
  }
}
```

### 2. Use Structured Logging

From SKG winston configuration:

```typescript
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()  // Structured format
  ),
  transports: [
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Logs are machine-parseable
logger.info('Consensus reached', {
  traceId: 'abc123',
  proposalId: 'prop-456',
  duration: 45,
  approvalRate: 0.87,
  byzantineDetected: 0,
  timestamp: Date.now()
});
```

### 3. Monitor the Right Percentiles

Don't just monitor averages:

```typescript
// From SKG
interface LatencyDistribution {
  mean: number;
  median: number;
  p50: number;
  p95: number;   // 95% of requests faster than this
  p99: number;   // 99% of requests faster than this
  p999: number;  // 99.9% of requests faster than this
  max: number;
}

// p99 matters more than average for user experience
if (latency.p99 > 1000) {
  alert('Some users experiencing high latency');
}
```

### 4. Correlate Metrics

Look for relationships between metrics:

```typescript
// High CPU and low throughput together suggests bottleneck
if (cpu > 80 && throughput < baseline * 0.5) {
  alert('CPU bottleneck detected');
}

// High memory and increasing latency suggests memory pressure
if (memory > threshold && latency > baseline * 2) {
  alert('Memory pressure affecting performance');
}

// Byzantine detections and consensus failures suggest attack
if (byzantineDetections > 0 && consensusFailureRate > 0.1) {
  alert('Possible Byzantine attack');
}
```

### 5. Test Your Monitoring

From SKG testing approach:

```typescript
// Test that alerts actually fire
describe('Monitoring alerts', () => {
  it('should alert on high latency', async () => {
    const alertListener = jest.fn();
    monitor.on('alert', alertListener);

    // Inject high latency
    await simulateHighLatency(2000);  // 2s latency

    expect(alertListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'latency_spike',
        severity: 'high'
      })
    );
  });
});
```

## Summary

Effective monitoring for distributed systems debugging requires:

1. **Comprehensive metrics**: Latency, throughput, resources, errors, consistency
2. **Multi-level aggregation**: Node, cluster, and global metrics
3. **Baseline tracking**: Detect deviations from normal
4. **Smart alerting**: Right thresholds, severity levels
5. **Performance analysis**: Complexity analysis, percentiles
6. **Correlation**: Understand relationships between metrics

All patterns extracted from actual SKG Agent Prototype 2 implementation and testing.
