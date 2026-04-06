# 🛡️ DPDP Compliance Checker

A full-stack **MERN** web application for checking websites against India's **Digital Personal Data Protection (DPDP) Act, 2023**.

---

## 📸 Features

- **URL Scanner** — Enter any website URL and get an instant compliance score
- **10 DPDP Checks** covering Sections 4–16 of the Act
- **Compliance Radar Chart** — Visual breakdown of all compliance areas
- **Evidence Detection** — Shows which indicators were found / missing
- **Actionable Recommendations** — Per-check guidance on how to fix issues
- **Audit History** — All past scans saved in MongoDB (with delete)
- **Privacy Policy Auto-Detection** — Also fetches `/privacy-policy` page for deeper analysis

---

## 🏗️ Architecture

```
dpdp-checker/
├── backend/                  # Node.js + Express API
│   ├── server.js             # Entry point
│   ├── routes/
│   │   ├── audit.js          # POST /api/audit
│   │   └── reports.js        # GET/DELETE /api/reports
│   ├── controllers/
│   │   └── auditController.js  # Fetch + analyze URL
│   ├── services/
│   │   └── dpdpAnalyzer.js   # Core DPDP compliance logic
│   ├── models/
│   │   └── Audit.js          # MongoDB schema
│   └── .env
│
└── frontend/                 # React app
    └── src/
        ├── App.jsx            # Router + Navbar + HomePage
        ├── components/
        │   ├── AuditResult.jsx  # Score + radar + check cards
        │   ├── CheckCard.jsx    # Expandable per-check card
        │   └── ScoreCircle.jsx  # Animated SVG score ring
        ├── pages/
        │   └── HistoryPage.jsx  # Past audit table
        └── utils/
            └── api.js          # Axios API helpers
```

---

## ⚖️ DPDP Act Sections Checked

| # | Section | What's Checked |
|---|---------|---------------|
| 1 | §6 – Consent | Cookie banner, reject option, granular controls |
| 2 | §5 – Notice | Privacy policy existence, completeness |
| 3 | §11 – Right to Access | Data access/download mechanism |
| 4 | §12 – Right to Erasure | Account deletion, data correction |
| 5 | §13 – Grievance Redressal | DPO contact, complaint mechanism |
| 6 | §8(3) – Data Minimization | Purpose limitation, optional fields |
| 7 | §9 – Children's Data | Age verification, parental consent |
| 8 | §8(7) – Retention Policy | Retention periods, deletion on withdrawal |
| 9 | §8(5) – Security | HTTPS, HSTS, encryption disclosure |
| 10 | §16 – Cross-border Transfer | International transfer disclosures |
| 11 | §4 – Lawful Processing | Legal basis, purposes listed, ToS |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Configure Environment

**backend/.env** (already created):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/dpdp_checker
FRONTEND_URL=http://localhost:3000
```

**frontend/.env** (already created):
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Servers

Open **two terminals**:

```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/audit` | Run compliance check on a URL |
| GET | `/api/reports` | List last 20 audit reports |
| GET | `/api/reports/:id` | Get a specific audit |
| DELETE | `/api/reports/:id` | Delete an audit |
| GET | `/api/health` | Health check |

### POST /api/audit — Request Body
```json
{ "url": "https://example.com" }
```

### Response
```json
{
  "success": true,
  "audit": {
    "url": "https://example.com",
    "domain": "example.com",
    "pageTitle": "Example Domain",
    "overallScore": 42,
    "overallStatus": "partial",
    "summary": { "passed": 3, "failed": 5, "warnings": 2, "notApplicable": 1 },
    "checks": [ ... ],
    "scanDate": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🧠 How the Analysis Works

1. **Fetch** — Backend fetches the target URL using Axios with a 15s timeout
2. **Privacy Policy** — Also tries `/privacy-policy`, `/privacy`, `/data-protection` paths
3. **Parse** — Cheerio extracts text, links, forms, and meta information
4. **Check** — Each of the 10 DPDP checks runs regex/heuristic analysis against the content
5. **Score** — Each check gets a 0–100 score; overall is the weighted average
6. **Store** — Results saved to MongoDB for history

---

## 📊 Scoring

| Score | Status |
|-------|--------|
| 70–100 | ✅ Compliant |
| 40–69 | ⚠️ Partially Compliant |
| 0–39 | ❌ Non-Compliant |

---

## ⚠️ Disclaimer

This tool performs **automated, heuristic-based analysis** and is intended for **educational and informational purposes only**. It is **not a legal audit** and results should not be treated as legal advice. For full compliance assessment, consult a qualified data protection professional or legal advisor familiar with the DPDP Act 2023.

---

## 📚 References

- [DPDP Act 2023 – MeitY](https://www.meity.gov.in/data-protection-framework)
- [DPDP Rules 2025 – Draft](https://www.meity.gov.in/)
- [Data Protection Board of India](https://www.meity.gov.in/)
