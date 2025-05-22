import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Profile() {
  const [formData, setFormData] = useState({
    fullName: "",
    profession: "",
    email: "",
    phone: "",
    location: "",
    about: "",
    education: [
      {
        institution: "",
        degree: "",
        field: "",
        startYear: "",
        endYear: "",
        description: ""
      }
    ],
    experience: [
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        responsibilities: ""
      }
    ],
    skills: [],
    projects: [
      {
        name: "",
        description: "",
        technologies: ""
      }
    ],
    certifications: [],
    languages: []
  });

  const [currentSkill, setCurrentSkill] = useState("");
  const [currentCertification, setCurrentCertification] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (arrayName, index, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [name]: value } : item
      )
    }));
  };

  const addItem = (arrayName, newItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], newItem]
    }));
  };

  const removeItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to save your profile");
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      
      await setDoc(userRef, {
        ...formData,
        userId: user.uid,
        lastUpdated: new Date()
      }, { merge: true });

      // alert("Profile saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      setError(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;

    const loadProfile = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setFormData(docSnap.data());
          }
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h2>
      <p className="text-center mb-8 text-gray-600">This information will be used to generate your professional resume</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Full Name*</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Profession*</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">About You*</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                rows="3"
                required
                placeholder="Brief professional summary (3-4 sentences)"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Education</h3>
          {formData.education.map((edu, index) => (
            <div key={index} className="mb-6 border-b pb-6 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Institution*</label>
                  <input
                    type="text"
                    name="institution"
                    value={edu.institution}
                    onChange={(e) => handleArrayChange("education", index, e)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Degree*</label>
                  <input
                    type="text"
                    name="degree"
                    value={edu.degree}
                    onChange={(e) => handleArrayChange("education", index, e)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Field of Study</label>
                  <input
                    type="text"
                    name="field"
                    value={edu.field}
                    onChange={(e) => handleArrayChange("education", index, e)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Start Year*</label>
                    <input
                      type="number"
                      name="startYear"
                      value={edu.startYear}
                      onChange={(e) => handleArrayChange("education", index, e)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">End Year*</label>
                    <input
                      type="number"
                      name="endYear"
                      value={edu.endYear}
                      onChange={(e) => handleArrayChange("education", index, e)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    name="description"
                    value={edu.description}
                    onChange={(e) => handleArrayChange("education", index, e)}
                    className="w-full p-2 border rounded-md"
                    rows="2"
                    placeholder="Notable achievements, honors, or relevant coursework"
                  />
                </div>
              </div>
              {formData.education.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("education", index)}
                  className="mt-2 text-red-500 text-sm"
                >
                  Remove Education
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("education", {
              institution: "",
              degree: "",
              field: "",
              startYear: "",
              endYear: "",
              description: ""
            })}
            className="text-blue-500 mt-2"
          >
            + Add Another Education
          </button>
        </div>

        {/* Experience */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
          {formData.experience.map((exp, index) => (
            <div key={index} className="mb-6 border-b pb-6 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Company*</label>
                  <input
                    type="text"
                    name="company"
                    value={exp.company}
                    onChange={(e) => handleArrayChange("experience", index, e)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Position*</label>
                  <input
                    type="text"
                    name="position"
                    value={exp.position}
                    onChange={(e) => handleArrayChange("experience", index, e)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Start Date*</label>
                    <input
                      type="text"
                      name="startDate"
                      value={exp.startDate}
                      onChange={(e) => handleArrayChange("experience", index, e)}
                      className="w-full p-2 border rounded-md"
                      placeholder="MM/YYYY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">End Date*</label>
                    <input
                      type="text"
                      name="endDate"
                      value={exp.endDate}
                      onChange={(e) => handleArrayChange("experience", index, e)}
                      className="w-full p-2 border rounded-md"
                      placeholder="MM/YYYY or Present"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Responsibilities*</label>
                  <textarea
                    name="responsibilities"
                    value={exp.responsibilities}
                    onChange={(e) => handleArrayChange("experience", index, e)}
                    className="w-full p-2 border rounded-md"
                    rows="3"
                    required
                    placeholder="Describe your responsibilities and achievements (bullet points work well)"
                  />
                </div>
              </div>
              {formData.experience.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("experience", index)}
                  className="mt-2 text-red-500 text-sm"
                >
                  Remove Experience
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("experience", {
              company: "",
              position: "",
              startDate: "",
              endDate: "",
              responsibilities: ""
            })}
            className="text-blue-500 mt-2"
          >
            + Add Another Experience
          </button>
        </div>

        {/* Skills */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.skills.map((skill, index) => (
              <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                {skill}
                <button
                  type="button"
                  onClick={() => removeItem("skills", index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              className="flex-grow p-2 border rounded-l-md"
              placeholder="Add a skill (e.g., JavaScript, Project Management)"
            />
            <button
              type="button"
              onClick={() => {
                if (currentSkill.trim()) {
                  addItem("skills", currentSkill.trim());
                  setCurrentSkill("");
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Projects</h3>
          {formData.projects.map((project, index) => (
            <div key={index} className="mb-6 border-b pb-6 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Project Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={project.name}
                    onChange={(e) => handleArrayChange("projects", index, e)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Technologies Used</label>
                  <input
                    type="text"
                    name="technologies"
                    value={project.technologies}
                    onChange={(e) => handleArrayChange("projects", index, e)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Comma separated list of technologies"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Description*</label>
                  <textarea
                    name="description"
                    value={project.description}
                    onChange={(e) => handleArrayChange("projects", index, e)}
                    className="w-full p-2 border rounded-md"
                    rows="3"
                    required
                    placeholder="Describe the project, your role, and key achievements"
                  />
                </div>
              </div>
              {formData.projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("projects", index)}
                  className="mt-2 text-red-500 text-sm"
                >
                  Remove Project
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("projects", {
              name: "",
              description: "",
              technologies: ""
            })}
            className="text-blue-500 mt-2"
          >
            + Add Another Project
          </button>
        </div>

        {/* Certifications */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Certifications</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.certifications.map((cert, index) => (
              <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                {cert}
                <button
                  type="button"
                  onClick={() => removeItem("certifications", index)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={currentCertification}
              onChange={(e) => setCurrentCertification(e.target.value)}
              className="flex-grow p-2 border rounded-l-md"
              placeholder="Add a certification (e.g., AWS Certified Developer)"
            />
            <button
              type="button"
              onClick={() => {
                if (currentCertification.trim()) {
                  addItem("certifications", currentCertification.trim());
                  setCurrentCertification("");
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-r-md hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Languages</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.languages.map((lang, index) => (
              <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center">
                {lang}
                <button
                  type="button"
                  onClick={() => removeItem("languages", index)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="flex-grow p-2 border rounded-l-md"
              placeholder="Add a language (e.g., Spanish - Fluent)"
            />
            <button
              type="button"
              onClick={() => {
                if (currentLanguage.trim()) {
                  addItem("languages", currentLanguage.trim());
                  setCurrentLanguage("");
                }
              }}
              className="bg-purple-500 text-white px-4 py-2 rounded-r-md hover:bg-purple-600"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;