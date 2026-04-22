import sdk from "@stackblitz/sdk";
import { ComponentNode, GenerationResult } from "@/types";

export function toStackBlitz(result: GenerationResult) {
  const components: ComponentNode[] = [];
  const collectComponents = (node: ComponentNode) => {
    components.push(node);
    if (node.children) {
      node.children.forEach(collectComponents);
    }
  };
  collectComponents(result.tree);

  const files: Record<string, string> = {
    "package.json": JSON.stringify({
      name: "agent-ui-project",
      version: "0.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "^0.363.0",
        "framer-motion": "^11.0.8",
        "clsx": "^2.1.0",
        "tailwind-merge": "^2.2.1"
      },
      devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "typescript": "^5.0.0",
        "tailwindcss": "^3.4.1",
        "autoprefixer": "^10.4.17",
        "postcss": "^8.4.35",
        "vite": "^5.1.4",
        "@vitejs/plugin-react": "^4.2.1"
      },
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      }
    }, null, 2),
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        target: "ESNext",
        lib: ["DOM", "DOM.Iterable", "ESNext"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "node",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./*"]
        }
      },
      include: ["src"]
    }, null, 2),
    "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    "postcss.config.js": `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AgentUI Export</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    "src/main.tsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    "src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
    "src/App.tsx": `import ${result.tree.name} from './components/${result.tree.name}'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <${result.tree.name} />
    </div>
  )
}`,
    "src/types/index.ts": `export interface ComponentNode {
    id: string;
    name: string;
    type: string;
    description: string;
    props: any;
    children: any[];
    code: string;
}`
  };

  // Add components
  components.forEach((node) => {
    files[`src/components/${node.name}.tsx`] = node.code;
  });

  const project = {
    title: "AgentUI Export",
    description: "Generated UI Project",
    template: "node" as const,
    files: files,
    settings: {
      compile: {
        trigger: "auto" as const,
        clearConsole: false
      }
    }
  };

  sdk.openProject(project, {
    newWindow: true,
    openFile: "src/App.tsx"
  });

  return project;
}
