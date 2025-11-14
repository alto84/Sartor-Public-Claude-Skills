#!/bin/bash
# analyze-coordination.sh
# Analyzes multi-agent coordination in a codebase
#
# Usage: ./analyze-coordination.sh [codebase_directory]

set -e

CODEBASE_DIR="${1:-.}"
REPORT_FILE="coordination-analysis-report.md"

echo "=== Multi-Agent Coordination Analysis ==="
echo "Codebase: $CODEBASE_DIR"
echo "Report will be saved to: $REPORT_FILE"
echo ""

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# Multi-Agent Coordination Analysis Report

Generated: $(date)
Codebase: $CODEBASE_DIR

## Executive Summary

EOF

# Function to count and report
count_and_report() {
    local pattern="$1"
    local description="$2"
    local count

    count=$(find "$CODEBASE_DIR" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" \) \
            -not -path "*/node_modules/*" \
            -not -path "*/.git/*" \
            -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l)

    echo "- $description: $count files"
    echo "- $description: $count files" >> "$REPORT_FILE"

    return "$count"
}

# Analyze consensus mechanisms
echo "## Analyzing Consensus Mechanisms"
echo "" >> "$REPORT_FILE"
echo "## Consensus Mechanisms" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

count_and_report "raft\|RaftConsensus" "Raft consensus implementation"
count_and_report "bft\|BFTConsensus\|byzantine" "BFT consensus implementation"
count_and_report "consensus\|quorum" "General consensus patterns"
count_and_report "leader.*election\|elect.*leader" "Leader election logic"

# Analyze communication patterns
echo ""
echo "## Analyzing Communication Patterns"
echo "" >> "$REPORT_FILE"
echo "## Communication Patterns" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

count_and_report "A2A\|agent.*to.*agent" "Agent-to-agent communication"
count_and_report "semantic.*rout\|SemanticRouter" "Semantic routing"
count_and_report "broadcast\|multicast" "Broadcast communication"
count_and_report "pubsub\|publish.*subscribe" "Pub-sub patterns"
count_and_report "circuit.*breaker\|CircuitBreaker" "Circuit breaker pattern"

# Analyze distributed state
echo ""
echo "## Analyzing Distributed State Management"
echo "" >> "$REPORT_FILE"
echo "## Distributed State Management" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

count_and_report "CRDT\|GCounter\|PNCounter\|LWWRegister" "CRDT implementations"
count_and_report "vector.*clock\|VectorClock\|lamport" "Vector clock usage"
count_and_report "conflict.*detect\|ConflictDetector" "Conflict detection"
count_and_report "merge.*function\|\.merge\(" "Merge operations"
count_and_report "eventual.*consistency" "Eventual consistency patterns"

# Analyze load balancing
echo ""
echo "## Analyzing Load Balancing"
echo "" >> "$REPORT_FILE"
echo "## Load Balancing and Routing" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

count_and_report "load.*balanc\|LoadBalancer" "Load balancer implementation"
count_and_report "round.*robin\|RoundRobin" "Round-robin algorithm"
count_and_report "least.*connection\|LeastConnection" "Least connections algorithm"
count_and_report "weighted.*routing" "Weighted routing"

# Analyze orchestration
echo ""
echo "## Analyzing Orchestration Patterns"
echo "" >> "$REPORT_FILE"
echo "## Orchestration Patterns" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

count_and_report "orchestrat\|Orchestrator" "Orchestrator implementation"
count_and_report "agent.*registry\|AgentRegistry" "Agent registry"
count_and_report "task.*queue\|TaskQueue" "Task queue"
count_and_report "task.*decompos\|decompose.*task" "Task decomposition"
count_and_report "dependency.*graph\|DependencyGraph" "Dependency graphs"

# Analyze coordination protocols
echo ""
echo "## Analyzing Coordination Protocols"
echo "" >> "$REPORT_FILE"
echo "## Coordination Protocols" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

count_and_report "session.*manag\|SessionManager" "Session management"
count_and_report "negotiation\|negotiate" "Negotiation patterns"
count_and_report "collaboration\|collaborate" "Collaboration patterns"
count_and_report "consensus.*build\|reach.*consensus" "Consensus building"

# Identify potential issues
echo ""
echo "## Identifying Potential Issues"
echo "" >> "$REPORT_FILE"
echo "## Potential Issues" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for missing patterns
echo "### Missing Critical Patterns" >> "$REPORT_FILE"

has_consensus=$(find "$CODEBASE_DIR" -type f -name "*.ts" -o -name "*.js" -o -name "*.py" \
                -not -path "*/node_modules/*" \
                -exec grep -l "consensus" {} \; 2>/dev/null | wc -l)

if [ "$has_consensus" -eq 0 ]; then
    echo "- WARNING: No consensus mechanism found" | tee -a "$REPORT_FILE"
else
    has_circuit_breaker=$(find "$CODEBASE_DIR" -type f -name "*.ts" -o -name "*.js" -o -name "*.py" \
                          -not -path "*/node_modules/*" \
                          -exec grep -l "circuit.*breaker\|CircuitBreaker" {} \; 2>/dev/null | wc -l)

    if [ "$has_circuit_breaker" -eq 0 ]; then
        echo "- WARNING: Consensus found but no circuit breaker (risk of cascading failures)" | tee -a "$REPORT_FILE"
    fi
fi

has_state_sync=$(find "$CODEBASE_DIR" -type f -name "*.ts" -o -name "*.js" -o -name "*.py" \
                 -not -path "*/node_modules/*" \
                 -exec grep -l "merge\|CRDT\|sync" {} \; 2>/dev/null | wc -l)

if [ "$has_state_sync" -eq 0 ]; then
    echo "- WARNING: No state synchronization mechanism found" | tee -a "$REPORT_FILE"
fi

# Performance analysis
echo ""
echo "## Performance Indicators"
echo "" >> "$REPORT_FILE"
echo "## Performance Indicators" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Logging and Monitoring" >> "$REPORT_FILE"

count_and_report "logger\|console\.log\|console\.error" "Logging statements"
count_and_report "metric\|monitor\|telemetry" "Monitoring/metrics"
count_and_report "performance\|benchmark" "Performance measurement"
count_and_report "latency\|throughput" "Performance metrics"

# Detailed file listing
echo ""
echo "## Detailed File Analysis"
echo "" >> "$REPORT_FILE"
echo "## Detailed File Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Consensus Implementation Files" >> "$REPORT_FILE"
find "$CODEBASE_DIR" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" \) \
     -not -path "*/node_modules/*" \
     -not -path "*/.git/*" \
     -exec grep -l "consensus\|raft\|bft" {} \; 2>/dev/null | \
     sed 's/^/- /' >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "### Communication Files" >> "$REPORT_FILE"
find "$CODEBASE_DIR" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" \) \
     -not -path "*/node_modules/*" \
     -not -path "*/.git/*" \
     -exec grep -l "A2A\|SemanticRouter\|message.*routing" {} \; 2>/dev/null | \
     sed 's/^/- /' >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "### State Management Files" >> "$REPORT_FILE"
find "$CODEBASE_DIR" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" \) \
     -not -path "*/node_modules/*" \
     -not -path "*/.git/*" \
     -exec grep -l "CRDT\|VectorClock\|ConflictDetector" {} \; 2>/dev/null | \
     sed 's/^/- /' >> "$REPORT_FILE"

# Recommendations
echo ""
echo "## Recommendations"
echo "" >> "$REPORT_FILE"
echo "## Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'RECOMMENDATIONS'
Based on the analysis above, consider the following:

### If using consensus but no circuit breakers:
- Implement circuit breaker pattern to prevent cascading failures
- Reference: SKG Agent Prototype 2 CircuitBreaker implementation

### If no state synchronization found:
- Consider CRDTs for eventual consistency
- Implement vector clocks for causal ordering
- Reference: SKG Agent Prototype 2 CRDT and VectorClock implementations

### If high coupling between agents:
- Consider semantic routing for better decoupling
- Implement agent registry for dynamic discovery
- Reference: SKG Agent Prototype 2 SemanticRouter

### If no monitoring/metrics:
- Add performance monitoring
- Track consensus latency, throughput
- Monitor circuit breaker states
- Track state synchronization overhead

### Performance Optimization:
- Measure baseline performance before optimization
- Consider delta-state synchronization for CRDTs (50-90% bandwidth reduction)
- Implement request batching for consensus (improves throughput)
- Use pre-vote optimization for Raft (reduces election disruptions)

### Fault Tolerance:
- Test failure scenarios (network partitions, Byzantine agents)
- Implement health checks (10-30s intervals)
- Use exponential backoff for retries
- Document recovery procedures

RECOMMENDATIONS

echo ""
echo "=== Analysis Complete ==="
echo "Report saved to: $REPORT_FILE"
echo ""
echo "Summary:"
grep "^- " "$REPORT_FILE" | head -20
