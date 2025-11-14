#!/usr/bin/env python3
"""
Distributed Trace Analyzer

Reconstructs message flows and causal chains from distributed traces.
Based on SKG Agent Prototype 2 vector clock and tracing patterns.

Usage:
    python trace-analyzer.py --logs ./logs/*.log --trace-id abc123
    python trace-analyzer.py --logs ./logs/*.log --analyze-flow
"""

import argparse
import json
import re
from collections import defaultdict
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path


class Span:
    """Represents a span in a distributed trace"""

    def __init__(self, trace_id: str, span_id: str, parent_span_id: Optional[str],
                 node_id: str, operation: str, timestamp: float, duration: float = None,
                 tags: Dict[str, Any] = None):
        self.trace_id = trace_id
        self.span_id = span_id
        self.parent_span_id = parent_span_id
        self.node_id = node_id
        self.operation = operation
        self.timestamp = timestamp
        self.duration = duration
        self.tags = tags or {}
        self.children = []

    def add_child(self, child: 'Span'):
        self.children.append(child)

    def __repr__(self):
        return f'Span({self.operation} on {self.node_id} at {self.timestamp})'


class VectorClock:
    """Vector clock for causality tracking (from SKG implementation)"""

    def __init__(self, clock: Dict[str, int] = None):
        self.clock = clock or {}

    def increment(self, node_id: str):
        self.clock[node_id] = self.clock.get(node_id, 0) + 1

    def merge(self, other: 'VectorClock'):
        """Merge with another vector clock, taking maximum"""
        all_nodes = set(self.clock.keys()) | set(other.clock.keys())
        for node in all_nodes:
            self.clock[node] = max(
                self.clock.get(node, 0),
                other.clock.get(node, 0)
            )

    def compare(self, other: 'VectorClock') -> str:
        """Compare two vector clocks for causality"""
        less = False
        greater = False

        all_nodes = set(self.clock.keys()) | set(other.clock.keys())

        for node in all_nodes:
            self_val = self.clock.get(node, 0)
            other_val = other.clock.get(node, 0)

            if self_val < other_val:
                less = True
            elif self_val > other_val:
                greater = True

        if less and not greater:
            return 'happens-before'
        elif greater and not less:
            return 'happens-after'
        elif not less and not greater:
            return 'equal'
        else:
            return 'concurrent'

    @classmethod
    def from_dict(cls, d: Dict[str, int]) -> 'VectorClock':
        return cls(d.copy())


class TraceReconstructor:
    """Reconstructs complete trace from log entries"""

    def __init__(self):
        self.spans_by_trace: Dict[str, List[Span]] = defaultdict(list)
        self.spans_by_id: Dict[str, Span] = {}

    def add_log_entry(self, entry: Dict[str, Any]):
        """Extract span information from log entry"""
        trace_id = entry.get('traceId')
        if not trace_id:
            return

        span = Span(
            trace_id=trace_id,
            span_id=entry.get('spanId', f'span-{len(self.spans_by_id)}'),
            parent_span_id=entry.get('parentSpanId'),
            node_id=entry.get('nodeId') or entry.get('agentId', 'unknown'),
            operation=entry.get('operation') or entry.get('message', 'unknown'),
            timestamp=entry.get('timestamp', 0),
            duration=entry.get('duration'),
            tags=entry
        )

        self.spans_by_trace[trace_id].append(span)
        self.spans_by_id[span.span_id] = span

    def build_trace_tree(self, trace_id: str) -> Optional[Span]:
        """Build hierarchical trace tree"""
        spans = self.spans_by_trace.get(trace_id, [])
        if not spans:
            return None

        # Sort by timestamp
        spans = sorted(spans, key=lambda s: s.timestamp)

        # Find root span (no parent)
        roots = [s for s in spans if not s.parent_span_id]
        if not roots:
            # No explicit root, use earliest span
            root = spans[0]
        else:
            root = roots[0]

        # Build parent-child relationships
        for span in spans:
            if span.parent_span_id and span.parent_span_id in self.spans_by_id:
                parent = self.spans_by_id[span.parent_span_id]
                parent.add_child(span)

        return root

    def get_critical_path(self, trace_id: str) -> List[Span]:
        """Get critical path (longest chain) through trace"""
        root = self.build_trace_tree(trace_id)
        if not root:
            return []

        def find_longest_path(span: Span) -> List[Span]:
            if not span.children:
                return [span]

            longest_child_path = max(
                (find_longest_path(child) for child in span.children),
                key=len,
                default=[]
            )

            return [span] + longest_child_path

        return find_longest_path(root)

    def analyze_trace(self, trace_id: str) -> Dict[str, Any]:
        """Analyze trace for performance and issues"""
        spans = self.spans_by_trace.get(trace_id, [])
        if not spans:
            return {'error': 'Trace not found'}

        # Calculate total duration
        spans = sorted(spans, key=lambda s: s.timestamp)
        total_duration = spans[-1].timestamp - spans[0].timestamp

        # Find slowest operations
        slow_spans = sorted(
            [s for s in spans if s.duration],
            key=lambda s: s.duration,
            reverse=True
        )[:5]

        # Count operations by node
        ops_by_node = defaultdict(int)
        for span in spans:
            ops_by_node[span.node_id] += 1

        # Find critical path
        critical_path = self.get_critical_path(trace_id)
        critical_path_duration = sum(s.duration for s in critical_path if s.duration) if critical_path else 0

        # Detect potential issues
        issues = []

        # Check for very slow spans
        if slow_spans and slow_spans[0].duration > 1000:
            issues.append({
                'type': 'slow_operation',
                'span': slow_spans[0].operation,
                'duration_ms': slow_spans[0].duration,
                'node': slow_spans[0].node_id
            })

        # Check for unbalanced load
        if ops_by_node:
            max_ops = max(ops_by_node.values())
            min_ops = min(ops_by_node.values())
            if max_ops > min_ops * 3:
                issues.append({
                    'type': 'unbalanced_load',
                    'max_ops': max_ops,
                    'min_ops': min_ops,
                    'message': 'Some nodes doing 3x more work than others'
                })

        return {
            'trace_id': trace_id,
            'total_spans': len(spans),
            'total_duration_ms': total_duration,
            'critical_path_duration_ms': critical_path_duration,
            'parallelism': total_duration / critical_path_duration if critical_path_duration > 0 else 1,
            'nodes_involved': list(ops_by_node.keys()),
            'operations_by_node': dict(ops_by_node),
            'slowest_operations': [
                {'operation': s.operation, 'duration_ms': s.duration, 'node': s.node_id}
                for s in slow_spans
            ],
            'critical_path': [
                {'operation': s.operation, 'node': s.node_id, 'timestamp': s.timestamp}
                for s in critical_path
            ],
            'issues': issues
        }


