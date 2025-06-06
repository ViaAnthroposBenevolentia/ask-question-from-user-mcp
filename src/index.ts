import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create an MCP server
const server = new McpServer({
    name: "ask-question-from-user-mcp",
    version: "1.0.0",
});

// Add a question tool
server.tool(
    "ask-question-from-user",
    { question: z.string().describe("The question to ask the user") },
    async ({ question }) => {
        return new Promise((resolve) => {
            const scriptPath = join(__dirname, "script.ps1");

            // Use PowerShell to show native Windows dialog
            const powershellProcess = spawn(
                "powershell.exe",
                ["-ExecutionPolicy", "Bypass", "-File", scriptPath, question],
                {
                    stdio: ["pipe", "pipe", "pipe"],
                }
            );

            let output = "";
            let errorOutput = "";

            powershellProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            powershellProcess.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            powershellProcess.on("close", (code) => {
                const userAnswer = output.trim();

                if (code === 0 && userAnswer) {
                    resolve({
                        content: [
                            {
                                type: "text",
                                text: `User answered: "${userAnswer}"`,
                            },
                        ],
                    });
                } else if (code === 0 && !userAnswer) {
                    resolve({
                        content: [
                            {
                                type: "text",
                                text: "User cancelled the dialog or provided no answer.",
                            },
                        ],
                    });
                } else {
                    resolve({
                        content: [
                            {
                                type: "text",
                                text: `Error showing dialog: ${
                                    errorOutput || "Unknown error"
                                }`,
                            },
                        ],
                    });
                }
            });

            powershellProcess.on("error", (error) => {
                resolve({
                    content: [
                        {
                            type: "text",
                            text: `Error launching PowerShell dialog: ${error.message}`,
                        },
                    ],
                });
            });
        });
    }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
