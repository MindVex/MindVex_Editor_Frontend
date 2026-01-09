# MindVex - AI-Powered Browser-Based Code Editor

<div align="center">
  <h3>A complete development environment that runs entirely in your browser</h3>
  <p>Powered by WebContainer technology for secure client-side execution</p>
</div>

## 🚀 Features

### 📝 Intelligent Code Editor
- Multi-tab interface with syntax highlighting for multiple languages
- Real-time code editing with immediate feedback
- File tree navigation for easy project exploration
- Support for both text and binary files

### 🤖 AI-Powered Assistance
- Context-aware chat interface that understands your entire codebase
- Multiple context modes: active file, selected files, or full project
- AI can generate, modify, and optimize code based on your requests
- Support for multiple AI providers (OpenAI, Anthropic, Google, Ollama)

### 📊 Project Analytics Dashboard
- Dependency analysis identifying all project dependencies
- Architecture visualization showing code layers
- Code quality metrics with health scoring
- Issue detection for TODOs, FIXMEs, HACKs, XXXs, and BUGs
- File structure mapping with visual representations

### 🔧 Integrated Development Tools
- Full-featured terminal running directly in the browser
- Version control integration with GitHub and GitLab
- One-click repository creation and code pushing
- Support for both public and private repositories

### 🎨 Modern UI
- Dark theme with orange accents for comfortable coding
- Responsive design adapting to different screen sizes
- Intuitive menu system with quick access to all features
- Consistent styling across all components

## 🛠️ Architecture

MindVex is built with modern web technologies:

- **Frontend**: React with TypeScript
- **Styling**: UnoCSS for atomic CSS
- **State Management**: Nanostores for reactive state management
- **AI Integration**: Vercel AI SDK for chat capabilities
- **File System**: WebContainer for secure client-side operations
- **UI Components**: Custom-built with accessibility in mind

## 🌟 Key Benefits

1. **Security**: All code execution happens client-side with WebContainer
2. **Convenience**: No setup required - works directly in the browser
3. **AI Integration**: Powerful AI assistance for coding tasks
4. **Analytics**: Deep insights into your codebase structure and quality
5. **Flexibility**: Multiple context modes for different development scenarios
6. **Persistence**: Workspace state preserved across sessions

## 📋 Use Cases

- **Rapid Prototyping**: Quickly set up and experiment with new projects
- **Code Review**: Use AI to analyze and improve existing code
- **Learning**: Explore new technologies with AI-assisted explanations
- **Collaboration**: Share project links for team development
- **Migration**: Analyze and refactor legacy codebases

## 📦 Installation Process

MindVex runs entirely in the browser and requires no installation. Simply navigate to the application URL in a modern web browser. For local development:

### Using npm (may have dependency conflicts):
1. Clone the repository: `git clone <repository-url>`
2. Install dependencies: `npm install --legacy-peer-deps` (due to dependency conflicts)
3. Start the development server: `npm run dev`
4. Open your browser to the provided local URL

### Recommended: Using pnpm (resolves dependency conflicts):
1. Clone the repository: `git clone <repository-url>`
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm run dev`
4. Open your browser to the provided local URL

Using pnpm is recommended as it resolves dependency conflicts that may occur with npm.

## 🚀 Getting Started

1. Open MindVex in a modern web browser
2. Create a new project or import an existing folder
3. Start coding in the multi-tab editor
4. Use the AI chat for assistance with your code
5. Check the dashboard for project analytics
6. Push your code to GitHub or GitLab when ready

## 🛠️ Usage Process

### Initial Setup
1. Upon first visit, you'll see the main menu with options to import a folder, create a new folder, or clone a repository
2. Import your project folder by dragging and dropping it into the browser or selecting files
3. The workbench will load with your project files in the file explorer

### Working with Files
1. Navigate through your project using the file tree on the left
2. Click on files to open them in editor tabs
3. Create new files using the context menu in the file explorer
4. Edit files in the multi-tab editor with syntax highlighting
5. Changes are saved automatically to the WebContainer file system

### Using AI Assistance
1. Access the AI chat through the menu or by clicking the chat icon
2. Select your preferred context mode (active file, selected files, or no context)
3. Type your request in the chat input field
4. Review AI-generated artifacts before applying them to your project
5. Use the 'Add Context' button to include specific files in your AI conversation

### Project Analytics
1. Navigate to the dashboard to view project analytics
2. See dependency analysis, architecture visualization, and code quality metrics
3. Identify potential issues and areas for improvement
4. Monitor file structure and project organization

### Version Control
1. Use the version control panel to connect with GitHub or GitLab
2. Enter your repository name and authentication token
3. Push your entire project with a single click
4. Manage public or private repositories directly from the editor

## 🎯 Advanced Features

- **Context Modes**: Choose between active file, selected files, or full project context for AI interactions
- **Artifact System**: AI-generated code changes are presented as reviewable artifacts
- **Real-time Analysis**: Dashboard updates automatically as you modify files
- **File Locking**: Prevent unintended modifications to critical files
- **Multiple View Modes**: Switch between code, diff, preview, and dashboard views

## 📚 Documentation

For detailed information about each feature, check out our documentation in the `docs/features/` directory:

- [Workspace Management](docs/features/workspace-management.md)
- [Code Editor](docs/features/code-editor.md)
- [AI Chat Integration](docs/features/ai-chat-integration.md)
- [Dashboard Analytics](docs/features/dashboard-analytics.md)
- [File Explorer](docs/features/file-explorer.md)
- [Version Control](docs/features/version-control.md)
- [Integrated Terminal](docs/features/terminal.md)
- [Theme Customization](docs/features/theme-customization.md)

For a comprehensive overview, see [MindVex Overview](docs/MindVex.md).

## 🤝 Contributing

We welcome contributions to MindVex! Feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚙️ Configuration

MindVex can be configured with various AI provider keys for enhanced functionality:

- **OpenAI API Key**: For GPT models
- **Anthropic API Key**: For Claude models
- **Google API Key**: For Gemini models
- **Ollama**: For self-hosted models (local setup required)

Configuration is done through environment variables or the settings interface.

## 🔒 Security Features

- Client-side execution using WebContainer technology
- No code leaves the browser during AI processing
- Secure token storage for version control integrations
- Path validation to prevent directory traversal attacks
- File type validation to prevent malicious uploads

## 🚨 Limitations & Known Issues

- Large projects may experience performance limitations due to browser constraints
- Some Node.js-specific features may not be fully supported in WebContainer
- AI model availability depends on external service providers
- Session data is stored locally and may be cleared by browser cleanup

## 🆘 Troubleshooting

- **Files not appearing**: Refresh the workspace or check file import paths
- **AI not responding**: Verify API keys are properly configured
- **Performance issues**: Close unnecessary tabs or reduce project size temporarily
- **Git operations failing**: Check token permissions and repository access rights

## 🔄 Updates & Maintenance

MindVex automatically updates when you refresh the browser. For local development:
- Pull the latest changes from the repository
- Run `npm install` to update dependencies
- Restart the development server with `npm run dev`

---

MindVex represents the next generation of browser-based development tools, combining the convenience of web applications with the power of AI and the security of client-side execution.