class MessageFlowAnalyzer:
    """Analyze message flows between nodes"""

    def __init__(self):
        self.messages = []

    def add_message(self, from_node: str, to_node: str, message_type: str,
                    timestamp: float, message_id: str = None):
        self.messages.append({
            'from': from_node,
            'to': to_node,
            'type': message_type,
            'timestamp': timestamp,
            'message_id': message_id
        })

    def analyze_flows(self) -> Dict[str, Any]:
        """Analyze message flows for patterns and issues"""
        # Count messages between nodes
        flows = defaultdict(int)
        for msg in self.messages:
            key = f"{msg['from']} → {msg['to']}"
            flows[key] += 1

        # Find most active flows
        top_flows = sorted(flows.items(), key=lambda x: x[1], reverse=True)[:10]

        # Detect message patterns
        message_types = defaultdict(int)
        for msg in self.messages:
            message_types[msg['type']] += 1

        # Check for message loops (A→B→A)
        loops = []
        msg_by_type = defaultdict(list)
        for msg in self.messages:
            msg_by_type[msg['type']].append(msg)

        for msg_type, msgs in msg_by_type.items():
            # Sort by timestamp
            sorted_msgs = sorted(msgs, key=lambda m: m['timestamp'])

            # Look for A→B followed by B→A
            for i in range(len(sorted_msgs) - 1):
                if (sorted_msgs[i]['from'] == sorted_msgs[i + 1]['to'] and
                        sorted_msgs[i]['to'] == sorted_msgs[i + 1]['from']):
                    loops.append({
                        'type': msg_type,
                        'nodes': [sorted_msgs[i]['from'], sorted_msgs[i]['to']],
                        'timestamps': [sorted_msgs[i]['timestamp'], sorted_msgs[i + 1]['timestamp']]
                    })

        # Detect broadcast storms (one node sending to many)
        broadcasts = defaultdict(int)
        for msg in self.messages:
            broadcasts[msg['from']] += 1

        broadcast_storms = [
            {'node': node, 'message_count': count}
            for node, count in broadcasts.items()
            if count > 100
        ]

        return {
            'total_messages': len(self.messages),
            'unique_flows': len(flows),
            'top_flows': top_flows[:10],
            'message_types': dict(message_types),
            'detected_loops': loops[:5],  # First 5 examples
            'broadcast_storms': broadcast_storms,
            'avg_messages_per_node': len(self.messages) / len(set(m['from'] for m in self.messages)) if self.messages else 0
        }


