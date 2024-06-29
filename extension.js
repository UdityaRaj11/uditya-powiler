const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function activate(context) {
    let disposable = vscode.commands.registerCommand('powiler.annotate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'python') {
            vscode.window.showErrorMessage('This extension only supports Python code.');
            return;
        }

        const code = document.getText();
        const modifiedCode = addDecorators(code);
        const tempFilePath = path.join(context.extensionPath, 'temp', `modified_${path.basename(document.fileName)}`);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(tempFilePath), Buffer.from(modifiedCode));

        exec(`python ${tempFilePath}`, async (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
            }
            const annotatedCode = annotateOriginalCode(code, stdout);
            const annotatedFilePath = path.join(context.extensionPath, 'temp', `annotated_${path.basename(document.fileName)}`);
            await vscode.workspace.fs.writeFile(vscode.Uri.file(annotatedFilePath), Buffer.from(annotatedCode));
            const annotatedDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(annotatedFilePath));
            await vscode.window.showTextDocument(annotatedDocument);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

function addDecorators(code) {
	// const decorator = '@measure_energy\n';
	// let modifiedCode = 'from pyJoules.energy_meter import measure_energy\n\n';
    const decorator = '@capture_cpu_usage\n';
    const functionRegex = /^(\s*)def\s+(\w+)\s*\(/gm;
    let match;
    let modifiedCode = 'import time\n' +
        'import os\n' +
        'import psutil\n' +
        'def capture_cpu_usage(func):\n' +
        '    def wrapper(*args, **kwargs):\n' +
        '        process = psutil.Process(os.getpid())\n' +
        '        start_cpu_times = process.cpu_times()\n' +
        '        result = func(*args, **kwargs)\n' +
        '        end_cpu_times = process.cpu_times()\n' +
        '        user_time = end_cpu_times.user - start_cpu_times.user\n' +
        '        system_time = end_cpu_times.system - start_cpu_times.system\n' +
        '        cpu_usage = user_time + system_time\n' +
		'        energy = cpu_usage * 1.6\n' +
        '        print(f"ENERGY_CONSUMPTION:{func.__name__}: {energy:.6f} J")\n' +
        '        return result\n' +
        '    return wrapper\n\n';
    let lastIndex = 0;

    while ((match = functionRegex.exec(code)) !== null) {
        modifiedCode += code.slice(lastIndex, match.index);
        modifiedCode += `${match[1]}${decorator}`;
        modifiedCode += code.slice(match.index, functionRegex.lastIndex);
        lastIndex = functionRegex.lastIndex;
    }
    modifiedCode += code.slice(lastIndex);

    return modifiedCode;
}

function annotateOriginalCode(originalCode, output) {
    const outputRegex = /^ENERGY_CONSUMPTION:(\w+): (.*)$/gm;
    let match;
    const functionOutputs = {};

    while ((match = outputRegex.exec(output)) !== null) {
        functionOutputs[match[1]] = match[2];
    }

    const functionRegex = /^(\s*)def\s+(\w+)\s*\(/gm;
    let lastIndex = 0;
    let annotatedCode = '';
    while ((match = functionRegex.exec(originalCode)) !== null) {
        annotatedCode += originalCode.slice(lastIndex, match.index);
        const functionName = match[2];
        const functionOutput = functionOutputs[functionName];
        if (functionOutput) {
            annotatedCode += `${match[1]}# ENERGY CONSUMPTION: ${functionOutput}\n`;
        }
        annotatedCode += originalCode.slice(match.index, functionRegex.lastIndex);
        lastIndex = functionRegex.lastIndex;
    }
    annotatedCode += originalCode.slice(lastIndex);

    return annotatedCode;
}

exports.activate = activate;
exports.deactivate = deactivate;
