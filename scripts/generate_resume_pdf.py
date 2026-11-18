import os
from playwright.sync_api import sync_playwright

HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Gautam Samdhiya — Data Analyst Resume</title>
<style>
  @page {
    size: A4;
    margin: 8mm 12mm 8mm 12mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #111827;
    background: #ffffff;
    font-size: 8.8pt;
    line-height: 1.32;
    -webkit-print-color-adjust: exact;
  }
  header {
    text-align: center;
    border-bottom: 1.5px solid #1e3a8a;
    padding-bottom: 5px;
    margin-bottom: 7px;
  }
  h1 {
    font-size: 18pt;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: #0f172a;
    margin-bottom: 1px;
  }
  .tagline {
    font-size: 9.8pt;
    font-weight: 600;
    color: #1e3a8a;
    margin-bottom: 3px;
  }
  .contact-bar {
    font-size: 8pt;
    color: #4b5563;
  }
  .contact-bar span {
    margin: 0 4px;
  }
  .contact-bar a {
    color: #1e3a8a;
    text-decoration: none;
  }
  section {
    margin-bottom: 6px;
  }
  h2 {
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #1e3a8a;
    border-bottom: 0.75px solid #cbd5e1;
    padding-bottom: 1px;
    margin-bottom: 3px;
  }
  p {
    color: #374151;
  }
  .skills-table {
    width: 100%;
    border-collapse: collapse;
  }
  .skills-table td {
    padding: 1px 0;
    vertical-align: top;
    font-size: 8.3pt;
  }
  .skills-label {
    font-weight: 700;
    color: #111827;
    width: 160px;
    white-space: nowrap;
  }
  .skills-val {
    color: #374151;
  }
  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 8.6pt;
    margin-bottom: 2px;
  }
  .job-title {
    font-weight: 700;
    color: #0f172a;
  }
  .job-company {
    font-weight: 600;
    color: #1e3a8a;
  }
  .job-meta {
    font-size: 7.8pt;
    color: #6b7280;
    font-weight: 500;
  }
  ul {
    padding-left: 13px;
    margin-bottom: 2px;
  }
  li {
    margin-bottom: 2px;
    color: #374151;
    font-size: 8.3pt;
  }
  .project-item {
    margin-bottom: 4px;
  }
  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 8.6pt;
    margin-bottom: 2px;
  }
  .project-name {
    font-weight: 700;
    color: #0f172a;
  }
  .project-link {
    font-size: 7.6pt;
    color: #1e3a8a;
    text-decoration: none;
  }
  .two-col {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
  .two-col > div {
    flex: 1;
  }
</style>
</head>
<body>
  <header>
    <h1>Gautam Samdhiya</h1>
    <div class="tagline">Data Analyst | SQL &bull; Power BI &bull; Excel &bull; Python</div>
    <div class="contact-bar">
      Ranchi, Jharkhand, India <span>&bull;</span>
      <a href="mailto:gautamsamdhiya2000@gmail.com">gautamsamdhiya2000@gmail.com</a> <span>&bull;</span>
      Phone: Available on request <span>&bull;</span>
      <a href="https://www.linkedin.com/in/connectwithgautam">linkedin.com/in/connectwithgautam</a> <span>&bull;</span>
      <a href="https://github.com/samdhiyagautam">github.com/samdhiyagautam</a>
    </div>
  </header>

  <section>
    <h2>Professional Summary</h2>
    <p style="font-size: 8.3pt; text-align: justify;">
      Data Analyst with 2+ years of professional experience as an Assistant Manager, combining operational business understanding with hands-on data analytics. Proficient in SQL (complex queries, CTEs, window functions), Python (Pandas ETL), Power BI (interactive dashboards, DAX measures), and Microsoft Excel (advanced formulas, Power Query) to build operational dashboards, automate recurring reporting, and turn business requirements into practical data solutions. Experienced in AI-assisted workflows with strict human validation of all analytical outputs.
    </p>
  </section>

  <section>
    <h2>Technical Skills</h2>
    <table class="skills-table">
      <tr>
        <td class="skills-label">Data Analysis &amp; Statistics:</td>
        <td class="skills-val">SQL (querying, multi-table joins, CTEs, window functions), Python (Pandas ETL pipelines), Microsoft Excel (XLOOKUP, Power Query, pivot tables), Google Sheets, Statistics Basics (distributions, variance, trend evaluation)</td>
      </tr>
      <tr>
        <td class="skills-label">BI &amp; Visualization:</td>
        <td class="skills-val">Power BI (dashboards, DAX measures, star-schema data modeling, scheduled refresh), Looker Studio</td>
      </tr>
      <tr>
        <td class="skills-label">Databases &amp; Systems:</td>
        <td class="skills-val">PostgreSQL, SQLite, relational schema design, indexes, constraint optimization</td>
      </tr>
      <tr>
        <td class="skills-label">Web &amp; Supporting Tools:</td>
        <td class="skills-val">Next.js, React, Supabase, Git/GitHub, Canva, Figma</td>
      </tr>
      <tr>
        <td class="skills-label">AI Productivity:</td>
        <td class="skills-val">Prompt engineering, AI-assisted exploratory data analysis and documentation with manual review</td>
      </tr>
    </table>
  </section>

  <section>
    <h2>Professional Experience</h2>
    <div>
      <div class="job-header">
        <div><span class="job-title">Assistant Manager</span> — <span class="job-company">Dhurina</span></div>
        <div class="job-meta">October 2024 – Present | Ranchi, India</div>
      </div>
      <ul>
        <li>Designed and deployed operational Power BI dashboards with custom DAX measures and automated data refresh, enabling leadership to track departmental KPIs with self-service reporting.</li>
        <li>Automated recurring cross-departmental reporting pipelines using Python (Pandas) and SQL, eliminating manual spreadsheet consolidation across teams.</li>
        <li>Engineered standardized SQL queries and analytical views across operational PostgreSQL databases to consolidate fragmented data sources, resolving metric discrepancies across teams.</li>
        <li>Partnered with departmental stakeholders to translate operational pain points into structured reporting specifications and actionable visual analytics.</li>
        <li>Developed and maintained internal operations web applications using Next.js, Supabase, and PostgreSQL, supporting daily staff workflow and structured data intake.</li>
      </ul>
    </div>
  </section>

  <section>
    <h2>Key Analytics Projects</h2>
    <div class="project-item">
      <div class="project-header">
        <div><span class="project-name">IPL Cricket Analytics (SQL + Python Pipeline)</span></div>
        <a class="project-link" href="https://github.com/samdhiyagautam/Gautam/tree/main/demo-projects/ipl-analysis">github.com/samdhiyagautam/Gautam/tree/main/demo-projects/ipl-analysis</a>
      </div>
      <ul>
        <li>Analyzed ball-by-ball data of 1,243 IPL matches (295,732 deliveries, 2008–2026) sourced from cricsheet.org: designed 2-table indexed SQLite schema and answered 12 SQL questions (54.7% toss-field advantage, Jaipur 64.7% chase win rate, death-over economy).</li>
        <li>Built dependency-free Python automated ingestion pipeline (download → SQLite → export) executing in ~4.2 seconds, outputting 12 query CSVs and SVG trend charts.</li>
      </ul>
    </div>

    <div class="project-item">
      <div class="project-header">
        <div><span class="project-name">Retail Sales Analysis &amp; Customer KPI Modeling (SQL + Power BI + Python)</span></div>
        <a class="project-link" href="https://github.com/samdhiyagautam/Gautam/tree/main/demo-projects/retail-sales-analysis">github.com/samdhiyagautam/Gautam/tree/main/demo-projects/retail-sales-analysis</a>
      </div>
      <ul>
        <li>Constructed star-schema analytical model with 11 production SQL queries using CTEs, CASE conditional pivots, and LAG window functions to evaluate customer concentration and MoM growth.</li>
        <li>Verified Pareto principle (top 20% accounts drove 50.9% / $4.20M of $8.26M revenue); analyzed Q4 seasonal revenue spikes ($1.32M in 2024, $1.24M in 2025) and repeat buyer metrics (84.4%).</li>
      </ul>
    </div>
  </section>

  <section class="two-col" style="border-top: 0.75px solid #cbd5e1; padding-top: 3px; margin-top: 3px;">
    <div>
      <h2>Education</h2>
      <p style="font-size: 8.3pt;"><strong>Bachelor of Science in Mathematics (B.Sc.)</strong><br><span style="color: #6b7280;">Ranchi University | 2024</span></p>
    </div>
    <div>
      <h2>Languages</h2>
      <p style="font-size: 8.3pt;"><strong>English</strong> (Professional Working Proficiency) &bull; <strong>Hindi</strong> (Native)</p>
    </div>
  </section>
</body>
</html>
"""

def generate():
    temp_html = "scripts/temp_resume.html"
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(HTML)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("file:///" + os.path.abspath(temp_html).replace("\\", "/"))
        page.pdf(
            path="public/resume.pdf",
            format="A4",
            print_background=True,
            margin={"top": "8mm", "bottom": "8mm", "left": "12mm", "right": "12mm"}
        )
        browser.close()

    if os.path.exists(temp_html):
        os.remove(temp_html)
    print("SUCCESS: public/resume.pdf written!")

if __name__ == "__main__":
    generate()
