const vscode = require('vscode');
const path = require('path');
const { exec } = require('child_process');
const { extractPythonCode, addDecorators, annotateOriginalCode } = require('../utils/codeUtils');
const fs = require('fs').promises;

async function annotate(context, model) {
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
        progress.report({ message: "Loading code..." });
        const code = document.getText();
        const prompt = "Convert this to python code and return only the code. Code: " + code;
        try {
            await model.generateContent(prompt);
        } catch (error) {
            vscode.window.showErrorMessage('An error occurred while processing the code. Please try again.');
            vscode.window.showErrorMessage(error.message);
            return;
        }
        const result = await model.generateContent(prompt);
        const codeInPython = result.response.text();
        const PythonCode = extractPythonCode(codeInPython);
        const modifiedCode = addDecorators(PythonCode);

        const tempDir = path.join(context.extensionPath, 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        const tempFilePath = path.join(tempDir, `modified_${path.basename(document.fileName, path.extname(document.fileName))}.py`);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(tempFilePath), Buffer.from(modifiedCode));

        progress.report({ message: "Executing code..." });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const escapedFilePath = tempFilePath.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');
        const command = `python "${escapedFilePath}"`;

        console.log(`Executing command: ${command}`);
        
        exec(command, async (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
            }
            const annotatedCode = annotateOriginalCode(code, stdout);
            const annotatedFilePath = path.join(tempDir, `annotated_${path.basename(document.fileName)}`);
            await vscode.workspace.fs.writeFile(vscode.Uri.file(annotatedFilePath), Buffer.from(annotatedCode));
            const annotatedDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(annotatedFilePath));
            await vscode.window.showTextDocument(annotatedDocument);
        });

        progress.report({ message: "Annotating code..." });
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 18000);
        });
    });
}

module.exports = annotate;
