import JobCard from './JobCard';

const ResultsSection = ({ jobs, loading, error, hasSearched, pagination, currentPage, onPageChange }) => {
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

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (!pagination || pagination.totalPages <= 1) return [];

    const pages = [];
    const totalPages = pagination.totalPages;
    const current = currentPage;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (current >= totalPages - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <section className="results-section" id="resultsSection">
      <div className="results-header">
        <h2 id="resultsTitle">Latest Opportunities</h2>
        <span className="badge" id="resultsCount">
          {pagination?.totalJobs || jobs.length} jobs found
        </span>
      </div>

      <div id="jobsGrid" className="jobs-grid">
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="jobs-pagination">
          <div className="pagination-info">
            Showing {jobs.length} of {pagination.totalJobs} jobs • Page {currentPage} of {pagination.totalPages}
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => onPageChange(1)}
              disabled={!pagination.hasPrevPage}
              className="pagination-btn"
              title="First Page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="pagination-btn"
              title="Previous"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className="pagination-numbers">
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`pagination-num ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="pagination-btn"
              title="Next"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <button
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
              className="pagination-btn"
              title="Last Page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ResultsSection;
