# Powiler

**Powiler** is a Visual Studio Code extension designed to help you track, visualize, optimize, and annotate functions with their energy consumption. Enhance your development workflow by integrating energy consumption analysis directly into your code editor.

- **Note: Python is required for this extension to function properly.**

## Features

- **Annotate Functions**: Automatically add annotations to your functions indicating their energy consumption.
- **Optimize Functions**: Receive recommendations for optimizing your functions based on their energy usage.
- **Visualize Data**: Gain insights into your code’s energy consumption patterns with visual representations.

## Commands

- **`powiler.annotate`**: Annotates functions with energy consumption data.
- **`powiler.optimize`**: Provides optimization suggestions for functions based on their energy consumption.

## Installation

1. **Open Visual Studio Code**.
2. **Go to the Extensions View**: Click on the Extensions icon in the Activity Bar on the side of the window or press `Ctrl+Shift+X`.
3. **Search for `Powiler`**: In the search bar, type `Powiler` and select it from the list.
4. **Install**: Click the `Install` button.

Alternatively, you can install the extension from the `.vsix` file:

1. **Package Your Extension**: Ensure you have `vsce` installed and package your extension:
   `sh vsce package `

This will create a .vsix file in your project directory.

2. **Install the .vsix File**: Open VS Code and go to the Extensions view.
   Click on the three-dot menu (ellipsis) in the upper-right corner of the Extensions view.
   Select Install from VSIX....
   Browse to the .vsix file and select it.

## Dependency Management

### Required Libraries

This extension requires the following Python libraries:

- pandas
- os
- eco2ai
  These libraries will be automatically installed if they are not already available.

### Ensuring Dependency Installation

The extension will attempt to install dependencies automatically. However, if you encounter issues, you can manually install the dependencies by adding the following code to your extension setup:

```python
import subprocess
import sys

def install_dependencies():
    try:
        import pandas
        import eco2ai
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "eco2ai"])
```

Adding this function ensures that pandas and eco2ai are installed when the extension is activated.

## Usage

### Configure API Key:

To use the Powiler extension, you need to configure your API key. Follow these steps:

1. **Open the Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
2. **Enter Google API Key**: If prompted for your API key, enter it in the input box.
3. If the extension does not prompt you, go to File > Preferences > Settings (or Code > Preferences > Settings on macOS) and search for Powiler.
4. **Enter your API key in the Powiler**: API Key setting.

### Activate Commands:

1. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P on macOS).
2. **Run Powiler**: Annotate to add annotations to your functions based on their energy consumption.
3. **Run Powiler**: Optimize to receive suggestions for optimizing your functions based on their energy usage.

## View Annotations and Suggestions:

Annotations will appear inline within your code editor.
Optimization suggestions will be provided through notifications or directly in the editor.
Configuration
Settings: Configure Powiler settings by going to File > Preferences > Settings (or Code > Preferences > Settings on macOS) and searching for Powiler.

## Contact

For any questions or support:

- **Publisher**: uditya-raj
- **Author**: Uditya Raj
- **GitHub Repository**: https://github.com/UdityaRaj11/uditya-powiler
- **Email**: udityaraj.18024@gmail.com

Thank you for using Powiler! We hope it enhances your development experience by providing valuable insights into energy consumption and optimization opportunities.

```

```
