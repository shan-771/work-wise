import './templateStyles.css';

export default function BasicTemplate({ data }) {
  return (
    <div className="resume basic-template">
      <header className="header">
        <h1 className="name">{data.fullName}</h1>
        <div className="contact-info">
          {data.email && <span className="contact-item">{data.email}</span>}
          {data.phone && <span className="contact-item">{data.phone}</span>}
          {data.location && <span className="contact-item">{data.location}</span>}
          {data.linkedIn && (
            <span className="contact-item">
              <a href={data.linkedIn} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </span>
          )}
        </div>
      </header>

      {data.summary && (
        <section className="section summary-section">
          <h2 className="section-title">Professional Summary</h2>
          <p className="summary-text">{data.summary}</p>
        </section>
      )}

{data.experience?.length > 0 && (
  <section className="section experience-section">
    <h2 className="section-title">Work Experience</h2>
    <div className="experience-container">
      {data.experience.map((exp, index) => (
        <div key={index} className="experience-item" style={{ marginBottom: '1.5rem' }}>
          <div className="experience-header">
            <div>
              <h3 className="position" style={{ fontWeight: 'bold' }}>{exp.position}</h3>
              <p className="company" >{exp.company}</p>
            </div>
            <div className="experience-dates">
              {exp.startDate} - {exp.endDate || 'Present'}
            </div>
          </div>
          
          {exp.responsibilities && (
            <div className="responsibilities">
              {Array.isArray(exp.responsibilities) ? (
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                  {exp.responsibilities.map((item, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: '0.5rem' }}>{exp.responsibilities}</p>
              )}
            </div>
          )}
          
          {/* Optional divider between experiences (except last one) */}
          {index < data.experience.length - 1 && (
            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #eee' }} />
          )}
        </div>
      ))}
    </div>
  </section>
)}

      {data.projects?.length > 0 && (
        <section className="section projects-section">
          <h2 className="section-title">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="project-item">
              <div className="project-header">
                <h3 className="project-name">{project.name}</h3>
                {project.technologies && (
                  <span className="project-tech">
                    {Array.isArray(project.technologies) 
                      ? project.technologies.join(', ')
                      : project.technologies}
                  </span>
                )}
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-details">
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                    View Project
                  </a>
                )}
                {project.role && (
                  <span className="project-role"><strong>Role:</strong> {project.role}</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="section education-section">
          <h2 className="section-title">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <h3 className="degree">{edu.degree}</h3>
                <span className="education-dates">
                  {edu.startYear} - {edu.endYear || 'Present'}
                </span>
              </div>
              <p className="institution">{edu.institution}</p>
              {edu.gpa && <p className="gpa"><strong>GPA:</strong> {edu.gpa}</p>}
              {edu.honors && <p className="honors">{edu.honors}</p>}
            </div>
          ))}
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="section skills-section">
          <h2 className="section-title">Skills</h2>
          <div className="skills-container">
            {data.skills.map((skill, index) => (
              <span key={index} className="skill-item">{skill}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}