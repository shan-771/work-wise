import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEdit, FiSave } from 'react-icons/fi';
import BasicTemplate from './templates/BasicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import './ResumeEditor.css';

function ResumeEditor() {
  const [template, setTemplate] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const navigate = useNavigate();

  // Load selected template and user data
  useEffect(() => {
    const templateId = localStorage.getItem('selectedTemplate');
    const data = JSON.parse(localStorage.getItem('userData'));
    
    if (!templateId || !data) {
      navigate('/resume-builder');
    } else {
      setTemplate(templateId);
      setUserData(data);
      setEditableData(data);
    }
  }, [navigate]);

  // Handle input changes for editable fields
  const handleInputChange = (section, field, value) => {
    setEditableData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle array item changes (for skills, experiences, education, etc.)
  const handleArrayItemChange = (section, index, field, value) => {
    setEditableData(prev => {
      const updatedSection = [...prev[section]];
      updatedSection[index] = {
        ...updatedSection[index],
        [field]: value
      };
      return {
        ...prev,
        [section]: updatedSection
      };
    });
  };

  // Add new item to an array section
  const handleAddItem = (section, newItem) => {
    setEditableData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  // Remove item from an array section
  const handleRemoveItem = (section, index) => {
    setEditableData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Save edited data
  const handleSave = () => {
    setUserData(editableData);
    localStorage.setItem('userData', JSON.stringify(editableData));
    setIsEditing(false);
  };

  // Render different templates
  const renderTemplate = () => {
    if (!template || !userData) return <div className="loading">Loading...</div>;
    
    switch(template) {
      case 'basic':
        return (
          <BasicTemplate 
            data={isEditing ? editableData : userData} 
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onArrayItemChange={handleArrayItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
        );
      case 'modern':
        return (
          <ModernTemplate 
            data={isEditing ? editableData : userData} 
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onArrayItemChange={handleArrayItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
        );
      case 'professional':
        return (
          <ProfessionalTemplate 
            data={isEditing ? editableData : userData} 
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onArrayItemChange={handleArrayItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
        );
      default:
        return <div className="error">Template not found</div>;
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="resume-editor-container">
      <div className="editor-header">
        <h1>Resume Editor</h1>
        <p>Customize your {template} resume</p>
      </div>

      <div className="editor-controls">
        <button 
          onClick={() => navigate('/resume-builder')}
          className="control-btn back-btn"
        >
          <FiArrowLeft /> Change Template
        </button>

        <div className="control-group">
          <button 
            onClick={handleEditToggle}
            className={`control-btn ${isEditing ? 'active' : ''}`}
          >
            {isEditing ? <><FiSave /> Save Changes</> : <><FiEdit /> Edit Mode</>}
          </button>
          {!isEditing && (
            <button 
              onClick={handleDownload}
              className="control-btn download-btn"
            >
              <FiDownload /> Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="resume-preview-container">
        {renderTemplate()}
      </div>
    </div>
  );
}

export default ResumeEditor;