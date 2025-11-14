#!/usr/bin/env python3
"""
Distributed System Debug Analyzer

Analyzes logs and traces for common distributed system issues.
Based on patterns from SKG Agent Prototype 2 debugging experience.

Usage:
    python debug-distributed-system.py --logs ./logs/*.log --check consensus
    python debug-distributed-system.py --logs ./logs/*.log --check all --report debug-report.md
"""

import argparse
import json
import re
from collections import defaultdict, Counter
from datetime import datetime
from typing import List, Dict, Any, Set
from pathlib import Path


class LogEntry:
    """Parsed log entry with structured data"""

    def __init__(self, timestamp: float, level: str, message: str,
                 node_id: str = None, trace_id: str = None, data: Dict = None):
        self.timestamp = timestamp
        self.level = level
        self.message = message
        self.node_id = node_id
        self.trace_id = trace_id
        self.data = data or {}

    @classmethod
    def parse(cls, line: str) -> 'LogEntry':
        """Parse a log line into structured entry"""
        # Try JSON format first (from SKG structured logging)
        try:
            entry = json.loads(line)
            return cls(
                timestamp=entry.get('timestamp', 0),
                level=entry.get('level', 'INFO'),
                message=entry.get('message', ''),
                node_id=entry.get('nodeId') or entry.get('agentId'),
                trace_id=entry.get('traceId'),
                data=entry
            )
        except json.JSONDecodeError:
            pass

        # Try timestamp-prefixed format
        match = re.match(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+\[(\w+)\]:\s+(.*)', line)
        if match:
            timestamp_str, level, message = match.groups()
            timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00')).timestamp()

            # Extract node_id from message if present
            node_match = re.search(r'node[_-]?(\w+)|agent[_-]?(\w+)', message, re.IGNORECASE)
            node_id = node_match.group(1) or node_match.group(2) if node_match else None

            return cls(timestamp=timestamp, level=level, message=message, node_id=node_id)

        # Fallback: treat as simple message
        return cls(timestamp=0, level='INFO', message=line.strip())


class ConsensusAnalyzer:
    """Analyze consensus-related issues"""

    def analyze(self, logs: List[LogEntry]) -> Dict[str, Any]:
        issues = []
        consensus_events = [l for l in logs if 'consensus' in l.message.lower()]

        # Check for consensus timeouts
        timeouts = [l for l in consensus_events if 'timeout' in l.message.lower()]
        if timeouts:
            issues.append({
                'type': 'consensus_timeout',
                'severity': 'high',
                'count': len(timeouts),
                'message': f'Found {len(timeouts)} consensus timeout events',
                'recommendation': 'Check for silent failures or network partitions'
            })

        # Check for silent failures (expected votes not received)
        vote_events = [l for l in consensus_events if 'vote' in l.message.lower()]
        votes_by_node = defaultdict(int)
        for event in vote_events:
            if event.node_id:
                votes_by_node[event.node_id] += 1

        if votes_by_node:
            avg_votes = sum(votes_by_node.values()) / len(votes_by_node)
            silent_nodes = [node for node, count in votes_by_node.items()
                            if count < avg_votes * 0.5]  # Less than 50% of average

            if silent_nodes:
                issues.append({
                    'type': 'silent_failures',
                    'severity': 'high',
                    'nodes': silent_nodes,
                    'message': f'Nodes {silent_nodes} participating in <50% of votes',
                    'recommendation': 'Investigate network connectivity or node health'
                })

        # Check for Byzantine behavior (unexpected vote patterns)
        reject_votes = [l for l in vote_events if 'reject' in l.message.lower()]
        if len(reject_votes) > len(vote_events) * 0.3:  # >30% rejections
            issues.append({
                'type': 'high_rejection_rate',
                'severity': 'medium',
                'count': len(reject_votes),
                'total': len(vote_events),
                'percentage': (len(reject_votes) / len(vote_events)) * 100,
                'message': f'High vote rejection rate: {len(reject_votes)}/{len(vote_events)}',
                'recommendation': 'Check for Byzantine agents or conflicting proposals'
            })

        return {
            'category': 'consensus',
            'issues_found': len(issues),
            'issues': issues
        }


class MessageOrderingAnalyzer:
    """Analyze message ordering issues"""

    def analyze(self, logs: List[LogEntry]) -> Dict[str, Any]:
        issues = []

        # Group by trace_id
        traces = defaultdict(list)
        for log in logs:
            if log.trace_id:
                traces[log.trace_id].append(log)

        # Check for out-of-order message delivery
        for trace_id, events in traces.items():
            sorted_events = sorted(events, key=lambda e: e.timestamp)

            # Look for response before request
            request_idx = None
            response_idx = None
            for i, event in enumerate(sorted_events):
                if 'request' in event.message.lower():
                    request_idx = i
                if 'response' in event.message.lower():
                    response_idx = i

            if request_idx is not None and response_idx is not None:
                if response_idx < request_idx:
                    issues.append({
                        'type': 'causal_ordering_violation',
                        'severity': 'high',
                        'trace_id': trace_id,
                        'message': 'Response logged before request',
                        'recommendation': 'Check vector clocks and message ordering'
                    })

        # Check for duplicate message IDs
        message_ids = [l.data.get('messageId') for l in logs if l.data.get('messageId')]
        duplicates = [msg_id for msg_id, count in Counter(message_ids).items() if count > 1]
        if duplicates:
            issues.append({
                'type': 'duplicate_messages',
                'severity': 'medium',
                'count': len(duplicates),
                'message_ids': duplicates[:5],  # First 5 examples
                'message': f'Found {len(duplicates)} duplicate message IDs',
                'recommendation': 'Check for message replay or idempotency issues'
            })

        return {
            'category': 'message_ordering',
            'issues_found': len(issues),
            'issues': issues
        }


class StateSyncAnalyzer:
    """Analyze state synchronization issues"""

    def analyze(self, logs: List[LogEntry]) -> Dict[str, Any]:
        issues = []

        # Check for state divergence
        state_updates = [l for l in logs if 'state' in l.message.lower() and
                         ('update' in l.message.lower() or 'sync' in l.message.lower())]

        # Group state updates by node
        updates_by_node = defaultdict(list)
        for event in state_updates:
            if event.node_id:
                updates_by_node[event.node_id].append(event)

        # Check if nodes have very different update counts (suggesting divergence)
        if len(updates_by_node) > 1:
            counts = [len(events) for events in updates_by_node.values()]
            avg_count = sum(counts) / len(counts)
            max_count = max(counts)
            min_count = min(counts)

            if max_count > avg_count * 2 or min_count < avg_count * 0.5:
                issues.append({
                    'type': 'state_divergence',
                    'severity': 'high',
                    'message': 'Nodes have significantly different state update counts',
                    'max_updates': max_count,
                    'min_updates': min_count,
                    'avg_updates': avg_count,
                    'recommendation': 'Check for network partitions or sync failures'
                })

        # Check for conflict resolution
        conflicts = [l for l in logs if 'conflict' in l.message.lower()]
        if conflicts:
            issues.append({
                'type': 'state_conflicts',
                'severity': 'medium',
                'count': len(conflicts),
                'message': f'Found {len(conflicts)} state conflict events',
                'recommendation': 'Review conflict resolution strategy (CRDTs, consensus)'
            })

        return {
            'category': 'state_synchronization',
            'issues_found': len(issues),
            'issues': issues
        }


class NetworkPartitionAnalyzer:
    """Analyze network partition issues"""

    def analyze(self, logs: List[LogEntry]) -> Dict[str, Any]:
        issues = []

        # Look for partition-related keywords
        partition_events = [l for l in logs if any(keyword in l.message.lower()
                                                    for keyword in ['partition', 'split-brain', 'unreachable'])]

        if partition_events:
            issues.append({
                'type': 'network_partition_detected',
                'severity': 'critical',
                'count': len(partition_events),
                'message': f'Found {len(partition_events)} partition-related events',
                'recommendation': 'Check network connectivity, implement partition recovery'
            })

        # Check for connection failures
        connection_failures = [l for l in logs if any(keyword in l.message.lower()
                                                       for keyword in ['connection refused', 'timeout',
                                                                       'unreachable', 'connection reset'])]

        # Group by node to find which nodes are affected
        failures_by_node = defaultdict(int)
        for event in connection_failures:
            if event.node_id:
                failures_by_node[event.node_id] += 1

        if failures_by_node:
            critical_nodes = [node for node, count in failures_by_node.items() if count > 10]
            if critical_nodes:
                issues.append({
                    'type': 'connection_failures',
                    'severity': 'high',
                    'nodes': critical_nodes,
                    'message': f'Nodes with high connection failure rates: {critical_nodes}',
                    'recommendation': 'Check network infrastructure and node health'
                })

        return {
            'category': 'network_partition',
            'issues_found': len(issues),
            'issues': issues
        }


class PerformanceAnalyzer:
    """Analyze performance issues"""

    def analyze(self, logs: List[LogEntry]) -> Dict[str, Any]:
        issues = []

        # Extract latency/duration values
        latencies = []
        for log in logs:
            if 'duration' in log.data:
                latencies.append(log.data['duration'])
            else:
                match = re.search(r'duration[:\s]+(\d+)', log.message)
                if match:
                    latencies.append(int(match.group(1)))

        if latencies:
            avg_latency = sum(latencies) / len(latencies)
            max_latency = max(latencies)
            p95_latency = sorted(latencies)[int(len(latencies) * 0.95)] if len(latencies) > 20 else max_latency

            if p95_latency > 1000:  # >1 second
                issues.append({
                    'type': 'high_latency',
                    'severity': 'high',
                    'avg_ms': round(avg_latency, 2),
                    'p95_ms': round(p95_latency, 2),
                    'max_ms': max_latency,
                    'message': f'High p95 latency: {p95_latency}ms',
                    'recommendation': 'Profile slow operations, check for resource exhaustion'
                })

        # Check for resource exhaustion
        oom_errors = [l for l in logs if 'out of memory' in l.message.lower() or 'oom' in l.message.lower()]
        if oom_errors:
            issues.append({
                'type': 'out_of_memory',
                'severity': 'critical',
                'count': len(oom_errors),
                'message': f'Found {len(oom_errors)} OOM errors',
                'recommendation': 'Investigate memory leaks, increase memory allocation'
            })

        # Check error rate
        errors = [l for l in logs if l.level in ['ERROR', 'CRITICAL']]
        if logs:
            error_rate = len(errors) / len(logs)
            if error_rate > 0.05:  # >5% errors
                issues.append({
                    'type': 'high_error_rate',
                    'severity': 'high',
                    'error_count': len(errors),
                    'total_logs': len(logs),
                    'error_rate': round(error_rate * 100, 2),
                    'message': f'High error rate: {error_rate * 100:.1f}%',
                    'recommendation': 'Investigate most common errors'
                })

        return {
            'category': 'performance',
            'issues_found': len(issues),
            'issues': issues
        }


class DebugReportGenerator:
    """Generate markdown debug report"""

    def generate(self, results: List[Dict[str, Any]], output_path: str = None):
        report = []
        report.append('# Distributed System Debug Report\n')
        report.append(f'**Generated**: {datetime.now().isoformat()}\n')
        report.append('---\n')

        # Summary
        total_issues = sum(r['issues_found'] for r in results)
        report.append(f'## Summary\n')
        report.append(f'**Total Issues Found**: {total_issues}\n')
        report.append('')

        # Issues by category
        for result in results:
            if result['issues_found'] == 0:
                continue

            report.append(f'## {result["category"].replace("_", " ").title()}\n')
            report.append(f'**Issues Found**: {result["issues_found"]}\n')

            for issue in result['issues']:
                severity_emoji = {
                    'critical': '🔴',
                    'high': '🟠',
                    'medium': '🟡',
                    'low': '🟢'
                }.get(issue['severity'], '⚪')

                report.append(f'\n### {severity_emoji} {issue["type"].replace("_", " ").title()}\n')
                report.append(f'**Severity**: {issue["severity"].upper()}\n')
                report.append(f'**Message**: {issue["message"]}\n')

                if 'recommendation' in issue:
                    report.append(f'**Recommendation**: {issue["recommendation"]}\n')

                # Add additional details
                for key, value in issue.items():
                    if key not in ['type', 'severity', 'message', 'recommendation']:
                        report.append(f'- **{key}**: {value}\n')

            report.append('')

        # Recommendations
        report.append('## Overall Recommendations\n')
        if total_issues == 0:
            report.append('No significant issues detected. System appears healthy.\n')
        else:
            report.append('1. Address critical issues immediately\n')
            report.append('2. Investigate high-severity issues within 24 hours\n')
            report.append('3. Monitor medium-severity issues\n')
            report.append('4. Review debug methodology in reference/debugging-methodology.md\n')

        report_text = '\n'.join(report)

        if output_path:
            Path(output_path).write_text(report_text)
            print(f'Report written to: {output_path}')
        else:
            print(report_text)


def main():
    parser = argparse.ArgumentParser(description='Analyze distributed system logs for common issues')
    parser.add_argument('--logs', nargs='+', required=True, help='Log files to analyze')
    parser.add_argument('--check', choices=['consensus', 'message-ordering', 'state-sync',
                                            'network-partition', 'performance', 'all'], default='all',
                        help='Type of issues to check')
    parser.add_argument('--report', help='Output markdown report to file')
    parser.add_argument('--json', help='Output JSON report to file')

    args = parser.parse_args()

    # Load all logs
    all_logs = []
    for log_pattern in args.logs:
        for log_file in Path('.').glob(log_pattern):
            with open(log_file) as f:
                for line in f:
                    entry = LogEntry.parse(line)
                    all_logs.append(entry)

    print(f'Loaded {len(all_logs)} log entries from {len(args.logs)} files')

    # Run analyzers
    analyzers = {
        'consensus': ConsensusAnalyzer(),
        'message-ordering': MessageOrderingAnalyzer(),
        'state-sync': StateSyncAnalyzer(),
        'network-partition': NetworkPartitionAnalyzer(),
        'performance': PerformanceAnalyzer()
    }

    results = []
    if args.check == 'all':
        for name, analyzer in analyzers.items():
            print(f'Running {name} analysis...')
            result = analyzer.analyze(all_logs)
            results.append(result)
    else:
        analyzer = analyzers[args.check]
        result = analyzer.analyze(all_logs)
        results.append(result)

    # Generate report
    if args.json:
        Path(args.json).write_text(json.dumps(results, indent=2))
        print(f'JSON report written to: {args.json}')

    report_gen = DebugReportGenerator()
    report_gen.generate(results, args.report)


if __name__ == '__main__':
    main()
