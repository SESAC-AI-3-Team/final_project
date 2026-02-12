import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import logo from './icon/logo.png'; // Removed import

const MyPage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: '김철수',
        email: 'kimcs@example.com',
        phone: '010-1234-5678',
        joinDate: '2026-01-15'
    });

    const handleSave = () => {
        setIsEditing(false);
        alert('프로필이 저장되었습니다.');
    };

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/main')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <img src="http://localhost:8000/static/icon/logo.png" alt="Momo Logo" className="h-10 w-auto" />
                            <h1 className="text-2xl font-bold">마이페이지</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h2 className="mb-2 text-xl font-medium">{profile.name}</h2>
                                <p className="text-muted-foreground">{profile.email}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <User className="w-5 h-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                    <label className="block mb-2 font-medium">이름</label>
                                    {!isEditing ? (
                                        <p className="text-lg">{profile.name}</p>
                                    ) : (
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-white rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                    <label className="block mb-2 font-medium">이메일</label>
                                    {!isEditing ? (
                                        <p className="text-lg">{profile.email}</p>
                                    ) : (
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-white rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone className="w-5 h-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                    <label className="block mb-2 font-medium">전화번호</label>
                                    {!isEditing ? (
                                        <p className="text-lg">{profile.phone}</p>
                                    ) : (
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full px-4 py-2 bg-white rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                    <label className="block mb-2 font-medium">가입일</label>
                                    <p className="text-lg">{profile.joinDate}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                                    프로필 수정
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                                        취소
                                    </button>
                                    <button onClick={handleSave} className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                                        저장
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="mb-4 text-lg font-medium">계정 설정</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                                비밀번호 변경
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                                알림 설정
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-red-500">
                                계정 삭제
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
