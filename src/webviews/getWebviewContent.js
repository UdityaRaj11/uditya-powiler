function getWebviewContent(markdownContent) {
    const md = require('markdown-it')();
    const htmlContent = md.render(markdownContent);
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Optimization Ideas</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
            padding: 16px;
        }
        pre {
            background: #2b2b2b;
            padding: 16px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
}

module.exports = getWebviewContent;
