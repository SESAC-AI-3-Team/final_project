import { useState } from 'react';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Plus, Bot, X, FileText, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';
import FinancialChart from '../components/FinancialChart';
// import logo from './icon/logo.png'; // Removed import

const Dashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);

    // Mock data
    const transactions = [
        { id: 1, type: 'income', title: '회비', subtitle: '2월 회비 납부', author: '김철수', date: '2026-02-01', amount: '+50,000원' },
        { id: 2, type: 'expense', title: '도서 구매', subtitle: '이달의 책 구매', author: '박영희', date: '2026-02-03', amount: '-35,000원' }
    ];

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-16 md:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <img src="http://localhost:8000/static/icon/logo.png" alt="Momo Logo" className="h-10 w-auto" />
                                <h1 className="text-2xl font-bold">독서 모임</h1>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                일정
                            </button>
                            <div className="relative">
                                <button onClick={() => setIsDashboardDropdownOpen(!isDashboardDropdownOpen)} className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Visual Charts */}
                    <FinancialChart balance={40000} income={100000} expense={60000} />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-muted-foreground">잔액</h3>
                                <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-3xl font-bold mb-1">40,000원</p>
                            <p className="text-sm text-muted-foreground">현재 모임 잔액</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-muted-foreground">총 수입</h3>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-3xl font-bold mb-1">100,000원</p>
                            <p className="text-sm text-muted-foreground">이번 달</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-muted-foreground">총 지출</h3>
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            </div>
                            <p className="text-3xl font-bold mb-1">60,000원</p>
                            <p className="text-sm text-muted-foreground">이번 달</p>
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-lg font-medium">거래 내역</h2>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                                <Plus className="w-5 h-5" />
                                거래 추가
                            </button>
                        </div>
                        <div className="divide-y divide-border">
                            {transactions.map(tx => (
                                <div key={tx.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {tx.type === 'income' ? '수입' : '지출'}
                                                </span>
                                                <span className="font-medium">{tx.title}</span>
                                            </div>
                                            <p className="text-muted-foreground mb-1">{tx.subtitle}</p>
                                            <p className="text-sm text-muted-foreground">{tx.author} · {tx.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.amount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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

export default Dashboard;
