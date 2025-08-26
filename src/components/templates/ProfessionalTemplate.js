import './templateStyles.css';

export default function ProfessionalTemplate({ data, isEditing, onInputChange, onArrayItemChange, onAddItem, onRemoveItem }) {
  return (
    <div className="resume professional-template">
      {/* Header Section */}
      <div className="header">
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
            data.fullName || 'Your Name'
          )}
        </h1>
        <p className="profession">
          {isEditing ? (
            <input
              type="text"
              value={data.profession || ''}
              onChange={e => onInputChange('personal', 'profession', e.target.value)}
              placeholder="Profession"
              className="edit-input"
            />
          ) : (
            data.profession || 'Your Profession'
          )}
        </p>
        <p className="contact-info">
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
                value={data.linkedin || ''}
                onChange={e => onInputChange('personal', 'linkedin', e.target.value)}
                placeholder="LinkedIn URL"
                className="edit-input"
              />
            </>
          ) : (
            <>
              {data.email && <span>{data.email} • </span>}
              {data.phone && <span>{data.phone} • </span>}
              {data.linkedin && (
                <a href={data.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              )}
            </>
          )}
        </p>
      </div>

      {/* Summary Section */}
      {isEditing ? (
        <div className="section">
          <h2 className="section-title">Professional Summary</h2>
          <textarea
            className="edit-input"
            value={data.summary || ''}
            onChange={e => onInputChange('personal', 'summary', e.target.value)}
            placeholder="Professional Summary"
          />
        </div>
      ) : (
        data.summary && (
          <div className="section">
            <h2 className="section-title">Professional Summary</h2>
            <p>{data.summary}</p>
          </div>
        )
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

      {/* Skills Section */}
      {data.skills?.length > 0 && (
        <div className="section">
          <h2 className="section-title">Skills</h2>
          <div className="skills-list">
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
                <span key={index} className="skill-tag">{skill}</span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Education Section */}
      {data.education?.length > 0 && (
        <div className="section">
          <h2 className="section-title">Education</h2>
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
                    value={edu.fieldOfStudy || ''}
                    onChange={e => onArrayItemChange('education', index, 'fieldOfStudy', e.target.value)}
                    placeholder="Field of Study"
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
                </>
              ) : (
                <>
                  <h3>{edu.degree} in {edu.fieldOfStudy}</h3>
                  <p className="institution">{edu.institution} | {edu.startYear} - {edu.endYear}</p>
                </>
              )}
              {isEditing && (
                <button type="button" className="remove-btn" onClick={() => onRemoveItem('education', index)}>Remove</button>
              )}
            </div>
          ))}
          {isEditing && (
            <button type="button" className="add-btn" onClick={() => onAddItem('education', { degree: '', fieldOfStudy: '', institution: '', startYear: '', endYear: '' })}>Add Education</button>
          )}
        </div>
      )}

      {/* Projects Section */}
      {data.projects?.length > 0 && (
        <div className="section">
          <h2 className="section-title">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="project-item">
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
                  <textarea
                    className="edit-input"
                    value={project.description || ''}
                    onChange={e => onArrayItemChange('projects', index, 'description', e.target.value)}
                    placeholder="Project Description"
                  />
                </>
              ) : (
                <>
                  <h3>{project.name}</h3>
                  {project.technologies && Array.isArray(project.technologies) && (
                    <p className="tech-stack">
                      <strong>Technologies:</strong> {project.technologies.join(', ')}
                    </p>
                  )}
                  <p className="project-description">{project.description}</p>
                </>
              )}
              {isEditing && (
                <button type="button" className="remove-btn" onClick={() => onRemoveItem('projects', index)}>Remove</button>
              )}
            </div>
          ))}
          {isEditing && (
            <button type="button" className="add-btn" onClick={() => onAddItem('projects', { name: '', technologies: [], description: '' })}>Add Project</button>
          )}
        </div>
      )}
    </div>
  );
}
