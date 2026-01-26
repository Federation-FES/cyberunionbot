import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure index.html has a div with id='root'");
}

console.log("Initializing React app...");

try {
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("React app rendered successfully");
} catch (error) {
  console.error("Failed to render React app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: white; background: #1a1a1a; min-height: 100vh;">
      <h1>Ошибка загрузки приложения</h1>
      <pre style="background: #2a2a2a; padding: 16px; border-radius: 8px; overflow: auto;">
        ${error instanceof Error ? error.message : String(error)}
        ${error instanceof Error ? error.stack : ''}
      </pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Перезагрузить страницу
      </button>
    </div>
  `;
}
