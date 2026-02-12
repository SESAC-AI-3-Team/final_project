import { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, AlignLeft, Users, Bot, X, MessageSquare, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';
// import logo from './icon/logo.png'; // Removed import

const Detail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);

    // Mock data for a specific event
    const event = {
        title: "정기 독서 토론 모임",
        date: "2026-02-15",
        time: "14:00 - 17:00",
        location: "강남역 북카페 '페이지'",
        description: "이번 달 선정 도서인 '이기적 유전자'를 읽고 각자의 생각을 나누는 시간입니다. 모임 후 간단한 저녁 식사가 예정되어 있습니다.",
        participants: [
            { id: 1, name: "김철수", status: "confirmed", avatar: "mo" },
            { id: 2, name: "박영희", status: "confirmed", avatar: "mo" },
            { id: 3, name: "이민수", status: "pending", avatar: "mo" },
            { id: 4, name: "최지우", status: "confirmed", avatar: "mo" },
        ]
    };

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-16 md:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <img src="http://localhost:8000/static/icon/logo.png" alt="Momo Logo" className="h-10 w-auto" />
                                <h1 className="text-2xl font-bold">일정 상세</h1>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">
                                일정
                            </button>
                            <div className="relative">
                                <button onClick={() => setIsDashboardDropdownOpen(!isDashboardDropdownOpen)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                    회비 대시보드
                                </button>
                                {isDashboardDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg z-20">
                                        <button onClick={() => navigate(`/meeting/${id}/dashboard`)} className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors">대시보드 조회</button>
                                        <button onClick={() => navigate(`/meeting/${id}/dashboard?filter=income`)} className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors">수입 조회</button>
                                        <button onClick={() => navigate(`/meeting/${id}/dashboard?filter=expense`)} className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors">지출 조회</button>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => navigate(`/meeting/${id}/board`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                모임 게시판
                            </button>
                            <button onClick={() => navigate(`/meeting/${id}/ocr`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                OCR
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Event Detail Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 mb-8">
                        <h2 className="text-3xl font-bold mb-6">{event.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">날짜</p>
                                    <p className="font-medium">{event.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">시간</p>
                                    <p className="font-medium">{event.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">장소</p>
                                    <p className="font-medium">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border pt-6 mb-8">
                            <h3 className="flex items-center gap-2 font-medium mb-3 text-gray-900">
                                <AlignLeft className="w-5 h-5 text-primary" />
                                상세 설명
                            </h3>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                {event.description}
                            </p>
                        </div>

                        {/* Button Actions */}
                        <div className="flex gap-4">
                            <button className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                                참석하기
                            </button>
                            <button className="flex-1 py-3 border border-border text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                불참하기
                            </button>
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-6 h-6 text-primary" />
                                참석 명단 ({event.participants.filter(p => p.status === 'confirmed').length}명)
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {event.participants.map(p => (
                                <div key={p.id} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-transparent hover:border-primary transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                                        {p.avatar}
                                    </div>
                                    <p className="font-medium">{p.name}</p>
                                    <p className={`text-xs ${p.status === 'confirmed' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {p.status === 'confirmed' ? '참석 확정' : '응답 대기'}
                                    </p>
                                </div>
                            ))}
                            <button className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-muted-foreground hover:text-primary hover:border-primary">
                                <div className="w-10 h-10 rounded-full border border-dashed border-gray-300 flex items-center justify-center mb-1">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-medium">초대하기</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Fab */}
            <button onClick={() => setIsAIModalOpen(true)} className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40">
                <Bot className="w-8 h-8" />
            </button>
            {/* AI Modal */}
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
            <BottomNav />
        </div>
    );
};

export default Detail;
