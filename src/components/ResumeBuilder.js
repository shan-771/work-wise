import React from 'react';
import { useNavigate } from 'react-router-dom';
import useUserData from "../hooks/useUserData";
import './ResumeBuilder.css';

function ResumeBuilder() {
  const { userData, loading, error } = useUserData();
  const navigate = useNavigate();

  const handleTemplateSelect = (templateId) => {
    localStorage.setItem('selectedTemplate', templateId);
    localStorage.setItem('userData', JSON.stringify(userData));
    navigate('/resume-editor');
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Loading your data...</p>
    </div>
  );

  if (error) return (
    <div className="error-state">
      <p>⚠️ Error: {error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <div className="resume-builder-container">
      <div className="header">
        <h1>Welcome back, <span>{userData?.fullName || 'User'}</span></h1>
        <p>Select a template to get started</p>
      </div>
      
      <div className="templates-grid">
        <div className="template-card" onClick={() => handleTemplateSelect('basic')}>
          <div className="template-preview basic-template">
            <div className="preview-content">
              <div className="preview-header"></div>
              <div className="preview-body">
                <div className="preview-line short"></div>
                <div className="preview-line medium"></div>
                <div className="preview-line long"></div>
              </div>
            </div>
          </div>
          <div className="template-footer">
            <button className="select-button">Basic</button>
            <span className="template-description">Clean single-column layout</span>
          </div>
        </div>
        
        <div className="template-card" onClick={() => handleTemplateSelect('modern')}>
          <div className="template-preview modern-template">
            <div className="preview-content">
              <div className="preview-column left"></div>
              <div className="preview-column right"></div>
            </div>
          </div>
          <div className="template-footer">
            <button className="select-button">Modern</button>
            <span className="template-description">Two-column design</span>
          </div>
        </div>
        
        <div className="template-card" onClick={() => handleTemplateSelect('professional')}>
          <div className="template-preview professional-template">
            <div className="preview-content">
              <div className="preview-header"></div>
              <div className="preview-section"></div>
              <div className="preview-section"></div>
            </div>
          </div>
          <div className="template-footer">
            <button className="select-button">Professional</button>
            <span className="template-description">Formal business style</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;