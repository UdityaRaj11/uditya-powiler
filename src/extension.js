const vscode = require('vscode');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const { exec } = require('child_process');

const annotate = require('./commands/annotate');
const optimize = require('./commands/optimize');

global.filepath = "";

async function activate(context) {
    const setupScriptPath = path.join(__dirname, 'src', 'setup', 'setup_script.py');
    const command = `python "${setupScriptPath}"`;
    // Run the setup script to ensure dependencies are installed
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error installing packages: ${stderr}`);
            return;
        }
        console.log(`Packages installed successfully: ${stdout}`);
    });
    global.filepath = context.extensionPath;
    const config = vscode.workspace.getConfiguration('powiler');
    let apiKey = config.get('apiKey');

    // Function to prompt for API key if it's not set
    async function promptForApiKey() {
        return await vscode.window.showInputBox({
            prompt: 'Enter your Google API key',
            ignoreFocusOut: true,
            password: true
        });
    }
    while (!apiKey) {
        const value = await promptForApiKey();
        if (value) {
            await config.update('apiKey', value, vscode.ConfigurationTarget.Global);
            apiKey = value;
        } else {
            vscode.window.showErrorMessage('API key is required to use this extension.');
        }
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Register commands
    const disposableAnnotate = vscode.commands.registerCommand('powiler.annotate', async () => {
        await annotate(context, model);
    });

    const disposableOptimize = vscode.commands.registerCommand('powiler.optimize', async () => {
        await optimize(context, model);
    });

    context.subscriptions.push(disposableAnnotate, disposableOptimize);
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
