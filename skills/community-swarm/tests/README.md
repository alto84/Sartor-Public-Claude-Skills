# Community Swarm Validation Framework
## Agent 10 Contribution: Complete Testing & Validation

### Overview

This validation framework ensures the community-swarm skill operates correctly with 8-10 agents following evidence-based principles. It validates proper orchestration delegation, reliable communication, hook execution, and multi-agent collaboration.

### Quick Start

```bash
# Run all validation tests
./run-validation.sh

# Run specific test suite
npm test -- --testNamePattern="Evidence"

# Generate validation report
./run-validation.sh --report-only

# Run stress tests only
npm test -- --testNamePattern="Stress"
```

### Test Categories

#### 1. Evidence-Based Compliance Tests (EBC/UNC/CON)
Validates that the swarm follows evidence-based principles:
- **No Fabrication**: All metrics and data are real and traceable
- **Citations**: Every claim has proper references
- **Uncertainty**: Appropriate expression of confidence levels
- **Creative Latitude**: Agents maintain personality within constraints

#### 2. Communication Tests (COM/BRD/AST/DAT)
Ensures reliable inter-agent communication:
- **Direct Messaging**: Point-to-point message delivery
- **Broadcasts**: One-to-many communication patterns
- **Assistance Protocol**: Help request routing
- **Data Sharing**: Shared pool with provenance tracking

#### 3. Orchestrator Delegation Tests (DEL/DEC/CTX)
Verifies the orchestrator delegates and never executes:
- **Task Delegation**: All work assigned to specialized agents
- **Complex Decomposition**: Multi-step tasks broken down properly
- **Context Protection**: Orchestrator never sees raw data

#### 4. Hook Execution Tests (HOOK/COMM-HOOK/QG-HOOK)
Validates lifecycle and event hooks:
- **Lifecycle Hooks**: pre/post spawn, task, shutdown
- **Communication Hooks**: pre-send, post-receive, timeout
- **Quality Gates**: Multi-stage validation checkpoints

#### 5. Integration Tests (INT)
End-to-end validation of the complete system:
- **Full Swarm Startup**: All 10 agents initialize
- **Task Execution Flow**: Complete task processing
- **Multi-Agent Collaboration**: Agents work together

#### 6. Stress Tests (STRESS)
System performance under load:
- **High Message Volume**: 1000 messages/second
- **Concurrent Tasks**: 50 simultaneous operations
- **Failure Recovery**: Agent crash handling

### Test Infrastructure

```
tests/
├── validation-suite.ts      # Main test implementation
├── run-validation.sh        # Test runner script
├── README.md               # This file
├── reports/                # Generated test reports
│   └── validation_report_*.md
└── logs/                   # Test execution logs
    ├── ebc-*.log
    ├── com-*.log
    └── stress-*.log
```

### Key Validation Points

#### ✅ MUST PASS Criteria

1. **Orchestrator Never Works**
   - Zero direct task execution
   - Zero file access
   - Only receives summaries < 500 words

2. **Evidence-Based Compliance**
   - 100% citation coverage
   - No fabricated data
   - Confidence scores on all outputs

3. **Agent Count**
   - Minimum 8 agents operational
   - Maximum 10 agents supported
   - All agents registered and communicating

4. **Communication Reliability**
   - Message delivery > 95%
   - Latency p99 < 500ms
   - No deadlocks detected

5. **Quality Gates**
   - All gates firing
   - 85-95% pass rate (not too high, not too low)
   - Proper rejection of non-compliant outputs

### Running Tests

#### Basic Test Execution
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific category
npm test -- --testNamePattern="Communication"

# Run with verbose output
npm test -- --verbose
```

#### Advanced Test Options
```bash
# Parallel execution
npm test -- --maxWorkers=4

# Watch mode for development
npm test -- --watch

# Debug mode
npm test -- --detectOpenHandles

# Generate JSON report
npm test -- --json --outputFile=report.json
```

### Test Metrics & Thresholds

| Metric | Target | Critical | Description |
|--------|--------|----------|-------------|
| Agent Spawn Time | < 2s | < 5s | Time to initialize one agent |
| Message Latency p50 | < 100ms | < 200ms | Median message delivery time |
| Message Latency p99 | < 500ms | < 1000ms | 99th percentile latency |
| Task Completion | > 95% | > 90% | Successfully completed tasks |
| Quality Gate Pass | 85-95% | 80-98% | Optimal rejection rate |
| Evidence Compliance | > 98% | > 95% | Claims with citations |
| Delegation Rate | 100% | 100% | Orchestrator delegation |
| Hook Execution | 100% | 100% | All hooks must fire |
| Recovery Time | < 1s | < 3s | Agent failure detection |

### Validation Reports

Reports are generated in Markdown format with:
- Executive summary
- Compliance checklist
- Performance metrics
- Detailed test results
- Improvement suggestions
- Pass/Fail certification

Example report structure:
```markdown
# Community Swarm Validation Report
- Total Tests: 47
- Passed: 47
- Failed: 0
- Compliance Score: 98.7%
```

### Continuous Integration

#### GitHub Actions Integration
```yaml
name: Validate Community Swarm
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: ./tests/run-validation.sh
      - uses: actions/upload-artifact@v2
        with:
          name: validation-report
          path: tests/reports/
```

#### Pre-Commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running community swarm validation..."
cd skills/community-swarm
./tests/run-validation.sh --quick

if [ $? -ne 0 ]; then
    echo "Validation failed. Commit aborted."
    exit 1
fi
```

### Debugging Failed Tests

#### Common Issues and Solutions

1. **Communication Timeout**
   - Check agent registration
   - Verify message queue not full
   - Ensure no network issues

2. **Quality Gate Failures**
   - Review evidence compliance
   - Check citation formatting
   - Verify confidence scores

3. **Orchestrator Violation**
   - Audit message payloads
   - Check summary length
   - Verify delegation logic

4. **Hook Not Firing**
   - Confirm hook registration
   - Check event triggers
   - Review timing requirements

#### Debug Commands
```bash
# Enable debug logging
DEBUG=swarm:* npm test

# Run single test with inspection
node --inspect-brk node_modules/.bin/jest --runInBand

# Check specific agent logs
tail -f logs/agent-*.log

# Monitor message queue
npm run monitor:messages

# Analyze hook execution
npm run analyze:hooks
```

### Validation Checklist

Before considering the swarm production-ready:

- [ ] All 47 validation tests passing
- [ ] Stress tests show > 95% reliability
- [ ] No orchestrator violations detected
- [ ] Evidence compliance > 98%
- [ ] All 10 agents operational
- [ ] Communication matrix complete
- [ ] Hooks firing correctly
- [ ] Quality gates functional
- [ ] Monitor generating suggestions
- [ ] Audit trail complete

### Support & Troubleshooting

For issues with the validation framework:

1. Check test logs in `tests/logs/`
2. Review the validation report in `tests/reports/`
3. Run tests with `--verbose` flag for detailed output
4. Ensure all dependencies are installed
5. Verify Node.js version compatibility

### Contributing

When adding new validation tests:

1. Follow the naming convention (TEST_CATEGORY-NUMBER)
2. Add to appropriate test suite
3. Update thresholds if needed
4. Document in this README
5. Ensure backwards compatibility

### License

This validation framework is part of the Community Swarm skill and follows the same licensing terms.

---
*Agent 10 Validation Framework - Ensuring swarm reliability through comprehensive testing*