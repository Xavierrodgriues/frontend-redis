import { useState, useEffect, useRef } from 'react';
import SearchForm from './SearchForm';
import ResultsSection from './ResultsSection';
import Login from './Login';
// Register is no longer imported or used here

function UserJobSearch() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('job_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('job_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('job_user');
    setJobs([]);
    setHasSearched(false);
    setCurrentPage(1);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalJobs: 0,
      limit: 12,
      hasNextPage: false,
      hasPrevPage: false
    });
    setLastSearchParams(null);
  };

  const handleSearch = async (searchParams, page = 1) => {
    setLoading(true);
    setError(null);
    if (page === 1) {
      setJobs([]);
    }
    setHasSearched(true);
    setLastSearchParams(searchParams);

    try {
      // 1. Trigger Link Request (only on first page)
      const API_BASE = 'http://localhost:3000';
      if (page === 1) {
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

        // 2. Wait for a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 3. Fetch Results with pagination
      const queryParams = new URLSearchParams({
        role: searchParams.role,
        experience: searchParams.experience,
        sortBy: searchParams.sortBy,
        dateRange: searchParams.dateRange,
        page: page.toString(),
        limit: '12'
      });

      const searchRes = await fetch(`${API_BASE}/api/v1/search?${queryParams.toString()}`);

      if (!searchRes.ok) {
        throw new Error('Failed to fetch job results');
      }

      const data = await searchRes.json();
      setJobs(data.jobs || []);
      if (data.pagination) {
        setPagination(data.pagination);
        setCurrentPage(data.pagination.currentPage);
      }

      // Scroll to results on page change (not first search)
      if (page > 1 && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && lastSearchParams) {
      setCurrentPage(newPage);
      handleSearch(lastSearchParams, newPage);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="app-navbar">
        <div className="nav-brand">
          <img src="/yuvii-logo.jpeg" alt="Yuvii Logo" className="nav-logo" />
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

        <div ref={resultsRef}>
          <ResultsSection
            jobs={jobs}
            loading={loading}
            error={error}
            hasSearched={hasSearched}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}

export default UserJobSearch;
