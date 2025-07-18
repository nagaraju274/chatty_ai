# Chatty AI - A Conversational Chatbot

Welcome to Chatty AI, an intelligent and interactive chatbot application built with Next.js and Google's Gemini AI. This application allows users to engage in natural language conversations, get insightful responses, and even analyze uploaded files.

## ✨ Features

- **Natural Language Conversations**: Engage in dynamic and coherent conversations with a powerful AI.
- **File Upload & Analysis**: Upload files (images, documents, etc.) and ask questions about their content. The AI will use the file as the primary context for its answers.
- **Sentiment Analysis**: User messages are analyzed for sentiment (Positive, Negative, Neutral), which is displayed with an icon next to the message.
- **Chat History**: Your conversations are automatically saved to your browser's local storage, allowing you to revisit them later.
- **Responsive UI**: A clean and user-friendly interface that works seamlessly across desktop and mobile devices.
- **Light & Dark Mode**: Switch between light and dark themes to suit your preference.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI**: [Google's Gemini Pro via Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    -   Create a new file named `.env` in the root of your project.
    -   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Add your API key to the `.env` file:
        ```
        GOOGLE_API_KEY=YOUR_API_KEY_HERE
        ```

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## 💡 Usage

- **Start a conversation**: Type a message in the input box at the bottom and press Enter or click the send button.
- **Upload a file**: Click the paperclip icon to attach a file to your message. You can then ask questions related to the file's content.
- **Switch conversations**: Previous chats are listed in the sidebar. Click on any of them to view the conversation history.
- **Start a new chat**: Click the "New Chat" button in the sidebar.
- **Change the theme**: Click the settings icon in the header to toggle between light, dark, and system themes.
