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
      <header className="app-navbar">
        <div className="nav-brand">
          <img src="yuvii-logo.jpeg" alt="Yuvii Logo" className="nav-logo" />
        </div>
        
        <div className="user-nav">
          <span className="user-greeting">
            Hello, <span className="user-role-badge">{user?.role}</span>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="hero-section">
        <h1 className="hero-tagline">Explore thousands of remote and onsite opportunities.</h1>
      </div>

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
