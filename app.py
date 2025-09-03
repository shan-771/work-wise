from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import logging
import time

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

genai.configure(api_key="AIzaSyC9i_OwpPVbKl_hypHHJmxvbSCHKy2TnUQ")

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
