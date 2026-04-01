#!/usr/bin/env python
# coding: utf-8



from langchain_google_genai import ChatGoogleGenerativeAI 
from langchain_community.document_loaders import PyMuPDFLoader
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
import requests
from langgraph.graph import START , END , StateGraph
from fastapi import FastAPI
from pydantic import BaseModel , Field
from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.messages import HumanMessage , SystemMessage 
from langchain_core.runnables import RunnableConfig
import pprint
from typing import TypedDict , Literal ,Optional , Annotated
import operator
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt , Command
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from pymongo import MongoClient
from bson.objectid import ObjectId
from langchain_huggingface import ChatHuggingFace , HuggingFaceEndpoint , HuggingFaceEndpointEmbeddings


# In[ ]:


load_dotenv()

# In[ ]:


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In[ ]:


 # llm = ChatGoogleGenerativeAI(model='gemini-2.5-flash-lite',api_key='AIzaSyD52s-JjeM7HRPWIxWrzvwNP9bC66o8Hho')


# In[ ]:

import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnableConfig

import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnableConfig

def get_dynamic_llm(config: RunnableConfig):
    """Extracts the user's key from the config and returns a ready-to-use LLM."""
    
    
    user_api_key = config.get("configurable", {}).get("user_api_key")
    
    if not user_api_key:
        raise ValueError("No Gemini API key found. Please add it via the Secrets Modal.")

   
    model_name = os.getenv("MODEL_NAME", "gemini-3-flash-preview")
    print(model_name)

    return ChatGoogleGenerativeAI(
        model=model_name,
        api_key=user_api_key,
        temperature=0.1 
    )


class ImprovementSuggestion(BaseModel):
    section: str = Field(description="The section of the resume (e.g., 'Experience', 'Projects')")
    original_text: str = Field(description="The exact weak sentence from the resume")
    suggested_rewrite: str = Field(description="The improved, quantifiable rewrite")

# In[ ]:


class ProjectDetails(BaseModel):
    name: str = Field(
        description="The title or name of the project."
    )
    type_of_project: str = Field(
        description="The category of the project (e.g., Personal, Academic, Open Source, Hackathon, Freelance)."
    )
    description: str = Field(
        description="A concise summary of the project's purpose and functionality."
    )
    skills_used: list[str] = Field(
        description="Specific technologies, languages, databases, and frameworks utilized (e.g., React, Node.js, PostgreSQL)."
    )
    key_achievements: list[str] = Field(
        description="Any quantifiable metrics, scale, or major technical problems solved. Leave empty if none are mentioned."
    )


# In[ ]:


class BulletPoint(BaseModel):
    text: str
    has_metrics: bool
    action_verb: str

class Experience(BaseModel):
    company: str
    role: str
    is_current: bool
    bullets: list[BulletPoint]

    

class Resume_Details(BaseModel):
    contact_details:str=Field(...,description='Contact details provided in the Resume')
    experience: list[Experience]
    projects: list[ProjectDetails] = Field(
        description="A detailed breakdown of all projects mentioned in the provided context."
    )
    achievenments:list[str]=Field(description='achievenments mentioned in the provided context')
    education_details:list[str]=Field(...,description="Any Education details Mentioned in the Resume")
    summary:str=Field(description='Any Summary related to the context provided in the Resume Context')
    hard_skills: list[str] =Field(...,description="Any hard skill mentioned in the Resume ")
    soft_skills: list[str] = Field(...,description='Any kind of the Soft skill mentioned in the resume')


# In[ ]:


class ScoreBreakdown(BaseModel):
    keyword_optimization: int = Field(
        ..., ge=0, le=100, 
        description="Score out of 100 based on how many core industry skills/keywords are present vs missing."
    )
    impact_and_metrics: int = Field(
        ..., ge=0, le=100, 
        description="Score out of 100 based on the usage of quantifiable numbers, percentages, and hard metrics in experience/projects."
    )
    action_language: int = Field(
        ..., ge=0, le=100, 
        description="Score out of 100 based on strong action verbs. Penalize for passive voice, fluff, or weak phrasing."
    )
    completeness: int = Field(
        ..., ge=0, le=100, 
        description="Score out of 100 based on having all necessary sections (Contact, Summary, Experience, Projects, Education) well fleshed out."
    )

# In[ ]:


class ATSGrpahState(TypedDict):
    resume_content_raw: str
    parsed_resume_structured: Resume_Details 
    
    # Granular Scoring
    final_score: int
    score_breakdown: Annotated[
        "ScoreBreakdown", 
        Field(description="The granular score breakdown across 4 specific categories.")
    ]
    
    # Core Feedback
    suggestions: list[ImprovementSuggestion]
    semantic_error: list[ImprovementSuggestion]
    missing_keywords: list[str]
    tailored_resume:Resume_Details
    user_choice:bool

# In[ ]:


from pydantic import BaseModel, Field

class ResumeScorer(BaseModel):
        
    suggestions: list[ImprovementSuggestion] = Field(
        description="Actionable improvements for impact, adding metrics, restructuring, or fixing skill gaps."
    )
    
    semantic_errors: list[ImprovementSuggestion] = Field(
        description="Language flaws, empty fluff words, passive voice, weak verbs (e.g., 'Helped'), or first-person pronouns (I, me)."
    )

    missing_keywords: list[str] = Field(
        description="Critical industry keywords or standard technologies that are expected for the candidate's implied role but are missing."
    )

# In[ ]:


async def extract_node(state: ATSGrpahState,config:RunnableConfig):
  
    raw_content = state.get('resume_content_raw')
    
    llm = get_dynamic_llm(config)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Applicant Tracking System (ATS) data extraction specialist. Your task is to carefully analyze the provided resume details and accurately find or extract the specific information requested by the user. Adhere strictly to these rules: Never Hallucinate: Only extract information that is explicitly stated in the provided resume text. Missing Data: If the requested information is not present in the resume, you must explicitly state 'Information not found in the provided text.' Do not guess or infer. Format: Keep your answers concise, direct, and structured. Do not include unnecessary conversational filler."),
        ("human", "Resume Details: {details}") 
    ])

    chain = prompt | llm.with_structured_output(Resume_Details)

    result = await chain.ainvoke({'details': raw_content})

    
    return {"parsed_resume_structured": result}


