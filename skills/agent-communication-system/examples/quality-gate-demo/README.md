# Quality Gate Demo

This example demonstrates how quality gates validate agent outputs to ensure they meet specified criteria before allowing workflows to proceed.

## What This Example Demonstrates

- **Citation Validation**: Ensures outputs have proper citations and sources
- **Confidence Thresholds**: Validates that agent confidence meets minimum levels
- **Format Validation**: Checks output structure and required fields
- **Peer Review Gates**: Implements multi-agent review processes
- **Gate Failure Handling**: Shows retry and revision workflows
- **Custom Validators**: Demonstrates extensible validation logic

## Quality Gate Flow

```
Agent Output
    ↓
Quality Gate System
    ├─ Citation Check (min 3 sources)
    ├─ Confidence Check (≥ 0.7)
    ├─ Format Validation (schema)
    └─ Peer Review (2 reviewers)
        ↓
    Pass/Fail Decision
        ├─ Pass → Continue Workflow
        └─ Fail → Request Revision
                    ↓
                Retry (max 3)
```

## How to Run

### Prerequisites
```bash
# Install Node.js if not already installed
# No additional dependencies required for the JavaScript version
```

### Running the Example
```bash
# Run basic example
node main.js

# Run with specific scenarios
node main.js --scenario=pass      # All gates pass
node main.js --scenario=fail       # Some gates fail
node main.js --scenario=retry      # Fail then retry successfully

# Run with verbose output
node main.js --verbose

# Run with specific gate configurations
node main.js --min-citations=5 --min-confidence=0.8
```

## Expected Output

### Successful Validation
```
=== Quality Gate System Demo ===
[10:00:00] Initializing quality gates...
[10:00:00] Registered 4 quality gates

[10:00:01] ResearchAgent: Generating research output...
[10:00:02] ResearchAgent: Output ready for validation

=== Running Quality Gates ===

Gate 1: Citation Check
  ✓ Passed: 5 citations found (minimum: 3)
  Sources: [pubmed:123, arxiv:456, nature:789, science:012, ieee:345]

Gate 2: Confidence Threshold
  ✓ Passed: Confidence 0.85 (minimum: 0.7)

Gate 3: Format Validation
  ✓ Passed: All required fields present
  Fields validated: title, abstract, findings, citations, methodology

Gate 4: Peer Review
  ⏳ Requesting peer review...
  Reviewer 1 (ValidationAgent-1): Approved with score 0.9
  Reviewer 2 (ValidationAgent-2): Approved with score 0.88
  ✓ Passed: 2/2 reviewers approved

=== All Gates Passed ===
Output accepted and workflow continues
Total validation time: 3.2 seconds
```

### Failed Validation with Retry
```
=== Quality Gate System Demo ===
[10:00:00] Initializing quality gates...

[10:00:01] ResearchAgent: Generating research output...
[10:00:02] ResearchAgent: Output ready for validation

=== Running Quality Gates ===

Gate 1: Citation Check
  ✗ Failed: Only 2 citations found (minimum: 3)
  Suggested action: Add more peer-reviewed sources

Gate 2: Confidence Threshold
  ✗ Failed: Confidence 0.65 (minimum: 0.7)
  Suggested action: Gather more evidence to increase confidence

=== Gates Failed - Requesting Revision ===
Sending feedback to ResearchAgent...

[10:00:05] ResearchAgent: Revising output based on feedback...
[10:00:06] ResearchAgent: Added 3 more citations
[10:00:07] ResearchAgent: Increased confidence through additional validation

=== Retrying Quality Gates (Attempt 2/3) ===

Gate 1: Citation Check
  ✓ Passed: 5 citations found (minimum: 3)

Gate 2: Confidence Threshold
  ✓ Passed: Confidence 0.78 (minimum: 0.7)

Gate 3: Format Validation
  ✓ Passed: All required fields present

Gate 4: Peer Review
  ✓ Passed: 2/2 reviewers approved

=== All Gates Passed on Retry ===
Output accepted after 1 revision
Total validation time: 7.1 seconds
```

## Key Concepts

### 1. Gate Types

#### Citation Check
```javascript
{
  name: 'citation-check',
  type: 'CITATION_CHECK',
  criteria: {
    minCitations: 3,
    citationTypes: ['pubmed', 'arxiv', 'nature'],
    requirePeerReviewed: true
  },
  blocking: true
}
```

