import React, { useState } from "react";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // adjust path to your firebase.js
import { getAuth } from "firebase/auth";
import { arrayUnion, Timestamp } from "firebase/firestore";

// Enhanced ATS Scorer Class
class EnhancedATSScorer {
  constructor() {
    this.skillCategories = {
      programmingLanguages: {
        javascript: ['js', 'javascript', 'ecmascript', 'es6', 'es2020'],
        python: ['python', 'py', 'python3'],
        java: ['java', 'openjdk'],
        typescript: ['typescript', 'ts'],
        csharp: ['c#', 'csharp', '.net', 'dotnet'],
        php: ['php', 'php7', 'php8'],
        go: ['golang', 'go'],
        rust: ['rust', 'rustlang'],
        swift: ['swift', 'ios'],
        kotlin: ['kotlin', 'android']
      },
      frameworks: {
        react: ['react', 'reactjs', 'react.js'],
        angular: ['angular', 'angularjs', 'angular2+'],
        vue: ['vue', 'vuejs', 'vue.js'],
        nodejs: ['node', 'nodejs', 'node.js'],
        express: ['express', 'expressjs', 'express.js'],
        django: ['django', 'python django'],
        flask: ['flask', 'python flask'],
        spring: ['spring', 'spring boot', 'springframework']
      },
      databases: {
        sql: ['sql', 'mysql', 'postgresql', 'sqlite', 'mssql'],
        nosql: ['mongodb', 'cassandra', 'dynamodb', 'redis'],
        database: ['database', 'db', 'dbms']
      },
      cloud: {
        aws: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
        azure: ['azure', 'microsoft azure'],
        gcp: ['gcp', 'google cloud', 'google cloud platform'],
        docker: ['docker', 'containerization'],
        kubernetes: ['kubernetes', 'k8s', 'container orchestration']
      },
      tools: {
        git: ['git', 'github', 'gitlab', 'version control'],
        ci_cd: ['ci/cd', 'jenkins', 'gitlab ci', 'github actions'],
        testing: ['testing', 'unit testing', 'jest', 'cypress', 'selenium']
      },
      softSkills: {
        leadership: ['leadership', 'lead', 'manage', 'mentor'],
        communication: ['communication', 'collaborate', 'teamwork'],
        problemSolving: ['problem solving', 'analytical', 'troubleshoot'],
        agile: ['agile', 'scrum', 'kanban', 'sprint']
      }
    };
    
    this.industryWeights = {
      frontend: { frameworks: 0.4, programmingLanguages: 0.3, tools: 0.2, softSkills: 0.1 },
      backend: { programmingLanguages: 0.4, databases: 0.3, cloud: 0.2, softSkills: 0.1 },
      fullstack: { programmingLanguages: 0.3, frameworks: 0.3, databases: 0.2, tools: 0.2 },
      devops: { cloud: 0.4, tools: 0.3, programmingLanguages: 0.2, softSkills: 0.1 },
      default: { programmingLanguages: 0.3, frameworks: 0.25, databases: 0.2, tools: 0.15, softSkills: 0.1 }
    };
  }

  extractEnhancedKeywords(jobDescription) {
    const text = jobDescription.toLowerCase();
    const extractedSkills = {};
    const skillImportance = {};
    
    const roleType = this.detectRoleType(text);
    
    for (const [category, skills] of Object.entries(this.skillCategories)) {
      extractedSkills[category] = [];
      
      for (const [skill, variants] of Object.entries(skills)) {
        const importance = this.calculateSkillImportance(text, variants);
        if (importance > 0) {
          extractedSkills[category].push({
            skill,
            variants,
            importance,
            required: this.isRequiredSkill(text, variants)
          });
          skillImportance[skill] = importance;
        }
      }
    }
    
    const experienceMatches = text.match(/(\d+)[\s]*(?:\+|plus)?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi);
    const minExperience = experienceMatches 
      ? Math.max(...experienceMatches.map(match => parseInt(match.match(/\d+/)[0])))
      : 0;
    
    const educationKeywords = this.extractEducationRequirements(text);
    
    return {
      skills: extractedSkills,
      roleType,
      minExperience,
      education: educationKeywords,
      skillImportance
    };
  }