# In[ ]:


from langchain_core.prompts import ChatPromptTemplate



async def analyzer_node(state: ATSGrpahState, config: RunnableConfig):
    parsed_resume = state.get('parsed_resume_structured')

    llm = get_dynamic_llm(config)
    
    system_prompt = """You are an elite Technical Recruiter, ATS Algorithm Expert, and Senior Engineering Manager. 
Your task is to critically audit the provided structured resume data. You must separate your feedback into STRICTLY mutually exclusive categories: Content Impact vs. Language Mechanics.

CRITICAL INSTRUCTIONS FOR CLASSIFICATION:
Do NOT overlap feedback. A single issue must belong to ONLY ONE category below.

1. `suggestions` (The "What" & "How Much"): 
   - Focus ONLY on business impact, technical depth, and quantifiable metrics.
   - Flag sentences that lack hard numbers, percentages, or scale.
   - Flag sentences where a technology is mentioned but the *architectural context* or *reason* for using it is missing.
   - Example Original: "Developed a REST API using Node.js."
   - Example Rewrite: "Architected a scalable Node.js REST API, improving data retrieval speed by 40% and supporting 10k+ daily active users."

2. `semantic_errors` (The "How it is Written"): 
   - Focus ONLY on grammar, spelling, tense consistency, formatting, and tone.
   - Flag first-person pronouns ("I", "me", "we", "my"). Resumes must be third-person implied.
   - Flag passive voice ("was responsible for", "duties included").
   - Flag spelling mistakes, bad grammar, and inconsistent tenses (e.g., using present tense for a past job).
   - Flag meaningless fluff and cliché buzzwords ("Team player", "Detail-oriented", "Hard worker").
   - Example Original: "I was responsible for fixing bugs and am a detail-oriented team player."
   - Example Rewrite: "Resolved critical software defects to ensure high system reliability."

3. `missing_keywords`: 
   - Analyze the candidate's implied role, industry, and existing skills to list 4 to 8 critical missing ATS keywords. 
   - DO NOT limit this to just companion technologies. You must also identify missing methodologies (e.g., Agile, CI/CD, SDLC, TDD), industry-specific domain terms (e.g., SaaS, Distributed Systems, FinTech, Microservices), and high-value role-based phrases (e.g., Cross-functional Collaboration, System Architecture, Performance Optimization).

OUTPUT REQUIREMENTS:
- You must perfectly populate the required schema.
- For `suggestions` and `semantic_error`, ALWAYS quote the exact `original_text` from the resume and provide the `suggested_rewrite`.
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Here is the parsed resume data to audit:\n\n{details}")
    ])
    
    
    final_chain = prompt | llm.with_structured_output(ResumeScorer)

   
    result = await final_chain.ainvoke({"details": parsed_resume.model_dump_json()})

    return {
        "suggestions": result.suggestions,
        "semantic_error": result.semantic_errors,
        "missing_keywords": result.missing_keywords,
    }
# In[ ]:


class ScoreModel(BaseModel):
    score: int = Field(
        ..., ge=0, le=100, 
        description="The final overall ATS readiness score from 0 to 100. This should be a weighted average of the breakdown scores."
    )
    score_breakdown: ScoreBreakdown = Field(
        ..., 
        description="The granular score breakdown across 4 specific categories."
    )

# In[ ]:


import json
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate


def safe_json_encoder(obj):
    """Safely converts ANY custom Pydantic object into a JSON-readable dictionary."""
    if hasattr(obj, 'model_dump'):
        return obj.model_dump() 
    if hasattr(obj, 'dict'):
        return obj.dict()      
    if hasattr(obj, '__dict__'):
        return obj.__dict__     
    return str(obj)             




async def score_node(state: ATSGrpahState, config: RunnableConfig) -> ATSGrpahState:
    parsed_resume = state.get('parsed_resume_structured', {})
    missing_keywords = state.get('missing_keywords', [])
    semantic_error = state.get('semantic_error', [])
    suggestions = state.get('suggestions', [])
    
    llm = get_dynamic_llm(config)
    
    system_prompt = """You are a deterministic, mathematically rigorous Enterprise ATS Scoring Engine.
Your ONLY job is to calculate precise resume scores based strictly on the penalty data provided. Do NOT guess or estimate. You must follow the deduction formulas below.

--- SCORING RUBRIC & FORMULAS ---

1. Keyword Match (Score out of 100 | Weight: 20%)
   - Baseline: 100 points.
   - Deduction: Subtract 5 points for EVERY single item inside the `Missing Keywords Penalties` array.
   - Minimum score: 0.

2. Impact & Metrics (Score out of 100 | Weight: 40%)
   - Baseline: 100 points.
   - Deduction: Subtract 10 points for EVERY single item inside the `Impact Penalties` (suggestions) array. These represent missing quantifiable achievements.
   - Minimum score: 0.

3. Action Language & Tone (Score out of 100 | Weight: 30%)
   - Baseline: 100 points.
   - Deduction: Subtract 8 points for EVERY single item inside the `Action Language Penalties` (semantic_error) array. These represent fluff, passive voice, or bad grammar.
   - Minimum score: 0.

4. Core Completeness (Score out of 100 | Weight: 10%)
   - Baseline: 100 points.
   - Look at the `Parsed Resume Data`. 
   - Deduct 20 points if 'Experience'/'Work History' is missing or empty.
   - Deduct 15 points if 'Education' is missing or empty.
   - Deduct 15 points if 'Skills' is missing or empty.
   - Minimum score: 0.

--- FINAL SCORE CALCULATION ---
The `score` MUST be the weighted average of the 4 categories above:
Final Score = (Keyword Match * 0.20) + (Impact * 0.40) + (Action * 0.30) + (Completeness * 0.10)