#### Confidence Threshold
```javascript
{
  name: 'confidence-gate',
  type: 'CONFIDENCE_THRESHOLD',
  criteria: {
    minConfidence: 0.7,
    confidenceType: 'weighted'  // or 'average', 'minimum'
  },
  blocking: true
}
```

#### Format Validation
```javascript
{
  name: 'format-check',
  type: 'FORMAT_VALIDATION',
  criteria: {
    requiredFields: ['title', 'abstract', 'findings', 'citations'],
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 10 },
        findings: { type: 'array', minItems: 1 }
      }
    }
  },
  blocking: false  // Warning only
}
```

#### Peer Review
```javascript
{
  name: 'peer-review',
  type: 'PEER_REVIEW',
  criteria: {
    minReviewers: 2,
    minApprovalScore: 0.7,
    reviewerCapabilities: ['domain-expert', 'methodology-validator']
  },
  blocking: true
}
```

### 2. Custom Validators

You can add custom validation logic:

```javascript
{
  name: 'plagiarism-check',
  type: 'CUSTOM',
  criteria: {
    validationFunction: async (output) => {
      const similarity = await checkPlagiarism(output.text);
      return {
        passed: similarity < 0.2,
        score: 1 - similarity,
        reason: `Similarity score: ${(similarity * 100).toFixed(1)}%`
      };
    }
  }
}
```

### 3. Failure Handling

The system provides detailed feedback for failures:

```javascript
{
  passed: false,
  reason: 'Insufficient citations from peer-reviewed sources',
  details: {
    found: ['blog:123', 'wiki:456'],
    required: ['pubmed', 'arxiv', 'nature'],
    missing: 2
  },
  suggestedActions: [
    'Search PubMed for relevant studies',
    'Include ArXiv preprints if applicable',
    'Verify all claims have supporting citations'
  ],
  canRetry: true,
  maxRetries: 3
}
```

## Gate Configuration

### Strict Mode (Research/Medical)
```javascript
const strictGates = {
  citations: { min: 5, requirePeerReviewed: true },
  confidence: { min: 0.9 },
  peerReview: { minReviewers: 3 },
  customChecks: ['plagiarism', 'fact-verification']
}
```

### Balanced Mode (General Purpose)
```javascript
const balancedGates = {
  citations: { min: 3, requirePeerReviewed: false },
  confidence: { min: 0.7 },
  peerReview: { minReviewers: 1 },
  customChecks: ['basic-validation']
}
```

### Fast Mode (Prototyping)
```javascript
const fastGates = {
  citations: { min: 1 },
  confidence: { min: 0.5 },
  peerReview: { skip: true },
  customChecks: []
}
```

## Performance Considerations

- **Citation Validation**: <100ms for checking presence and types
- **Format Validation**: <50ms for schema validation
- **Peer Review**: Variable (depends on reviewer availability)
- **Custom Validators**: Depends on implementation
- **Retry Overhead**: Adds latency but improves quality

## Extending the Example

### Add New Gate Types
```javascript
qualityGateSystem.addGate({
  name: 'ethical-review',
  type: 'CUSTOM',
  criteria: {
    validationFunction: ethicalReviewValidator
  }
});
```

### Implement Weighted Scoring
```javascript
const weightedScore = gates.reduce((total, gate) => {
  return total + (gate.score * gate.weight);
}, 0) / totalWeight;
```

### Add Telemetry
```javascript
qualityGateSystem.on('gate-evaluated', (event) => {
  telemetry.record({
    gate: event.gateName,
    passed: event.passed,
    duration: event.duration,
    agentId: event.agentId
  });
});
```

## Troubleshooting

### Gate Always Fails
- Check criteria thresholds
- Verify input format matches expected schema
- Ensure citations are properly formatted
- Check reviewer availability for peer review gates

### Performance Issues
- Consider caching validation results
- Run non-blocking gates in parallel
- Implement timeout for peer reviews
- Use sampling for expensive validations

### False Positives/Negatives
- Tune confidence thresholds based on domain
- Adjust citation requirements for field
- Calibrate custom validators
- Review peer reviewer qualifications

## Learn More

- See `main.ts` for TypeScript implementation
- Check `validators/` for custom validator examples
- Review `../../templates/` for gate configurations
- Explore peer review implementation details

---
*Part of the Sartor Public Claude Skills Library*