import { useState, useEffect, useRef } from 'react';

const SUPPORTED_ROLES = [
  "Backend Engineer", "Frontend Engineer", "Full Stack Engineer", "Mobile Engineer", "Software Engineer",
  "Platform Engineer", "Systems Engineer", "Embedded Systems Engineer", "UI UX",
  "Cloud Engineer", "Cloud Architect", "DevOps Engineer", "Site Reliability Engineer (SRE)", "Infrastructure Engineer",
  "Cloud Strategy Consultant", "Network Cloud Engineer",
  "Security Engineer", "Cloud Security Engineer", "Application Security Engineer", "Network Security Engineer",
  "Cyber Security Analyst", "GRC / Compliance Engineer", "IT Auditor", "FedRAMP / ATO Engineer", "Technology Risk Manager",
  "Data Engineer", "Data Scientist", "Analytics Engineer", "Business Intelligence Engineer", "Machine Learning Engineer",
  "AI Engineer", "Financial Analyst",
  "QA Engineer", "Automation Test Engineer", "Performance Test Engineer", "Security Test Engineer", "Test Lead / QA Lead",
  "IT Infrastructure Engineer", "IT Operations Engineer", "Linux / Unix Administrator", "Monitoring / SIEM Engineer",
  "Observability Engineer", "Release / Configuration Manager", "Network Engineer",
  "SAP Analyst", "ERP Consultant", "CRM Consultant", "ServiceNow Developer / Admin", "IT Asset / ITOM Engineer",
  "Workday Analyst", "Salesforce Developer",
  "Enterprise Architect", "Solutions Architect", "IT Manager", "CTO / CIO", "Product Manager", "Technical Product Manager",
  "Project Manager", "Program Manager",
  "Blockchain Engineer", "IoT Engineer", "Robotics Engineer", "AR / VR Engineer", "AML KYC", "Business Analyst"
];

const RoleSuggestions = ({ value, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInput = (e) => {
    const query = e.target.value;
    onChange(query);

    if (query.length < 1) {
      setSuggestions([]);
      setIsVisible(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = SUPPORTED_ROLES.filter(role =>
      role.toLowerCase().includes(lowerQuery)
    );

    matches.sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(lowerQuery);
      const bStarts = b.toLowerCase().startsWith(lowerQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    setSuggestions(matches.slice(0, 10));
    setIsVisible(true);
  };

  const handleSelect = (role) => {
    onSelect(role);
    setIsVisible(false);
  };

  return (
    <div className="input-group" ref={wrapperRef}>
      <label htmlFor="role">Job Role</label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          id="role"
          placeholder="e.g. Frontend Developer"
          value={value}
          onChange={handleInput}
          onFocus={() => value.length >= 1 && setSuggestions(suggestions) && setIsVisible(true)}
          required
          autoComplete="off"
        />
        {isVisible && suggestions.length > 0 && (
          <div className="suggestions-box visible">
            {suggestions.map((role) => (
              <div
                key={role}
                className="suggestion-item"
                onClick={() => handleSelect(role)}
              >
                {role}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSuggestions;
