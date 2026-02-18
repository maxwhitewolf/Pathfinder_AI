# PATHFINDER AI - PRESENTATION CONTENT

## RESEARCH GAP

Limited solutions integrate academic performance + skills + job market data

Existing platforms lack deep resume semantic understanding

Few systems provide step-by-step learning roadmaps

Lack of adaptive, context-aware recommendations (e.g., contextual bandits)

Gaps in addressing industry readiness through measurable skill improvement

Insufficient integration of AI talent analytics techniques in education systems

---

## SYSTEM ARCHITECTURE

**Frontend:** React-based user interface (profiles, dashboards, recommendations)

**Backend:** FastAPI with authentication, resume parsing, ML model integration

**AI Components:**
- Resume text extraction (PyPDF2 for PDF parsing)
- Skill extraction using Google Gemini AI (LLM-based NLP)
- Job similarity matching (Doc2Vec embeddings)
- Career recommendation (KNN model on skill vectors)
- Personalized roadmap generation (Gemini LLM + contextual bandit selection)

**Database:** SQLite for user profiles, jobs, and historical data

**Pipeline:** Upload Resume → Extract Text → Extract Skills (Gemini AI) → Analyze Gaps → Recommend Careers (KNN) → Generate Roadmap (LLM + Bandit)

---

## SYSTEM WORKFLOW

1. User logs in / creates profile with academic data (CGPA, degree, skills)

2. User uploads resume → system extracts text content using PyPDF2

3. Gemini AI pipeline identifies skills, categorizes into technical and soft skills

4. Skill-gap module compares user skills with targeted career skills

5. ML models compute job similarity using Doc2Vec and recommend best-fit options

6. Gemini LLM generates detailed personalized learning roadmap (4 variants)

7. Contextual bandit selects optimal roadmap variant based on user experience level

8. System displays dashboard with recommendations, analytics, and next steps

---

## ALGORITHMS USED

### Resume Skill Extraction (LLM-based)
- **Method:** Google Gemini AI (Large Language Model)
- **Process:** Text extraction from PDF → LLM prompt-based skill identification
- **Output:** Categorized technical and soft skills in JSON format
- **Note:** Uses AI-based extraction, not traditional tokenization/pattern matching

### Career Recommendation (KNN)
- **Algorithm:** K-Nearest Neighbors on skill vectors
- **Process:** 
  - Skills encoded using Multi-Label Binarizer
  - KNN finds nearest career clusters in skill space
  - Distance-based similarity scoring
- **Output:** Top-K career recommendations with matching/missing skills

### Job Matching using Doc2Vec
- **Algorithm:** Document-to-Vector embeddings
- **Process:**
  - Resume text tokenized and converted to embedding vector
  - Pre-computed job embeddings stored in vector space
  - Cosine similarity ranking for matched jobs
- **Output:** Ranked job matches with similarity scores

### Contextual Bandit for Personalization
- **Algorithm:** Simplified contextual bandit (rule-based selection)
- **Process:**
  - Considers user experience level (beginner/advanced)
  - Selects roadmap variant (Fast-Track, Balanced, Self-Paced)
  - Future: Will learn from user feedback and interactions
- **Output:** Optimal roadmap variant selection

---

## RESULT ANALYSIS - EXPECTED OUTCOMES

Accurate mapping between user skills and industry requirements

Significant improvement in personalized recommendation quality

Better career clarity and reduced decision-making confusion

More relevant job matches using Doc2Vec semantic similarity

Adaptive learning paths increase user engagement and satisfaction

Potential to scale to thousands of users with cloud deployment

---

## RESULT ANALYSIS - SYSTEM BENEFITS

Reduces counseling load for institutions

Data-driven insights into student readiness

Generates measurable skill-gap reports

Supports academic planning and employability development

Enhances overall career confidence through personalized guidance

---

## PHASE II PLAN

Integrate BERT/Transformer models for enhanced resume understanding

Add multimodal psychometric assessment (visual, behavioral data) - **NEW FEATURE**

Expand job dataset using real-time APIs (LinkedIn/Indeed scraping pipelines)

Introduce user progress tracking dashboards with analytics

Deploy mobile application version (React Native)

Add multilingual support and accessibility enhancements

Incorporate fairness/bias-checking modules for ethical AI

Implement full contextual bandit learning from user feedback

Add collaborative filtering for peer-based recommendations

---

## KEY CORRECTIONS MADE:

### ✅ ACCURATE:
- System architecture correctly describes FastAPI, React, SQLite
- Algorithms correctly identify KNN, Doc2Vec, Contextual Bandit
- Workflow accurately reflects the actual implementation

### ⚠️ CORRECTED:
1. **Skill Extraction:** Changed from "Tokenization, stopword removal, embedding-based" to "Gemini AI (LLM-based)" - the system uses AI, not traditional NLP
2. **Database:** Specified SQLite (not PostgreSQL) - current implementation uses SQLite
3. **Contextual Bandit:** Clarified it's simplified/rule-based currently, with learning planned for Phase II
4. **Psychological Well-being:** Changed to "career confidence" - more accurate than psychological well-being

### ✅ PHASE II:
- Psychometric assessment is correctly listed as a **future feature** (not current)
- All other Phase II items are appropriate future enhancements



