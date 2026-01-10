"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Sparkles, Loader2, Bot, User, Zap, Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { chatService, ChatMessage, SuggestedQuestion } from '@/services/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Load suggestions when opened first time
            loadSuggestions();
            // Add initial greeting
            setMessages([{
                id: 'init',
                sender: 'ai',
                text: 'Xin chào! Mình là trợ lý Tinmyn. Bạn cần giúp gì hôm nay?',
                timestamp: new Date()
            }]);
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const loadSuggestions = async () => {
        try {
            const suggestions = await chatService.getSuggestedQuestions();
            setSuggestedQuestions(suggestions);
        } catch (error) {
            console.error("Failed to load suggestions", error);
        }
    };

    const handleSendMessage = async (text?: string) => {
        const messageText = text || inputValue;
        if (!messageText.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const responseText = await chatService.sendMessage(messageText);
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: responseText,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Xin lỗi, hiện tại mình đang gặp trục trặc kỹ thuật. Vui lòng thử lại sau.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Icon mapping for suggestions (You can expand this based on real data)
    const getIconForSuggestion = (id: number) => {
        switch (id % 4) {
            case 0: return <Sparkles className="h-4 w-4 text-amber-500" />;
            case 1: return <Zap className="h-4 w-4 text-blue-500" />;
            case 2: return <Info className="h-4 w-4 text-green-500" />;
            case 3: return <HelpCircle className="h-4 w-4 text-purple-500" />;
            default: return <MessageCircle className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Trigger Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg transition-transform duration-300 hover:scale-110",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                )}
            >
                {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 origin-bottom-right font-sans">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shrink-0 shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/10">
                                <Bot className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight tracking-tight">Tinmyn Assistant</h3>
                                <p className="text-blue-100 text-[11px] font-medium opacity-90">Luôn sẵn sàng hỗ trợ 24/7</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
                        <div className="space-y-4 flex flex-col min-h-full">

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm transition-all duration-200",
                                        msg.sender === 'user'
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white self-end rounded-br-none"
                                            : "bg-white text-slate-800 self-start rounded-bl-none border border-slate-100"
                                    )}
                                >
                                    {msg.sender === 'ai' && (
                                        <div className="flex items-center gap-2 mb-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <Sparkles className="h-3 w-3 text-indigo-500" /> Tinmyn AI
                                        </div>
                                    )}
                                    <div className="text-sm leading-relaxed">
                                        {msg.sender === 'ai' ? (
                                            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:font-bold prose-headings:text-slate-800">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="marker:text-slate-400" {...props} />,
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        strong: ({ node, ...props }) => <span className="font-bold text-slate-900" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <span className="whitespace-pre-wrap">{msg.text}</span>
                                        )}
                                    </div>
                                    <div className={cn("text-[10px] mt-1.5 opacity-70 text-right font-medium", msg.sender === 'user' ? "text-blue-100" : "text-slate-400")}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}

                            {/* Suggestion Grid (Only when just greeting exists) */}
                            {messages.length === 1 && !isLoading && suggestedQuestions.length > 0 && (
                                <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                    <p className="text-xs font-semibold text-slate-400 mb-3 px-1 uppercase tracking-wider">Đề xuất cho bạn</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {suggestedQuestions.map((q) => (
                                            <button
                                                key={q.id}
                                                onClick={() => handleSendMessage(q.text)}
                                                className="group flex items-center gap-3 p-3 bg-white hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 rounded-xl text-left transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                                            >
                                                <div className="p-2 bg-slate-50 group-hover:bg-white rounded-full transition-colors">
                                                    {getIconForSuggestion(q.id)}
                                                </div>
                                                <span className="text-sm text-slate-700 group-hover:text-indigo-700 font-medium line-clamp-2">
                                                    {q.text}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isLoading && (
                                <div className="self-start bg-white rounded-2xl rounded-bl-none p-4 border border-slate-100 shadow-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                    <span className="text-sm text-slate-500 font-medium">Đang suy nghĩ...</span>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập câu hỏi..."
                                className="flex-1 bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all pr-12 shadow-inner"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue.trim() || isLoading}
                                size="icon"
                                className={cn(
                                    "absolute right-1.5 rounded-full h-9 w-9 transition-all duration-200 shadow-sm",
                                    inputValue.trim()
                                        ? "bg-blue-600 hover:bg-blue-700 text-white scale-100"
                                        : "bg-slate-200 text-slate-400 scale-90"
                                )}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
