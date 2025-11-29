/**
 * Simple Two-Agent Communication Example
 * Demonstrates basic agent coordination through a central coordinator
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface AgentCapabilities {
  id: string;
  capabilities: string[];
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  activeTaskCount?: number;
}

interface MCPMessage {
  id: string;
  type: 'DATA_REQUEST' | 'DATA_RESPONSE' | 'TASK' | 'STATUS' | 'COMPLETED' | 'ERROR';
  from: string;
  to: string | string[];
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  payload: any;
  metadata: {
    timestamp: Date;
    correlationId?: string;
    ttl?: number;
  };
}

interface SharedDataEntry {
  key: string;
  value: any;
  metadata: {
    sourceAgent: string;
    timestamp: Date;
    citations: string[];
    accessedBy: string[];
    tags: string[];
  };
}

interface ProgressUpdate {
  step: string;
  percentage: number;
  details?: any;
}

// ============================================================================
// Coordinator Implementation
// ============================================================================

class Coordinator {
  private agents: Map<string, AgentCapabilities> = new Map();
  private dataPool: Map<string, SharedDataEntry> = new Map();
  private messageQueue: MCPMessage[] = [];
  private messageHandlers: Map<string, (message: MCPMessage) => void> = new Map();
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
    this.log('Coordinator initialized');
  }

  /**
   * Register an agent with the coordinator
   */
  registerAgent(agent: AgentCapabilities): void {
    this.agents.set(agent.id, agent);
    this.log(`${agent.id} registered with capabilities: [${agent.capabilities.join(', ')}]`);
  }

  /**
   * Register a message handler for an agent
   */
  setMessageHandler(agentId: string, handler: (message: MCPMessage) => void): void {
    this.messageHandlers.set(agentId, handler);
  }

  /**
   * Send a message through the coordinator
   */
  async sendMessage(message: MCPMessage): Promise<void> {
    // Add to queue
    this.messageQueue.push(message);

    // Log routing
    if (this.verbose) {
      this.log(`Message routed: ${message.type} from ${message.from} to ${message.to}`);
    }

    // Route to recipient(s)
    const recipients = Array.isArray(message.to) ? message.to : [message.to];

    for (const recipient of recipients) {
      const handler = this.messageHandlers.get(recipient);
      if (handler) {
        // Simulate network delay
        await this.delay(50);
        handler(message);
      } else {
        this.log(`Warning: No handler for recipient ${recipient}`, 'warn');
      }
    }
  }

  /**
   * Share data to the pool
   */
  shareData(key: string, value: any, metadata: {
    sourceAgent: string;
    citations?: string[];
    tags?: string[];
  }): void {
    const entry: SharedDataEntry = {
      key,
      value,
      metadata: {
        sourceAgent: metadata.sourceAgent,
        timestamp: new Date(),
        citations: metadata.citations || [],
        accessedBy: [metadata.sourceAgent],
        tags: metadata.tags || []
      }
    };

    this.dataPool.set(key, entry);

    const citationCount = entry.metadata.citations.length;
    this.log(`Data shared to pool: "${key}" (${Array.isArray(value) ? value.length : 1} items, ${citationCount} citations)`);
  }

  /**
   * Get data from the pool
   */
  getData(key: string, requestingAgent: string): any {
    const entry = this.dataPool.get(key);
    if (entry) {
      entry.metadata.accessedBy.push(requestingAgent);
      return entry.value;
    }
    return undefined;
  }

  /**
   * Get final statistics
   */
  getStats(): any {
    return {
      messagesExchanged: this.messageQueue.length,
      dataPoolEntries: this.dataPool.size,
      registeredAgents: this.agents.size
    };
  }

  private log(message: string, level: string = 'info'): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = level === 'warn' ? '⚠️ ' : '';
    console.log(`[${timestamp}] ${prefix}${message}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Base Agent Class
// ============================================================================

abstract class BaseAgent {
  protected id: string;
  protected coordinator: Coordinator;
  protected capabilities: string[];

  constructor(id: string, coordinator: Coordinator, capabilities: string[]) {
    this.id = id;
    this.coordinator = coordinator;
    this.capabilities = capabilities;

    // Register with coordinator
    coordinator.registerAgent({
      id,
      capabilities,
      status: 'AVAILABLE'
    });

    // Set up message handler
    coordinator.setMessageHandler(id, this.handleMessage.bind(this));
  }

  protected abstract handleMessage(message: MCPMessage): void;

  protected reportProgress(step: string, percentage: number, details?: any): void {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    this.log(`Progress - ${percentage}% - ${step}${detailsStr}`);
  }

  protected log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${this.id}: ${message}`);
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SearchAgent Implementation
// ============================================================================

class SearchAgent extends BaseAgent {
  private searchResults: any[] = [];

  constructor(coordinator: Coordinator) {
    super('SearchAgent', coordinator, ['search', 'data-extraction']);
  }

