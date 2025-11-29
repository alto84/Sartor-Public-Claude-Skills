# Glossary

Common terms used in agent communication systems.

## A

- **Agent**: An autonomous software component capable of perceiving its environment, making decisions, and taking actions to achieve specific goals. In communication systems, agents can send and receive messages, process information, and collaborate with other agents.

- **Agent Registry**: A centralized database or service that maintains a list of all active agents in the system, including their capabilities, addresses, and current status.

- **Acknowledgment (ACK)**: A signal sent by a receiving agent to confirm that a message has been successfully received and processed.

- **Assistance Request**: A formal message structure used by one agent to request help or resources from another agent, typically including context, requirements, and expected outcomes.

- **Async Communication**: Message exchange pattern where the sender does not wait for an immediate response, allowing agents to continue processing other tasks.

- **Audit Trail**: A chronological record of all agent communications and actions, used for debugging, compliance, and system analysis.

## B

- **Backpressure**: A flow control mechanism where a receiving agent signals to senders to slow down message transmission when its processing capacity is exceeded.

- **Broadcast**: Sending a message to all agents in the system simultaneously, without targeting specific recipients.

- **Buffer**: Temporary storage area for messages waiting to be processed, helping manage varying processing speeds between agents.

## C

- **Capability Discovery**: The process by which agents identify and catalog the skills and services available from other agents in the system.

- **Channel**: A logical communication path between agents, which may be implemented through various protocols (HTTP, WebSocket, file system, etc.).

- **Circuit Breaker**: A design pattern that prevents an agent from repeatedly attempting failed operations, temporarily blocking requests to allow recovery time.

- **Collaboration Protocol**: A formal specification defining how multiple agents work together to achieve a common goal, including message formats, sequencing, and error handling.

- **Consensus**: Agreement among multiple agents on a particular value or decision, often achieved through voting or Byzantine fault tolerance algorithms.

- **Context Propagation**: The automatic forwarding of metadata (like correlation IDs, user context, or trace information) through a chain of agent communications.

- **Coordinator**: A specialized agent responsible for orchestrating the activities of other agents, managing workflows, and ensuring proper sequencing of operations.

- **Correlation ID**: A unique identifier that links related messages across multiple agent interactions, enabling request tracing and debugging.

## D

- **Dead Letter Queue**: A special queue that stores messages that cannot be delivered or processed after multiple attempts, preventing message loss.

- **Deadlock**: A situation where two or more agents are waiting for each other to release resources, resulting in a system standstill.

- **Delegation**: The process of an agent assigning a task or responsibility to another agent better suited to handle it.

- **Discovery Service**: A system component that helps agents find and connect with other agents based on capabilities, availability, or other criteria.

## E

- **Endpoint**: A specific network address or file location where an agent can receive messages.

- **Event Sourcing**: A pattern where all changes to agent state are stored as a sequence of events, enabling replay and audit capabilities.

- **Eventually Consistent**: A consistency model where agents may temporarily have different views of shared data, but will converge to the same state given time.

## F

- **Failover**: The automatic switching to a backup agent when the primary agent becomes unavailable.

- **Fanout**: A messaging pattern where one message is distributed to multiple recipients simultaneously.

- **Federation**: The ability for agents from different systems or organizations to communicate and collaborate using agreed-upon protocols.

- **File Lock**: A mechanism preventing multiple agents from simultaneously modifying the same file in file-based communication systems.

## G

- **Gateway Agent**: An agent that acts as an intermediary between different communication protocols or systems, translating messages as needed.

- **Gossip Protocol**: A peer-to-peer communication pattern where agents randomly share information with neighbors to eventually propagate data throughout the network.

## H

- **Handshake**: Initial exchange of messages between agents to establish communication parameters, verify identity, and agree on protocols.

- **Heartbeat**: Regular signals sent by an agent to indicate it is still active and responsive.

- **Hierarchical Communication**: A structured pattern where agents are organized in a tree-like structure with clear parent-child relationships.

- **Hub-and-Spoke**: A centralized communication topology where all agents connect through a central hub rather than directly to each other.

## I

- **Idempotent Operation**: An operation that produces the same result regardless of how many times it's performed, important for retry logic.

- **Inter-Agent Protocol**: The agreed-upon rules and formats for communication between different agents.

- **Interoperability**: The ability of agents built with different technologies or frameworks to communicate effectively.

## L

- **Latency**: The time delay between sending a message and receiving a response.

- **Load Balancing**: Distributing work evenly across multiple agents to optimize resource utilization and prevent overload.

- **Lock**: A synchronization mechanism preventing multiple agents from accessing shared resources simultaneously.

