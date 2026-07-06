import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hi there! I am your AI Career Assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const { backendUrl, userData, userToken } = useContext(AppContext);

    // Suggested starter prompts
    const suggestions = [
        "Find remote jobs suitable for wheelchair users",
        "Suggest jobs for visually impaired graduates",
        "Help me improve my resume"
    ];

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Trap focus when opened, allow ESC to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSuggestionClick = (text) => {
        setInputValue(text);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = inputValue.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Build payload, incorporating accessibility data if available
            const payload = { message: userMsg };

            if (userToken && userData) {
                if (userData.disabilityType) payload.disabilityType = userData.disabilityType;
                if (userData.assistiveNeeds) payload.assistiveNeeds = userData.assistiveNeeds;
            }

            // We use axios directly to hit our new endpoint
            const response = await axios.post(`${backendUrl}/api/ai-chat`, payload);

            if (response.data && response.data.reply) {
                setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "I received a response, but couldn't parse it." }]);
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [
                ...prev,
                { role: 'ai', content: "I'm having trouble connecting right now. Please try again later." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={toggleChat}
                aria-label={isOpen ? "Close AI Career Assistant" : "Open AI Career Assistant"}
                aria-expanded={isOpen}
                className={`relative z-50 p-4 rounded-full shadow-lg transition-transform duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)] hover:scale-105 ${isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-[var(--primary-color)] hover:brightness-110"
                    } text-white flex items-center justify-center`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Sliding Chat Panel */}
            <div
                role="dialog"
                aria-label="AI Career Assistant Chat"
                aria-hidden={!isOpen}
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[var(--card-bg)] border-l border-[var(--border-color)] shadow-2xl z-[1001] flex flex-col transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="bg-[var(--primary-color)] text-white p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2 font-semibold">
                        <Bot size={20} />
                        <h2>AI Career Assistant</h2>
                    </div>
                    <button
                        onClick={toggleChat}
                        aria-label="Close Chat"
                        className="p-1 rounded-md hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--bg-color)]">
                    {/* Suggestions Layer (Shown only at start or if empty space allows) */}
                    {messages.length === 1 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {suggestions.map((sug, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSuggestionClick(sug)}
                                    className="text-xs text-left bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] hover:border-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 px-3 py-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Message Bubbles */}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-3 text-sm flex gap-2 shadow-sm ${msg.role === 'user'
                                    ? 'bg-[var(--primary-color)] text-white rounded-br-none'
                                    : 'bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-bl-none'
                                    }`}
                            >
                                {msg.role === 'ai' && <Bot size={16} className="shrink-0 mt-0.5" />}
                                <p className="whitespace-pre-wrap leading-relaxed break-words overflow-hidden">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl rounded-bl-none p-3 text-[var(--text-muted)] flex items-center gap-2 shadow-sm">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Assistant is typing...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)]">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border-color)] p-1.5 rounded-full focus-within:ring-2 focus-within:ring-[var(--primary-color)] transition-shadow"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask anything..."
                            aria-label="Type your message"
                            className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-[var(--text-color)] placeholder-[var(--text-muted)]"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            aria-label="Send message"
                            className="bg-[var(--primary-color)] text-white p-2 rounded-full hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-color)] dark:focus-visible:ring-offset-[var(--card-bg)]"
                        >
                            <Send size={16} className="pl-0.5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChatAssistant;
