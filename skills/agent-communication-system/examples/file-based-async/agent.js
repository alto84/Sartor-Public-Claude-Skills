/**
 * File-Based Agent (JavaScript version)
 * Polls for instructions and executes tasks through filesystem communication
 */

const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

// ============================================================================
// File-Based Agent
// ============================================================================

class FileBasedAgent {
  constructor(
    agentId,
    capabilities = ['general'],
    basePath = './communication',
    pollInterval = 2000,
    verbose = false
  ) {
    this.agentId = agentId;
    this.capabilities = capabilities;
    this.basePath = basePath;
    this.pollInterval = pollInterval;
    this.verbose = verbose;
    this.currentTask = null;
    this.processedTasks = new Set();
    this.running = false;
  }

  /**
   * Start the agent
   */
  async start() {
    this.running = true;

    // Register with coordinator
    await this.register();

    this.log(`Started with capabilities: [${this.capabilities.join(', ')}]`);
    this.log(`Polling interval: ${this.pollInterval}ms`);

    // Main polling loop
    while (this.running) {
      try {
        // Check for new instructions
        await this.checkForInstructions();

        // Send heartbeat
        if (Date.now() % 10000 < this.pollInterval) { // Every ~10 seconds
          await this.sendHeartbeat();
        }

        // Wait before next poll
        await this.delay(this.pollInterval);
      } catch (error) {
        this.log(`Error in main loop: ${error.message}`, 'error');
        await this.delay(5000); // Longer delay on error
      }
    }
  }

  /**
   * Register agent with coordinator
   */
  async register() {
    const registryPath = path.join(this.basePath, 'registry');
    await fs.mkdir(registryPath, { recursive: true });

    const registration = {
      agentId: this.agentId,
      capabilities: this.capabilities,
      status: 'AVAILABLE',
      timestamp: new Date().toISOString()
    };

    const regFile = path.join(registryPath, `${this.agentId}.json`);
    await fs.writeFile(regFile, JSON.stringify(registration, null, 2));
    this.log('Registered with coordinator');
  }

