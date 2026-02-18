import React, { useState, useRef, useEffect } from 'react';
import { phase2API, aiAPI } from '../../services/api';

const ChatWidget = ({ context = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Hi! I am your Career Copilot. Ask me anything about this roadmap or your career path.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // 1. First try RAG if applicable
            let contextText = "";
            try {
                const ragRes = await phase2API.queryRag(input);
                if (ragRes.data && ragRes.data.results && ragRes.data.results.documents) {
                    contextText = ragRes.data.results.documents[0].join("\n");
                }
            } catch (e) {
                console.warn("RAG failed, falling back to basic chat", e);
            }

            // 2. Call Chat API with augmented context
            // Note: The backend chat endpoint currently takes just "message". 
            // Ideally we would pass the RAG context to the backend.
            // For now, we append it to the message or rely on backend to do RAG (which we set up in phase2_routes /rag/query).
            // But `aiAPI.chat` calls `gemini_service.chat_with_context`.
            // Let's rely on standard chat for now or augment message.

            const augmentedMessage = contextText
                ? `Context base on knowledge base:\n${contextText}\n\nUser Question: ${input}`
                : input;

            const response = await aiAPI.chat(augmentedMessage);

            const aiMsg = { role: 'assistant', content: response.data.response };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat failed", error);
            setMessages(prev => [...prev, { role: 'system', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-96 glass-card flex flex-col shadow-2xl border border-cyan-500/30 overflow-hidden bg-[#0a0f1e]">
                    {/* Header */}
                    <div className="p-3 bg-cyan-900/40 border-b border-cyan-500/20 flex justify-between items-center">
                        <h3 className="font-bold text-cyan-300 flex items-center">
                            <span className="mr-2">🤖</span> Career Copilot
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                        ? 'bg-cyan-600/30 text-white border border-cyan-500/30'
                                        : msg.role === 'system'
                                            ? 'bg-red-500/10 text-red-200 text-xs text-center w-full'
                                            : 'bg-slate-700/50 text-slate-200 border border-slate-600/30'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-400">
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-cyan-500/20 bg-slate-900/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about your roadmap..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading}
                                className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white disabled:opacity-50"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105"
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default ChatWidget;
