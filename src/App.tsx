import { useState, useEffect } from 'react';
import Simulator from './components/Simulator';
import Markdown from 'react-markdown';
import { MessageSquare, FileCode2, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'architecture' | 'ai-log'>('simulator');
  const [architectureMd, setArchitectureMd] = useState('');
  const [aiLogMd, setAiLogMd] = useState('');

  useEffect(() => {
    // In a real app, we'd fetch these or import them as raw strings.
    // Since we created them in the file system, we can fetch them if they are in public,
    // or we can just hardcode them here for the sake of the prototype if fetch fails.
    // Let's try to fetch them from the src directory if possible, or just use a fallback.
    // Actually, Vite can import raw files with ?raw
    import('./docs/architecture.md?raw').then(res => setArchitectureMd(res.default)).catch(console.error);
    import('./docs/ai-usage-log.md?raw').then(res => setAiLogMd(res.default)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Conflict Mediator</h1>
          <p className="text-gray-400">Real-time chat moderation prototype</p>
        </header>

        <div className="border-b border-gray-800">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'simulator'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Simulator
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'architecture'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              Architecture
            </button>
            <button
              onClick={() => setActiveTab('ai-log')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai-log'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              AI Usage Log
            </button>
          </nav>
        </div>

        <main className="mt-6">
          {activeTab === 'simulator' && <Simulator />}
          
          {activeTab === 'architecture' && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 prose prose-invert max-w-none">
              <div className="markdown-body">
                <Markdown>{architectureMd || 'Loading...'}</Markdown>
              </div>
            </div>
          )}

          {activeTab === 'ai-log' && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 prose prose-invert max-w-none">
              <div className="markdown-body">
                <Markdown>{aiLogMd || 'Loading...'}</Markdown>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