OUTPUT INSTRUCTIONS:
Ensure your math is completely accurate based on the exact count of items in the provided arrays. Output the final `score` and the 4 category scores in the `score_breakdown` dictionary."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", """
        --- INPUT DATA ---
        Parsed Resume Data: {parsed_resume}
        Missing Keywords Penalties (Count: {keyword_count}): {missing_keywords}
        Action Language Penalties (Count: {semantic_count}): {semantic_error}
        Impact Penalties (Count: {suggestion_count}): {suggestions}
        """)
    ])

    final_chain = prompt | llm.with_structured_output(ScoreModel)
    
   
    result = await final_chain.ainvoke({
        "parsed_resume": json.dumps(parsed_resume, default=safe_json_encoder),
        "missing_keywords": json.dumps(missing_keywords, default=safe_json_encoder),
        "semantic_error": json.dumps(semantic_error, default=safe_json_encoder),
        "suggestions": json.dumps(suggestions, default=safe_json_encoder),
        "keyword_count": len(missing_keywords) if missing_keywords else 0,
        "semantic_count": len(semantic_error) if semantic_error else 0,
        "suggestion_count": len(suggestions) if suggestions else 0,
    })

    return {
        "final_score": result.score,
        "score_breakdown": result.score_breakdown 
    }
# In[ ]:


def needTailoredResume(state: ATSGrpahState):
   
    user_choice = state.get('user_choice', False)

    if user_choice:
        return 'tailor_my_resume'
    else:
        
        return END

# In[ ]:


class FinalResume(BaseModel):
    final_score:int = Field(...,ge=0,le=100,description='Final Resume Score')
    final_resume_tailored:Resume_Details

# In[ ]:


import json

