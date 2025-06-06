# Ask Question From User MCP

A simple MCP server that provides a tool to ask questions from the user via a native dialog.

## Prerequisites

-   Windows or macOS (Submit a PR to support Linux if you want, I can't directly test that)
-   Node.js and npm

## Installation

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Build the project:
    ```bash
    npm run build
    ```

## Cursor Configuration

To use this MCP server with Cursor, you need to add the following configuration to your `mcp.json` file You can go there via UI: Ctrl + Shift + J, to "MCP tools" section. Or by typing "View: Open MCP Settings" to the command pallete.

```json
{
    "mcpServers": {
        "ask-question-from-user-mcp": {
            "command": "node",
            "args": [
                "/path/to/your/project/ask-question-from-user-mcp/build/index.js"
            ]
        }
    }
}
```

**Important**: Make sure to replace the path in the `args` array with the absolute path to the `index.js` file in the `build` directory of this project on your machine.
