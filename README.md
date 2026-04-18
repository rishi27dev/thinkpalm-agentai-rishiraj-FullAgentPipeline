AgentUI is a professional, AI-powered application that transforms Product Requirement Documents (PRDs) into high-quality, production-ready React components. Leveraging the power of Groq AI and Llama 3, it automates the transition from text-based requirements to a structured component tree and live code.

## 🚀 Pipeline Overview

```text
[ PRD Input ] -> [ Groq Parser ] -> [ Architect Runner ] -> [ Code Generator ]
```

## ✨ Key Features

- **High-Performance Generation:** Powered by Groq's Llama 3 models for near-instant results.
- **Multi-Stage AI Generation:** A robust three-stage pipeline (Parser → Architect → Code Gen) for maximum accuracy and structural integrity.
- **Real-Time Streaming:** Watch the AI agent work in real-time with status updates streamed directly to the UI.
- **Enhanced Component Explorer:** A recursive tree viewer with type-specific indicators and property badges.
- **Live Preview & Code Viewer:** Built-in sandbox for instant visual feedback and a Monaco-powered code editor.
- **One-Click Export:** Download your entire project as a ZIP file or open it instantly in a StackBlitz sandbox.
- **Customizable Configuration:** Fine-tune the AI's output by choosing models, complexity levels, and visual tones.

## 🛠️ Tech Stack

| Tool | Purpose |
| :--- | :--- |
| **Next.js 14** | Modern React framework with App Router |
| **Tailwind CSS** | Utility-first styling for generated and local components |
| **Groq AI** | High-performance LLM for structured code generation (Llama 3) |
| **Lucide React** | Premium icon library |
| **Monaco Editor** | Industry-standard code editing experience |
| **JSZip** | Browser-side project bundling |
| **StackBlitz SDK** | Instant interactive previews |

## 📋 Prerequisites

- **Node.js:** version 18.0.0 or higher
- **Groq API Key:** Obtain one from the [Groq Console](https://console.groq.com/)

## ⚙️ Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/prd-to-ui.git
    cd prd-to-ui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory:
    ```bash
    cp .env.example .env.local
    ```
    Open `.env.local` and add your secret key:
    ```env
    GROQ_API_KEY=your_actual_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 🌐 Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GROQ_API_KEY` | Yes | Your Groq API key |

## 📖 Usage Walkthrough

1.  **Input PRD:** Paste your raw requirements or upload a text file in the left panel.
2.  **Configure:** Choose your preferred model (e.g., Gemini 1.5 Pro) and visual tone.
3.  **Generate:** Click **Generate UI** and watch the AI status updates in the center panel.
4.  **Explore:** Use the **Component Tree** to see the logic structure and hierarchy.
5.  **View Code:** Select any node in the tree to view its specific JSX and Tailwind implementation.
6.  **Export:** Use the **Export** menu to download a ZIP for local use or open it in **StackBlitz**.

## 📂 Project Structure

```text
prd-to-ui/
├── app/                  # Next.js App Router (Pages and API routes)
│   ├── api/generate/     # Gemini streaming endpoint
│   └── page.tsx          # Main application shell
├── components/           # UI Components
│   ├── editor/           # PRD and Configuration inputs
│   ├── export/           # Export actions and menu
│   ├── preview/          # Code viewer and Live preview
│   ├── tree/             # Component Tree explorer
│   └── ui/               # Base UI elements (Button, Loader, etc.)
├── lib/                  # Utility logic
│   ├── export/           # ZIP and StackBlitz logic
│   └── gemini/           # AI Prompts and SDK setup
├── types/                # TypeScript interfaces and definitions
└── tailwind.config.ts    # Design system configuration
```

## 🧠 Prompt Engineering & Architecture

AgentUI uses a **three-stage generative pipeline** to ensure consistency and modularity:

1.  **Stage 1: The Parser:** Extracts functional features and entities from the raw PRD text into a structured JSON schema.
2.  **Stage 2: The Architect:** Designs the component hierarchy based on the parsed data, selecting appropriate types (Page, Layout, Component, etc.).
3.  **Stage 3: The Code Gen:** Generates specific React/Tailwind code for each node in the tree, ensuring they are independent and high-quality.

**Why Temperature 0.3?**
We use a low temperature to prioritize deterministic, predictable JSON structures while allowing just enough creativity for unique UI designs. This significantly reduces "hallucination" in the component tree.

**Few-Shot Examples:**
The system uses specialized few-shot prompts to demonstrate "Gold Standard" component patterns to the AI, which significantly improves the accuracy of the generated property definitions and Tailwind class usage.

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