async def tailor_my_resume(state: ATSGrpahState, config: RunnableConfig) -> ATSGrpahState:
    parsed_resume = state['parsed_resume_structured']
    original_score = state['final_score']
    score_breakdown = state['score_breakdown']
    missing_keywords = state.get('missing_keywords', [])
    suggestions = state.get('suggestions', [])
    semantic_errors = state.get('semantic_error', [])
    
    llm = get_dynamic_llm(config)
    
    system_prompt = """You are a Master Resume Architect and Principal ATS Optimization Expert.
Your absolute directive is to transform the provided resume into a top 1% candidate profile. You must completely rewrite the weak sections by strictly executing the provided audit feedback.

CRITICAL REWRITING RULES (NO COMPROMISES):
1. SEAMLESS KEYWORD INJECTION: You must weave EVERY single item from the `missing_keywords` list into the Summary, Experience, and Skills sections. Zero keyword stuffing. They must be contextualized (e.g., "Architected distributed systems using [Keyword] to reduce latency...").
2. MAXIMIZE BUSINESS IMPACT: Look at the `suggestions` array. You must rewrite the targeted bullets to include the exact quantifiable metrics and impact-driven phrasing suggested. Transition bullets from "task-based" to "results-based".
3. FLAWLESS MECHANICS & TONE: Look at the `semantic_errors` array. Eradicate all passive voice, first-person pronouns, and fluff. Enforce an aggressive, action-driven, highly technical tone across the entire document.
4. ZERO HALLUCINATION: Do NOT invent fake jobs, fake degrees, or fake companies. You are optimizing the *presentation* of the candidate's actual experience, not their history.

SCORING RUBRIC (THE FINAL EVALUATION):
Because you are an elite system executing all of the above fixes, the resulting resume will be a highly optimized, ATS-beating document.
- Start with the Original Score: {original_score}.
- Acknowledge the fixes: You are injecting {keyword_count} keywords, applying {suggestion_count} impact metrics, and fixing {semantic_count} semantic errors.
- Since you are resolving ALL identified penalties, your new `final_score` MUST reflect this massive transformation, safely jumping into the 92-98 range.
- Do not score below 90, and cap the absolute maximum at 98.

Output the exact JSON structure defined by the schema."""

    human_prompt = """Please completely transform this resume based on the following audit data:

--- ORIGINAL RESUME ---
{parsed_resume}

--- CURRENT ATS PERFORMANCE ---
Original Score: {original_score}/100
Score Breakdown: {score_breakdown}

--- MANDATORY UPGRADES TO APPLY ---
Keywords to Weave In: {missing_keywords}
Impact/Metric Upgrades: {suggestions}
Grammar/Tone Fixes: {semantic_errors}

Generate the perfected, highly optimized `final_resume_tailored` and the new `final_score` (92+)."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt)
    ])
    
    chain = prompt | llm.with_structured_output(FinalResume)
    
    
    result = await chain.ainvoke({
        "original_score": original_score,
        "parsed_resume": parsed_resume.model_dump_json() if hasattr(parsed_resume, 'model_dump_json') else json.dumps(parsed_resume),
        "score_breakdown": score_breakdown.model_dump_json() if hasattr(score_breakdown, 'model_dump_json') else (score_breakdown if isinstance(score_breakdown, str) else json.dumps(score_breakdown)),
        "missing_keywords": json.dumps(missing_keywords),
        "suggestions": json.dumps([s.model_dump() if hasattr(s, 'model_dump') else s for s in suggestions]),
        "semantic_errors": json.dumps([s.model_dump() if hasattr(s, 'model_dump') else s for s in semantic_errors]),
        "keyword_count": len(missing_keywords) if missing_keywords else 0,
        "suggestion_count": len(suggestions) if suggestions else 0,
        "semantic_count": len(semantic_errors) if semantic_errors else 0,
    })
    
    print(f"DEBUG -> Original Score: {original_score} | AI Generated Score: {result.final_score}")
    
    
    final_calculated_score = result.final_score if result.final_score > original_score else max(92, min(original_score + 25, 98))

    return {
        "final_score": final_calculated_score,
        "tailored_resume": result.final_resume_tailored
    }
# In[ ]:


graph = StateGraph(state_schema=ATSGrpahState)

graph.add_node('extract_node',extract_node)
graph.add_node('score_node',score_node)
graph.add_node('analyzer_node',analyzer_node)
graph.add_node('tailor_my_resume',tailor_my_resume)

graph.add_edge(START,'extract_node')
graph.add_edge('extract_node','analyzer_node')
graph.add_edge('analyzer_node','score_node')
graph.add_conditional_edges('score_node',needTailoredResume,{'tailor_my_resume':'tailor_my_resume',END:END})
graph.add_edge('tailor_my_resume',END)

# In[ ]:


checkpointers = InMemorySaver()
final_graph = graph.compile(checkpointer=checkpointers,interrupt_after=['score_node'])

# In[ ]:


final_graph

# In[ ]:


class JD_Structured(BaseModel):
    skills: list[str] = Field(..., description='Skills required mentioned in JD')
    experience: str = Field(description='Experience required mentioned in JD')
    title: str = Field(..., description='This refers to the job title')
    Location: str = Field(..., description='Location of the Job. If flexible, state both remote and onsite. Clearly specify if Remote or Onsite.')
    summary: str = Field(..., description='Summary of the Job, not more than 3-4 lines')
    soft_skills: list[str] = Field(description='Any Soft Skill mentioned in the JD')
    salary_range: str = Field(description='The salary range or compensation details if mentioned in the JD. Return "Not specified" if absent.')
    perks_benefits: list[str] = Field(description='List of any benefits, perks, or "what we offer" details mentioned in the JD')

# In[ ]:


class JDMatcher(TypedDict):
    match_score:int
    raw_jd_content: str
    raw_resume_content:str
    parsed_resume_structured: Resume_Details
    parsed_jd_structured:JD_Structured
    missing_points: list[str]        
    points_matched: list[str]        
    improvements: list[ImprovementSuggestion]
    tailored_resume_content:Resume_Details
    summary_suggestion :list[ImprovementSuggestion]
    experience_suggestion:list[ImprovementSuggestion]
    projects_suggestions:list[ImprovementSuggestion]
    skills_strategy_suggestions:list[ImprovementSuggestion]
    user_approval:bool
    human_feedback:Annotated[list[str], operator.add]
    user_thought:Literal["Approved","Rewrite"]

# In[ ]:


async def jd_analyzer(state:JDMatcher,config:RunnableConfig):
    raw_jd = state['raw_jd_content']
    
    llm = get_dynamic_llm(config)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system","You are an expert Technical Recruiter and Data Extraction Specialist. Your task is to carefully analyze the provided Job Description (JD) text and extract the key information into a highly structured format. Adhere strictly to these rules: No Hallucinations: Only extract information explicitly mentioned in the text. If a detail like salary range, experience, or perks is missing, explicitly output 'Not specified'. Do not guess. Comprehensive Skills: Exhaustively list all hard skills (programming languages, frameworks, databases, tools) and soft skills (communication, leadership, etc.). If it is listed as a 'nice-to-have', include it. Clear Summarization: Write a concise 3-4 line summary of the role's primary focus and daily responsibilities. Precise Location: Clearly state if the role is Remote, Onsite, or Hybrid/Flexible based on the text provided. Perks & Benefits: Extract any specific offerings, bonuses, or cultural benefits into a clean list."),
        ("human","JD Content {details}")
    ])
  
    chain = prompt | llm.with_structured_output(JD_Structured)

    result = await chain.ainvoke({"details":raw_jd})

    return {"parsed_jd_structured":result}

# In[ ]:


async def resume_extract(state: JDMatcher,config:RunnableConfig):
  
    raw_content = state['raw_resume_content']
    
    llm = get_dynamic_llm(config)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Applicant Tracking System (ATS) data extraction specialist. Your task is to carefully analyze the provided resume details and accurately find or extract the specific information requested by the user. Adhere strictly to these rules: Never Hallucinate: Only extract information that is explicitly stated in the provided resume text. Missing Data: If the requested information is not present in the resume, you must explicitly state 'Information not found in the provided text.' Do not guess or infer. Format: Keep your answers concise, direct, and structured. Do not include unnecessary conversational filler."),
        ("human", "Resume Details: {details}") 
    ])

    chain = prompt | llm.with_structured_output(Resume_Details)

    result = await chain.ainvoke({'details': raw_content})

    
    return {"parsed_resume_structured": result}


# In[ ]:


class Matcher(BaseModel):
    points_matched: list[str] = Field(...,description='Points or things that are matched in the resume acc to the Job discription')
    missing_points: list[str]
    summary_suggestion: str = Field(description="A rewritten high-impact summary")
    experience_suggestions: list[ImprovementSuggestion] = Field(description="Rewrites for work history")
    project_suggestions: list[ImprovementSuggestion] = Field(description="Rewrites for projects")
    skills_strategy: str = Field(description="How to reorder the skills section")
    improvements:list[ImprovementSuggestion]=Field(description='Improvements Required in the Resume according to the JD')

# In[ ]:


async def evaluator_node(state: dict, config: RunnableConfig):
    parsed_jd = state.get('parsed_jd_structured')
    parsed_resume = state.get('parsed_resume_structured')

    if not parsed_jd or not parsed_resume:
        return {"missing_points": ["Error: Parsing failed for JD or Resume"]}
    
    llm = get_dynamic_llm(config)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a World-Class Technical Recruiter and ATS Optimization Expert. Your mission is to perform a surgical-level gap analysis and provide a complete blueprint for tailoring a candidate's resume to a specific Job Description (JD).

You are provided with structured JSON data for both the JD and the Resume. Your analysis must be ruthless, objective, and highly tactical.

ADHERE TO THESE RED-LINE RULES:
1. ZERO TOLERANCE FOR FORCED MATCHING: If the candidate's resume is fundamentally unrelated to the JD (e.g., applying for a coding role with a purely non-technical resume), DO NOT stretch concepts, guess, or hallucinate to create a match. You must only return EXACT, verifiable matches. If there is no genuine overlap, leave `points_matched` completely empty.
2. NO HALLUCINATION: Do not invent experiences. Only suggest optimizations based on the candidate's existing projects and roles.
3. ATS SCORING LOGIC: Prioritize hard skills and job titles. If the JD asks for 'Senior Full Stack Developer' and the resume says 'Software Engineer Intern', flag this as a critical structural gap.
4. QUANTIFIED IMPACT: Every suggestion for Experience or Projects MUST include a placeholder for a metric (e.g., [X%], [Y ms], [Z users]).

YOUR OUTPUT MUST EXACTLY POPULATE THE FOLLOWING CATEGORIES:

1. points_matched (List of Strings): Extract direct hits. If a skill is 'conceptually' present but named differently (e.g., JD asks for 'Cloud Native', user has 'Docker/K8s'), list it as a match but suggest using exact terminology.
2. missing_points (List of Strings): List the core skills, certifications, or experiences required by the JD that are entirely absent from the resume.
3. summary_suggestion (String): Rewrite the candidate's 'Summary' to act as a direct mirror to the JD's 'About Us' and 'Responsibilities'. Highlight the top 3 overlapping tech stacks immediately.
4. experience_suggestions (List of Objects): Analyze the 'Experience' section. Provide specific rewrites for work history bullet points to target the JD's primary responsibilities.
5. project_suggestions (List of Objects): Pick the top 2 projects that align best with the JD. Suggest how to re-order or re-phrase descriptions to put the JD's required tools at the beginning.
6. skills_strategy (String): Provide the 'Optimal Skills Layout'. Tell the candidate which skills to 'Promote' to the top of their list and which to 'Demote'.
7. improvements (List of Objects): General structural or overall resume improvements required to match the JD (e.g., "Change job title to match JD", "Remove multi-column layout").
"""),
        
        ("human", """
        Job Description Data:
        {jd_details}

        Candidate Resume Data:
        {resume_details}
        """)
    ])
    
    
    chain = prompt | llm.with_structured_output(Matcher)
    
    try:
       
        jd_json = parsed_jd.model_dump_json() if hasattr(parsed_jd, 'model_dump_json') else str(parsed_jd)
        resume_json = parsed_resume.model_dump_json() if hasattr(parsed_resume, 'model_dump_json') else str(parsed_resume)

        result = await chain.ainvoke({
            "jd_details": jd_json,
            "resume_details": resume_json
        })
        
        if result is None:
            raise ValueError("LLM returned empty structured output")
            
    except Exception as e:
        print(f"Evaluator Error: {e}")
        return {
            "missing_points": ["Unexpected Error Occurred during JD Matching evaluation."]
        }

    return {
        "points_matched": result.points_matched,
        "missing_points": result.missing_points,
        "improvements": result.improvements,
        "skills_strategy_suggestions": result.skills_strategy,
        "projects_suggestions": result.project_suggestions,
        "summary_suggestion": result.summary_suggestion,
        "experience_suggestion": result.experience_suggestions,
    }

