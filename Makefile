.PHONY: install lint test check web platform-api platform-web platform-check run-demo run-healthcare run-fintech run-marketplace playground local-grade

install:
	agents-cli install

lint:
	ruff check app tests platform/api/careerproof_api platform/api/tests streamlit_app.py

test:
	pytest

check: lint test

web:
	streamlit run streamlit_app.py

platform-api:
	PYTHONPATH=.:platform/api uvicorn careerproof_api.main:app --app-dir platform/api --reload

platform-web:
	npm --prefix platform/web run dev

platform-check:
	PYTHONPATH=.:platform/api pytest tests platform/api/tests
	npm --prefix platform/web run test

playground:
	agents-cli playground

run-demo:
	agents-cli run '{"target_role":"Business Analyst","company":"Healthcare operations company","industry":"Healthcare Operations / HealthTech","job_description":"We are looking for a Business Analyst to build dashboards, define KPIs, work with stakeholders, improve reporting processes, and translate data into recommendations. SQL, Excel, Power BI, and stakeholder communication are required.","candidate_profile":"Candidate has experience at Uber Taiwan in operations, ERP implementation, cross-functional coordination with Product, Sales, CRM, PR, Legal, SKU expansion from 1000 to 3000, complaint rate reporting from 5% to 1%, and VisualSoft dashboard work using Python and Power BI improving decision efficiency by 30%."}'

run-healthcare:
	agents-cli run '{"target_role":"Business Analyst","company":"Healthcare AI company","industry":"Healthcare Operations / HealthTech","job_description":"Build dashboards for patient access, reduce wait time, analyze provider utilization, SQL and Power BI required.","candidate_profile":"Uber operations, ERP implementation, dashboarding, cross-functional stakeholder work, complaint rate reporting."}'

run-fintech:
	agents-cli run '{"target_role":"Risk Analyst","company":"FinTech lending company","industry":"FinTech / Credit / Lending","job_description":"Analyze approval rate, default rate, fraud risk, and repayment behavior. SQL and Python preferred.","candidate_profile":"Operations analytics, defect reporting, dashboard building, process improvement."}'

run-marketplace:
	agents-cli run '{"target_role":"Marketplace Analyst","company":"Two-sided marketplace","industry":"Marketplace Platforms","job_description":"Analyze supply-demand balance, match rate, GMV, cancellation rate, and repeat transactions.","candidate_profile":"Uber Eats operations, merchant onboarding, SKU expansion, process automation, complaint analysis."}'

local-grade:
	uv run python tests/eval/local_grade.py
