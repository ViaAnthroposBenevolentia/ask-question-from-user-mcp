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
            let scriptPath;
            let childProcess;

            switch (process.platform) {
                case "win32":
                    scriptPath = join(__dirname, "script.ps1");
                    childProcess = spawn(
                        "powershell.exe",
                        [
                            "-ExecutionPolicy",
                            "Bypass",
                            "-File",
                            scriptPath,
                            question,
                        ],
                        {
                            stdio: ["pipe", "pipe", "pipe"],
                        }
                    );
                    break;

                case "darwin":
                    scriptPath = join(__dirname, "script.sh");
                    childProcess = spawn("bash", [scriptPath, question], {
                        stdio: ["pipe", "pipe", "pipe"],
                    });
                    break;

                default:
                    resolve({
                        content: [
                            {
                                type: "text",
                                text: `Unsupported platform: ${process.platform}`,
                            },
                        ],
                    });
                    return;
            }

            let output = "";
            let errorOutput = "";

            childProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            childProcess.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            childProcess.on("close", (code) => {
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

            childProcess.on("error", (error) => {
                resolve({
                    content: [
                        {
                            type: "text",
                            text: `Error launching script: ${error.message}`,
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