  calculateSkillImportance(text, skillVariants) {
    let importance = 0;
    const contexts = {
      required: 3,
      must: 3,
      essential: 2.5,
      preferred: 1.5,
      nice: 0.5,
      bonus: 0.5
    };
    
    for (const variant of skillVariants) {
      const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        importance += matches.length * 0.5;
        
        for (const [context, multiplier] of Object.entries(contexts)) {
          const contextRegex = new RegExp(`${context}[^.]*\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          if (contextRegex.test(text)) {
            importance += multiplier;
          }
        }
        
        if (text.indexOf('requirement') < text.indexOf(variant)) {
          importance += 1;
        }
      }
    }
    
    return Math.min(importance, 5);
  }

  isRequiredSkill(text, skillVariants) {
    const requiredPatterns = ['required', 'must have', 'essential', 'mandatory'];
    
    for (const variant of skillVariants) {
      for (const pattern of requiredPatterns) {
        const regex = new RegExp(`${pattern}[^.]*\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(text)) return true;
      }
    }
    return false;
  }

  detectRoleType(text) {
    const patterns = {
      frontend: ['frontend', 'front-end', 'ui', 'user interface', 'react', 'angular', 'vue'],
      backend: ['backend', 'back-end', 'server', 'api', 'database', 'microservices'],
      fullstack: ['fullstack', 'full-stack', 'full stack'],
      devops: ['devops', 'infrastructure', 'deployment', 'ci/cd', 'kubernetes', 'docker']
    };
    
    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return type;
      }
    }
    return 'default';
  }

  analyzeResume(resumeText, jobKeywords) {
    const resumeLower = resumeText.toLowerCase();
    const analysis = {
      matchedSkills: {},
      skillScores: {},
      totalMatches: 0,
      experienceScore: 0,
      educationScore: 0,
      overallScore: 0,
      suggestions: []
    };

    for (const [category, skills] of Object.entries(jobKeywords.skills)) {
      if (skills.length === 0) continue;
      
      analysis.matchedSkills[category] = [];
      let categoryScore = 0;
      let maxCategoryScore = 0;

      for (const skillData of skills) {
        const { skill, variants, importance, required } = skillData;
        maxCategoryScore += importance;

        const skillPresent = this.checkSkillPresence(resumeLower, variants);
        
        if (skillPresent) {
          const contextScore = this.getSkillContextScore(resumeText, variants);
          const finalScore = importance * contextScore;
          
          analysis.matchedSkills[category].push({
            skill,
            score: finalScore,
            contextScore,
            required
          });
          categoryScore += finalScore;
        } else if (required) {
          analysis.suggestions.push(`Add required skill: ${skill}`);
        }
      }

      analysis.skillScores[category] = maxCategoryScore > 0 
        ? (categoryScore / maxCategoryScore) * 100 
        : 0;
    }

    analysis.experienceScore = this.analyzeExperience(resumeText, jobKeywords.minExperience);
    analysis.educationScore = this.analyzeEducation(resumeText, jobKeywords.education);

    const weights = this.industryWeights[jobKeywords.roleType];
    let weightedScore = 0;
    let totalWeight = 0;

    for (const [category, weight] of Object.entries(weights)) {
      if (analysis.skillScores[category] !== undefined) {
        weightedScore += analysis.skillScores[category] * weight;
        totalWeight += weight;
      }
    }

    weightedScore += analysis.experienceScore * 0.15;
    weightedScore += analysis.educationScore * 0.1;
    totalWeight += 0.25;

    analysis.overallScore = Math.min(Math.round(weightedScore / totalWeight), 100);
    
    this.generateSuggestions(analysis, jobKeywords);

    return analysis;
  }

  checkSkillPresence(resumeText, skillVariants) {
    for (const variant of skillVariants) {
      const exactRegex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (exactRegex.test(resumeText)) return true;
    }
    return false;
  }

  getSkillContextScore(resumeText, skillVariants) {
    let contextScore = 0.5;
    
    for (const variant of skillVariants) {
      const achievementPattern = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^.]*(?:\\d+%|improved|increased|reduced|optimized)`, 'gi');
      if (achievementPattern.test(resumeText)) contextScore += 0.3;
      
      const experiencePattern = new RegExp(`\\d+\\s*(?:years?|yrs?)\\s*(?:of\\s*)?(?:experience\\s*)?(?:with\\s*|in\\s*)?\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (experiencePattern.test(resumeText)) contextScore += 0.2;
      
      const skillsSectionPattern = new RegExp(`(?:skills?|technologies?|tools?)[:]*[^\\n]*\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (skillsSectionPattern.test(resumeText)) contextScore += 0.1;
    }
    
    return Math.min(contextScore, 1);
  }

  analyzeExperience(resumeText, requiredYears) {
    if (requiredYears === 0) return 100;
    
    const experiencePatterns = [
      /(\d+)[\s]*(?:\+|plus)?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi,
      /experience:\s*(\d+)/gi,
      /(\d{4})\s*[-–]\s*(?:present|current|\d{4})/gi
    ];
    
    let maxExperience = 0;
    
    for (const pattern of experiencePatterns) {
      const matches = resumeText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const years = parseInt(match.match(/\d+/)[0]);
          maxExperience = Math.max(maxExperience, years);
        }
      }
    }
    
    const dateRanges = resumeText.match(/(\d{4})\s*[-–]\s*(?:present|current|(\d{4}))/gi);
    if (dateRanges) {
      const currentYear = new Date().getFullYear();
      for (const range of dateRanges) {
        const [start, end] = range.split(/[-–]/).map(d => d.trim());
        const startYear = parseInt(start);
        const endYear = end.toLowerCase().includes('present') || end.toLowerCase().includes('current') 
          ? currentYear 
          : parseInt(end);
        maxExperience = Math.max(maxExperience, endYear - startYear);
      }
    }
    
    return Math.min((maxExperience / requiredYears) * 100, 100);
  }

  extractEducationRequirements(text) {
    const educationLevels = {
      phd: ['ph.d', 'phd', 'doctorate', 'doctoral'],
      masters: ['master', 'ms', 'ma', 'mba', 'graduate degree'],
      bachelors: ['bachelor', 'bs', 'ba', 'undergraduate', 'college degree'],
      associate: ['associate', 'aa', 'as'],
      diploma: ['diploma', 'certificate', 'certification']
    };
    
    const found = [];
    for (const [level, variants] of Object.entries(educationLevels)) {
      if (variants.some(variant => text.includes(variant))) {
        found.push(level);
      }
    }
    return found;
  }

  analyzeEducation(resumeText, requiredEducation) {
    if (!requiredEducation || requiredEducation.length === 0) return 100;
    
    const resumeEducation = this.extractEducationRequirements(resumeText.toLowerCase());
    
    const educationHierarchy = ['diploma', 'associate', 'bachelors', 'masters', 'phd'];
    const getEducationLevel = (edu) => educationHierarchy.indexOf(edu);
    
    const maxResumeLevel = Math.max(...resumeEducation.map(getEducationLevel), -1);
    const minRequiredLevel = Math.min(...requiredEducation.map(getEducationLevel));
    
    return maxResumeLevel >= minRequiredLevel ? 100 : 50;
  }

  generateSuggestions(analysis, jobKeywords) {
    const suggestions = analysis.suggestions;
    
    for (const [category, skills] of Object.entries(jobKeywords.skills)) {
      for (const skillData of skills) {
        if (skillData.importance > 2 && 
            !analysis.matchedSkills[category]?.some(m => m.skill === skillData.skill)) {
          suggestions.push(`Consider adding "${skillData.skill}" - high importance skill`);
        }
      }
    }
    
    if (analysis.overallScore < 70) {
      suggestions.push('Add quantifiable achievements (e.g., "Improved performance by 25%")');
      suggestions.push('Use action verbs and specific examples');
    }
    
    const lowScoreCategories = Object.entries(analysis.skillScores)
      .filter(([_, score]) => score < 50)
      .map(([category, _]) => category);
    
    if (lowScoreCategories.length > 0) {
      suggestions.push(`Focus on improving ${lowScoreCategories.join(', ')} sections`);
    }
  }

  calculateEnhancedScore(resumeText, jobDescription) {
    try {
      const jobKeywords = this.extractEnhancedKeywords(jobDescription);
      const analysis = this.analyzeResume(resumeText, jobKeywords);
      
      return {
        score: analysis.overallScore,
        breakdown: analysis.skillScores,
        matched: analysis.matchedSkills,
        suggestions: analysis.suggestions,
        experienceScore: analysis.experienceScore,
        educationScore: analysis.educationScore,
        jobAnalysis: jobKeywords
      };
    } catch (error) {
      console.error('Error in calculateEnhancedScore:', error);
      return {
        score: 0,
        breakdown: {},
        matched: {},
        suggestions: ['Error analyzing resume. Please try again.'],
        experienceScore: 0,
        educationScore: 0
      };
    }
  }
}

const ResumeScorer = () => {
  const [jdFileName, setJdFileName] = useState("");
  const [fileName, setFileName] = useState('');
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [scoreResult, setScoreResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animatedScore, setAnimatedScore] = useState(0);
  const scorer = new EnhancedATSScorer();
  

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setScoreResult(null);
    setResumeText("");
    setFileName("");
    setLoading(true);
    
    setFileName(file.name);
    
    try {
      if (file.type === "application/pdf") {
        const text = await parsePDF(file);
        setResumeText(text);
      } else if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
      } else {
        setError("Unsupported file type. Please upload PDF or TXT.");
      }
    } catch (e) {
      console.error('File parsing error:', e);
      setError("Failed to parse file: " + e.message);
    }
    setLoading(false);
  };

  const handleJDFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setError("");
  setJobDescription("");
  setJdFileName("");
  setLoading(true);

  setJdFileName(file.name);

  try {
    if (file.type === "application/pdf") {
      const text = await parsePDF(file);
      setJobDescription(text);
    } else if (file.type === "text/plain") {
      const text = await file.text();
      setJobDescription(text);
    } else {
      setError("Unsupported file type for Job Description. Please upload PDF or TXT.");
    }
  } catch (e) {
    console.error("Job Description parsing error:", e);
    setError("Failed to parse Job Description file: " + e.message);
  }
  setLoading(false);
};


  async function parsePDF(file) {
    try {
      // Dynamic import for PDF.js
      const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js');
      
      // Set worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + " ";
      }
      return text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF. Please try converting to text format.');
    }
  }

  const handleScore = () => {
  setError("");
  if (!resumeText || !jobDescription) {
    setError("Please upload a resume and enter a job description.");
    return;
  }

  setLoading(true);
  setAnimatedScore(0);   // reset score animation

  setTimeout(() => {
    try {
      console.log("Starting scoring process...");
      const result = scorer.calculateEnhancedScore(resumeText, jobDescription);
      console.log("Score result:", result);
      setScoreResult(result);

      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      updateProgress(userId, jdFileName, result.score);
    
      // Animate number rising
      let start = 0;
      const end = result.score;
      const duration = 2000; // 2 seconds
      const stepTime = 20; // update every 20ms
      let current = start;
      const increment = (end - start) / (duration / stepTime);

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        setAnimatedScore(Math.round(current));
      }, stepTime);

    } catch (e) {
      console.error("Scoring error:", e);
      setError("Scoring failed: " + e.message);
    }
    setLoading(false);
  }); // 3 second delay
};

const updateProgress = async (userId, jdName, score) => {
  try {
    const userRef = doc(db, "users", userId);

    // Save latest score
    await setDoc(
      userRef,
      { latestResumeScore: score },
      { merge: true }
    );

    // Append to resume history
    await setDoc(
      userRef,
      {
        resumeHistory: arrayUnion({
          jdName,
          score,
          date: Timestamp.now()
        })
      },
      { merge: true }
    );

    console.log("Progress updated:", score);
  } catch (err) {
    console.error("Error updating progress:", err);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Resume ATS Scorer</h2>
      
    <div className="grid md:grid-cols-2 gap-8 mb-10">
  {/* Resume Upload */}
  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition hover:border-blue-500 hover:shadow-lg">
    <label className="block text-lg font-semibold text-gray-700 mb-4">
      Upload Resume
    </label>
    <input
      type="file"
      accept=".pdf,.txt"
      onChange={handleFileUpload}
      className="hidden"
      id="resume-upload"
    />
    <label
      htmlFor="resume-upload"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition"
    >
      Choose Resume File
    </label>
    {fileName && (
      <p className="mt-4 text-green-600 font-medium">✓ {fileName}</p>
    )}
  </div>

  {/* Job Description Upload */}
  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition hover:border-purple-500 hover:shadow-lg">
    <label className="block text-lg font-semibold text-gray-700 mb-4">
      Upload Job Description
    </label>
    <input
      type="file"
      accept=".pdf,.txt"
      onChange={handleJDFileUpload}
      className="hidden"
      id="jd-upload"
    />
    <label
      htmlFor="jd-upload"
      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer hover:bg-purple-700 transition"
    >
      Choose JD File
    </label>
    {jdFileName && (
      <p className="mt-4 text-purple-600 font-medium">✓ {jdFileName}</p>
    )}
  </div>
</div>


      
      <div className="flex justify-center mb-8">
  <button
    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-semibold shadow-lg transition disabled:opacity-50"
    onClick={handleScore}
    disabled={loading || !resumeText || !jobDescription}
  >
    {loading ? "⏳ Scoring..." : "⚡ Score Resume"}
  </button>
</div>

      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {scoreResult && (
  <div className="mt-12 space-y-10">
    {/* Radial ATS Score */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-10 rounded-2xl shadow-xl flex flex-col items-center space-y-6"
    >
      <div className="relative w-44 h-44">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${
              scoreResult.score >= 70 ? '#22c55e'
              : scoreResult.score >= 50 ? '#eab308'
              : '#ef4444'
            } ${scoreResult.score}%, #f3f4f6 ${scoreResult.score}%)`
          }}
        />
        <motion.div
  className="absolute inset-6 rounded-full bg-white flex items-center justify-center"
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ duration: 1 }}
>
  <span className="text-4xl font-extrabold text-gray-800">
    {animatedScore}
  </span>
