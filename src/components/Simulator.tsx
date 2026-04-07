import { useState, useEffect, useRef } from 'react';
import { initialChatLog, ChatMessage } from '../data/chatLog';
import { analyzeChatContext, MediatorDecision } from '../lib/gemini';
import { Bot, User, AlertTriangle, ShieldAlert, CheckCircle2, Play, FastForward, RotateCcw } from 'lucide-react';

export default function Simulator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeChat, setActiveChat] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastDecision, setLastDecision] = useState<MediatorDecision | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat]);

  const handleNextMessage = async () => {
    if (currentStep >= initialChatLog.length || isAnalyzing || isPlaying) return;

    const nextMsg = initialChatLog[currentStep];
    const newChat = [...activeChat, nextMsg];
    setActiveChat(newChat);
    setCurrentStep(currentStep + 1);

    // Trigger AI analysis
    setIsAnalyzing(true);
    try {
      const decision = await analyzeChatContext(newChat);
      setLastDecision(decision);

      if (decision.intervene && decision.response) {
        // Add AI response to chat
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          user: 'AI_Mediator',
          content: decision.response,
          type: 'message'
        };
        setActiveChat(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsAnalyzing(false);
    setCurrentStep(0);
    setActiveChat([]);
    setLastDecision(null);
  };

  const handlePlayAll = async () => {
    if (isPlayingRef.current || isAnalyzing) return;
    
    isPlayingRef.current = true;
    setIsPlaying(true);
    
    let step = currentStep;
    let currentChat = [...activeChat];
    
    while (step < initialChatLog.length && isPlayingRef.current) {
      const nextMsg = initialChatLog[step];
      currentChat = [...currentChat, nextMsg];
      setActiveChat(currentChat);
      step++;
      setCurrentStep(step);

      setIsAnalyzing(true);
      try {
        const decision = await analyzeChatContext(currentChat);
        if (!isPlayingRef.current) break; // Stop if reset was clicked
        
        setLastDecision(decision);

        if (decision.intervene && decision.response) {
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            user: 'AI_Mediator',
            content: decision.response,
            type: 'message'
          };
          currentChat = [...currentChat, aiMsg];
          setActiveChat(currentChat);
        }
      } catch (error) {
        console.error("Analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
      
      if (!isPlayingRef.current) break;
      // Small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'none': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  // Combine active chat with upcoming messages for display
  const displayChat = [
    ...activeChat,
    ...initialChatLog.slice(currentStep).map(msg => ({ ...msg, isUpcoming: true }))
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Room: "Chill Vibes 🎵"
            </h2>
            <p className="text-xs text-gray-400">Indonesian region, 10 users online</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNextMessage}
              disabled={currentStep >= initialChatLog.length || isAnalyzing || isPlaying}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Step
            </button>
            <button 
              onClick={handlePlayAll}
              disabled={currentStep >= initialChatLog.length || isAnalyzing || isPlaying}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <FastForward className="w-4 h-4" />
              {isPlaying ? 'Playing...' : 'Play All'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayChat.map((msg: any) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.type === 'system' ? 'items-center' : 'items-start'} ${msg.isUpcoming ? 'opacity-30 grayscale' : 'opacity-100 transition-opacity duration-500'}`}
            >
              {msg.type === 'system' ? (
                <div className="text-xs text-gray-500 italic bg-gray-800/50 px-3 py-1 rounded-full">
                  ** {msg.content} **
                </div>
              ) : (
                <div className={`max-w-[80%] ${msg.user === 'AI_Mediator' ? 'ml-auto' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-medium ${msg.user === 'AI_Mediator' ? 'text-blue-400' : 'text-gray-400'}`}>
                      {msg.user}
                    </span>
                    <span className="text-[10px] text-gray-600">{msg.timestamp}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    msg.user === 'AI_Mediator' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            AI Mediator Brain
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-sm animate-pulse">Analyzing context...</p>
            </div>
          ) : lastDecision ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Intervene:</span>
                  {lastDecision.intervene ? (
                    <span className="flex items-center gap-1 text-red-400 text-sm font-medium bg-red-400/10 px-2 py-1 rounded">
                      <AlertTriangle className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded">
                      <CheckCircle2 className="w-4 h-4" /> No
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Severity:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded border uppercase ${getSeverityColor(lastDecision.severity)}`}>
                    {lastDecision.severity}
                  </span>
                </div>
              </div>

              {/* Plan B Indicator */}
              {lastDecision.planB_triggered && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-500">Plan B Triggered</h4>
                    <p className="text-xs text-red-400/80 mt-1">AI was attacked or ignored. Escalating intervention.</p>
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Reasoning</h3>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {lastDecision.reasoning}
                  </p>
                </div>
              </div>

              {/* Planned Response */}
              {lastDecision.response && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Generated Response</h3>
                  <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-800/50">
                    <p className="text-sm text-blue-200 italic">
                      "{lastDecision.response}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 text-sm text-center px-4">
              Waiting for chat activity to analyze...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
