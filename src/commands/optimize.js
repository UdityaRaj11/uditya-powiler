const vscode = require('vscode');
const path = require('path');
const getWebviewContent = require('../webviews/getWebviewContent');

async function optimize(context, model) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found!');
        return;
    }
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Powiler",
        cancellable: false
    }, async (progress) => {
        const document = editor.document;
        const lang = document.languageId;
        if (lang !== 'python' && lang !== 'javascript') {
            vscode.window.showInformationMessage('Free access includes support for Python and JavaScript. Unlock support for more languages with our paid version.');
            return;
        }
        progress.report({message: "Loading code..."});
        const code = document.getText();
        const prompt = "Optimize this code focusing on lower energy consumption and provide suggestions, making it Energy Efficient, Identifying objective and variables, Optimizing algorithm architecture and Assessing data outlier probabilities. Code: " + code;
        try {
            await model.generateContent(prompt);
        }
        catch (error) {
            vscode.window.showErrorMessage('An error occurred while processing the code. Please try again.');
            vscode.window.showErrorMessage(error.message);
            return;
        }
        const result = await model.generateContent(prompt);
        const panel = vscode.window.createWebviewPanel(
            'optimizationIdeas',
            'Optimization Ideas',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );
        const optimizedCode = result.response.text();
        panel.webview.html = getWebviewContent(optimizedCode);
        const optimizedFilePath = path.join(context.extensionPath, 'temp', `optimized_code.md`);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(optimizedFilePath), Buffer.from(optimizedCode));
        progress.report({message: "Optimizing code..."});
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 5000);
        });
    });
}

module.exports = optimize;
