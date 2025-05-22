import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ResumeScorer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [score, setScore] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Extract keywords from job description
  const extractKeywords = (text) => {
    if (!text) return { hardSkills: [], softSkills: [], tools: [], experience: [], education: [] };
    
    // Focus on requirements section if it exists
    const requirementsSection = text.match(/requirements:(.*?)(?=nice to have|benefits|$)/is)?.[1] || text;
    
    const hardSkills = requirementsSection.match(/\b(react|javascript|typescript|node\.?js|python|java|html|css|sql)\b/gi) || [];
    const softSkills = requirementsSection.match(/\b(communication|teamwork|leadership|problem[- ]solving|collaboration)\b/gi) || [];
    const tools = requirementsSection.match(/\b(git|aws|docker|jenkins|webpack|redux)\b/gi) || [];
    const experience = requirementsSection.match(/\d+\+ years? experience\b/gi) || [];
    const education = requirementsSection.match(/\b(bachelor'?s?|master'?s?|ph\.?d|degree)\b/gi) || [];

    return {
      hardSkills: [...new Set(hardSkills.map(s => s.toLowerCase()))],
      softSkills: [...new Set(softSkills.map(s => s.toLowerCase()))],
      tools: [...new Set(tools.map(s => s.toLowerCase()))],
      experience: [...new Set(experience)],
      education: [...new Set(education.map(s => s.toLowerCase()))]
    };
  };

  // Calculate ATS score
  const calculateScore = () => {
    if (!resumeText || !jobDescriptionText) return;
    
    const jdKeywords = extractKeywords(jobDescriptionText);
    const resumeLower = resumeText.toLowerCase();
    
    let totalScore = 0;
    const matchedKeywords = [];
    const missingKeywords = [];
    const missingRequirements = [];
    const scoreBreakdown = {};
    const suggestions = [];

    // Calculate scores for each category
    const calculateCategoryScore = (keywords, weight) => {
      if (!keywords || keywords.length === 0) return 0;
      const matched = keywords.filter(kw => 
        new RegExp(`\\b${kw}\\b`, 'i').test(resumeLower)
      );
      matchedKeywords.push(...matched);
      missingKeywords.push(...keywords.filter(kw => !matched.includes(kw)));
      return (matched.length / keywords.length) * weight * 100;
    };

    scoreBreakdown.hardSkills = Math.round(calculateCategoryScore(jdKeywords.hardSkills, 0.4));
    scoreBreakdown.softSkills = Math.round(calculateCategoryScore(jdKeywords.softSkills, 0.2));
    scoreBreakdown.tools = Math.round(calculateCategoryScore(jdKeywords.tools, 0.2));
    scoreBreakdown.experience = jdKeywords.experience.some(exp => 
      new RegExp(exp, 'i').test(resumeLower)
    ) ? 10 : 0;
    scoreBreakdown.education = jdKeywords.education.some(edu => 
      new RegExp(edu, 'i').test(resumeLower)
    ) ? 10 : 0;

    totalScore = Math.min(Math.round(Object.values(scoreBreakdown).reduce((a, b) => a + b, 0)), 100);

    // Generate suggestions
    if (scoreBreakdown.hardSkills < 30 && missingKeywords.length > 0) {
      suggestions.push(`Add these skills: ${missingKeywords.slice(0, 5).join(', ')}${missingKeywords.length > 5 ? '...' : ''}`);
    }
    if (scoreBreakdown.experience === 0 && jdKeywords.experience.length > 0) {
      missingRequirements.push(`Requires ${jdKeywords.experience.join(' or ')} experience`);
    }
    if (scoreBreakdown.education === 0 && jdKeywords.education.length > 0) {
      missingRequirements.push(`Requires ${jdKeywords.education.join(' or ')} degree`);
    }

    setAnalysis({
      matchedKeywords,
      missingKeywords,
      missingRequirements,
      scoreBreakdown,
      suggestions
    });
    setScore(totalScore);
  };

  // Process uploaded files
  const processFile = async (file) => {
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + ' ';
        }
        return text.trim();
      } else {
        return await file.text();
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error processing ${file.name}`);
      return '';
    }
  };

  // Handle file drops
  const onDrop = async (acceptedFiles, isResume) => {
    if (acceptedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      const text = await processFile(acceptedFiles[0]);
      if (isResume) {
        setResumeText(text);
      } else {
        setJobDescriptionText(text);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Recalculate score when files change
  useEffect(() => {
    calculateScore();
  }, [resumeText, jobDescriptionText]);

  // Dropzone configurations
  const resumeDropzone = useDropzone({
    onDrop: (files) => onDrop(files, true),
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: false,
    maxFiles: 1,
    disabled: isProcessing
  });

  const jdDropzone = useDropzone({
    onDrop: (files) => onDrop(files, false),
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: false,
    maxFiles: 1,
    disabled: isProcessing
  });

  // Circular progress component
  const CircularProgress = ({ percentage }) => (
    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r="54"
          stroke="#e9ecef" strokeWidth="12" fill="none"
        />
        <circle
          cx="60" cy="60" r="54"
          stroke={percentage > 70 ? '#28a745' : percentage > 50 ? '#ffc107' : '#dc3545'}
          strokeWidth="12"
          strokeDasharray="339"
          strokeDashoffset={339 - (339 * percentage / 100)}
          strokeLinecap="round"
          fill="none"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '24px',
        fontWeight: 'bold',
        color: percentage > 70 ? '#28a745' : percentage > 50 ? '#ffc107' : '#dc3545'
      }}>
        {percentage}%
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>ATS Resume Optimizer</h1>
      
      {/* File Upload Areas */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div 
          {...resumeDropzone.getRootProps()} 
          style={{ 
            flex: 1,
            border: '2px dashed #4a89dc',
            padding: '25px',
            textAlign: 'center',
            cursor: isProcessing ? 'wait' : 'pointer',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            transition: 'all 0.3s'
          }}
        >
          <input {...resumeDropzone.getInputProps()} />
          <h3 style={{ color: '#4a89dc', marginBottom: '10px' }}>Upload Resume</h3>
          <p style={{ color: '#666' }}>(PDF or TXT)</p>
          {isProcessing && resumeDropzone.isFileDialogActive ? (
            <p style={{ color: '#4a89dc', marginTop: '10px' }}>Processing...</p>
          ) : resumeText ? (
            <p style={{ color: '#28a745', marginTop: '10px' }}>✓ Resume Loaded</p>
          ) : (
            <p style={{ color: '#666', marginTop: '10px' }}>Drag & drop file here</p>
          )}
        </div>

        <div 
          {...jdDropzone.getRootProps()} 
          style={{ 
            flex: 1,
            border: '2px dashed #37bc9b',
            padding: '25px',
            textAlign: 'center',
            cursor: isProcessing ? 'wait' : 'pointer',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            transition: 'all 0.3s'
          }}
        >
          <input {...jdDropzone.getInputProps()} />
          <h3 style={{ color: '#37bc9b', marginBottom: '10px' }}>Upload Job Description</h3>
          <p style={{ color: '#666' }}>(PDF or TXT)</p>
          {isProcessing && jdDropzone.isFileDialogActive ? (
            <p style={{ color: '#37bc9b', marginTop: '10px' }}>Processing...</p>
          ) : jobDescriptionText ? (
            <p style={{ color: '#28a745', marginTop: '10px' }}>✓ JD Loaded</p>
          ) : (
            <p style={{ color: '#666', marginTop: '10px' }}>Drag & drop file here</p>
          )}
        </div>
      </div>

      {/* Results Section */}
      {score !== null && (
        <div style={{ 
          border: '1px solid #e0e0e0', 
          padding: '30px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: '30px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h2 style={{ marginBottom: '5px', color: '#333' }}>ATS Compatibility Score</h2>
              <p style={{ 
                color: score > 70 ? '#28a745' : score > 50 ? '#f6bb42' : '#da4453',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {score > 70 ? 'Excellent match! 🎉' : 
                 score > 50 ? 'Good match, but could be improved 👍' : 
                 'Needs significant improvement ⚠️'}
              </p>
            </div>
            <CircularProgress percentage={score} />
          </div>

          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {/* Positive Matches */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ 
                backgroundColor: '#f0f9eb',
                padding: '20px',
                borderRadius: '8px',
                height: '100%'
              }}>
                <h3 style={{ color: '#28a745', marginBottom: '15px' }}>✅ Strong Matches</h3>
                {analysis.matchedKeywords.length > 0 ? (
                  <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                    {analysis.matchedKeywords.slice(0, 10).map((keyword, i) => (
                      <li key={i} style={{ 
                        marginBottom: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#e1f3d8',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          borderRadius: '50%',
                          textAlign: 'center',
                          lineHeight: '20px',
                          marginRight: '10px',
                          fontSize: '12px'
                        }}>✓</span>
                        <strong>{keyword}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666' }}>No strong keyword matches found</p>
                )}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ 
                backgroundColor: '#fef6f6',
                padding: '20px',
                borderRadius: '8px',
                height: '100%'
              }}>
                <h3 style={{ color: '#da4453', marginBottom: '15px' }}>⚠️ Missing Keywords</h3>
                {analysis.missingKeywords.length > 0 ? (
                  <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                    {analysis.missingKeywords.slice(0, 10).map((keyword, i) => (
                      <li key={i} style={{ 
                        marginBottom: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#fce1e1',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: '#da4453',
                          color: 'white',
                          borderRadius: '50%',
                          textAlign: 'center',
                          lineHeight: '20px',
                          marginRight: '10px',
                          fontSize: '12px'
                        }}>✗</span>
                        <strong>{keyword}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666' }}>All important keywords matched!</p>
                )}

                {analysis.missingRequirements.length > 0 && (
                  <>
                    <h4 style={{ 
                      color: '#da4453',
                      marginTop: '20px',
                      marginBottom: '15px'
                    }}>⚠️ Missing Requirements</h4>
                    <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                      {analysis.missingRequirements.map((req, i) => (
                        <li key={i} style={{ 
                          marginBottom: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#fce1e1',
                          borderRadius: '4px'
                        }}>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>📊 Detailed Score Breakdown</h3>
            <div style={{ 
              backgroundColor: '#f5f7fa',
              padding: '20px',
              borderRadius: '8px'
            }}>
              {Object.entries(analysis.scoreBreakdown).map(([category, score]) => (
                <div key={category} style={{ marginBottom: '15px' }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '5px'
                  }}>
                    <span style={{ 
                      textTransform: 'capitalize',
                      fontWeight: '500'
                    }}>
                      {category.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: score > 70 ? '#28a745' : score > 50 ? '#f6bb42' : '#da4453'
                    }}>
                      {score}%
                    </span>
                  </div>
                  <div style={{
                    height: '10px',
                    backgroundColor: '#e0e6ed',
                    borderRadius: '5px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${score}%`,
                      height: '100%',
                      backgroundColor: score > 70 ? '#28a745' : score > 50 ? '#f6bb42' : '#da4453',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>💡 Optimization Suggestions</h3>
              <div style={{ 
                backgroundColor: '#f0f7fd',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i} style={{ 
                      marginBottom: '10px',
                      paddingLeft: '20px',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: '0',
                        color: '#4a89dc'
                      }}>•</span>
                      {suggestion}
                    </li>
                  ))}
                  <li style={{ 
                    marginBottom: '10px',
                    paddingLeft: '20px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '0',
                      color: '#4a89dc'
                    }}>•</span>
                    Use exact phrases from the job description
                  </li>
                  <li style={{ 
                    marginBottom: '10px',
                    paddingLeft: '20px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '0',
                      color: '#4a89dc'
                    }}>•</span>
                    Highlight quantifiable achievements (e.g., "Increased performance by 20%")
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeScorer;