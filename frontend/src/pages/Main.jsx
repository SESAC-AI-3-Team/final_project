import { useState } from 'react';
import {
    Settings, LogOut, Plus, UserPlus, Users, Calendar, UserMinus, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Main = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    // Mock data based on the HTML
    const meetings = [
        {
            id: 1,
            title: "독서 모임",
            description: "매주 토요일 책을 읽고 토론하는 모임입니다",
            isOwner: true,
            members: 8,
            date: "2026-01-15",
            balance: "40,000원"
        },
        {
            id: 2,
            title: "등산 동호회",
            description: "주말마다 함께 산을 오르는 동호회",
            isOwner: false,
            members: 12,
            date: "2026-01-20",
            balance: "150,000원"
        }
    ];

    const handleLogout = () => {
        // Implement logout logic here
        navigate('/login');
    };

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
            {/* Fixed Header */}
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                                <span className="text-white text-lg">mo</span>
                            </div>
                            <h1 className="text-2xl font-bold">momo</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/mypage')}
                                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-black transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                                설정
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-black transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Title and Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">내 모임</h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="whitespace-nowrap">모임 만들기</span>
                            </button>
                            <button
                                onClick={() => setIsJoinModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl hover:bg-blue-50 transition-colors font-medium"
                            >
                                <UserPlus className="w-5 h-5" />
                                <span className="whitespace-nowrap">모임 가입</span>
                            </button>
                        </div>
                    </div>

                    {/* Meetings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {meetings.map((meeting) => (
                            <div key={meeting.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="mb-2 font-medium text-lg">{meeting.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {meeting.description}
                                        </p>
                                    </div>
                                    {meeting.isOwner && (
                                        <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">방장</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{meeting.members}명</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{meeting.date}</span>
                                    </div>
                                </div>

                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">현재 잔액</p>
                                    <p className="text-xl text-primary font-bold">{meeting.balance}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/meeting/${meeting.id}/schedule`)}
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                                    >
                                        입장
                                    </button>
                                    {!meeting.isOwner && (
                                        <button
                                            onClick={() => {
                                                if (confirm('정말로 이 모임에서 탈퇴하시겠습니까?')) {
                                                    console.log('Left meeting');
                                                }
                                            }}
                                            className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <UserMinus className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Meeting Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="mb-6 text-xl font-medium">새 모임 만들기</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="meetingName" className="block mb-2 font-medium">모임 이름</label>
                                <input
                                    id="meetingName"
                                    type="text"
                                    placeholder="예: 독서 모임"
                                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="meetingDescription" className="block mb-2 font-medium">모임 설명</label>
                                <textarea
                                    id="meetingDescription"
                                    placeholder="모임에 대해 간단히 설명해주세요"
                                    rows="4"
                                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    required
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                                >
                                    만들기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Meeting Modal */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="mb-6 text-xl font-medium">모임 가입하기</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="joinCode" className="block mb-2 font-medium">초대 코드</label>
                                <input
                                    id="joinCode"
                                    type="text"
                                    placeholder="초대 코드를 입력하세요"
                                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                                <p className="text-sm text-muted-foreground mt-2">모임장에게 받은 초대 코드를 입력해주세요</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsJoinModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                                >
                                    가입하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;
