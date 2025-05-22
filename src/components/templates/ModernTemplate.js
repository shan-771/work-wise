import './templateStyles.css';

export default function ModernTemplate({ data }) {
  return (
    <div className="resume modern-template">
      <div className="two-column-layout">
        {/* Left Column - Personal Info */}
        <div className="left-column">
          {data.profilePic && (
            <div className="profile-section">
              <img src={data.profilePic} alt="Profile" className="profile-image" />
            </div>
          )}

          <div className="personal-info">
            <h1 className="name">{data.fullName}</h1>
            {data.profession && <p className="profession">{data.profession}</p>}
          </div>

          {/* Contact Information */}
          <div className="section contact-section">
            <h2 className="section-title">Contact</h2>
            <div className="contact-details">
              {data.email && (
                <div className="contact-item">
                  <span className="icon">✉️</span>
                  <span>{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="contact-item">
                  <span className="icon">📱</span>
                  <span>{data.phone}</span>
                </div>
              )}
              {data.location && (
                <div className="contact-item">
                  <span className="icon">📍</span>
                  <span>{data.location}</span>
                </div>
              )}
              {data.linkedIn && (
                <div className="contact-item">
                  <span className="icon">🔗</span>
                  <a href={data.linkedIn} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Skills Section */}
          {data.skills?.length > 0 && (
            <div className="section skills-section">
              <h2 className="section-title">Skills</h2>
              <div className="skills-grid">
                {data.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Section */}
          {data.languages?.length > 0 && (
            <div className="section languages-section">
              <h2 className="section-title">Languages</h2>
              <div className="languages-list">
                {data.languages.map((lang, index) => {
                  // Handle both string and object format
                  const languageName = typeof lang === 'string' ? lang.split(' ')[0] : lang.name;
                  const proficiency = typeof lang === 'string' ? 
                    (lang.toLowerCase().includes('fluent') ? 90 : 
                     lang.toLowerCase().includes('intermediate') ? 60 : 30) : 
                    lang.proficiency || 50;
                  
                  return (
                    <div key={index} className="language-item">
                      <span className="language-name">{languageName}</span>
                      <div className="language-proficiency">
                        <div 
                          className="proficiency-bar"
                          style={{ width: `${proficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Professional Content */}
        <div className="right-column">
          {/* Summary Section */}
          {data.summary && (
            <div className="section summary-section">
              <h2 className="section-title">Professional Profile</h2>
              <p className="summary-text">{data.summary}</p>
            </div>
          )}

          {/* Enhanced Experience Section */}
          {data.experience?.length > 0 && (
            <div className="section experience-section">
              <h2 className="section-title">Work Experience</h2>
              <div className="timeline">
                {data.experience.map((exp, index) => (
                  <div key={index} className="timeline-item" style={{ marginBottom: '2rem' }}>
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

          {/* Projects Section */}
          {data.projects?.length > 0 && (
            <div className="section projects-section">
              <h2 className="section-title">Key Projects</h2>
              <div className="projects-grid">
                {data.projects.map((project, index) => (
                  <div key={index} className="project-card">
                    <h3 className="project-title">{project.name}</h3>
                    {project.technologies && (
                      <div className="project-technologies">
                        {Array.isArray(project.technologies) ? (
                          project.technologies.map((tech, i) => (
                            <span key={i} className="tech-tag">{tech}</span>
                          ))
                        ) : (
                          <span className="tech-tag">{project.technologies}</span>
                        )}
                      </div>
                    )}
                    <p className="project-description">{project.description}</p>
                    {project.link && (
                      <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {data.education?.length > 0 && (
            <div className="section education-section">
              <h2 className="section-title">Education</h2>
              <div className="education-list">
                {data.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <h3 className="degree">{edu.degree}</h3>
                    <p className="institution">{edu.institution}</p>
                    <p className="education-dates">
                      {edu.startYear} - {edu.endYear || 'Present'}
                      {edu.gpa && <span> | GPA: {edu.gpa}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}