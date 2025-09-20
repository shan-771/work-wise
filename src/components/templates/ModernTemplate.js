import './templateStyles.css';

export default function ModernTemplate({ data, isEditing, onInputChange, onArrayItemChange, onAddItem, onRemoveItem }) {
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
            {isEditing ? (
              <input
                type="text"
                value={data.profession || ''}
                onChange={e => onInputChange('personal', 'profession', e.target.value)}
                placeholder="Profession"
                className="edit-input"
              />
            ) : (
              data.profession && <p className="profession">{data.profession}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="section contact-section">
            <h2 className="section-title">Contact</h2>
            <div className="contact-details">
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
                </>
              )}
            </div>
          </div>

          {/* Skills Section */}
          {data.skills?.length > 0 && (
            <div className="section skills-section">
              <h2 className="section-title">Skills</h2>
              <div className="skills-grid">
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
                    <div key={index} className="skill-tag">{skill}</div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Languages Section */}
          {data.languages?.length > 0 && (
            <div className="section languages-section">
              <h2 className="section-title">Languages</h2>
              <div className="languages-list">
                {isEditing ? (
                  <>
                    {data.languages.map((lang, index) => (
                      <input
                        key={index}
                        type="text"
                        value={typeof lang === 'string' ? lang : lang.name}
                        onChange={e => onArrayItemChange('languages', index, 'name', e.target.value)}
                        className="edit-input"
                        placeholder="Language"
                      />
                    ))}
                    <button type="button" className="add-btn" onClick={() => onAddItem('languages', '')}>Add Language</button>
                    {data.languages.length > 0 && (
                      <button type="button" className="remove-btn" onClick={() => onRemoveItem('languages', data.languages.length - 1)}>Remove Last Language</button>
                    )}
                  </>
                ) : (
                  data.languages.map((lang, index) => {
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
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Professional Content */}
        <div className="right-column">
          {/* Summary Section */}
          {isEditing ? (
            <div className="section summary-section">
              <h2 className="section-title">Professional Profile</h2>
              <textarea
                className="summary-text edit-input"
                value={data.summary || ''}
                onChange={e => onInputChange('personal', 'summary', e.target.value)}
                placeholder="Professional Profile"
              />
            </div>
          ) : (
            data.summary && (
              <div className="section summary-section">
                <h2 className="section-title">Professional Profile</h2>
                <p className="summary-text">{data.summary}</p>
              </div>
            )
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
                          <h3 className="position" style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {exp.position}
                          </h3>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="company" style={{  color: '#555' }}>
                            {exp.company}
                          </span>
                          <span className="experience-dates" style={{ color: '#666' }}>
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
                          </span>
                        </div>
                      </div>
                      <div className="responsibilities" style={{ marginTop: '0.75rem' }}>
                        {isEditing ? (
                          <textarea
                            className="edit-input"
                            value={Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : exp.responsibilities || ''}
                            onChange={e => onArrayItemChange('experience', index, 'responsibilities', e.target.value.split('\n'))}
                            placeholder="Responsibilities (one per line)"
                          />
                        ) : (
                          Array.isArray(exp.responsibilities) ? (
                            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                              {exp.responsibilities.map((item, i) => (
                                <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ marginTop: '0.5rem' }}>{exp.responsibilities}</p>
                          )
                        )}
                      </div>
                      {isEditing && (
                        <button type="button" className="remove-btn" onClick={() => onRemoveItem('experience', index)}>Remove</button>
                      )}
                    </div>
                  </div>
                ))}
                {isEditing && (
                  <button type="button" className="add-btn" onClick={() => onAddItem('experience', { position: '', company: '', startDate: '', endDate: '', responsibilities: [] })}>Add Experience</button>
                )}
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
                      <h3 className="project-title">{project.name}</h3>
                    )}
                    {project.technologies && !isEditing && (
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
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={project.link || ''}
                          onChange={e => onArrayItemChange('projects', index, 'link', e.target.value)}
                          placeholder="Project Link"
                          className="edit-input"
                        />
                      </>
                    ) : (
                      project.link && (
                        <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
                          View Project →
                        </a>
                      )
                    )}
                    {isEditing && (
                      <button type="button" className="remove-btn" onClick={() => onRemoveItem('projects', index)}>Remove</button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button type="button" className="add-btn" onClick={() => onAddItem('projects', { name: '', technologies: [], description: '', link: '' })}>Add Project</button>
                )}
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
                          value={edu.institution || ''}
                          onChange={e => onArrayItemChange('education', index, 'institution', e.target.value)}
                          placeholder="Institution"
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
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={e => onArrayItemChange('education', index, 'gpa', e.target.value)}
                          placeholder="GPA"
                          className="edit-input"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="degree">{edu.degree}</h3>
                        <p className="institution">{edu.institution}</p>
                        <p className="education-dates">
                          {edu.startYear} - {edu.endYear || 'Present'}
                          {edu.gpa && <span> | GPA: {edu.gpa}</span>}
                        </p>
                      </>
                    )}
                    {isEditing && (
                      <button type="button" className="remove-btn" onClick={() => onRemoveItem('education', index)}>Remove</button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button type="button" className="add-btn" onClick={() => onAddItem('education', { degree: '', institution: '', startYear: '', endYear: '', gpa: '' })}>Add Education</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
