#!/usr/bin/env node
/**
 * Suggestion Monitoring Script
 * Tracks and displays improvement suggestions from the Autonomous Action Agent
 */

class SuggestionMonitor {
  constructor() {
    this.suggestions = [];
    this.feedback = [];
  }

  /**
   * Add a new suggestion
   */
  addSuggestion(suggestion) {
    this.suggestions.push({
      ...suggestion,
      receivedAt: new Date().toISOString()
    });
    this.printSuggestion(suggestion);
  }

  /**
   * Record feedback for a suggestion
   */
  recordFeedback(suggestionId, action, reason) {
    this.feedback.push({
      suggestionId,
      action,
      reason,
      timestamp: new Date().toISOString()
    });
    console.log(`\x1b[36m[Feedback] ${action}: ${suggestionId}\x1b[0m`);
  }

  /**
   * Print a suggestion to console
   */
  printSuggestion(suggestion) {
    const priorityColors = {
      critical: '\x1b[31m',
      high: '\x1b[33m',
      medium: '\x1b[34m',
      low: '\x1b[90m'
    };
    const color = priorityColors[suggestion.priority] || '\x1b[0m';

    console.log(`\n${color}=== SUGGESTION: ${suggestion.title} ===\x1b[0m`);
    console.log(`Type: ${suggestion.type}`);
    console.log(`Priority: ${suggestion.priority}`);
    console.log(`Confidence: ${(suggestion.evidence?.confidence * 100).toFixed(0)}%`);
    console.log(`Description: ${suggestion.description}`);

    if (suggestion.evidence?.sources?.length > 0) {
      console.log(`Sources: ${suggestion.evidence.sources.join(', ')}`);
    }

    if (suggestion.evidence?.isSpeculative) {
      console.log('\x1b[33m[SPECULATIVE]\x1b[0m');
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const accepted = this.feedback.filter(f => f.action === 'accepted').length;
    const rejected = this.feedback.filter(f => f.action === 'rejected').length;
    const deferred = this.feedback.filter(f => f.action === 'deferred').length;

    return {
      total: this.suggestions.length,
      accepted,
      rejected,
      deferred,
      pending: this.suggestions.length - accepted - rejected - deferred,
      acceptanceRate: this.feedback.length > 0
        ? ((accepted / this.feedback.length) * 100).toFixed(1)
        : 'N/A'
    };
  }

  /**
   * Print summary
   */
  printSummary() {
    const stats = this.getStats();
    console.log('\n\x1b[1m=== Suggestion Summary ===\x1b[0m');
    console.log(`Total: ${stats.total}`);
    console.log(`\x1b[32mAccepted: ${stats.accepted}\x1b[0m`);
    console.log(`\x1b[31mRejected: ${stats.rejected}\x1b[0m`);
    console.log(`\x1b[33mDeferred: ${stats.deferred}\x1b[0m`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`Acceptance Rate: ${stats.acceptanceRate}%`);
  }
}

// Demo
function main() {
  console.log('\x1b[1m=== Autonomous Action Agent - Suggestion Monitor ===\x1b[0m\n');

  const monitor = new SuggestionMonitor();

  // Demo suggestions
  monitor.addSuggestion({
    id: 'demo-001',
    type: 'code_quality',
    title: 'Extract duplicate validation logic',
    priority: 'medium',
    description: 'Similar validation patterns observed in 3 endpoints',
    evidence: { confidence: 0.75, sources: ['api.ts:45', 'api.ts:67'], isSpeculative: false }
  });

  monitor.addSuggestion({
    id: 'demo-002',
    type: 'performance',
    title: 'Add caching for user lookups',
    priority: 'low',
    description: 'Repeated database queries detected',
    evidence: { confidence: 0.55, sources: ['handler.ts:23'], isSpeculative: true }
  });

  // Demo feedback
  setTimeout(() => {
    monitor.recordFeedback('demo-001', 'accepted');
    monitor.recordFeedback('demo-002', 'deferred', 'Will address in next sprint');
    monitor.printSummary();
  }, 1000);
}

main();