## M

- **MCP (Model Context Protocol)**: A standardized protocol for communication between AI models and tools, enabling consistent interaction patterns.

- **Message**: The basic unit of communication between agents, containing data and metadata.

- **Message Bus**: A shared communication infrastructure that enables agents to send and receive messages without direct connections.

- **Message Queue**: A buffer that stores messages for asynchronous processing, ensuring reliable delivery even when recipients are temporarily unavailable.

- **Middleware**: Software layer that provides common services and capabilities to agents, such as message routing, transformation, and monitoring.

- **Multicast**: Sending a message to a specific group of agents, as opposed to broadcast (all) or unicast (one).

## N

- **Negotiation**: The process by which agents reach agreement on task allocation, resource sharing, or conflict resolution.

- **Network Partition**: A failure condition where groups of agents cannot communicate with each other, potentially leading to split-brain scenarios.

## O

- **Orchestration**: Centralized coordination of multiple agents to execute complex workflows or business processes.

- **Ordering Guarantee**: Ensures messages are processed in a specific sequence, such as FIFO (First In, First Out) or causal ordering.

## P

- **Payload**: The actual data content of a message, excluding headers and metadata.

- **Peer-to-Peer (P2P)**: Direct communication between agents without intermediary coordinators or hubs.

- **Pipeline**: A series of agents where each processes and transforms data before passing it to the next.

- **Polling**: Repeatedly checking for new messages or status updates at regular intervals.

- **Protocol**: The formal rules governing the format, timing, and error handling of agent communications.

- **Publish-Subscribe**: A messaging pattern where agents subscribe to topics and receive all messages published to those topics.

## Q

- **Quality Gate**: A checkpoint that evaluates whether agent output meets predefined quality criteria before proceeding.

- **Quality of Service (QoS)**: Guarantees about message delivery, such as at-least-once, at-most-once, or exactly-once delivery.

- **Queue**: A data structure storing messages in order for sequential processing.

- **Quorum**: The minimum number of agents that must agree before a decision is considered valid.

## R

- **Rate Limiting**: Restricting the number of messages an agent can send or receive within a time period.

- **Registry**: See Agent Registry.

- **Reliability**: The probability that messages will be successfully delivered and processed.

- **Request-Response**: A synchronous communication pattern where an agent sends a request and waits for a reply.

- **Retry Logic**: Automated attempts to resend failed messages with configurable backoff strategies.

- **Routing**: Determining the path messages should take through the agent network to reach their destination.

## S

- **Saga Pattern**: A sequence of transactions across multiple agents where each transaction can be compensated if later steps fail.

- **Scalability**: The ability to handle increasing numbers of agents or messages by adding resources.

- **Schema**: The formal structure and validation rules for messages exchanged between agents.

- **Semantic Interoperability**: The ability of agents to understand the meaning of exchanged information, not just its format.

- **Service Discovery**: The process of automatically finding available agent services in a distributed system.

- **Session**: A series of related interactions between agents, maintaining context across multiple messages.

- **Shared Memory**: A communication method where agents exchange data through commonly accessible memory regions.

- **State Machine**: A model defining agent behavior based on current state and received messages.

- **Store-and-Forward**: A communication method where messages are saved before being transmitted to ensure reliability.

- **Synchronous Communication**: Message exchange where the sender waits for a response before continuing.

## T

- **Throttling**: Limiting the rate of message processing to prevent system overload.

- **Timeout**: Maximum time an agent will wait for a response before considering the operation failed.

- **Topic**: A named channel or category used in publish-subscribe systems to route messages to interested subscribers.

- **Transaction**: A group of operations that must all succeed or all fail together.

- **Transport Layer**: The underlying mechanism used to move messages between agents (TCP, HTTP, files, etc.).

## U

- **Unicast**: Sending a message to exactly one specific recipient agent.

- **Uniform Interface**: Consistent message formats and protocols across all agent interactions.

## V

- **Validation**: Checking that messages conform to expected format and contain required information.

- **Version Control**: Managing different versions of agent protocols to ensure backward compatibility.

- **Virtual Agent**: An abstraction representing multiple physical agents as a single logical entity.

## W

- **Webhook**: An HTTP callback triggered when specific events occur in an agent system.

- **Workflow**: A predefined sequence of agent interactions to accomplish a complex task.

- **Work Queue**: A queue containing tasks to be processed by available worker agents.

## Z

- **Zero-Copy**: Efficient message passing technique where data is transferred without being copied between memory locations.

- **Zombie Agent**: An agent that appears active but is not processing messages or responding to requests.

---
*Part of the Sartor Public Claude Skills Library - Agent Communication System*