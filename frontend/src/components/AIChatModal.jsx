import React from 'react';
import { Bot, X, Send } from 'lucide-react';

const AIChatModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] md:h-[600px] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary flex-shrink-0">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold truncate text-sm md:text-base">AI 고객센터</h2>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">언제든지 질문을 해보세요</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 p-4 md:p-6 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                        <div className="bg-blue-50 p-4 rounded-xl max-w-[85%] md:max-w-[80%]">
                            <p className="text-sm">안녕하세요! **AI 고객센터**입니다. 무엇을 도와드릴까요? 모임 일정이나 회비에 대해 궁금한 점이 있으시면 말씀해주세요.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="메시지 입력..."
                            className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                        />
                        <button className="flex-shrink-0 p-3 md:px-6 md:py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base">
                            <span className="hidden md:inline">전송</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatModal;
