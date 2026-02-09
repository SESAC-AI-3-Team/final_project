import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Main from './pages/Main';
import Board from './pages/Board';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import OCR from './pages/OCR';
import Schedule from './pages/Schedule';
import MyPage from './pages/MyPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/main" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/main" element={<Main />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/meeting/:id/board" element={<Board />} />
                <Route path="/meeting/:id/dashboard" element={<Dashboard />} />
                <Route path="/meeting/:id/detail" element={<Detail />} />
                <Route path="/meeting/:id/ocr" element={<OCR />} />
                <Route path="/meeting/:id/schedule" element={<Schedule />} />
            </Routes>
        </Router>
    );
}

export default App;
