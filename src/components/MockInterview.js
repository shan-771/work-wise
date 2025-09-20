import { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, getDoc} from "firebase/firestore";


const MockInterview = () => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [recording, setRecording] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [evaluation, setEvaluation] = useState([]);
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [setScore] = useState(null);


  useEffect(() => {
    let interval;
    if (isEvaluating) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 5));
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isEvaluating]);

  const LoadingAnimation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
        <div className="relative h-4 bg-gray-200 rounded-full mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex flex-col items-center mb-4">
          {/* Spinner with question counter */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                {evaluation.length + 1}/{questions.length}
              </span>
            </div>
          </div>
          {/* Current question being evaluated */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md max-h-20 overflow-y-auto">
            <p className="text-sm font-medium text-blue-800">
              Evaluating: {questions[evaluation.length]}
            </p>
          </div>
        </div>
        <p className="text-lg font-medium">Evaluating your answers...</p>
        <p className="text-gray-600 text-sm mt-1">
          {progress}% complete • Question {evaluation.length + 1} of {questions.length}
        </p>
      </div>
    </div>
  );

  const generateQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5000/generate_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_role: jobRole, experience, skills })
      });
      const data = await response.json();
      setQuestions(data.questions || []);
      setCurrentQuestion(0);
      setAnswers([]);
      setEvaluation([]);
      setShowDownload(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const startRecording = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      document.getElementById("answer-box").value = transcript;
    };
    speechRecognition.start();
    setRecognition(speechRecognition);
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setRecording(false);
  };

  const nextQuestion = async () => {
    const userAnswer = document.getElementById("answer-box").value.trim();
    const newAnswers = [...answers];
    
    if (userAnswer !== "") {
      newAnswers.push({ question: questions[currentQuestion], answer: userAnswer });
      setAnswers(newAnswers);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      document.getElementById("answer-box").value = "";
    } else {
      document.getElementById("answer-box").value = "";
      await evaluateAnswers(newAnswers);
      setShowDownload(true);
    }
  };

  const evaluateAnswers = async (answersToEvaluate) => {
  setIsEvaluating(true);
  setProgress(0);

  try {
    if (!Array.isArray(answersToEvaluate) || answersToEvaluate.length === 0) {
      console.error("Invalid answers format");
      return;
    }

    const response = await fetch("http://localhost:5000/evaluate_answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answersToEvaluate })
    });

    const data = await response.json();

    let score = 0;
    if (Array.isArray(data.evaluations)) {
      // Example: assume backend gives scores inside each evaluation
      score = data.evaluations.reduce((acc, item) => acc + (item.score || 0), 0) / data.evaluations.length;
    }

    setEvaluation(data.evaluations || []);

    setScore(score);
    saveInterviewResult(score);

  } catch (error) {
    console.error("Error fetching evaluation:", error);
  } finally {
    setIsEvaluating(false);
    setShowDownload(true);
  }
};

const saveInterviewResult = async (score) => {
  if (typeof score !== "number" || isNaN(score)) score = 0;
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let newCount = 1;
    let newAvg = score;

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const prevCount = userData.interviews || 0;
      const prevAvg = Number(userData.avgScore) || 0;

      newCount = prevCount + 1;
      newAvg = Number(((prevAvg * prevCount + score) / newCount).toFixed(2));
    }

    await setDoc(userRef, {
      interviews: newCount,
      avgScore: newAvg
    }, { merge: true }); // ✅ important

    console.log("✅ Interview progress and avgScore saved:", { newCount, newAvg });
  } catch (error) {
    console.error("❌ Error saving result:", error);
  }
};



const downloadAnswers = () => {
    const element = document.createElement("a");
    const file = new Blob([answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "mock_interview_answers.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 w-[90%] mx-auto">
      {isEvaluating && <LoadingAnimation />}
      
      <h2 className="text-2xl font-bold text-gradient">Mock Interview Generator</h2>
      <input 
        type="text" 
        value={jobRole} 
        onChange={(e) => setJobRole(e.target.value)} 
        placeholder="Enter Job Role" 
        className="input w-[50%] p-3 text-lg border rounded-md" 
      />
      <input 
        type="text" 
        value={experience} 
        onChange={(e) => setExperience(e.target.value)} 
        placeholder="Enter Experience (e.g. 2 years)" 
        className="input w-[50%] p-3 text-lg border rounded-md" 
      />
      <input 
        type="text" 
        value={skills} 
        onChange={(e) => setSkills(e.target.value)} 
        placeholder="Enter Skills" 
        className="input w-[50%] p-3 text-lg border rounded-md" 
      />
      <button 
        onClick={generateQuestions} 
        className="btn bg-primary text-light px-6 py-2 rounded-md hover:bg-primary-hover transition"
      >
        Generate Questions
      </button>

      {questions.length > 0 && (
        <div className="w-full max-w-5xl p-6 bg-light rounded shadow-soft">
          <p className="text-lg font-medium mb-4">{questions[currentQuestion]}</p>
          <textarea 
            id="answer-box" 
            className="input w-[100%] p-3 text-lg border rounded-md resize-none" 
            placeholder="Your answer..." 
            rows="4"
          ></textarea>
          <div className="flex space-x-4 mt-3">
            <button 
              onClick={startRecording} 
              className="btn bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
              disabled={recording}
            >
              Start Recording
            </button>
            <button 
              onClick={stopRecording} 
              className="btn bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              disabled={!recording}
            >
              Stop Recording
            </button>
          </div>
          <button 
            onClick={nextQuestion} 
            className="btn bg-primary text-light px-6 py-2 rounded-md hover:bg-primary-hover transition mt-4"
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "Submit"}
          </button>
        </div>
      )}

      {showDownload && (
        <div className="w-full max-w-5xl p-6 bg-light rounded mt-4 shadow-soft">
          <h3 className="text-xl font-bold mb-4">Evaluation</h3>
          <div className="text-lg space-y-4">
            {evaluation.map((feedback, index) => (
              <p key={index} className="border-b pb-2">{feedback}</p>
            ))}
          </div>
          <button 
            onClick={downloadAnswers} 
            className="btn bg-primary text-light px-6 py-2 rounded-md hover:bg-primary-hover transition mt-4"
          >
            Download Answers
          </button>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