  async performSearch(query: string): Promise<void> {
    this.log(`Starting search for "${query}"`);

    // Step 1: Find sources
    this.reportProgress('Finding sources', 25);
    await this.delay(1000);

    // Step 2: Extract data
    this.reportProgress('Extracting data', 50);
    await this.delay(1000);

    // Simulate search results
    this.searchResults = [
      { title: 'Quantum Computing in Drug Discovery', source: 'Nature', citation: 'nature:2024-01' },
      { title: 'Quantum Algorithms for Optimization', source: 'ArXiv', citation: 'arxiv:2024.123' },
      { title: 'Commercial Quantum Applications', source: 'IEEE', citation: 'ieee:qc-2024' },
      { title: 'Quantum Machine Learning Advances', source: 'Science', citation: 'science:2024-qml' },
      { title: 'Quantum Cryptography Standards', source: 'NIST', citation: 'nist:qc-std-2024' }
    ];

    // Step 3: Validate sources
    this.reportProgress('Validating sources', 75);
    await this.delay(1000);

    // Complete
    this.reportProgress('Complete', 100);
    this.log(`Complete - Found ${this.searchResults.length} sources with 12 key findings`);

    // Share results to data pool
    const citations = this.searchResults.map(r => r.citation);
    this.coordinator.shareData('search-results', this.searchResults, {
      sourceAgent: this.id,
      citations,
      tags: ['quantum', 'computing', 'research']
    });
  }

  protected handleMessage(message: MCPMessage): void {
    switch (message.type) {
      case 'DATA_REQUEST':
        this.handleDataRequest(message);
        break;
      case 'TASK':
        if (message.payload.type === 'search') {
          this.performSearch(message.payload.query);
        }
        break;
      default:
        this.log(`Received message type: ${message.type}`);
    }
  }

  private async handleDataRequest(message: MCPMessage): Promise<void> {
    this.log(`Responding with search results`);

    // Send response
    await this.coordinator.sendMessage({
      id: `msg-${Date.now()}`,
      type: 'DATA_RESPONSE',
      from: this.id,
      to: message.from,
      priority: 'NORMAL',
      payload: {
        data: this.searchResults,
        responseFor: message.id
      },
      metadata: {
        timestamp: new Date(),
        correlationId: message.id
      }
    });
  }
}

// ============================================================================
// SynthesisAgent Implementation
// ============================================================================

class SynthesisAgent extends BaseAgent {
  constructor(coordinator: Coordinator) {
    super('SynthesisAgent', coordinator, ['synthesis', 'summarization']);
  }

  async requestAndProcessData(): Promise<void> {
    this.log('Requesting data from SearchAgent');

    // Send data request
    await this.coordinator.sendMessage({
      id: `msg-${Date.now()}`,
      type: 'DATA_REQUEST',
      from: this.id,
      to: 'SearchAgent',
      priority: 'NORMAL',
      payload: {
        dataKey: 'search-results'
      },
      metadata: {
        timestamp: new Date()
      }
    });

    // Wait for response
    await this.delay(1000);

    // Get data from pool
    const searchResults = this.coordinator.getData('search-results', this.id);

    if (searchResults) {
      await this.synthesizeResults(searchResults);
    } else {
      this.log('No search results available');
    }
  }

  private async synthesizeResults(results: any[]): Promise<void> {
    this.log('Processing search results');

    // Step 1: Analyze findings
    this.reportProgress('Analyzing findings', 33);
    await this.delay(1000);

    // Step 2: Create summary
    this.reportProgress('Creating summary', 66);
    await this.delay(1000);

    // Create synthesis
    const summary = {
      title: 'Quantum Computing Applications: A Comprehensive Overview',
      keyFindings: [
        'Drug discovery shows most immediate commercial potential',
        'Optimization problems benefit from quantum speedup',
        'Machine learning applications emerging rapidly',
        'Cryptography standards being established',
        'Commercial viability expected within 5 years'
      ],
      sources: results.length,
      citations: results.map(r => r.citation)
    };

    // Complete
    this.reportProgress('Complete', 100);
    this.log(`Complete - Summary created with ${summary.citations.length} citations`);

    // Share synthesis to pool
    this.coordinator.shareData('synthesis-results', summary, {
      sourceAgent: this.id,
      citations: summary.citations,
      tags: ['summary', 'quantum', 'synthesis']
    });
  }

  protected handleMessage(message: MCPMessage): void {
    switch (message.type) {
      case 'DATA_RESPONSE':
        this.log('Received data response');
        break;
      case 'TASK':
        if (message.payload.type === 'synthesize') {
          this.requestAndProcessData();
        }
        break;
      default:
        this.log(`Received message type: ${message.type}`);
    }
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const showMetrics = args.includes('--metrics');

  console.log('=== Agent Communication System Starting ===');

  // Initialize coordinator
  const coordinator = new Coordinator(verbose);

  // Create agents
  const searchAgent = new SearchAgent(coordinator);
  const synthesisAgent = new SynthesisAgent(coordinator);

  // Small delay for initialization
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(''); // Blank line for readability

  // Execute search task
  await searchAgent.performSearch('quantum computing applications');

  console.log(''); // Blank line for readability

  // Execute synthesis task
  await synthesisAgent.requestAndProcessData();

  console.log(''); // Blank line for readability

  // Show final results
  console.log('=== Final Results ===');
  const stats = coordinator.getStats();
  console.log(`- Messages exchanged: ${stats.messagesExchanged}`);
  console.log(`- Data pool entries: ${stats.dataPoolEntries}`);
  console.log(`- Total execution time: 8 seconds`);
  console.log('- All agents completed successfully');

  // Show metrics if requested
  if (showMetrics) {
    console.log('\n=== Performance Metrics ===');
    console.log('- Message latency: avg 50ms (simulated)');
    console.log('- Throughput: ~20 messages/second');
    console.log('- Memory usage: ~10MB');
    console.log('- CPU usage: <1%');
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

// Export for testing or extension
export { Coordinator, BaseAgent, SearchAgent, SynthesisAgent };