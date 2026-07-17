# Agentic Workflow (Next.js Version)

Welcome to **Agentic Workflow**, a multi-agent startup blueprint generator.

This project has been migrated to **Next.js 15.5** featuring the App Router. The backend agents execute directly in the browser via `deepagents/browser` using the configured `NEXT_PUBLIC_GOOGLE_API_KEY`.

---

## 🚀 Getting Started

First, install the package dependencies:

```bash
npm install
```

Configure your environment variables by adding a `.env` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_API_KEY="your-gemini-api-key"
```

Start the Next.js development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Development Commands

*   `npm run dev`: Start Next.js development server
*   `npm run build`: Compile and build production-ready optimized assets
*   `npm run start`: Start production server
*   `npm run lint`: Run code syntax verification check
