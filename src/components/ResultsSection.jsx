import JobCard from './JobCard';

const ResultsSection = ({ jobs, loading, error, hasSearched }) => {
  if (loading) {
    return (
      <div id="loadingState" className="state-message">
        <div className="spinner"></div>
        <p>Searching for the best roles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div id="errorState" className="state-message">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (hasSearched && jobs.length === 0) {
    return (
      <div id="emptyState" className="state-message">
        <p>No jobs found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  if (!hasSearched && jobs.length === 0) {
      return null;
  }

  return (
    <section className="results-section" id="resultsSection">
      <div className="results-header">
        <h2 id="resultsTitle">Latest Opportunities</h2>
        <span className="badge" id="resultsCount">{jobs.length} jobs found</span>
      </div>
      
      <div id="jobsGrid" className="jobs-grid">
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>
    </section>
  );
};

export default ResultsSection;
