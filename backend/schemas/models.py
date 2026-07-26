from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

class DealInput(BaseModel):
    company_name: str
    website: Optional[str] = None
    industry: str
    country: str
    revenue: float
    ebitda: float
    employees: int
    funding_amount: float
    funding_purpose: str
    existing_debt: float
    years_in_business: int
    business_description: str
    additional_notes: Optional[str] = None

class ValidationResult(BaseModel):
    is_valid: bool = Field(description="Whether the input is complete and logical.")
    missing_fields: List[str] = Field(description="Any critical missing information.")
    inconsistencies: List[str] = Field(description="Any illogical values.")
    cleaned_input: DealInput = Field(description="The normalized and cleaned input data.")
    validation_notes: str = Field(description="Brief notes on the validation.")

class CompanyResearch(BaseModel):
    company_profile: str = Field(description="Detailed overview of the company based on public info. If unavailable, state 'Information unavailable from public sources'.")
    industry_analysis: str = Field(description="Analysis of the industry and market size.")
    competitors: List[str] = Field(description="Likely competitors in the space.")
    business_model: str = Field(description="How the company makes money.")
    recent_news: str = Field(description="Recent news/trends. If none, state 'No recent public news available'.")
    confidence_level: float = Field(description="AI confidence in this research from 0 to 1 based on data availability.")
    sources_used: List[str] = Field(description="URLs or specific names of public sources used.")
    
    # Extended Enterprise Data Fields (Optional for backward compatibility)
    headquarters: Optional[str] = Field(default=None, description="Company headquarters location if public.")
    founded: Optional[str] = Field(default=None, description="Founding year if public.")
    years_in_business_public: Optional[str] = Field(default=None, description="Publicly verified years in business.")
    employee_count_public: Optional[str] = Field(default=None, description="Publicly verified employee count.")
    revenue_public: Optional[str] = Field(default=None, description="Publicly verified revenue if available.")
    ebitda_public: Optional[str] = Field(default=None, description="Publicly verified EBITDA if available.")
    funding_history: Optional[str] = Field(default=None, description="History of past funding rounds or capital raised.")
    market_trends: Optional[str] = Field(default=None, description="Broad market trends affecting the industry.")
    public_filings: Optional[str] = Field(default=None, description="Summary of relevant public filings (e.g. SEC/Companies House).")
    verified_fields: Optional[Dict[str, Any]] = Field(default=None, description="Detailed dictionary of fields and their verification status.")
    verified_sources: Optional[List[Dict[str, Any]]] = Field(default=None, description="Detailed list of sources, timestamps, and authority scores.")

class FinancialAnalysis(BaseModel):
    health_score: int = Field(description="Score from 1-100 indicating financial health based on provided inputs.")
    revenue_analysis: str = Field(description="Analysis of revenue scale.")
    debt_capacity: str = Field(description="Analysis of their ability to take on new debt.")
    growth_prospects: str = Field(description="Analysis of growth potential.")
    key_risks: List[str] = Field(description="Key financial risks.")
    observations: str = Field(description="Overall financial observations.")

class FinancingRecommendation(BaseModel):
    recommended_debt_structure: str = Field(description="The proposed debt structure.")
    loan_type: str = Field(description="E.g. Term Loan, Revolver, Mezzanine.")
    loan_tenure: str = Field(description="Recommended duration.")
    security_collateral: str = Field(description="What should secure the loan.")
    repayment_recommendation: str = Field(description="How the loan should be repaid (e.g. amortizing, bullet, cash sweep).")
    interest_assumptions: str = Field(description="Expected interest rate range.")
    reasoning: str = Field(description="Detailed reasoning for this recommendation.")

class LenderCategory(BaseModel):
    category_name: str = Field(description="E.g. Commercial Banks, NBFCs, Private Credit.")
    fit_explanation: str = Field(description="Why this category fits the deal.")
    likelihood_of_approval: str = Field(description="High, Medium, Low.")

class LenderMatching(BaseModel):
    suggested_lenders: List[LenderCategory] = Field(description="List of suitable lender categories.")
    overall_lender_strategy: str = Field(description="How to approach the market for this deal.")

class FinalReport(BaseModel):
    executive_summary: str = Field(description="Section 1: Executive Summary")
    company_overview: str = Field(description="Section 2: Company Overview. If public info is missing, use provided input and state 'Extensive public info unavailable'.")
    business_analysis: str = Field(description="Section 3: Business Analysis")
    industry_analysis: str = Field(description="Section 4: Industry Analysis")
    financial_highlights: str = Field(description="Section 5: Financial Highlights based on input numbers")
    funding_requirement: str = Field(description="Section 6: Funding Requirement (Amount and Purpose)")
    financing_requirement: str = Field(description="Section 7: Financing Requirement (Type of capital needed)")
    recommended_debt_structure: str = Field(description="Section 8: Recommended Debt Structure")
    loan_structure: str = Field(description="Section 9: Loan Structure (Tenure, Security, Rate)")
    repayment_recommendation: str = Field(description="Section 10: Repayment Recommendation")
    recommended_lender_categories: List[LenderCategory] = Field(description="Section 11: Suggested Lender Categories")
    risk_assessment: str = Field(description="Section 12: Risk Assessment")
    strengths: List[str] = Field(description="Section 13: Key Strengths")
    potential_concerns: List[str] = Field(description="Section 14: Potential Concerns")
    sources: List[str] = Field(description="Section 15: Specific sources cited (URLs or database names). Do NOT invent sources.")
    ai_confidence_score: float = Field(description="Section 16: AI Confidence Score (0.0 to 1.0)")
    analyst_notes: str = Field(description="Section 17: Analyst Notes (Initial thoughts or next steps)")
    disclaimer: str = Field(description="Section 18: Standard investment banking disclaimer.")
