import './templateStyles.css';

export default function BasicTemplate({ data, isEditing, onInputChange, onArrayItemChange, onAddItem, onRemoveItem }) {
  return (
    <div className="resume basic-template">
      <header className="header">
        <h1 className="name">
          {isEditing ? (
            <input
              type="text"
              value={data.fullName || ''}
              onChange={e => onInputChange('personal', 'fullName', e.target.value)}
              placeholder="Full Name"
              className="edit-input"
            />
          ) : (
            data.fullName
          )}
        </h1>
        <div className="contact-info">
          {isEditing ? (
            <>
              <input
                type="email"
                value={data.email || ''}
                onChange={e => onInputChange('personal', 'email', e.target.value)}
                placeholder="Email"
                className="edit-input"
              />
              <input
                type="text"
                value={data.phone || ''}
                onChange={e => onInputChange('personal', 'phone', e.target.value)}
                placeholder="Phone"
                className="edit-input"
              />
              <input
                type="text"
                value={data.location || ''}
                onChange={e => onInputChange('personal', 'location', e.target.value)}
                placeholder="Location"
                className="edit-input"
              />
              <input
                type="text"
                value={data.linkedIn || ''}
                onChange={e => onInputChange('personal', 'linkedIn', e.target.value)}
                placeholder="LinkedIn URL"
                className="edit-input"
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {isEditing ? (
        <section className="section summary-section">
          <h2 className="section-title">Professional Summary</h2>
          <textarea
            className="summary-text edit-input"
            value={data.summary || ''}
            onChange={e => onInputChange('personal', 'summary', e.target.value)}
            placeholder="Professional Summary"
          />
        </section>
      ) : (
        data.summary && (
          <section className="section summary-section">
            <h2 className="section-title">Professional Summary</h2>
            <p className="summary-text">{data.summary}</p>
          </section>
        )
      )}

      {/* ...existing code for experience, projects, education, skills... */}
      {data.experience?.length > 0 && (
        <section className="section experience-section">
          <h2 className="section-title">Work Experience</h2>
          <div className="experience-container">
            {data.experience.map((exp, index) => (
              <div key={index} className="experience-item" style={{ marginBottom: '1.5rem' }}>
                <div className="experience-header">
                  <div>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={exp.position || ''}
                          onChange={e => onArrayItemChange('experience', index, 'position', e.target.value)}
                          placeholder="Position"
                          className="edit-input"
                        />
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={e => onArrayItemChange('experience', index, 'company', e.target.value)}
                          placeholder="Company"
                          className="edit-input"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="position" style={{ fontWeight: 'bold' }}>{exp.position}</h3>
                        <p className="company" >{exp.company}</p>
                      </>
                    )}
                  </div>
                  <div className="experience-dates">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={e => onArrayItemChange('experience', index, 'startDate', e.target.value)}
                          placeholder="Start Date"
                          className="edit-input"
                        />
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={e => onArrayItemChange('experience', index, 'endDate', e.target.value)}
                          placeholder="End Date"
                          className="edit-input"
                        />
                      </>
                    ) : (
                      <>{exp.startDate} - {exp.endDate || 'Present'}</>
                    )}
                  </div>
                </div>
                {isEditing ? (
                  <textarea
                    className="edit-input"
                    value={Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : exp.responsibilities || ''}
                    onChange={e => onArrayItemChange('experience', index, 'responsibilities', e.target.value.split('\n'))}
                    placeholder="Responsibilities (one per line)"
                  />
                ) : (
                  exp.responsibilities && (
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
                  )
                )}
                {isEditing && (
                  <button type="button" className="remove-btn" onClick={() => onRemoveItem('experience', index)}>Remove</button>
                )}
                {/* Optional divider between experiences (except last one) */}
                {index < data.experience.length - 1 && (
                  <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #eee' }} />
                )}
              </div>
            ))}
            {isEditing && (
              <button type="button" className="add-btn" onClick={() => onAddItem('experience', { position: '', company: '', startDate: '', endDate: '', responsibilities: [] })}>Add Experience</button>
            )}
          </div>
        </section>
      )}

      {/* ...existing code for projects, education, skills, with similar editing logic... */}
      {data.projects?.length > 0 && (
        <section className="section projects-section">
          <h2 className="section-title">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="project-item">
              <div className="project-header">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={project.name || ''}
                      onChange={e => onArrayItemChange('projects', index, 'name', e.target.value)}
                      placeholder="Project Name"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || ''}
                      onChange={e => onArrayItemChange('projects', index, 'technologies', e.target.value.split(','))}
                      placeholder="Technologies (comma separated)"
                      className="edit-input"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="project-name">{project.name}</h3>
                    {project.technologies && (
                      <span className="project-tech">
                        {Array.isArray(project.technologies) 
                          ? project.technologies.join(', ')
                          : project.technologies}
                      </span>
                    )}
                  </>
                )}
              </div>
              {isEditing ? (
                <textarea
                  className="edit-input"
                  value={project.description || ''}
                  onChange={e => onArrayItemChange('projects', index, 'description', e.target.value)}
                  placeholder="Project Description"
                />
              ) : (
                <p className="project-description">{project.description}</p>
              )}
              <div className="project-details">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={project.link || ''}
                      onChange={e => onArrayItemChange('projects', index, 'link', e.target.value)}
                      placeholder="Project Link"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={project.role || ''}
                      onChange={e => onArrayItemChange('projects', index, 'role', e.target.value)}
                      placeholder="Role"
                      className="edit-input"
                    />
                  </>
                ) : (
                  <>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                        View Project
                      </a>
                    )}
                    {project.role && (
                      <span className="project-role"><strong>Role:</strong> {project.role}</span>
                    )}
                  </>
                )}
              </div>
              {isEditing && (
                <button type="button" className="remove-btn" onClick={() => onRemoveItem('projects', index)}>Remove</button>
              )}
            </div>
          ))}
          {isEditing && (
            <button type="button" className="add-btn" onClick={() => onAddItem('projects', { name: '', technologies: [], description: '', link: '', role: '' })}>Add Project</button>
          )}
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="section education-section">
          <h2 className="section-title">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={e => onArrayItemChange('education', index, 'degree', e.target.value)}
                      placeholder="Degree"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={edu.startYear || ''}
                      onChange={e => onArrayItemChange('education', index, 'startYear', e.target.value)}
                      placeholder="Start Year"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={edu.endYear || ''}
                      onChange={e => onArrayItemChange('education', index, 'endYear', e.target.value)}
                      placeholder="End Year"
                      className="edit-input"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="degree">{edu.degree}</h3>
                    <span className="education-dates">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </span>
                  </>
                )}
              </div>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={e => onArrayItemChange('education', index, 'institution', e.target.value)}
                    placeholder="Institution"
                    className="edit-input"
                  />
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={e => onArrayItemChange('education', index, 'gpa', e.target.value)}
                    placeholder="GPA"
                    className="edit-input"
                  />
                  <input
                    type="text"
                    value={edu.honors || ''}
                    onChange={e => onArrayItemChange('education', index, 'honors', e.target.value)}
                    placeholder="Honors"
                    className="edit-input"
                  />
                </>
              ) : (
                <>
                  <p className="institution">{edu.institution}</p>
                  {edu.gpa && <p className="gpa"><strong>GPA:</strong> {edu.gpa}</p>}
                  {edu.honors && <p className="honors">{edu.honors}</p>}
                </>
              )}
              {isEditing && (
                <button type="button" className="remove-btn" onClick={() => onRemoveItem('education', index)}>Remove</button>
              )}
            </div>
          ))}
          {isEditing && (
            <button type="button" className="add-btn" onClick={() => onAddItem('education', { degree: '', institution: '', startYear: '', endYear: '', gpa: '', honors: '' })}>Add Education</button>
          )}
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="section skills-section">
          <h2 className="section-title">Skills</h2>
          <div className="skills-container">
            {isEditing ? (
              <>
                {data.skills.map((skill, index) => (
                  <input
                    key={index}
                    type="text"
                    value={skill}
                    onChange={e => onArrayItemChange('skills', index, null, e.target.value)}
                    className="edit-input"
                    placeholder="Skill"
                  />
                ))}
                <button type="button" className="add-btn" onClick={() => onAddItem('skills', '')}>Add Skill</button>
                {data.skills.length > 0 && (
                  <button type="button" className="remove-btn" onClick={() => onRemoveItem('skills', data.skills.length - 1)}>Remove Last Skill</button>
                )}
              </>
            ) : (
              data.skills.map((skill, index) => (
                <span key={index} className="skill-item">{skill}</span>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
