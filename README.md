# Offer Catcher / Offer 捕手

Offer Catcher is a student job-matching demo that compares a resume with a target job description and returns AI-assisted matching insights. The frontend is a static HTML/CSS/JavaScript app, and the AI matching endpoint runs as a Vercel Serverless Function.

## Features

- Resume and job description matching powered by Gemini API.
- Career direction selector covering software, data, product, AI, QA, security, cloud, design, consulting, fintech, and IT consulting paths.
- Structured analysis output:
  - matched job summary
  - match score
  - application recommendation level
  - strengths
  - skill gaps
  - resume suggestions
  - action plan
- Application tracking board stored in the browser.
- Static UI deployable on Vercel.

## Tech Stack

- Frontend: vanilla HTML, CSS, JavaScript
- API: Vercel Serverless Function at `api/match.js`
- AI provider: Gemini API
- Storage: browser `localStorage` only for application tracking

## Project Structure

```text
.
├── api/
│   └── match.js          # Serverless API that calls Gemini
├── app.js                # Frontend interaction logic
├── index.html            # App UI
├── styles.css            # App styles
├── package.json
├── vercel.json
└── DEPLOYMENT.md
```

## Environment Variables

Do not commit API keys. Configure secrets in Vercel Project Settings or with the Vercel CLI.

Required:

```bash
GEMINI_API_KEY=<your-gemini-api-key>
```

Optional:

```bash
GEMINI_MODEL=gemini-2.5-flash
```

## Local Development

For the static UI only:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

For local API testing with Vercel:

```bash
GEMINI_API_KEY=<your-gemini-api-key> vercel dev
```

## Deploy To Vercel

```bash
vercel env add GEMINI_API_KEY production
vercel --prod
```

If you want to override the default model:

```bash
vercel env add GEMINI_MODEL production
vercel --prod
```

The app is configured as a static site with `outputDirectory` set to `.` in `vercel.json`.

## Data And Privacy

- Resume text and JD text are sent to the serverless `/api/match` endpoint only when the user clicks `开始匹配`.
- The serverless endpoint forwards the resume and JD to Gemini API for analysis.
- This project does not save resume text, JD text, or matching results to a database.
- Application tracking records are saved only in the user's browser `localStorage` under:

```text
offer-catcher-applications
```

- Different users cannot see each other's tracking records unless they share the same browser profile/device.
- No database is included in this project.

## Security Notes

- `GEMINI_API_KEY` is read only on the server side from `process.env.GEMINI_API_KEY`.
- The API key is never embedded in frontend code.
- `.env*`, `.vercel/`, `node_modules/`, logs, and local render artifacts are ignored by Git.
- If a real API key is ever committed accidentally, revoke it immediately and rotate a new key.

## License

This project currently has no open-source license file. Add a `LICENSE` file before publishing if you want others to reuse or modify the code under explicit terms.
