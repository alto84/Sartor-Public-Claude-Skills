#!/bin/bash

# MCP Server Testing Script
# Tests MCP server functionality including stdio communication, tool invocation, and error handling

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server path is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No server path provided${NC}"
    echo "Usage: $0 <path-to-server.js>"
    echo "Example: $0 ./dist/index.js"
    exit 1
fi

SERVER_PATH="$1"

# Check if server file exists
if [ ! -f "$SERVER_PATH" ]; then
    echo -e "${RED}Error: Server file not found: $SERVER_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}Testing MCP Server: $SERVER_PATH${NC}"
echo ""

# Test 1: Server starts without errors
echo -e "${YELLOW}Test 1: Server Startup${NC}"
timeout 5s node "$SERVER_PATH" > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✓ Server started successfully${NC}"
    kill $SERVER_PID 2>/dev/null || true
else
    echo -e "${RED}✗ Server failed to start${NC}"
    exit 1
fi

# Test 2: List tools request
echo ""
echo -e "${YELLOW}Test 2: List Tools${NC}"
LIST_TOOLS_REQUEST='{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

TOOLS_RESPONSE=$(echo "$LIST_TOOLS_REQUEST" | node "$SERVER_PATH" 2>/dev/null | grep -v "^Server" | head -1)

if echo "$TOOLS_RESPONSE" | grep -q '"tools"'; then
    TOOL_COUNT=$(echo "$TOOLS_RESPONSE" | grep -o '"name"' | wc -l)
    echo -e "${GREEN}✓ Listed $TOOL_COUNT tools${NC}"
else
    echo -e "${RED}✗ Failed to list tools${NC}"
    echo "Response: $TOOLS_RESPONSE"
fi

# Test 3: Call a tool (assumes an 'echo' or similar test tool exists)
echo ""
echo -e "${YELLOW}Test 3: Tool Invocation${NC}"

# Extract first tool name from response
FIRST_TOOL=$(echo "$TOOLS_RESPONSE" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$FIRST_TOOL" ]; then
    echo "Testing tool: $FIRST_TOOL"

    CALL_TOOL_REQUEST="{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":\"$FIRST_TOOL\",\"arguments\":{}}}"

    CALL_RESPONSE=$(echo "$CALL_TOOL_REQUEST" | node "$SERVER_PATH" 2>/dev/null | grep -v "^Server" | head -2 | tail -1)

    if echo "$CALL_RESPONSE" | grep -q '"content"'; then
        echo -e "${GREEN}✓ Tool invocation successful${NC}"
    else
        echo -e "${YELLOW}⚠ Tool invocation returned unexpected response${NC}"
        echo "Response: $CALL_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠ No tools found to test${NC}"
fi

# Test 4: Error handling
echo ""
echo -e "${YELLOW}Test 4: Error Handling${NC}"

INVALID_TOOL_REQUEST='{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"nonexistent_tool","arguments":{}}}'

ERROR_RESPONSE=$(echo "$INVALID_TOOL_REQUEST" | node "$SERVER_PATH" 2>/dev/null | grep -v "^Server" | head -2 | tail -1)

if echo "$ERROR_RESPONSE" | grep -qi 'error\|unknown'; then
    echo -e "${GREEN}✓ Error handling works correctly${NC}"
else
    echo -e "${YELLOW}⚠ Error response format unexpected${NC}"
    echo "Response: $ERROR_RESPONSE"
fi

# Test 5: Stdio protocol integrity
echo ""
echo -e "${YELLOW}Test 5: Stdio Protocol Integrity${NC}"

# Send multiple requests
MULTI_REQUEST="$LIST_TOOLS_REQUEST
$LIST_TOOLS_REQUEST"

MULTI_RESPONSE=$(echo -e "$MULTI_REQUEST" | node "$SERVER_PATH" 2>/dev/null | grep -v "^Server")

RESPONSE_COUNT=$(echo "$MULTI_RESPONSE" | grep -c '"jsonrpc"' || true)

if [ "$RESPONSE_COUNT" -eq 2 ]; then
    echo -e "${GREEN}✓ Stdio protocol handles multiple requests${NC}"
else
    echo -e "${YELLOW}⚠ Received $RESPONSE_COUNT responses instead of 2${NC}"
fi

# Test 6: Check for console.log pollution
echo ""
echo -e "${YELLOW}Test 6: Stdout Pollution Check${NC}"

STDERR_OUTPUT=$(echo "$LIST_TOOLS_REQUEST" | node "$SERVER_PATH" 2>&1 1>/dev/null)

if echo "$STDERR_OUTPUT" | grep -q "Server\|running\|started"; then
    echo -e "${GREEN}✓ Logging correctly uses stderr${NC}"
else
    echo -e "${YELLOW}⚠ No stderr logging detected${NC}"
fi

STDOUT_LINES=$(echo "$LIST_TOOLS_REQUEST" | node "$SERVER_PATH" 2>/dev/null | wc -l)

if [ "$STDOUT_LINES" -le 2 ]; then
    echo -e "${GREEN}✓ Stdout only contains protocol messages${NC}"
else
    echo -e "${YELLOW}⚠ Stdout may contain extra output${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}MCP Server Test Complete${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Recommendations:"
echo "1. Test with MCP Inspector: npx @modelcontextprotocol/inspector $SERVER_PATH"
echo "2. Check server logs in stderr for detailed information"
echo "3. Validate tool schemas match actual implementations"
echo "4. Test with real MCP client (Claude Desktop, etc.)"
