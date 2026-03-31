# 🚀 AI Job Sourcing & ATS Optimization Agent

An autonomous, multi-agent platform designed to deterministically bridge the gap between candidate resumes and job descriptions. Instead of relying on standard GPT wrappers that hallucinate skills, this system utilizes **Vector Semantic Search** to rank job alignment and a **LangGraph-powered stateful agent** to rewrite and tailor resumes to bypass Applicant Tracking Systems (ATS).

[ResumeTailor.AI](https://resume-tailor-teal.vercel.app/)

## ✨ Key Features

*   **Autonomous Sourcing (Smart Match):** Upload a resume, and the system instantly vectorizes the document to cross-reference it against a global job cache using MongoDB Vector Search.
*   **Stateful AI Tailoring:** A LangGraph cyclical agent scores the resume, identifies missing industry keywords, flags weak action verbs, and deterministically rewrites the resume to perfectly align with the target Job Description (JD) without hallucinating experiences.
*   **Cold Outreach Generator:** Automatically drafts a high-impact, 150-word cold email to recruiters highlighting the top two matching technical skills, and sends it via an integrated SMTP agent.
*   **Polyglot Microservices Architecture:** Seamless orchestration between a React frontend, a Node.js/Express authentication & routing layer, and a Python/FastAPI AI engine.
*   **Secure Authentication:** Powered by Clerk for seamless user sign-ups, session management, and profile saving.

## 🛠️ Tech Stack

**Frontend**
*   React.js (Vite)
*   Tailwind CSS (Styling & UI)
*   Clerk (Authentication)
*   React Router & Axios

**Backend & AI Engine**
*   Python & FastAPI (AI Microservice)
*   Node.js & Express (API Gateway & Webhooks)
*   LangGraph & LangChain (Agentic Workflows)
*   Google Gemini 2.5 Flash (LLM Core)
*   HuggingFace (`BAAI/bge-m3`) (Feature Extraction / Embeddings)

**Database & Infrastructure**
*   MongoDB Atlas (Document Storage & Vector Search Index)
*   Render (Cloud Deployment & Hosting)

## 🏗️ System Architecture

1.  **Frontend:** User uploads a PDF resume.
2.  **Node.js Layer:** Validates the Clerk session token and proxies the file to the Python engine.
3.  **FastAPI AI Layer:** 
    *   Parses the PDF using `PyMuPDFLoader`.
    *   Vectorizes the text using HuggingFace Endpoint Embeddings.
    *   Runs a `$vectorSearch` aggregation against the MongoDB job cache.
    *   Executes a LangGraph state machine (`extract -> analyze -> score -> tailor`) to iteratively improve the resume based on the selected JD.



<img width="1906" height="904" alt="image" src="https://github.com/user-attachments/assets/c7c0fa10-1dd7-456e-8723-1a2944649dd4" />

<img width="1903" height="909" alt="image" src="https://github.com/user-attachments/assets/83318d94-0e67-45a1-8d73-651f451baf5f" />
<img width="1908" height="904" alt="image" src="https://github.com/user-attachments/assets/e58c79a0-ea07-4127-98c6-409d647925b0" />

<img width="1904" height="905" alt="image" src="https://github.com/user-attachments/assets/f1a34310-f8c0-4855-a474-633e8372039a" />

<img width="748" height="838" alt="image" src="https://github.com/user-attachments/assets/92db213a-232c-4501-8cb0-53c4205c7984" />

<img width="668" height="833" alt="image" src="https://github.com/user-attachments/assets/136b4f90-6c48-4a13-9550-f2cb064fc630" />





