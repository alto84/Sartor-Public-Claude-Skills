#!/usr/bin/env node
/**
 * Message Monitoring Utility
 * Monitors swarm message traffic for debugging and analysis
 *
 * Usage: npm run monitor:messages
 */

const MESSAGE_TYPES = {
  TASK_ASSIGN: 'TASK_ASSIGN',
  TASK_PROGRESS: 'TASK_PROGRESS',
  TASK_COMPLETE: 'TASK_COMPLETE',
  TASK_FAILED: 'TASK_FAILED',
  ASSISTANCE_REQUEST: 'ASSISTANCE_REQUEST',
  ASSISTANCE_RESPONSE: 'ASSISTANCE_RESPONSE',
  DATA_SHARE: 'DATA_SHARE',
  DATA_REQUEST: 'DATA_REQUEST',
  DATA_RESPONSE: 'DATA_RESPONSE',
  QUALITY_CHECK: 'QUALITY_CHECK',
  QUALITY_PASS: 'QUALITY_PASS',
  QUALITY_FAIL: 'QUALITY_FAIL',
  HEARTBEAT: 'HEARTBEAT',
  ALERT: 'ALERT'
};

class MessageMonitor {
  constructor() {
    this.messageLog = [];
    this.agentStats = {};
    this.startTime = Date.now();
  }

  /**
   * Log a message
   */
  logMessage(message) {
    const entry = {
      timestamp: new Date().toISOString(),
      id: message.id,
      type: message.type,
      from: message.from,
      to: message.to,
      priority: message.priority,
      payloadSize: JSON.stringify(message.payload || {}).length
    };

    this.messageLog.push(entry);
    this.updateAgentStats(message);
    this.printMessage(entry);
  }

  /**
   * Update statistics for agents
   */
  updateAgentStats(message) {
    // Sender stats
    if (!this.agentStats[message.from]) {
      this.agentStats[message.from] = { sent: 0, received: 0, types: {} };
    }
    this.agentStats[message.from].sent++;
    this.agentStats[message.from].types[message.type] =
      (this.agentStats[message.from].types[message.type] || 0) + 1;

    // Receiver stats
    const receivers = Array.isArray(message.to) ? message.to : [message.to];
    receivers.forEach(receiver => {
      if (!this.agentStats[receiver]) {
        this.agentStats[receiver] = { sent: 0, received: 0, types: {} };
      }
      this.agentStats[receiver].received++;
    });
  }

  /**
   * Print a message to console
   */
  printMessage(entry) {
    const color = this.getColorForType(entry.type);
    console.log(
      `${color}[${entry.timestamp}] ${entry.type.padEnd(20)} ` +
      `${entry.from} → ${entry.to} ` +
      `(${entry.payloadSize} bytes)\x1b[0m`
    );
  }

  /**
   * Get console color for message type
   */
  getColorForType(type) {
    const colors = {
      TASK_ASSIGN: '\x1b[34m',      // Blue
      TASK_COMPLETE: '\x1b[32m',    // Green
      TASK_FAILED: '\x1b[31m',      // Red
      QUALITY_FAIL: '\x1b[31m',     // Red
      QUALITY_PASS: '\x1b[32m',     // Green
      ASSISTANCE_REQUEST: '\x1b[33m', // Yellow
      HEARTBEAT: '\x1b[90m',        // Gray
      ALERT: '\x1b[35m'             // Magenta
    };
    return colors[type] || '\x1b[0m';
  }

  /**
   * Print summary statistics
   */
  printSummary() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const messageRate = this.messageLog.length / elapsed;

    console.log('\n\x1b[1m=== Message Monitor Summary ===\x1b[0m\n');
    console.log(`Duration: ${elapsed.toFixed(1)}s`);
    console.log(`Total messages: ${this.messageLog.length}`);
    console.log(`Message rate: ${messageRate.toFixed(2)}/sec\n`);

    console.log('\x1b[1mAgent Statistics:\x1b[0m');
    Object.entries(this.agentStats).forEach(([agent, stats]) => {
      console.log(`  ${agent}:`);
      console.log(`    Sent: ${stats.sent}, Received: ${stats.received}`);
      console.log(`    Types: ${JSON.stringify(stats.types)}`);
    });

    console.log('\n\x1b[1mMessage Type Breakdown:\x1b[0m');
    const typeCounts = {};
    this.messageLog.forEach(entry => {
      typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
    });
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
  }

  /**
   * Export log to file
   */
  exportLog(filename) {
    const fs = require('fs');
    const data = {
      summary: {
        startTime: new Date(this.startTime).toISOString(),
        totalMessages: this.messageLog.length,
        agentStats: this.agentStats
      },
      messages: this.messageLog
    };
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Log exported to ${filename}`);
  }
}

// Main execution
function main() {
  console.log('\x1b[1m=== Community Swarm Message Monitor ===\x1b[0m\n');
  console.log('Monitoring for swarm message traffic...');
  console.log('Press Ctrl+C to stop and see summary.\n');

  const monitor = new MessageMonitor();

  // Simulate some messages for demonstration
  const demoMessages = [
    { id: 'msg-001', type: 'TASK_ASSIGN', from: 'orchestrator', to: 'assessment-agent', priority: 'NORMAL', payload: { task: 'analyze' } },
    { id: 'msg-002', type: 'TASK_PROGRESS', from: 'assessment-agent', to: 'orchestrator', priority: 'LOW', payload: { progress: 50 } },
    { id: 'msg-003', type: 'ASSISTANCE_REQUEST', from: 'implementation-agent', to: 'research-agent', priority: 'HIGH', payload: { query: 'best practice' } },
    { id: 'msg-004', type: 'ASSISTANCE_RESPONSE', from: 'research-agent', to: 'implementation-agent', priority: 'HIGH', payload: { result: 'found' } },
    { id: 'msg-005', type: 'TASK_COMPLETE', from: 'assessment-agent', to: 'orchestrator', priority: 'NORMAL', payload: { status: 'done' } }
  ];

  console.log('Demo mode: Showing sample messages\n');
  demoMessages.forEach((msg, i) => {
    setTimeout(() => monitor.logMessage(msg), i * 500);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    monitor.printSummary();
    process.exit(0);
  });

  // Keep running until interrupted
  setTimeout(() => {
    console.log('\n--- Demo complete. Press Ctrl+C to exit. ---');
  }, demoMessages.length * 500 + 100);
}

main();
