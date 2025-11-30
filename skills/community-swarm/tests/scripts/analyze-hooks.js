#!/usr/bin/env node
/**
 * Hook Execution Analyzer
 * Analyzes hook execution patterns in the community swarm
 *
 * Usage: npm run analyze:hooks
 */

const HOOK_TYPES = {
  PRE_SPAWN: 'pre-spawn',
  POST_SPAWN: 'post-spawn',
  PRE_TASK: 'pre-task',
  POST_TASK: 'post-task',
  PRE_SHUTDOWN: 'pre-shutdown',
  POST_SHUTDOWN: 'post-shutdown',
  PRE_SEND: 'pre-send',
  POST_RECEIVE: 'post-receive',
  ON_ERROR: 'on-error',
  ON_TIMEOUT: 'on-timeout'
};

class HookAnalyzer {
  constructor() {
    this.hookLog = [];
    this.hookStats = {};
    this.chainAnalysis = [];
    this.startTime = Date.now();

    // Initialize stats for all hook types
    Object.values(HOOK_TYPES).forEach(type => {
      this.hookStats[type] = {
        executions: 0,
        totalDuration: 0,
        errors: 0,
        blocked: 0
      };
    });
  }

  /**
   * Log a hook execution
   */
  logHookExecution(hook) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: hook.type,
      name: hook.name,
      agent: hook.agent,
      duration: hook.duration,
      result: hook.result, // 'proceed', 'blocked', 'error'
      error: hook.error
    };

    this.hookLog.push(entry);
    this.updateStats(entry);
    this.analyzeChain(entry);
    this.printHook(entry);
  }

  /**
   * Update statistics
   */
  updateStats(entry) {
    const stats = this.hookStats[entry.type];
    if (stats) {
      stats.executions++;
      stats.totalDuration += entry.duration || 0;
      if (entry.result === 'error') stats.errors++;
      if (entry.result === 'blocked') stats.blocked++;
    }
  }

  /**
   * Analyze hook chains for patterns
   */
  analyzeChain(entry) {
    // Check for expected sequences
    const expectedSequences = [
      ['pre-spawn', 'post-spawn'],
      ['pre-task', 'post-task'],
      ['pre-send', 'post-receive'],
      ['pre-shutdown', 'post-shutdown']
    ];

    const last5 = this.hookLog.slice(-5).map(h => h.type);

    expectedSequences.forEach(sequence => {
      if (sequence[0] === entry.type) {
        this.chainAnalysis.push({
          type: 'sequence-start',
          sequence: sequence.join(' → '),
          timestamp: entry.timestamp
        });
      }
    });
  }

  /**
   * Print a hook execution to console
   */
  printHook(entry) {
    const color = this.getColorForResult(entry.result);
    const durationStr = entry.duration ? `${entry.duration}ms` : '?ms';
    const icon = this.getIconForResult(entry.result);

    console.log(
      `${color}${icon} [${entry.timestamp}] ${entry.type.padEnd(15)} ` +
      `${entry.name || 'anonymous'} ` +
      `(${entry.agent || 'system'}) ` +
      `[${durationStr}]\x1b[0m`
    );

    if (entry.error) {
      console.log(`   \x1b[31mError: ${entry.error}\x1b[0m`);
    }
  }

  /**
   * Get console color for result
   */
  getColorForResult(result) {
    const colors = {
      proceed: '\x1b[32m',  // Green
      blocked: '\x1b[33m',  // Yellow
      error: '\x1b[31m'     // Red
    };
    return colors[result] || '\x1b[0m';
  }

  /**
   * Get icon for result
   */
  getIconForResult(result) {
    const icons = {
      proceed: '✓',
      blocked: '⊘',
      error: '✗'
    };
    return icons[result] || '○';
  }

  /**
   * Calculate timing statistics
   */
  getTimingStats() {
    const timings = {};

    Object.entries(this.hookStats).forEach(([type, stats]) => {
      if (stats.executions > 0) {
        timings[type] = {
          count: stats.executions,
          avgDuration: (stats.totalDuration / stats.executions).toFixed(2),
          totalDuration: stats.totalDuration
        };
      }
    });

    return timings;
  }

  /**
   * Detect potential issues
   */
  detectIssues() {
    const issues = [];

    // Check for hooks that never fired
    Object.entries(this.hookStats).forEach(([type, stats]) => {
      if (stats.executions === 0) {
        issues.push({
          type: 'never-fired',
          hook: type,
          severity: 'info',
          message: `Hook '${type}' has never fired`
        });
      }
    });

    // Check for high error rates
    Object.entries(this.hookStats).forEach(([type, stats]) => {
      if (stats.executions > 0 && stats.errors / stats.executions > 0.1) {
        issues.push({
          type: 'high-error-rate',
          hook: type,
          severity: 'warning',
          message: `Hook '${type}' has ${((stats.errors / stats.executions) * 100).toFixed(1)}% error rate`
        });
      }
    });

    // Check for high block rates
    Object.entries(this.hookStats).forEach(([type, stats]) => {
      if (stats.executions > 0 && stats.blocked / stats.executions > 0.2) {
        issues.push({
          type: 'high-block-rate',
          hook: type,
          severity: 'info',
          message: `Hook '${type}' blocked ${((stats.blocked / stats.executions) * 100).toFixed(1)}% of executions`
        });
      }
    });

    return issues;
  }

  /**
   * Print summary
   */
  printSummary() {
    const elapsed = (Date.now() - this.startTime) / 1000;

    console.log('\n\x1b[1m=== Hook Analysis Summary ===\x1b[0m\n');
    console.log(`Duration: ${elapsed.toFixed(1)}s`);
    console.log(`Total hook executions: ${this.hookLog.length}\n`);

    console.log('\x1b[1mHook Statistics:\x1b[0m');
    const timings = this.getTimingStats();
    Object.entries(timings)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([type, stats]) => {
        const hookStats = this.hookStats[type];
        console.log(`  ${type}:`);
        console.log(`    Executions: ${stats.count}`);
        console.log(`    Avg Duration: ${stats.avgDuration}ms`);
        console.log(`    Errors: ${hookStats.errors}, Blocked: ${hookStats.blocked}`);
      });

    // Print issues
    const issues = this.detectIssues();
    if (issues.length > 0) {
      console.log('\n\x1b[1mPotential Issues:\x1b[0m');
      issues.forEach(issue => {
        const color = issue.severity === 'warning' ? '\x1b[33m' : '\x1b[36m';
        console.log(`  ${color}[${issue.severity.toUpperCase()}] ${issue.message}\x1b[0m`);
      });
    }

    // Print lifecycle completeness
    console.log('\n\x1b[1mLifecycle Completeness:\x1b[0m');
    const lifecyclePairs = [
      ['pre-spawn', 'post-spawn'],
      ['pre-task', 'post-task'],
      ['pre-shutdown', 'post-shutdown']
    ];
    lifecyclePairs.forEach(([pre, post]) => {
      const preCount = this.hookStats[pre]?.executions || 0;
      const postCount = this.hookStats[post]?.executions || 0;
      const complete = preCount === postCount;
      const icon = complete ? '✓' : '!';
      const color = complete ? '\x1b[32m' : '\x1b[33m';
      console.log(`  ${color}${icon} ${pre} (${preCount}) → ${post} (${postCount})\x1b[0m`);
    });
  }
}

