import { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import ResultsSection from './components/ResultsSection';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'register', 'app'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('job_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('app');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('job_user', JSON.stringify(userData));
    setView('app');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('job_user');
    setView('login');
    setJobs([]);
    setHasSearched(false);
  };

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    setJobs([]);
    setHasSearched(true);
    
    try {
      // 1. Trigger Link Request
      const API_BASE = 'http://localhost:3000'; // For local dev
      // const API_BASE = 'https://redis-jobseeker-backend.onrender.com';

      // Ensure userId is unique for this session/request
      const userId = user ? `user-${user.username}` : 'frontend-user-' + Date.now();

      const requestRes = await fetch(`${API_BASE}/api/v1/request-for-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: searchParams.role,
          experience: searchParams.experience,
          location: searchParams.location,
          userId
        })
      });

      if (!requestRes.ok) {
        throw new Error('Failed to initiate job search request');
      }

      // 2. Wait for a moment (simulating processing/database update)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Fetch Results with Sorting & Filtering
      const queryParams = new URLSearchParams({
        role: searchParams.role,
        experience: searchParams.experience,
        sortBy: searchParams.sortBy,
        dateRange: searchParams.dateRange
      });

      const searchRes = await fetch(`${API_BASE}/api/v1/search?${queryParams.toString()}`);
      
      if (!searchRes.ok) {
        throw new Error('Failed to fetch job results');
      }

      const data = await searchRes.json();
      setJobs(data.jobs || []);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'login') {
    return <Login onLogin={handleLogin} onNavigate={setView} />;
  }

  if (view === 'register') {
    return <Register onLogin={handleLogin} onNavigate={setView} />;
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo">
          <img style={{ borderRadius: '1rem' }} src="yuvii-logo.jpeg" alt="Yuvii Logo" className="main-logo-img" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <p className="tagline">Explore thousands of remote and onsite opportunities.</p>
          <div className="user-controls" style={{ fontSize: '0.9rem' }}>
            <span style={{ marginRight: '1rem', fontWeight: '500' }}>Hello, {user?.role}</span>
            <button 
              onClick={handleLogout}
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="search-section">
          <SearchForm 
            onSearch={handleSearch} 
            isSearching={loading} 
            lockedRole={user?.role}
          />
        </section>

        <ResultsSection 
          jobs={jobs} 
          loading={loading} 
          error={error} 
          hasSearched={hasSearched}
        />
      </main>
    </div>
  );
}

export default App;