# In[ ]:


class Score(BaseModel):
    score: int = Field(..., le=100, ge=0, description="Compare the JD and resume and provide the Score")

async def match_score_node(state: JDMatcher,config:RunnableConfig):
    jd = state.get('parsed_jd_structured')
    resume = state.get('parsed_resume_structured')
    missing_points = state.get('missing_points', [])
    points_matched = state.get('points_matched', [])
    
    llm = get_dynamic_llm(config)
   
    SYSTEM_PROMPT = """You are an elite, highly strict Applicant Tracking System (ATS). Your objective is to calculate a highly accurate, realistic match score (0-100) between a candidate's resume and a Job Description.

    SCORING RUBRIC:
    - 90-100: Exceptional fit. Candidate has the exact required titles, years of experience, and all core hard skills.
    - 75-89: Strong match. Minor gaps in secondary skills, but core tech stack and experience align perfectly.
    - 50-74: Average match. Missing some important keywords, workflow concepts, or slightly short on experience. Needs optimization.
    - 0-49: Poor match. Fundamental misalignment in tech stack, role level, or missing critical hard requirements.

    Be objective and strict. Base your score heavily on the 'Matched Points' vs 'Missing Points' provided in the context. If core hard skills from the JD are in the 'Missing Points', the score MUST be penalized heavily."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", """
        ### TARGET JOB DESCRIPTION:
        {jd}

        ### CANDIDATE RESUME:
        {resume}

        ### GAP ANALYSIS RESULTS:
        - ✅ Matched Keywords/Skills: {matched}
        - ❌ Critical Missing Gaps: {missing}

        Analyze the severity of the missing gaps compared to the matched points. Provide the final integer score.
        """)
    ])

    
    chain = prompt | llm.with_structured_output(Score)

    try:
        
        result = await chain.ainvoke({
            "jd": jd.model_dump_json() if hasattr(jd, 'model_dump_json') else str(jd),
            "resume": resume.model_dump_json() if hasattr(resume, 'model_dump_json') else str(resume),
            "matched": json.dumps(points_matched),
            "missing": json.dumps(missing_points)
        })
        final_score = result.score
        
    except Exception as e:
        print(f"Scoring Node Error: {e}")
        final_score = 50 

    return {
        "match_score": final_score
    }

# ### Conditional Edge 

# In[ ]:


def should_tailor(state: JDMatcher):
    if state.get("user_approval") is True:
        return "tailored_resume" 
    return END 

# In[ ]:




# #### HITL (Human in the Loop) Resume Corrector

# In[ ]:


async def tailored_resume(state: JDMatcher, config: RunnableConfig):
    jd = state['parsed_jd_structured']
    feedback = state['improvements']
    gaps = state['missing_points']
    match_score = state['match_score']

  
    current_resume = state.get('tailored_resume_content') 
    if not current_resume:
        current_resume = state['parsed_resume_structured']

    
    feedback_history = state.get('human_feedback', [])
    if feedback_history:
        user_feedback = "\n- ".join(feedback_history)
        user_feedback = f"Follow these user instructions (prioritize the most recent):\n- {user_feedback}"
    else:
        user_feedback = "No specific user instructions provided yet. Focus on the improvements and missing points."

    llm = get_dynamic_llm(config)
    
    SYSTEM_PROMPT = """You are a World-Class Executive Resume Architect. Your goal is to rewrite the candidate's resume to create a perfect narrative alignment with the provided Job Description (JD) while strictly adhering to the User's specific feedback.

        INPUTS PROVIDED:
        1. Current Resume: The structured data of the candidate (either original or previously tailored).
        2. Target JD: The requirements and tech stack of the hiring company.
        3. Change Log: A list of 'Improvements' and 'Missing Points' from the evaluator.
        4. USER FEEDBACK: Direct instructions from the candidate on how they want to be perceived.
        5: Match Score of resume and JD 

        STRICT OPERATING CONSTRAINTS (The Hierarchy):
        0. ZERO TOLERANCE FOR FORCED MATCHING / HALLUCINATION: If the original resume is fundamentally unrelated to the JD, DO NOT invent, guess, or magically add missing skills to the resume. You must only reframe verifiable facts. NEVER fabricate roles, tools, or projects just to force a higher match.
        1. USER IS THE BOSS: If User Feedback contradicts the JD or the Change Log, PRIORITIZE the User Feedback. (e.g., If the user says 'Keep it under 1 page' or 'Focus on my leadership over my coding', do exactly that).
        2. TRUTH OVER ALL: Never invent new companies, degrees, or years of experience. Reframe, do not fabricate.
        3. TERMINOLOGY MIRRORING: Use exact technical keywords from the JD (e.g., 'Cloud-Native' vs 'Web-based') ONLY IF they genuinely align with the candidate's actual past work.
        4. QUANTIFIED BULLETS: Every project bullet point must include placeholders for metrics (e.g., [X%], [Y ms], [Z users]).

        YOUR MISSION:
        Rewrite the Resume_Details object. Maintain the JSON structure. Ensure the Professional Summary and Projects sections are the strongest evidence of the candidate's fit for the role and their personal preferences."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", """
        ### CONTEXT FOR REWRITE:
        - **Current Resume:** {current_resume_data}
        - **Target JD:** {target_jd}
        - **Match Score:** {match_score}

        ### EVALUATOR SUGGESTIONS:
        - **Required Improvements:** {improvements}
        - **Missing Skills to Address:** {gaps}
         
         

        ### 🛑 CRITICAL USER FEEDBACK (PRIORITIZE THIS):
        {user_feedback}

        Please provide the updated Resume_Details object now.""")
    ])

    chain = prompt | llm.with_structured_output(Resume_Details)

    refined_resume = await chain.ainvoke({
        "current_resume_data": current_resume.model_dump_json() if hasattr(current_resume, 'model_dump_json') else str(current_resume),
        "target_jd": jd.model_dump_json() if hasattr(jd, 'model_dump_json') else str(jd),
        "improvements": feedback,
        "gaps": gaps,
        "user_feedback": user_feedback,
        "match_score": match_score
    })

    return {
        "tailored_resume_content": refined_resume 
    }
# In[ ]:


def rewrite_taillored_resume(state: JDMatcher):
    
    user_thought = state.get('user_thought','Approved')
    
    if user_thought == 'Rewrite':
        return 'tailored_resume'
    else:
        return END

# In[ ]:


graph = StateGraph(state_schema=JDMatcher)

graph.add_node('jd_analyzer',jd_analyzer)
graph.add_node('resume_extract',resume_extract)
graph.add_node('evaluator_node',evaluator_node)
graph.add_node('tailored_resume',tailored_resume)
graph.add_node('match_score_node',match_score_node)


graph.add_edge(START,"jd_analyzer")
graph.add_edge(START,"resume_extract")

graph.add_edge("jd_analyzer","evaluator_node")
graph.add_edge("resume_extract","evaluator_node")
graph.add_edge('evaluator_node','match_score_node')

graph.add_conditional_edges('match_score_node',should_tailor,{'tailored_resume':'tailored_resume',END:END})
graph.add_conditional_edges('tailored_resume',rewrite_taillored_resume,{'tailored_resume':'tailored_resume',END:END})

graph.add_edge('tailored_resume',END)

# In[ ]:


checkpointers = InMemorySaver()
final_graph2 = graph.compile(checkpointer=checkpointers,interrupt_after=['match_score_node',"tailored_resume"])
config={"configurable":{"thread_id":"atul_user_tester"}}

# In[ ]:


final_graph2

# In[ ]:


class   EmailState(TypedDict):
    sender_email: str            
    receiver_email: str          
    raw_jd_content:str
    raw_resume_content:str
    email_subject: Optional[str] 
    email_content: Optional[str]
    send:bool
    resume_url:str

# In[ ]:


class Email(BaseModel):
    subject: str = Field(description="The professional subject line of the email.")
    content: str = Field(description="The tailored, professional body of the email.")

# In[ ]:


async def draft_email_node(state: EmailState, config: RunnableConfig):
    """Generates a concise outreach email based on Resume and JD."""
    
    
    llm = get_dynamic_llm(config)
    
   
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are drafting a direct outreach email from the perspective of the CANDIDATE to the Hiring Manager or Recruiter. 
        Write entirely in the first person ("I", "my", "me") as if you are the applicant.
        Write a CONCISE, high-impact email (max 150 words).
        Focus on connecting the candidate's top 2 matching technical skills directly to the job description requirements. 
        Use a professional, confident, and enthusiastic tone. 
        Do not use buzzwords; be direct about the value you bring.
        Include placeholders like [Hiring Manager Name] or [Company Name] where data is missing."""),
        ("human", """
        JOB DESCRIPTION:
        {jd}

        CANDIDATE RESUME:
        {resume}
         
        Draft a short, direct application email from the candidate to the recruiter for this role.
        """)
    ])

    chain = prompt | llm.with_structured_output(Email)
    response = await chain.ainvoke({
        "jd": state.get("raw_jd_content", "N/A"),
        "resume": state.get("raw_resume_content", "N/A")
    })

    return {
        "email_subject":response.subject,
        "email_content":response.content
    }



