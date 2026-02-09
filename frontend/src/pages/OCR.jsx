import { useState, useRef } from 'react';
import { ArrowLeft, Camera, Upload, FileText, CheckCircle, Bot, X, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';

const OCR = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancelImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
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
                            <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                일정
                            </button>
                            <div className="relative">
                                <button onClick={() => setIsDashboardDropdownOpen(!isDashboardDropdownOpen)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                    회비 대시보드
                                </button>
                                {isDashboardDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg z-20">
                                        <button onClick={() => navigate(`/meeting/${id}/detail`)} className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors">대시보드 조회</button>
                                        <button onClick={() => navigate(`/meeting/${id}/detail?filter=income`)} className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors">수입 조회</button>
                                        <button onClick={() => navigate(`/meeting/${id}/detail?filter=expense`)} className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors">지출 조회</button>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => navigate(`/meeting/${id}/board`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                모임 게시판
                            </button>
                            <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">
                                OCR
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-2 text-xl font-medium">영수증 OCR</h2>
                            <p className="text-muted-foreground">영수증을 촬영하거나 업로드하면 자동으로 금액을 인식합니다</p>
                        </div>

                        {/* Upload Area */}
                        <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors border-border bg-white cursor-pointer hover:bg-blue-50 relative overflow-hidden">
                            {selectedImage ? (
                                <div className="space-y-4">
                                    <div className="relative inline-block w-full max-w-md">
                                        <img src={selectedImage} alt="Receipt Preview" className="rounded-lg shadow-md max-h-[400px] mx-auto object-contain bg-gray-50" />
                                        <button
                                            onClick={handleCancelImage}
                                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="px-4 py-2 border border-border text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            다시 선택
                                        </button>
                                        <button className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                                            인식 시작하기
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                    </div>

                                    <h3 className="mb-2 font-medium">영수증을 업로드하세요</h3>
                                    <p className="text-muted-foreground mb-6">파일을 선택하거나 사진을 직접 촬영하세요</p>

                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
                                        >
                                            <Upload className="w-5 h-5" />
                                            파일 선택
                                        </button>
                                        <button
                                            onClick={() => cameraInputRef.current.click()}
                                            className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <Camera className="w-5 h-5" />
                                            사진 촬영
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Hidden Inputs */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <input
                                type="file"
                                ref={cameraInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                            />
                        </div>

                        {/* Example Result */}
                        <div className="space-y-4">
                            <h3 class="text-lg font-medium">처리 결과</h3>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="mb-1 font-medium">영수증_2026-02-05.jpg</h4>
                                            <p className="text-sm text-muted-foreground">2026-02-05</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 text-green-600 text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        완료
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">아메리카노</span>
                                        <span>4,500원</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">카페라떼</span>
                                        <span>5,000원</span>
                                    </div>
                                    <div className="pt-2 border-t border-border flex justify-between font-medium">
                                        <span>총액</span>
                                        <span className="text-xl text-primary">9,500원</span>
                                    </div>
                                </div>
                                <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                                    거래 내역에 추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => setIsAIModalOpen(true)} className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40">
                <Bot className="w-8 h-8" />
            </button>

            {/* AI Modal */}
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
            <BottomNav />
        </div>
    );
};

export default OCR;
