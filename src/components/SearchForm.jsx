import { useState, useRef, useEffect } from 'react';
import RoleSuggestions from './RoleSuggestions';

const SearchForm = ({ onSearch, isSearching, lockedRole }) => {
  const [role, setRole] = useState(lockedRole || '');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('United States');
  const [sortBy, setSortBy] = useState('newest');
  const [dateRange, setDateRange] = useState('all');

  const [expOpen, setExpOpen] = useState(false);
  const expRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (expRef.current && !expRef.current.contains(event.target)) {
        setExpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ role, experience, location, sortBy, dateRange });
  };

  const experienceOptions = [
    { value: 'Entry Level', label: 'Junior (1-3 years)' },
    { value: 'Mid Level', label: 'Mid-Level (3-5 years)' },
    { value: 'Senior Level', label: 'Senior (5+ years)' }
  ];

  const getExperienceLabel = () => {
    const opt = experienceOptions.find(o => o.value === experience);
    return opt ? opt.label : 'Select Experience';
  };

  return (
    <div className="search-card">
      <form id="searchForm" className="search-form" onSubmit={handleSubmit}>
        {lockedRole ? (
          <div className="input-group">
            <label>Job Role (Locked)</label>
            <input 
              type="text" 
              value={lockedRole} 
              disabled 
              style={{ background: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }} 
            />
          </div>
        ) : (
          <RoleSuggestions 
            value={role} 
            onChange={setRole} 
            onSelect={setRole} 
          />
        )}
        
        <div className="input-group">
          <label htmlFor="experience">Experience Level</label>
          <div className={`custom-select-wrapper ${expOpen ? 'open' : ''}`} ref={expRef}>
            <input type="hidden" id="experience" value={experience} required />
            <div 
              className={`custom-select-trigger ${experience ? 'has-value' : ''}`} 
              onClick={() => setExpOpen(!expOpen)}
            >
              <span className="selected-value">{getExperienceLabel()}</span>
              <span className="arrow">▼</span>
            </div>
            <div className="custom-options">
              {experienceOptions.map(opt => (
                <div 
                  key={opt.value}
                  className={`custom-option ${experience === opt.value ? 'selected' : ''}`}
                  data-value={opt.value}
                  onClick={() => {
                    setExperience(opt.value);
                    setExpOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="location">Location</label>
          <input 
            type="text" 
            id="location" 
            placeholder="e.g. United States" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* New Sorting and Filtering */}
        <div className="filters-row" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', gridColumn: '1 / -1' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="sortBy">Sort By</label>
            <select 
              id="sortBy" 
              className="start-input" // Reusing styling if possible, or we might need new CSS
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e1e4e8', fontSize: '1rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="dateRange">Date Posted</label>
            <select 
              id="dateRange"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e1e4e8', fontSize: '1rem' }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">Any Time</option>
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Past Week</option>
              <option value="30d">Past Month</option>
            </select>
          </div>
        </div>

        <button type="submit" className="search-btn" disabled={isSearching}>
          <span className="btn-text">{isSearching ? 'Searching...' : 'Find Jobs'}</span>
          <span className="btn-icon">→</span>
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
