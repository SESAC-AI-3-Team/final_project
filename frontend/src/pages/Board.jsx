import { useState } from 'react';
import { ArrowLeft, MessageSquare, ThumbsUp, Calendar, Plus, Bot, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import BottomNav from '../components/BottomNav';

const Board = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [isNotice, setIsNotice] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [posts, setPosts] = useState([
        {
            id: 1,
            title: "다음 모임 장소 투표",
            content: "다음 모임 장소를 투표로 정하려고 합니다. 댓글로 의견 부탁드려요!",
            author: "김철수",
            date: "2026-02-03",
            likes: 5,
            comments: 8,
            isNotice: true,
            isLiked: false,
            commentsList: [
                { id: 1, author: "박영희", date: "2026-02-03", text: "상수동 어때요?" },
                { id: 2, author: "이민수", date: "2026-02-03", text: "저는 연남동 추천합니다!" }
            ]
        },
        {
            id: 2,
            title: "이번 달 회비 안내",
            content: "이번 달 회비는 5만원입니다.",
            author: "박영희",
            date: "2026-02-01",
            likes: 12,
            comments: 3,
            isNotice: false,
            isLiked: true,
            commentsList: [
                { id: 3, author: "김철수", date: "2026-02-01", text: "확인했습니다!" }
            ]
        }
    ]);

    const handleCreatePost = (e) => {
        e.preventDefault();
        const newPost = {
            id: Date.now(),
            title: newPostTitle,
            content: newPostContent,
            author: "나",
            date: new Date().toISOString().split('T')[0],
            likes: 0,
            comments: 0,
            isNotice: isNotice,
            isLiked: false,
            commentsList: []
        };
        setPosts([newPost, ...posts]);
        setNewPostTitle('');
        setNewPostContent('');
        setIsNotice(false);
        setShowCreateModal(false);
    };

    const handleLike = (postId, e) => {
        if (e) e.stopPropagation();
        setPosts(posts.map(post => {
            if (post.id === postId) {
                const newIsLiked = !post.isLiked;
                return {
                    ...post,
                    isLiked: newIsLiked,
                    likes: newIsLiked ? post.likes + 1 : post.likes - 1
                };
            }
            return post;
        }));
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const commentObj = {
            id: Date.now(),
            author: "나",
            date: new Date().toISOString().split('T')[0],
            text: newComment
        };

        setPosts(posts.map(post => {
            if (post.id === selectedPost.id) {
                return {
                    ...post,
                    comments: post.comments + 1,
                    commentsList: [...post.commentsList, commentObj]
                };
            }
            return post;
        }));
        setNewComment('');
    };

    const currentSelectedPost = posts.find(p => p.id === selectedPost?.id);


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
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                                    <span className="text-white text-lg">mo</span>
                                </div>
                                <h1 className="text-2xl font-bold">독서 모임</h1>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
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

                            <button className="px-4 py-2 rounded-lg transition-colors bg-primary text-white font-medium">
                                모임 게시판
                            </button>
                            <button onClick={() => navigate(`/meeting/${id}/ocr`)} className="px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-gray-100 font-medium">
                                OCR
                            </button>
                        </div>

                        {/* Mobile Menu Button - simple toggle for now */}
                        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        </button>
                    </div>
                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-2">
                            <button onClick={() => navigate(`/meeting/${id}/schedule`)} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-base font-medium">일정</button>
                            <div className="space-y-1">
                                <div className="px-4 py-3 font-medium text-base">회비 대시보드</div>
                                <button onClick={() => navigate(`/meeting/${id}/detail`)} className="w-full text-left px-8 py-2 text-base text-gray-600 hover:bg-gray-50 rounded-lg">대시보드 조회</button>
                            </div>
                            <button className="w-full text-left px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium text-base">모임 게시판</button>
                            <button onClick={() => navigate(`/meeting/${id}/ocr`)} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-base font-medium">OCR</button>
                        </div>
                    )}
                </div>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">모임 게시판</h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Plus className="w-5 h-5" />
                                글쓰기
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[...posts].sort((a, b) => (b.isNotice ? 1 : 0) - (a.isNotice ? 1 : 0)).map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => setSelectedPost(post)}
                                    className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 ${post.isNotice ? 'border-primary/20 bg-blue-50/10' : 'border-transparent'}`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {post.isNotice && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary text-white">
                                                공지
                                            </span>
                                        )}
                                        <h3 className="font-medium text-lg">{post.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground mb-4 line-clamp-2">{post.content}</p>

                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <span>{post.author}</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{post.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={(e) => handleLike(post.id, e)}
                                                className={`flex items-center gap-1 hover:text-primary transition-colors ${post.isLiked ? 'text-primary' : ''}`}
                                            >
                                                <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                                <span>{post.likes}</span>
                                            </button>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4" />
                                                <span>{post.comments}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Fab */}
            <button
                onClick={() => setIsAIModalOpen(true)}
                className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-transform hover:scale-105 z-40"
            >
                <Bot className="w-8 h-8" />
            </button>

            {/* AI Modal */}
            <AIChatModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">새 게시글 작성</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div>
                                <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    제목
                                </label>
                                <input
                                    id="postTitle"
                                    type="text"
                                    value={newPostTitle}
                                    onChange={(e) => setNewPostTitle(e.target.value)}
                                    placeholder="제목을 입력하세요"
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-1">
                                    내용
                                </label>
                                <textarea
                                    id="postContent"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="내용을 입력하세요"
                                    rows={8}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2 py-2">
                                <input
                                    id="isNotice"
                                    type="checkbox"
                                    checked={isNotice}
                                    onChange={(e) => setIsNotice(e.target.checked)}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                                />
                                <label htmlFor="isNotice" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    공지사항으로 등록 (게시판 최상단 고정)
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-600"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-md"
                                >
                                    작성 완료
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Post Detail Modal */}
            {selectedPost && currentSelectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-2">
                                {currentSelectedPost.isNotice && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary text-white">
                                        공지
                                    </span>
                                )}
                                <h2 className="text-xl font-bold line-clamp-1">{currentSelectedPost.title}</h2>
                            </div>
                            <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="mb-6 pb-6 border-b border-border">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <span className="font-medium text-gray-900">{currentSelectedPost.author}</span>
                                    <span>·</span>
                                    <span>{currentSelectedPost.date}</span>
                                </div>
                                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {currentSelectedPost.content}
                                </div>
                                <div className="mt-6 flex items-center gap-4">
                                    <button
                                        onClick={() => handleLike(currentSelectedPost.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${currentSelectedPost.isLiked ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-gray-50'}`}
                                    >
                                        <ThumbsUp className={`w-5 h-5 ${currentSelectedPost.isLiked ? 'fill-current' : ''}`} />
                                        <span className="font-medium">{currentSelectedPost.likes}</span>
                                    </button>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MessageSquare className="w-5 h-5" />
                                        <span>{currentSelectedPost.comments}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold">댓글 {currentSelectedPost.comments}</h3>
                                <div className="space-y-4">
                                    {currentSelectedPost.commentsList.map(comment => (
                                        <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-sm">{comment.author}</span>
                                                <span className="text-xs text-muted-foreground">{comment.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.text}</p>
                                        </div>
                                    ))}
                                    {currentSelectedPost.commentsList.length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">첫 번째 댓글을 남겨보세요!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-white rounded-b-2xl">
                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="댓글을 입력하세요..."
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                                >
                                    등록
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <BottomNav />
        </div>
    );
};

export default Board;