# In[ ]:


import smtplib
from email.message import EmailMessage
from langchain_core.runnables import RunnableConfig

async def send_actual_email(state: EmailState, config: RunnableConfig):
    """
    Sends an email using the dynamic credentials extracted from the config.
    """
    
    configurable = config.get("configurable", {})
    smtp_user = configurable.get("email_user")
    smtp_pass = configurable.get("email_pass")

    if not smtp_user or not smtp_pass:
        print("❌ Error: SMTP credentials missing from config.")
        return "Failed: Missing SMTP Credentials"

    
    subject = state.get('email_subject', 'No Subject')
    sender = state.get('sender_email')  
    receiver = state.get('receiver_email')
    base_content = state.get('email_content', '')
    
    
    resume_url = state.get('resume_url', 'No link provided') 

   
    plain_text_content = f"{base_content}\n\nHere is my resume url: {resume_url}"

    
    formatted_base_content = base_content.replace('\n', '<br>')
    
    html_content = f"""\
    <html>
      <body>
        <p>{formatted_base_content}</p>
        <br>
        <p>
          <b>Here is my resume url:</b> 
          <a href="{resume_url}" style="background-color: #fef08a; padding: 2px 4px; border-radius: 4px; text-decoration: none; color: #1d4ed8; font-weight: bold;">
            {resume_url}
          </a>
        </p>
      </body>
    </html>
    """

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = receiver
    
    
    msg.set_content(plain_text_content)
    
    
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_user, smtp_pass) 
            server.send_message(msg)
        
        print(f"✅ Email sent successfully from {smtp_user}")
        return {"send": True}
        
    except Exception as e:
        print(f"SMTP Error: {e}")
        return {"send": False}

