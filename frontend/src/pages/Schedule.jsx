import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Bot, X, Edit3, Sparkles, Calendar as CalendarIcon, Clock, AlignLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';

const Schedule = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);

    // Modal states
    const [selectionModalOpen, setSelectionModalOpen] = useState(false);
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [aiInputModalOpen, setAiInputModalOpen] = useState(false);

    // Date state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const [events, setEvents] = useState([
        { id: 1, title: '정기 모임', date: '2026-02-05', time: '19:00', desc: '강남역 11번 출구', type: 'meeting' },
        { id: 2, title: '운영진 회의', date: '2026-02-12', time: '14:00', desc: '줌 미팅', type: 'meeting' },
        { id: 3, title: '회비 납부 마감', date: '2026-02-25', time: '23:59', desc: '계좌 확인 필수', type: 'money' }
    ]);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const renderCalendar = () => {
        const days = [];
        // Padding
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`pad-${i}`} className="bg-gray-50 min-h-[120px]"></div>);
        }
        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            const isToday = day === new Date().getDate() &&
                currentMonth === new Date().getMonth() &&
                currentYear === new Date().getFullYear();

            days.push(
                <div
                    key={`day-${day}`}
                    onClick={() => {
                        setSelectedDate(dateStr);
                    }}
                    className={`bg-white min-h-[120px] p-2 relative group hover:bg-blue-50/30 cursor-pointer transition-colors border-2 ${selectedDate === dateStr ? 'border-primary' : 'border-transparent'}`}
                >
                    <div className={`text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'text-blue-600 bg-blue-100' : 'text-gray-700'
                        }`}>
                        {day}
                    </div>
                    <div className="relative z-10">
                        {dayEvents.map(evt => (
                            <div key={evt.id}>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/meeting/${id}/detail`);
                                    }}
                                    className={`hidden md:block text-xs px-2 py-1 rounded mb-1 truncate cursor-pointer hover:opacity-80 ${evt.type === 'money' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                                >
                                    {evt.title}
                                </div>
                                <div className="md:hidden flex justify-center mt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${evt.type === 'money' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Add Button on Hover (Desktop Only) */}
                    <div className="hidden md:group-hover:flex absolute inset-0 items-center justify-center bg-black/5 rounded-lg transition-colors">
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectionModalOpen(true);
                            }}
                            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all transform hover:scale-110 z-20"
                        >
                            <Plus className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-16 md:pb-0">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                                    <span className="text-white text-lg">mo</span>
                                </div>
                                <h1 className="text-2xl font-bold">독서 모임</h1>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">
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

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">{currentYear}년 {currentMonth + 1}월</h2>
                        <div className="flex gap-2">
                            <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={goToToday} className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50">오늘</button>
                            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-border">
                        <div className="grid grid-cols-7 border-b border-border bg-gray-50">
                            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                                <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-px bg-gray-200">
                            {renderCalendar()}
                        </div>
                    </div>

                    {/* Mobile Agenda List */}
                    <div className="mt-8 space-y-4 md:hidden">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                {selectedDate.split('-')[1]}월 {selectedDate.split('-')[2]}일 일정
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectionModalOpen(true)}
                                    className="p-2 bg-primary text-white rounded-full shadow-sm active:scale-95 transition-transform"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-muted-foreground">{events.filter(e => e.date === selectedDate).length}개</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {events.filter(e => e.date === selectedDate).length > 0 ? (
                                events.filter(e => e.date === selectedDate).map(evt => (
                                    <div
                                        key={evt.id}
                                        onClick={() => {
                                            navigate(`/meeting/${id}/detail`);
                                        }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-border flex items-center gap-4 active:scale-[0.98] transition-all"
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${evt.type === 'money' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <CalendarIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold truncate">{evt.title}</h4>
                                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{evt.time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{evt.desc}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center bg-white rounded-xl border border-dashed border-border">
                                    <p className="text-muted-foreground">이날은 등록된 일정이 없습니다</p>
                                    <button
                                        onClick={() => setSelectionModalOpen(true)}
                                        className="mt-2 text-primary font-medium text-sm"
                                    >
                                        일정 추가하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Modal */}
            {selectionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
                        <h3 className="text-lg font-bold mb-6">일정 추가 방식 선택</h3>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => { setSelectionModalOpen(false); setManualModalOpen(true); }} className="flex items-center justify-center gap-3 p-4 border border-border rounded-xl hover:bg-blue-50 transition-colors group">
                                <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200"><Edit3 className="w-5 h-5 text-primary" /></div>
                                <div className="text-left">
                                    <p className="font-medium">수동 기입</p>
                                    <p className="text-xs text-muted-foreground">직접 세부 내용을 입력합니다</p>
                                </div>
                            </button>
                            <button onClick={() => { setSelectionModalOpen(false); setAiInputModalOpen(true); }} className="flex items-center justify-center gap-3 p-4 border border-border rounded-xl hover:bg-purple-50 transition-colors group">
                                <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200"><Bot className="w-5 h-5 text-purple-600" /></div>
                                <div className="text-left">
                                    <p className="font-medium">AI 기입</p>
                                    <p className="text-xs text-muted-foreground">AI에게 말하듯 입력합니다</p>
                                </div>
                            </button>
                        </div>
                        <button onClick={() => setSelectionModalOpen(false)} className="mt-6 text-sm text-gray-500 hover:text-gray-800">취소</button>
                    </div>
                </div>
            )}

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

export default Schedule;
