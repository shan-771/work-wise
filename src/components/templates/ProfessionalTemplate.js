import './templateStyles.css';

export default function ProfessionalTemplate({ data }) {
  return (
    <div className="resume professional-template">
      {/* Header Section */}
      <div className="header">
        <h1 className="name">{data.fullName || 'Your Name'}</h1>
        <p className="profession">{data.profession || 'Your Profession'}</p>
        <p className="contact-info">
          {data.email && <span>{data.email} • </span>}
          {data.phone && <span>{data.phone} • </span>}
          {data.linkedin && (
            <a href={data.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
        </p>
      </div>

      {/* Summary Section */}
      {data.summary && (
        <div className="section">
          <h2 className="section-title">Professional Summary</h2>
          <p>{data.summary}</p>
        </div>
      )}

      {/* Enhanced Experience Section */}
      {data.experience?.length > 0 && (
            <div className="section experience-section">
              <h2 className="section-title">Work Experience</h2>
              <div className="timeline">
                {data.experience.map((exp, index) => (
                  <div key={index} className="timeline-item" style={{ marginBottom: '2rem'}}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="experience-header">
                        <h3 className="position" style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {exp.position}
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="company" style={{  color: '#555' }}>
                            {exp.company}
                          </span>
                          <span className="experience-dates" style={{ color: '#666' }}>
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="responsibilities" style={{ marginTop: '0.75rem' }}>
                        {Array.isArray(exp.responsibilities) ? (
                          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                            {exp.responsibilities.map((item, i) => (
                              <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ marginTop: '0.5rem' }}>{exp.responsibilities}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


      {/* Skills Section */}
      {data.skills?.length > 0 && (
        <div className="section">
          <h2 className="section-title">Skills</h2>
          <div className="skills-list">
            {data.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {data.education?.length > 0 && (
        <div className="section">
          <h2 className="section-title">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="education-item">
              <h3>{edu.degree} in {edu.fieldOfStudy}</h3>
              <p className="institution">{edu.institution} | {edu.startYear} - {edu.endYear}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects Section */}
      {data.projects?.length > 0 && (
        <div className="section">
          <h2 className="section-title">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="project-item">
              <h3>{project.name}</h3>
              {project.technologies && Array.isArray(project.technologies) && (
                <p className="tech-stack">
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
                </p>
              )}
              <p className="project-description">{project.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