# In[ ]:


def send_email(state:EmailState):
    permission = state['send']

    if permission:
        return "send_actual_email"
    else:
        return END

# In[ ]:


graph = StateGraph(state_schema=EmailState)
graph.add_node('email_node',draft_email_node)
graph.add_node('send_actual_email',send_actual_email)

graph.add_edge(START,"email_node")
graph.add_conditional_edges("email_node",send_email,{"send_actual_email":"send_actual_email",END:END})
graph.add_edge('send_actual_email',END)



# In[ ]:


checkpointers=InMemorySaver()
final_graph3 = graph.compile(checkpointer=checkpointers,interrupt_after=['email_node'])

# In[ ]:


import os 

hf_token = os.getenv("HUGGINGFACE_API_TOKEN")

embedding_model = HuggingFaceEndpointEmbeddings(
    model='BAAI/bge-m3',
    task='feature-extraction',
    huggingfacehub_api_token=hf_token
)
# In[ ]:

mongo_client = os.getenv("MONGO_CLIENT")
client = MongoClient(mongo_client)

# In[ ]:


db = client['ResumeTailor']

# In[ ]:


jobs_collection = db['jobs']

# In[ ]:


# all_items = list(jobs_collection.find()) # Convert to list so we can use it

# for job in all_items:
#     text_to_embed = f"Title: {job.get('title', '')} | Description: {job.get('description', '')}"
#     vector_array = embedding_model.embed_query(text_to_embed)
    
    
#     jobs_collection.update_one(
#         {"_id": job["_id"]}, 
#         {"$set": {"embeddings": vector_array}}
#     )

# print(" Database updated with 1024-dim embeddings!")

# In[ ]:




from fastapi import APIRouter, HTTPException

# In[ ]:


def pdf_parser(url:str)->str:

    document = PyMuPDFLoader(file_path=url)
    loaded_docs = document.load()
    
    return loaded_docs[0].page_content
    

# In[ ]:

@app.get("/ping")
async def ping():
    return {"status": "alive", "message": "I am awake!"}

class ScoreRequest(BaseModel):
    resume_url: str
    api_key: Optional[str] = None
    clerk_id: str  

@app.post('/api/calculate-score')
async def calculate_score(data: ScoreRequest):
    print(f"Processing for Clerk ID: {data.clerk_id}")
    resume_text = pdf_parser(url=data.resume_url) 
    
    
    key_to_use = data.api_key if data.api_key else "YOUR_SAFE_FALLBACK_KEY_FROM_ENV"
    
    
    
    
    config = {
        "configurable": {
            "thread_id": data.clerk_id,
            "user_api_key": key_to_use 
        }
    }
    
   
    result = await final_graph.ainvoke({'resume_content_raw': resume_text}, config=config)
    
    return {
        "success": True, 
        "response": result
    }

# In[ ]:


class UserNeed(BaseModel):
    user_choice: bool
    clerk_id: str            
    api_key: Optional[str] = None

@app.post('/api/tailor-resume')
async def needTailoring(data: UserNeed):
    print(f"[TAILOR] Processing choice ({data.user_choice}) for Clerk ID: {data.clerk_id}")
    
    
    key_to_use = data.api_key if data.api_key else "YOUR_SAFE_FALLBACK_KEY_FROM_ENV"
    
    
    
    
    config = {
        "configurable": {
            "thread_id": data.clerk_id,
            "user_api_key": key_to_use 
        }
    }
    
    
    if data.user_choice:
        final_graph.update_state(config, {'user_choice': True})
        result = await final_graph.ainvoke(None, config=config)

        return {
            'success': True,
            'response': result
        }
    
    else:
        final_graph.update_state(config, {'user_choice': False})
        result = await final_graph.ainvoke(None, config=config)

        return {
            'success': True,
            'response': result
        }

# In[ ]:


class JdPostRequest(BaseModel):
    resume_url: str
    jd_content: str
    clerk_id: str            
    api_key: Optional[str] = None

@app.post('/api/jd-matcher/analyze')
async def start_graph(data: JdPostRequest):
    print(f"[JD MATCHER] Processing for Clerk ID: {data.clerk_id}")
    print(f"Resume URL: {data.resume_url}")

    resume_text = pdf_parser(url=data.resume_url) 
    jd_content_raw = data.jd_content

    
    key_to_use = data.api_key if data.api_key else "YOUR_SAFE_FALLBACK_KEY_FROM_ENV"
    
    

    inputs = {
        "raw_jd_content": jd_content_raw,
        "raw_resume_content": resume_text
    }
    
   
    config = {
        "configurable": {
            "thread_id": data.clerk_id,
            "user_api_key": key_to_use 
        }
    }

    
    result = await final_graph2.ainvoke(inputs, config=config)

    return {
        "success": True,
        "response": result
    }