  /**
   * Check for new instructions
   */
  async checkForInstructions() {
    const instructionsPath = path.join(this.basePath, 'instructions');

    try {
      const files = await fs.readdir(instructionsPath);

      for (const file of files) {
        // Look for files assigned to this agent
        if (file.startsWith(this.agentId) && file.endsWith('.json')) {
          const taskId = file.replace(`${this.agentId}-`, '').replace('.json', '');

          // Skip if already processed
          if (this.processedTasks.has(taskId)) {
            continue;
          }

          const filePath = path.join(instructionsPath, file);
          const lockPath = `${filePath}.lock`;

          try {
            // Try to claim the task
            await fs.writeFile(lockPath, this.agentId, { flag: 'wx' });

            // Read the task
            const content = await fs.readFile(filePath, 'utf-8');
            const task = JSON.parse(content);

            this.log(`Received task: ${task.task.id} - "${task.task.description}"`);

            // Process the task
            await this.executeTask(task);

            // Mark as processed
            this.processedTasks.add(taskId);

            // Clean up instruction file
            await fs.unlink(filePath).catch(() => {});
            await fs.unlink(lockPath).catch(() => {});
          } catch (error) {
            if (error.code !== 'EEXIST') {
              this.log(`Error claiming task ${file}: ${error.message}`, 'error');
            }
          }
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.log(`Error checking instructions: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    this.currentTask = task;
    const startTime = Date.now();

    try {
      this.log('Starting task execution');

      // Update status
      await this.updateAgentStatus('BUSY');

      // Progress: 0%
      await this.reportProgress(task.task.id, 0, 'initialization', 'Starting task');

      // Simulate task execution based on type
      const result = await this.performTaskLogic(task);

      // Complete the task
      await this.completeTask(task.task.id, result);

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      this.log(`Task completed successfully in ${duration}s`);
    } catch (error) {
      this.log(`Task failed: ${error.message}`, 'error');
      await this.failTask(task.task.id, error.message);
    } finally {
      this.currentTask = null;
      await this.updateAgentStatus('AVAILABLE');
    }
  }

  /**
   * Perform actual task logic based on type
   */
  async performTaskLogic(task) {
    const taskType = task.task.type;
    const input = task.task.input;

    // Progress: 25%
    await this.reportProgress(task.task.id, 25, 'data-loading', 'Loading input data');
    await this.delay(1000);

    let result = {};

    switch (taskType) {
      case 'analysis':
        result = await this.performAnalysis(input);
        break;

      case 'synthesis':
        result = await this.performSynthesis(input);
        break;

      case 'validation':
        result = await this.performValidation(input);
        break;

      default:
        result = await this.performGenericTask(input);
    }

    // Progress: 75%
    await this.reportProgress(task.task.id, 75, 'validation', 'Validating results');
    await this.delay(1000);

    // Validate output if requirements specified
    if (task.validation) {
      this.validateOutput(result, task.validation);
    }

    // Progress: 100%
    await this.reportProgress(task.task.id, 100, 'complete', 'Task completed');

    return result;
  }

  /**
   * Perform analysis task
   */
  async performAnalysis(input) {
    // Progress: 50%
    await this.reportProgress(this.currentTask.task.id, 50, 'processing', 'Analyzing data');
    await this.delay(2000);

    // Simulate analysis
    const data = input.data || [];
    const mean = data.reduce((a, b) => a + b, 0) / data.length || 0;
    const sorted = [...data].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length || 0;
    const stddev = Math.sqrt(variance);

    return {
      summary: `Analysis of ${data.length} data points`,
      metrics: {
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        stddev: stddev.toFixed(2),
        min: Math.min(...data),
        max: Math.max(...data),
        count: data.length
      },
      insights: [
        `Data shows ${stddev > mean * 0.3 ? 'high' : 'low'} variability`,
        `Central tendency: mean=${mean.toFixed(2)}, median=${median.toFixed(2)}`,
        `Range: ${Math.min(...data)} to ${Math.max(...data)}`
      ]
    };
  }

  /**
   * Perform synthesis task
   */
  async performSynthesis(input) {
    await this.reportProgress(this.currentTask.task.id, 50, 'processing', 'Synthesizing information');
    await this.delay(2000);

    return {
      summary: 'Synthesis completed',
      combined: input,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Perform validation task
   */
  async performValidation(input) {
    await this.reportProgress(this.currentTask.task.id, 50, 'processing', 'Validating data');
    await this.delay(1500);

    return {
      valid: true,
      checks: ['format', 'completeness', 'consistency'],
      issues: []
    };
  }

  /**
   * Perform generic task
   */
  async performGenericTask(input) {
    await this.reportProgress(this.currentTask.task.id, 50, 'processing', 'Processing task');
    await this.delay(2000);

    return {
      input: input,
      processed: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate output against requirements
   */
  validateOutput(output, validation) {
    if (validation.requiredFields) {
      for (const field of validation.requiredFields) {
        if (!(field in output)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
    }
  }

  /**
   * Report progress
   */
  async reportProgress(taskId, percentage, step, message) {
    const progressMessage = {
      messageId: `progress-${Date.now()}`,
      type: 'PROGRESS',
      timestamp: new Date().toISOString(),
      taskId,
      agentId: this.agentId,
      progress: {
        percentage,
        currentStep: step,
        message
      }
    };

    const progressPath = path.join(this.basePath, 'progress');
    await fs.mkdir(progressPath, { recursive: true });

    const filename = `${taskId}-${percentage}.json`;
    const filePath = path.join(progressPath, filename);

    await fs.writeFile(filePath, JSON.stringify(progressMessage, null, 2));

    this.log(`Progress: ${percentage}% - ${message}`);
  }

  /**
   * Complete a task
   */
  async completeTask(taskId, result) {
    const completion = {
      messageId: `complete-${Date.now()}`,
      type: 'COMPLETION',
      timestamp: new Date().toISOString(),
      taskId,
      agentId: this.agentId,
      status: 'SUCCESS',
      result,
      citations: this.generateCitations()
    };

    const completionsPath = path.join(this.basePath, 'completions');
    await fs.mkdir(completionsPath, { recursive: true });

    const filename = `${taskId}-complete.json`;
    const filePath = path.join(completionsPath, filename);

    await fs.writeFile(filePath, JSON.stringify(completion, null, 2));

    this.log(`Results written to completions/${filename}`);
  }

  /**
   * Fail a task
   */
  async failTask(taskId, error) {
    const completion = {
      messageId: `fail-${Date.now()}`,
      type: 'COMPLETION',
      timestamp: new Date().toISOString(),
      taskId,
      agentId: this.agentId,
      status: 'FAILURE',
      error
    };

    const completionsPath = path.join(this.basePath, 'completions');
    await fs.mkdir(completionsPath, { recursive: true });

    const filename = `${taskId}-failed.json`;
    const filePath = path.join(completionsPath, filename);

    await fs.writeFile(filePath, JSON.stringify(completion, null, 2));
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(status) {
    const registration = {
      agentId: this.agentId,
      capabilities: this.capabilities,
      status,
      timestamp: new Date().toISOString()
    };

    const regFile = path.join(this.basePath, 'registry', `${this.agentId}.json`);
    await fs.writeFile(regFile, JSON.stringify(registration, null, 2));
  }

  /**
   * Send heartbeat
   */
  async sendHeartbeat() {
    await this.updateAgentStatus(this.currentTask ? 'BUSY' : 'AVAILABLE');
  }

  /**
   * Generate citations for the task
   */
  generateCitations() {
    return [
      `method:${this.currentTask?.task.type || 'generic'}-v1`,
      `agent:${this.agentId}`,
      `timestamp:${new Date().toISOString()}`
    ];
  }

  /**
   * Log message
   */
  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = level === 'error' ? '❌ ' : level === 'warn' ? '⚠️ ' : '';
    console.log(`[${timestamp}] ${this.agentId}: ${prefix}${message}`);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop the agent
   */
  stop() {
    this.running = false;
    this.log('Stopping...');
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const agentId = args.find(a => a.startsWith('--agent-id='))?.split('=')[1] || `agent-${Date.now()}`;
  const capabilities = args.find(a => a.startsWith('--capabilities='))?.split('=')[1]?.split(',') || ['general'];
  const pollInterval = parseInt(args.find(a => a.startsWith('--poll-interval='))?.split('=')[1] || '2000');
  const verbose = args.includes('--verbose');
  const basePath = args.find(a => a.startsWith('--path='))?.split('=')[1] || './communication';

  // Create and start agent
  const agent = new FileBasedAgent(agentId, capabilities, basePath, pollInterval, verbose);

  console.log(`Starting ${agentId}...`);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down agent...');
    agent.stop();
    setTimeout(() => process.exit(0), 1000);
  });

  // Start the agent
  await agent.start();
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for testing
module.exports = { FileBasedAgent };