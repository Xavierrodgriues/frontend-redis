const JobCard = ({ job }) => {
  const company = job.company || 'Unknown Company';
  const title = job.title || job.role || 'Job Opportunity';
  const source = job.source || 'Aggregator';

  return (
    <div className="job-card">
      <div className="job-header">
        <div className="company-name">{company}</div>
        <h3 className="job-title">{title}</h3>
      </div>
      <div className="job-meta">
        <span className="meta-item">📍 {job.location || 'United States'}</span>
        <span className="meta-item">💼 {job.experience || 'Not specified'}</span>
        <span className="meta-item">🔗 {source}</span>
      </div>
      <a 
        href={job.apply_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="apply-btn"
      >
        Apply Now ↗
      </a>
    </div>
  );
};

export default JobCard;