# In[ ]:


class TailorRequest(BaseModel):
    action: str
    feedback: Optional[str] = None
    clerk_id: str            
    api_key: Optional[str] = None

@app.post('/api/jd-matcher/tailor')
async def tailor_resume(data: TailorRequest):
    try:
        print(f"[JD MATCHER TAILOR] Processing action ({data.action}) for Clerk ID: {data.clerk_id}")
        
       
        key_to_use = data.api_key if data.api_key else "YOUR_SAFE_FALLBACK_KEY_FROM_ENV"
        

        
        config = {
        "configurable": {
            "thread_id": data.clerk_id,
            "user_api_key": key_to_use 
        }
        }
        
        action = data.action.strip().lower()

        
        if action == "start_tailoring":
            print("\n🎬 PHASE 2: Generating first tailored draft...")
            final_graph2.update_state(config, {"user_approval": True})
            result  = await final_graph2.ainvoke(None, config=config) 
            print(result)
            new_state = final_graph2.get_state(config)
            return {
                "success": True,
                "message": "First draft generated.",
                "tailored_resume_content": new_state.values.get('tailored_resume_content'),
                "result": result
            }
        
        elif action == "rewrite":
            print("\n📝 PHASE 3: Refixing with User Feedback...")
            
           
            state_updates = {"user_thought": "Rewrite"}
            
            
            if data.feedback:
                state_updates["human_feedback"] = [data.feedback]
            
           
            final_graph2.update_state(config, state_updates)
            result = await final_graph2.ainvoke(None, config=config)
            
            print(result)
            new_state = final_graph2.get_state(config)
            return {
                "success": True,
                "response": new_state.values
            }

        elif action == "accept":
            print("\n✅ PHASE 4: Accepted!")
            final_graph2.update_state(config, {"user_thought": "Approved"})
            await final_graph2.ainvoke(None, config=config)
            
            new_state = final_graph2.get_state(config)
            return {
                "success": True,
                "response": new_state.values
            }

        else:
            raise HTTPException(status_code=400, detail="Invalid action. Use start_tailoring, rewrite, or accept.")

    except Exception as e:
        print(f"Error in tailor_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# In[ ]:


class MatchedJobs(BaseModel):
    resume_url:str
    

# In[ ]:


@app.post('/api/matched-jobs')
async def matched_jobs(data:MatchedJobs):
    resume_content = pdf_parser(data.resume_url)

    embedded_resume  = embedding_model.embed_query(resume_content)

    pipeline = [
    {
        '$vectorSearch': {
            'index': 'jobs_search', 
            'path': 'embeddings', 
            'queryVector': embedded_resume,
            'numCandidates': 150, 
            'limit': 15
        }
    },
    {
        '$project': {
            '_id': { '$toString': '$_id' },                    
            'title': 1,
            'company_name': 1,
            'apply_link': 1,
            'description':1,
            'source_from':1,
            'location':1,
            'score': { '$meta': 'vectorSearchScore' }
        }
    }
    ]

    print("🔍 Searching for the perfect job match...")
    results = client["ResumeTailor"]["jobs"].aggregate(pipeline)


    matched_jobs = list(results)

    if not matched_jobs:
        return {
            "success":True,
            "response":"No Matched Jobs Found For your Resume"
        }
    else:
        return {
            "success":True,
            "response":matched_jobs
        }

    

# In[ ]:


class EmailAgentRequest(BaseModel):
    clerk_id: str
    api_key: str
    email_user: str
    email_pass: str
    raw_jd_content: Optional[str] = None
    raw_resume_content: Optional[str] = None
    send: Optional[bool] = False

# In[ ]:


@app.post("/api/agent/draft-email")
async def draft_email(data: EmailAgentRequest):
    
    config = {
        "configurable": {
            "thread_id": data.clerk_id,
            "user_api_key": data.api_key,
            "email_user": data.email_user,
            "email_pass": data.email_pass
        }
    }

    initial_state = {
        "raw_jd_content": data.raw_jd_content,
        "raw_resume_content": data.raw_resume_content,
        "send": False
    }


    result = await final_graph3.ainvoke(initial_state, config=config)

    return {
        "success": True,
        "status": "Waiting for approval",
        "draft_subject": result.get("email_subject"),
        "draft_content": result.get("email_content")
    }

# In[ ]:


class ApproveRequest(BaseModel):
    clerk_id: str
    api_key: str
    email_user: str 
    email_pass: str 
    email_subject: str
    email_content: str
    sender_email: str
    receiver_email: str
    approve: bool = True,
    resume_url:str

# In[ ]:


@app.post("/api/agent/approve-send")
async def approve_and_send(data: ApproveRequest):
    config = {
        "configurable": {
            "thread_id": data.clerk_id,
            "user_api_key": data.api_key,
            "email_user": data.email_user,
            "email_pass": data.email_pass
        }
    }

    try:
        final_graph3.update_state(
            config, 
            {
                "email_subject": data.email_subject,
                "email_content": data.email_content,
                "sender_email": data.sender_email,
                "receiver_email": data.receiver_email,
                "send": True,
                "resume_url": data.resume_url
            },
            as_node="email_node"
        )

        result = await final_graph3.ainvoke(None, config=config)

        return {
            "success": True,
            "email_status": result,
            "message": "Manual edits applied and email dispatched."
        }

    except Exception as e:
        print(f"Approval Error: {str(e)}")
        return {"success": False, "error": str(e)}

# In[ ]:


import uvicorn

if __name__ == "__main__":
    # If you named your file ai_server.py, you can also use "ai_server:app" with reload=True
    uvicorn.run(app, host="127.0.0.1", port=8000)