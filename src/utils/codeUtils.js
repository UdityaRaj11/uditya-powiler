const vscode = require('vscode');

function extractPythonCode(inputString) {
    try {
        const pattern = /```python\s([\s\S]*?)\s```/g;
        let matches = [];
        let match;
        while ((match = pattern.exec(inputString)) !== null) {
            matches.push(match[1]);
        }
        const extractedCode = matches.join('\n');
        const cleanedString = inputString.replace(pattern, '');
        const resultString = cleanedString + '\n' + extractedCode;
        return resultString;
    }
    catch (error) {
        vscode.window.showErrorMessage(`Hey, your code cannot be used to analyze energy consumption. Please provide a valid code snippet.`);
        return inputString;
    }
}

function addDecorators(code) {
    const decorator = '@track';
    const functionRegex = /^(\s*)def\s+(\w+)\s*\(/gm;
    let match;
    let modifiedCode =
        'import pandas as pd\n'+
        'import os\n'+
        'from eco2ai import set_params, track\n\n'+
        'file_path = "emission.csv"\n'+
        'if os.path.exists(file_path):\n'+
        '   os.remove(file_path)\n\n'+
        'set_params(\n'+
        '   project_name="powiler",\n'+
        '   experiment_description="Get energy consumption",\n'+
        '   file_name="emission.csv"\n'+
        ')\n\n';
    let lastIndex = 0;
    let lastModification = '\ndf = pd.read_csv("emission.csv")\n'+
        'energy = df["power_consumption(kWh)"]\n'+
        'energy_list = energy.tolist()\n'+
        'print("energy: " + str(energy_list))\n\n';

    while ((match = functionRegex.exec(code)) !== null) {
        modifiedCode += code.slice(lastIndex, match.index);
        modifiedCode += `${match[1]}${decorator}`;
        modifiedCode += code.slice(match.index, functionRegex.lastIndex);
        lastIndex = functionRegex.lastIndex;
    }
    modifiedCode += code.slice(lastIndex);
    modifiedCode += lastModification;

    return modifiedCode;
}

function convertEnergyConsumption(pythonConsumption, targetLanguage) {
    const energyConsumption = {
        "c": 1.00,
        "cpp": 1.34,
        "java": 1.98,
        "javascript": 4.19,
        "python": 75.88,
        "go": 3.20
    };

    if (!(targetLanguage in energyConsumption)) {
        throw new Error(`Unsupported language: ${targetLanguage}`);
    }

    const pythonNormalized = energyConsumption["python"];
    const targetNormalized = energyConsumption[targetLanguage];
    
    const convertedConsumption = pythonConsumption * (targetNormalized / pythonNormalized);
    
    return convertedConsumption;
}

function extractEnergyList(inputString) {
    const regex = /energy:\s*\[([^\]]+)\]/;
    const match = inputString.match(regex);

    if (match) {
        const listString = `[${match[1]}]`; 
        try {
            const listArray = JSON.parse(listString);
            return listArray;
        } catch (e) {
            console.error("Error parsing JSON:", e);
            return null;
        }
    } else {
        return null; 
    }
}

function annotateOriginalCode(originalCode, output) {
    let functionOutputs;
    try {
        functionOutputs = extractEnergyList(output);
    } catch (error) {
        vscode.window.showErrorMessage(`Error parsing output: ${error.message}`);
        return originalCode;
    }

    functionOutputs = functionOutputs.map(value => parseFloat(value) * 3.6e6);

    const functionRegexPatterns = {
        python: /^(\s*)def\s+(\w+)\s*\(/gm,
        javascript: /^(\s*)function\s+(\w+)\s*\(/gm,
        java: /^(\s*public\s+|private\s+|protected\s+|static\s+)?(\w+)\s+\w+\s*\(/gm,
        c: /^(\s*)(\w+)\s+\w+\s*\(/gm,
        cpp: /^(\s*)(\w+)\s+\w+\s*\(/gm,
        go: /^(\s*)func\s+(\w+)\s*\(/gm
    };

    let lastIndex = 0;
    let annotatedCode = '';
    let valueIndex = 0;
    let match;

    for (const lang in functionRegexPatterns) {
        const functionRegex = functionRegexPatterns[lang];
        lastIndex = 0;
        functionRegex.lastIndex = 0;

        while ((match = functionRegex.exec(originalCode)) !== null) {
            annotatedCode += originalCode.slice(lastIndex, match.index);
            const functionOutput = functionOutputs[valueIndex++];
            if (functionOutput !== undefined) {
                const numericValue = parseFloat(functionOutput);
                if (!isNaN(numericValue)) {
                    try {
                        const convertedValue = convertEnergyConsumption(numericValue, lang);
                        annotatedCode += `${match[1]}// ENERGY CONSUMPTION: ${convertedValue.toFixed(5)} J\n`;
                    } catch (error) {
                        vscode.window.showErrorMessage(`Error converting energy consumption: ${error.message}`);
                        annotatedCode += `${match[1]}// ENERGY CONSUMPTION: ${functionOutput}\n`;
                    }
                } else {
                    vscode.window.showErrorMessage(`Failed to parse numeric value from: ${functionOutput}`);
                    annotatedCode += `${match[1]}// ENERGY CONSUMPTION: ${functionOutput}\n`;
                }
            }
            annotatedCode += originalCode.slice(match.index, functionRegex.lastIndex);
            lastIndex = functionRegex.lastIndex;
        }
        annotatedCode += originalCode.slice(lastIndex);
        originalCode = annotatedCode;
        annotatedCode = '';
    }

    return originalCode;
}

module.exports = {
    extractPythonCode,
    addDecorators,
    convertEnergyConsumption,
    extractEnergyList,
    annotateOriginalCode
};