// Main execution
function main() {
  console.log('\x1b[1m=== Community Swarm Hook Analyzer ===\x1b[0m\n');
  console.log('Analyzing hook execution patterns...');
  console.log('Press Ctrl+C to stop and see summary.\n');

  const analyzer = new HookAnalyzer();

  // Simulate some hook executions for demonstration
  const demoHooks = [
    { type: 'pre-spawn', name: 'resource-checker', agent: 'assessment-agent', duration: 12, result: 'proceed' },
    { type: 'post-spawn', name: 'registration-logger', agent: 'assessment-agent', duration: 5, result: 'proceed' },
    { type: 'pre-spawn', name: 'resource-checker', agent: 'implementation-agent', duration: 8, result: 'proceed' },
    { type: 'post-spawn', name: 'registration-logger', agent: 'implementation-agent', duration: 4, result: 'proceed' },
    { type: 'pre-task', name: 'capability-validator', agent: 'assessment-agent', duration: 15, result: 'proceed' },
    { type: 'post-task', name: 'quality-gate', agent: 'assessment-agent', duration: 45, result: 'proceed' },
    { type: 'pre-task', name: 'capability-validator', agent: 'implementation-agent', duration: 10, result: 'blocked', error: 'Agent busy' },
    { type: 'on-error', name: 'error-handler', agent: 'system', duration: 3, result: 'proceed' }
  ];

  console.log('Demo mode: Showing sample hook executions\n');
  demoHooks.forEach((hook, i) => {
    setTimeout(() => analyzer.logHookExecution(hook), i * 300);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    analyzer.printSummary();
    process.exit(0);
  });

  // Show summary after demo
  setTimeout(() => {
    console.log('\n--- Demo complete. Press Ctrl+C to exit. ---');
  }, demoHooks.length * 300 + 100);
}

main();
