const vscode = require('vscode');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const annotate = require('./commands/annotate');
const optimize = require('./commands/optimize');

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

global.filepath = "";

function activate(context) {
    global.filepath = context.extensionPath;

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