class TraceVisualizer:
    """Generate text-based visualization of traces"""

    @staticmethod
    def visualize_trace_tree(span: Span, indent: int = 0) -> str:
        """Generate tree visualization of trace"""
        lines = []
        prefix = '  ' * indent

        duration_str = f' ({span.duration}ms)' if span.duration else ''
        lines.append(f'{prefix}├─ {span.operation} [{span.node_id}]{duration_str}')

        for child in span.children:
            child_lines = TraceVisualizer.visualize_trace_tree(child, indent + 1)
            lines.append(child_lines)

        return '\n'.join(lines)

    @staticmethod
    def visualize_timeline(spans: List[Span]) -> str:
        """Generate timeline visualization"""
        if not spans:
            return 'No spans to visualize'

        # Sort by timestamp
        spans = sorted(spans, key=lambda s: s.timestamp)
        start_time = spans[0].timestamp

        lines = []
        lines.append('Timeline:')
        lines.append('─' * 80)

        for span in spans:
            offset = span.timestamp - start_time
            offset_str = f'T+{int(offset):4d}ms'
            duration_str = f' ({span.duration}ms)' if span.duration else ''
            lines.append(f'{offset_str} │ [{span.node_id:10s}] {span.operation}{duration_str}')

        return '\n'.join(lines)

    @staticmethod
    def visualize_message_flow(messages: List[Dict[str, Any]]) -> str:
        """Generate message flow diagram"""
        if not messages:
            return 'No messages to visualize'

        # Get unique nodes
        nodes = sorted(set(m['from'] for m in messages) | set(m['to'] for m in messages))
        node_index = {node: i for i, node in enumerate(nodes)}

        lines = []
        lines.append('Message Flow:')
        lines.append('Nodes: ' + ', '.join(nodes))
        lines.append('─' * 80)

        # Sort messages by timestamp
        sorted_messages = sorted(messages, key=lambda m: m['timestamp'])

        for msg in sorted_messages[:50]:  # Limit to 50 messages
            from_idx = node_index[msg['from']]
            to_idx = node_index[msg['to']]

            # Create arrow visualization
            if from_idx < to_idx:
                arrow = '─' * abs(to_idx - from_idx - 1) + '→'
                line = ' ' * (from_idx * 4) + msg['from'][:3] + arrow + msg['to'][:3]
            else:
                arrow = '←' + '─' * abs(from_idx - to_idx - 1)
                line = ' ' * (to_idx * 4) + msg['to'][:3] + arrow + msg['from'][:3]

            lines.append(f"{line} [{msg['type']}]")

        return '\n'.join(lines)


def parse_log_file(log_file: Path) -> List[Dict[str, Any]]:
    """Parse log file and extract entries"""
    entries = []
    with open(log_file) as f:
        for line in f:
            try:
                # Try JSON format
                entry = json.loads(line)
                entries.append(entry)
            except json.JSONDecodeError:
                # Try to extract structured data from plain text
                # This is a simple example - extend as needed
                match = re.match(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z).*traceId[:\s]+(\S+)', line)
                if match:
                    timestamp_str, trace_id = match.groups()
                    timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00')).timestamp() * 1000
                    entries.append({
                        'timestamp': timestamp,
                        'traceId': trace_id,
                        'message': line.strip()
                    })

    return entries


def main():
    parser = argparse.ArgumentParser(description='Analyze distributed traces')
    parser.add_argument('--logs', nargs='+', required=True, help='Log files to analyze')
    parser.add_argument('--trace-id', help='Specific trace ID to analyze')
    parser.add_argument('--analyze-flow', action='store_true', help='Analyze message flows')
    parser.add_argument('--visualize', action='store_true', help='Generate visualizations')
    parser.add_argument('--output', help='Output file for analysis')

    args = parser.parse_args()

    # Load logs
    all_entries = []
    for log_pattern in args.logs:
        for log_file in Path('.').glob(log_pattern):
            entries = parse_log_file(log_file)
            all_entries.extend(entries)
            print(f'Loaded {len(entries)} entries from {log_file}')

    # Build trace reconstructor
    reconstructor = TraceReconstructor()
    for entry in all_entries:
        reconstructor.add_log_entry(entry)

    results = {}

    if args.trace_id:
        # Analyze specific trace
        print(f'\nAnalyzing trace: {args.trace_id}')
        analysis = reconstructor.analyze_trace(args.trace_id)
        results['trace_analysis'] = analysis

        print(json.dumps(analysis, indent=2))

        if args.visualize:
            root = reconstructor.build_trace_tree(args.trace_id)
            if root:
                print('\nTrace Tree:')
                print(TraceVisualizer.visualize_trace_tree(root))

                spans = reconstructor.spans_by_trace[args.trace_id]
                print('\nTimeline:')
                print(TraceVisualizer.visualize_timeline(spans))

    if args.analyze_flow:
        # Analyze message flows
        print('\nAnalyzing message flows...')
        flow_analyzer = MessageFlowAnalyzer()

        # Extract message events
        for entry in all_entries:
            if entry.get('from') and entry.get('to'):
                flow_analyzer.add_message(
                    from_node=entry['from'],
                    to_node=entry['to'],
                    message_type=entry.get('type', 'unknown'),
                    timestamp=entry.get('timestamp', 0),
                    message_id=entry.get('messageId')
                )

        flow_analysis = flow_analyzer.analyze_flows()
        results['flow_analysis'] = flow_analysis

        print(json.dumps(flow_analysis, indent=2))

        if args.visualize and flow_analyzer.messages:
            print('\nMessage Flow Diagram:')
            print(TraceVisualizer.visualize_message_flow(flow_analyzer.messages))

    if args.output:
        Path(args.output).write_text(json.dumps(results, indent=2))
        print(f'\nResults written to: {args.output}')


if __name__ == '__main__':
    main()
