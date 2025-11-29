/**
 * File-Based Coordinator (JavaScript version)
 * Manages task distribution and monitoring through filesystem
 */

const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

// ============================================================================
// File-Based Coordinator
// ============================================================================

class FileBasedCoordinator {
  constructor(basePath = './communication', pollInterval = 2000, verbose = false) {
    this.basePath = basePath;
    this.pollInterval = pollInterval;
    this.verbose = verbose;
    this.agents = {};
    this.activeTasks = new Map();
    this.watchIntervals = new Map();
  }

  /**
   * Initialize the coordinator
   */
  async initialize() {
    // Create directory structure if it doesn't exist
    const dirs = ['instructions', 'progress', 'completions', 'archive', 'registry'];
    for (const dir of dirs) {
      const dirPath = path.join(this.basePath, dir);
      if (!existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
        this.log(`Created directory: ${dirPath}`);
      }
    }

    this.log(`Coordinator: Started watching ${this.basePath}/instructions/`);
    this.log(`Coordinator: Polling interval: ${this.pollInterval}ms`);
  }

  /**
   * Start watching for tasks and updates
   */
  async start() {
    await this.initialize();

    // Watch for new instructions
    this.watchDirectory('instructions', this.handleNewInstruction.bind(this));

    // Watch for progress updates
    this.watchDirectory('progress', this.handleProgressUpdate.bind(this));

    // Watch for completions
    this.watchDirectory('completions', this.handleCompletion.bind(this));

    // Watch for agent registrations
    this.watchDirectory('registry', this.handleAgentRegistration.bind(this));

    // Periodic health check
    setInterval(() => this.performHealthCheck(), 30000);

    this.log('Coordinator fully initialized and watching all channels');
  }

