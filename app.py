from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import logging
import time
import requests 
import re, json
from dotenv import load_dotenv
import os


load_dotenv()  # This loads your .env file variables
# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

genai.configure(api_key=os.environ.get("GENAI_API_KEY"))

ADZUNA_APP_ID = os.environ.get("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.environ.get("ADZUNA_APP_KEY")


app = Flask(__name__)
CORS(app)

# Rate limiting variables
LAST_API_CALL_TIME = 0
MIN_CALL_INTERVAL = 5  # seconds between API calls

def rate_limited_generate_content(model, prompt):
    global LAST_API_CALL_TIME
    current_time = time.time()
    
    # Enforce rate limiting
    if current_time - LAST_API_CALL_TIME < MIN_CALL_INTERVAL:
        wait_time = MIN_CALL_INTERVAL - (current_time - LAST_API_CALL_TIME)
        logger.debug(f"Waiting {wait_time:.1f} seconds to avoid rate limit")
        time.sleep(wait_time)
    
    LAST_API_CALL_TIME = time.time()
    return model.generate_content(prompt)

@app.route('/generate_roadmap', methods=['POST'])
def generate_roadmap():
    try:
        data = request.json
        goal = data.get("goal", "software engineer")
        current_skills = data.get("current_skills", "python, problem solving")
        duration = data.get("duration", "6 months")

        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = (
            f"You are an assistant that ONLY returns valid JSON. "
            f"No explanations, no steps, no notes, no extra text. "
            f"Your response MUST be a single JSON array. "
            f"Each JSON object in the array represents a roadmap step and must have these keys:\n"
            f"  - title (string)\n"
            f"  - description (string)\n"
            f"  - expected_duration (string)\n"
            f"  - topics (array of strings, list main subtopics or chapters to study, at least 3-6 items)\n"
            f"  - resources (array of strings, optional recommended learning resources)\n\n"
            f"Goal: {goal}\n"
            f"Current skills: {current_skills}\n"
            f"Target duration: {duration}\n\n"
            f"Example output:\n"
            f"[\n"
            f"  {{\n"
            f"    \"title\": \"C++ Fundamentals\",\n"
            f"    \"description\": \"Learn C++ syntax, OOP, and STL.\",\n"
            f"    \"expected_duration\": \"3 months\",\n"
            f"    \"topics\": [\"Variables & Data Types\", \"Control Flow\", \"Functions\", \"OOP Basics\", \"STL Usage\"],\n"
            f"    \"resources\": [\"Book: 'C++ Primer'\", \"YouTube: MyCodeSchool C++ playlist\"]\n"
            f"  }}\n"
            f"]"
        )

        response = rate_limited_generate_content(model, prompt)
        roadmap = clean_response(response.text)  # clean and parse JSON

        return jsonify({"roadmap": roadmap})

    except Exception as e:
        logger.error(f"Error in generate_roadmap: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
def clean_response(response_text):
    import re, json
    match = re.search(r'\[.*\]', response_text, re.DOTALL)
    if match:
        json_str = match.group(0)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            print("⚠️ JSON still invalid")
    return []



@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        job_role = data.get("job_role", "software engineer")
        experience = data.get("experience", "fresher")
        skills = data.get("skills", "python, c++, java, ai models")

        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            f"You are an interviewer. Generate 5 interview questions for a {job_role} role "
            f"with {experience} years of experience and skills in {skills}. The questions should "
            f"be in a serious tone without hints. Return each question on a new line."
        )

        # Clean up the response and split into questions
        questions = [q.strip() for q in response.text.split("\n") if q.strip()]
        return jsonify({"questions": questions})

    except Exception as e:
        logger.error(f"Error in generate_questions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/evaluate_answers', methods=['POST'])
def evaluate_answers():
    try:
        data = request.json
        answers = data.get("answers", [])
        logger.debug(f"Received {len(answers)} answers for evaluation")

        if not isinstance(answers, list):
            return jsonify({"error": "Answers should be a list"}), 400

        model = genai.GenerativeModel('gemini-2.0-flash')
        evaluations = []
        failed_count = 0

        for idx, entry in enumerate(answers):
            question = entry.get("question", "")
            answer = entry.get("answer", "")

            if not question or not answer:
                evaluations.append("Missing question or answer")
                continue

            prompt = (
                f"You are an expert interviewer. Evaluate the following answer based on correctness, clarity, and depth:\n\n"
                f"Question: {question}\n"
                f"Candidate's Answer: {answer}\n\n"
                f"Provide a structured evaluation using the following format and ensure each section starts on a new line:\n\n"
                f"Score:\n(Give a score out of 10)\n\n"
                f"Mistakes:\n(List key mistakes or weaknesses in the answer, each mistake on a new line)\n\n"
                f"How to Improve:\n(Provide clear and actionable steps to enhance the response, each step on a new line)\n\n"
                f"Do NOT use markdown formatting like **bold**, *italics*, or lists with dashes (-) or asterisks (*). Only use plain text."
            )


            try:
                response = rate_limited_generate_content(model, prompt)
                evaluation_text = response.text.strip()
                evaluations.append(evaluation_text)
                logger.debug(f"Evaluation {idx+1}/{len(answers)} complete")
            except Exception as e:
                logger.error(f"Error evaluating answer {idx+1}: {str(e)}")
                evaluations.append(f"Evaluation failed for this question")
                failed_count += 1
                # If we hit rate limits, slow down further
                if "429" in str(e):
                    time.sleep(10)

        return jsonify({
            "status": "partial" if failed_count else "complete",
            "evaluations": evaluations,
            "failed_count": failed_count
        })

    except Exception as e:
        logger.error(f"Endpoint error: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500
    
@app.route('/job_suggestions', methods=['GET'])
def job_suggestions():
    try:
        # Get query params from frontend
        query = request.args.get("query", "software engineer")
        location = request.args.get("location", "India")

        # Adzuna API endpoint
        url = "https://api.adzuna.com/v1/api/jobs/in/search/1"
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "what": query,
            "where": location,
            "results_per_page": 10
        }

        response = requests.get(url, params=params, timeout=10)

        if response.status_code == 200:
            jobs = response.json().get("results", [])
            simplified = [
                {
                    "title": job.get("title"),
                    "company": job.get("company", {}).get("display_name"),
                    "location": job.get("location", {}).get("display_name"),
                    "url": job.get("redirect_url")
                }
                for job in jobs
            ]
            return jsonify({"jobs": simplified})
        else:
            return jsonify({"error": "Failed to fetch jobs"}), 500

    except Exception as e:
        logger.error(f"Error in job_suggestions: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