</motion.div>


      </div>
      <h3 className="text-xl font-semibold text-gray-700">ATS Score</h3>
    </motion.div>

    {/* Skill Breakdown + Experience/Education */}
    <div className="grid md:grid-cols-2 gap-8">
      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-6 rounded-2xl shadow-md"
      >
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Skill Breakdown</h4>
        <div className="space-y-4">
          {Object.entries(scoreResult.breakdown).map(([cat, val]) => (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">{cat.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-medium">{Math.round(val)}/100</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(val, 100)}%` }}
                transition={{ duration: 0.8 }}
                className="bg-blue-500 h-3 rounded-full"
              />
              <div className="w-full bg-gray-200 rounded-full h-3 -mt-3" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Experience & Education */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-6 rounded-2xl shadow-md"
      >
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Experience & Education</h4>
        <div className="space-y-5">
          {/* Experience */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Experience Match</span>
              <span className="font-medium">{Math.round(scoreResult.experienceScore)}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scoreResult.experienceScore}%` }}
                transition={{ duration: 0.8 }}
                className="bg-green-500 h-3 rounded-full"
              />
            </div>
          </div>
          {/* Education */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Education Match</span>
              <span className="font-medium">{Math.round(scoreResult.educationScore)}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scoreResult.educationScore}%` }}
                transition={{ duration: 0.8 }}
                className="bg-purple-500 h-3 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Suggestions */}
    {scoreResult.suggestions?.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-md"
      >
        <h4 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          💡 Optimization Suggestions
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {scoreResult.suggestions.slice(0, 10).map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400 flex items-start gap-3"
            >
              <span className="text-yellow-500 mt-1">⚡</span>
              <span className="text-gray-700">{s}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )}
  </div>
)}
 
      {resumeText && (
        <details className="mt-6 bg-gray-50 p-4 rounded-lg">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
            Show parsed resume text ({resumeText.length} characters)
          </summary>
          <pre className="mt-4 bg-white p-4 rounded border text-xs whitespace-pre-wrap max-h-96 overflow-y-auto">
            {resumeText}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ResumeScorer;