  /**
   * Watch a directory for changes
   */
  watchDirectory(dir, handler) {
    const dirPath = path.join(this.basePath, dir);

    // Use polling approach for cross-platform compatibility
    const interval = setInterval(async () => {
      try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          if (file.endsWith('.json') && !file.endsWith('.lock')) {
            await handler(file);
          }
        }
      } catch (error) {
        if (this.verbose) {
          console.error(`Error watching ${dir}:`, error);
        }
      }
    }, this.pollInterval);

    this.watchIntervals.set(dir, interval);
  }

  /**
   * Handle new instruction file
   */
  async handleNewInstruction(filename) {
    const filePath = path.join(this.basePath, 'instructions', filename);
    const lockPath = `${filePath}.lock`;

    try {
      // Try to claim the task with a lock file
      await fs.writeFile(lockPath, 'coordinator', { flag: 'wx' });

      // Read the task
      const content = await fs.readFile(filePath, 'utf-8');
      const task = JSON.parse(content);

      // Check if we've already processed this task
      if (this.activeTasks.has(task.task.id)) {
        await fs.unlink(lockPath);
        return;
      }

      this.log(`Coordinator: New instruction detected: ${filename}`);

      // Find suitable agent
      const agent = this.findSuitableAgent(task.task.requirements.capabilities);
      if (agent) {
        await this.assignTaskToAgent(task, agent);
        this.activeTasks.set(task.task.id, task);

        // Move instruction to assigned folder
        const assignedPath = path.join(this.basePath, 'instructions', `assigned-${filename}`);
        await fs.rename(filePath, assignedPath);
        this.log(`Coordinator: Assigned ${task.task.id} to ${agent}`);
      } else {
        this.log(`Coordinator: No suitable agent for task ${task.task.id}`, 'warn');
      }

      // Clean up lock
      await fs.unlink(lockPath).catch(() => {});
    } catch (error) {
      if (error.code !== 'EEXIST') { // Ignore if lock already exists
        this.log(`Error handling instruction ${filename}: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Handle progress update
   */
  async handleProgressUpdate(filename) {
    const filePath = path.join(this.basePath, 'progress', filename);
    const processedPath = `${filePath}.processed`;

    try {
      // Check if already processed
      if (existsSync(processedPath)) {
        return;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const progress = JSON.parse(content);

      this.log(`Coordinator: Progress update from ${progress.agentId}: ${progress.taskId} - ${progress.progress.percentage}%`);

      // Update agent status
      if (this.agents[progress.agentId]) {
        this.agents[progress.agentId].lastSeen = new Date();
      }

      // Mark as processed
      await fs.writeFile(processedPath, '', { flag: 'wx' });

      // Archive after a delay
      setTimeout(async () => {
        await this.archiveFile(filePath, 'progress');
        await fs.unlink(processedPath).catch(() => {});
      }, 60000);
    } catch (error) {
      if (!error.message.includes('ENOENT')) {
        this.log(`Error handling progress ${filename}: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Handle task completion
   */
  async handleCompletion(filename) {
    const filePath = path.join(this.basePath, 'completions', filename);
    const processedPath = `${filePath}.processed`;

    try {
      // Check if already processed
      if (existsSync(processedPath)) {
        return;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const completion = JSON.parse(content);

      this.log(`Coordinator: Task completed: ${completion.taskId} by ${completion.agentId} - ${completion.status}`);

      // Update agent status
      if (this.agents[completion.agentId]) {
        this.agents[completion.agentId].status = 'AVAILABLE';
        this.agents[completion.agentId].currentTask = undefined;
      }

      // Remove from active tasks
      this.activeTasks.delete(completion.taskId);

      // Mark as processed
      await fs.writeFile(processedPath, '', { flag: 'wx' });

      // Archive the completion
      await this.archiveCompletion(completion);
    } catch (error) {
      if (!error.message.includes('ENOENT')) {
        this.log(`Error handling completion ${filename}: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Handle agent registration
   */
  async handleAgentRegistration(filename) {
    const filePath = path.join(this.basePath, 'registry', filename);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const registration = JSON.parse(content);

      // Update or add agent
      this.agents[registration.agentId] = {
        capabilities: registration.capabilities,
        status: registration.status || 'AVAILABLE',
        lastSeen: new Date()
      };

      if (this.verbose) {
        this.log(`Agent registered: ${registration.agentId} with capabilities: ${registration.capabilities.join(', ')}`);
      }
    } catch (error) {
      if (!error.message.includes('ENOENT')) {
        this.log(`Error handling registration ${filename}: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Find suitable agent for task
   */
  findSuitableAgent(requiredCapabilities) {
    for (const [agentId, agent] of Object.entries(this.agents)) {
      if (agent.status === 'AVAILABLE') {
        const hasAllCapabilities = requiredCapabilities.every(cap =>
          agent.capabilities.includes(cap)
        );
        if (hasAllCapabilities) {
          agent.status = 'BUSY';
          return agentId;
        }
      }
    }
    return null;
  }

  /**
   * Assign task to agent
   */
  async assignTaskToAgent(task, agentId) {
    // Update task with assignment
    task.to = agentId;
    task.timestamp = new Date().toISOString();

    // Write to agent's inbox
    const agentInboxPath = path.join(this.basePath, 'instructions', `${agentId}-${task.task.id}.json`);
    await fs.writeFile(agentInboxPath, JSON.stringify(task, null, 2));

    // Update agent record
    this.agents[agentId].currentTask = task.task.id;
  }

  /**
   * Archive a file
   */
  async archiveFile(filePath, type) {
    const date = new Date().toISOString().split('T')[0];
    const archivePath = path.join(this.basePath, 'archive', date, type);
    await fs.mkdir(archivePath, { recursive: true });

    const filename = path.basename(filePath);
    const destination = path.join(archivePath, filename);

    try {
      await fs.rename(filePath, destination);
    } catch (error) {
      // File might already be archived
    }
  }

  /**
   * Archive completion with full task history
   */
  async archiveCompletion(completion) {
    const date = new Date().toISOString().split('T')[0];
    const archivePath = path.join(this.basePath, 'archive', date, completion.taskId);
    await fs.mkdir(archivePath, { recursive: true });

    // Save completion
    const completionPath = path.join(archivePath, 'completion.json');
    await fs.writeFile(completionPath, JSON.stringify(completion, null, 2));

    // Archive related progress files
    const progressDir = path.join(this.basePath, 'progress');
    const progressFiles = await fs.readdir(progressDir);
    for (const file of progressFiles) {
      if (file.includes(completion.taskId)) {
        const sourcePath = path.join(progressDir, file);
        const destPath = path.join(archivePath, file);
        await fs.rename(sourcePath, destPath).catch(() => {});
      }
    }

    this.log(`Coordinator: Archived task ${completion.taskId} to archive/${date}/`);
  }

  /**
   * Perform health check on agents
   */
  async performHealthCheck() {
    const now = new Date();
    const timeout = 60000; // 1 minute

    for (const [agentId, agent] of Object.entries(this.agents)) {
      const timeSinceLastSeen = now.getTime() - agent.lastSeen.getTime();
      if (timeSinceLastSeen > timeout && agent.status !== 'OFFLINE') {
        agent.status = 'OFFLINE';
        this.log(`Agent ${agentId} marked as OFFLINE (no heartbeat)`, 'warn');
      }
    }
  }

  /**
   * Log message with timestamp
   */
  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = level === 'warn' ? '⚠️ ' : level === 'error' ? '❌ ' : '';
    console.log(`[${timestamp}] ${prefix}${message}`);
  }

  /**
   * Stop the coordinator
   */
  stop() {
    for (const interval of this.watchIntervals.values()) {
      clearInterval(interval);
    }
    this.log('Coordinator stopped');
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const pollInterval = parseInt(args.find(a => a.startsWith('--poll-interval='))?.split('=')[1] || '2000');
  const verbose = args.includes('--verbose');
  const basePath = args.find(a => a.startsWith('--path='))?.split('=')[1] || './communication';

  // Create sample tasks if requested
  if (args.includes('--create-sample-tasks')) {
    await createSampleTasks(basePath);
  }

  // Start coordinator
  const coordinator = new FileBasedCoordinator(basePath, pollInterval, verbose);
  await coordinator.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down coordinator...');
    coordinator.stop();
    process.exit(0);
  });
}

/**
 * Create sample tasks for testing
 */
async function createSampleTasks(basePath) {
  const tasksPath = path.join(basePath, 'instructions');
  await fs.mkdir(tasksPath, { recursive: true });

  const sampleTask = {
    messageId: `msg-${Date.now()}`,
    type: 'TASK',
    timestamp: new Date().toISOString(),
    from: 'user',
    to: 'any-available-agent',
    priority: 'HIGH',
    task: {
      id: `task-${Date.now()}`,
      type: 'analysis',
      description: 'Analyze sample dataset',
      input: {
        data: [1, 2, 3, 4, 5],
        operation: 'statistical-analysis'
      },
      requirements: {
        capabilities: ['analysis'],
        estimatedDuration: '2 minutes'
      }
    },
    validation: {
      outputFormat: 'json',
      requiredFields: ['mean', 'median', 'stddev']
    }
  };

  const taskFile = path.join(tasksPath, `${sampleTask.task.id}.json`);
  await fs.writeFile(taskFile, JSON.stringify(sampleTask, null, 2));
  console.log(`Created sample task: ${taskFile}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for testing
module.exports = { FileBasedCoordinator };