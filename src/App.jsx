import { Routes, Route } from 'react-router-dom';
import UserJobSearch from './components/UserJobSearch';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/" element={<UserJobSearch />} />
      <Route path="*" element={<UserJobSearch />} />
    </Routes>
  );
}

export default App;
