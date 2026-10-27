'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR = __dirname;

function getBase64Image(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).replace('jpg', 'jpeg');
    return `data:image/${ext};base64,${fileBuffer.toString('base64')}`;
  } catch {
    return '';
  }
}

const youcodeB64 = getBase64Image(path.join(DIR, 'youcode.jpeg'));
const landmarkB64 = getBase64Image(path.join(DIR, 'landmark.jpeg'));

// ──────────────────────────────────────────────────────────────────────────────
// CSS
// ──────────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');

  @page {
    size: A4;
    margin: 2.5cm 2.5cm 2.8cm 2.5cm;
    @bottom-center {
      content: "— " counter(page) " —";
      font-family: 'Times New Roman', serif;
      font-size: 10pt;
      color: #6b7280;
    }
  }

  @page cover-page { margin: 0; }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #1a1a2e;
    background: #fff;
  }

  /* ── COVER ── */
  .cover {
    page: cover-page;
    width: 210mm;
    height: 297mm;
    display: flex;
    flex-direction: column;
    background: linear-gradient(160deg, #07112a 0%, #0f1c3d 45%, #091429 100%);
    color: #fff;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: -80px; left: -80px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%);
  }
  .cover::after {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
  }
  .cover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.8cm 2.5cm 0;
    position: relative; z-index: 2;
  }
  .cover-header img { max-height: 52px; object-fit: contain; filter: brightness(1.1); }
  .cover-header-sep {
    font-size: 20pt;
    color: rgba(0,229,255,0.5);
    font-weight: 300;
  }
  .cover-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 2.5cm;
    position: relative; z-index: 2;
    text-align: center;
  }
  .cover-tag {
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 4px;
    color: #00e5ff;
    margin-bottom: 16pt;
    font-family: 'Times New Roman', serif;
  }
  .cover-main-title {
    font-size: 27pt;
    font-weight: bold;
    line-height: 1.25;
    color: #ffffff;
    margin-bottom: 10pt;
    font-family: 'Times New Roman', Times, serif;
  }
  .cover-sub-title {
    font-size: 12.5pt;
    color: rgba(186,201,220,0.85);
    line-height: 1.6;
    margin-bottom: 28pt;
  }
  .cover-separator {
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #00e5ff, #2563eb);
    border-radius: 2px;
    margin: 0 auto 32pt;
  }
  .cover-footer {
    padding: 0 2.5cm 1.6cm;
    position: relative; z-index: 2;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 1.2cm;
  }
  .cover-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14pt;
  }
  .cover-info-item { text-align: left; }
  .cover-info-item .label {
    display: block;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(186,201,220,0.55);
    margin-bottom: 3pt;
  }
  .cover-info-item .value {
    font-size: 10pt;
    color: #ffffff;
    font-weight: bold;
  }
  .cover-info-item .value.accent { color: #00e5ff; }

  /* ── HEADERS/FOOTERS via fixed positioning ── */
  .running-header {
    display: none;
  }

  /* ── PAGE BREAKS ── */
  .page-break { page-break-before: always; }
  .avoid-break { page-break-inside: avoid; }

  /* ── FRONT MATTER PAGES ── */
  .front-section { padding-top: 0.5cm; }
  .front-section h1 {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #1a3f8f;
    border-bottom: 2.5px solid #1a3f8f;
    padding-bottom: 6pt;
    margin-bottom: 20pt;
  }

  /* ── BODY TYPOGRAPHY ── */
  h1.chapter-title {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #fff;
    background: linear-gradient(135deg, #1a3f8f, #2563eb);
    padding: 14pt 18pt;
    border-radius: 6px;
    margin-bottom: 24pt;
    letter-spacing: 0.5px;
    page-break-after: avoid;
  }
  h2 {
    font-size: 13pt;
    font-weight: bold;
    color: #1a3f8f;
    margin-top: 22pt;
    margin-bottom: 10pt;
    padding-left: 10pt;
    border-left: 4px solid #2563eb;
    page-break-after: avoid;
  }
  h3 {
    font-size: 12pt;
    font-weight: bold;
    color: #1e4db7;
    margin-top: 16pt;
    margin-bottom: 8pt;
    page-break-after: avoid;
  }
  h4 {
    font-size: 12pt;
    font-style: italic;
    color: #374151;
    margin-top: 12pt;
    margin-bottom: 6pt;
    page-break-after: avoid;
  }
  p {
    margin-bottom: 11pt;
    text-align: justify;
    hyphens: auto;
  }
  ul, ol {
    margin: 0 0 11pt 22pt;
    text-align: justify;
  }
  li { margin-bottom: 5pt; }
  code, .code-inline {
    font-family: 'Courier New', Courier, monospace;
    font-size: 10pt;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 3px;
    padding: 1px 5px;
    color: #1e4db7;
  }
  strong { color: #1a1a2e; }

  /* ── TABLES ── */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
    margin: 14pt 0 4pt;
    page-break-inside: avoid;
  }
  thead th {
    background: linear-gradient(135deg, #1a3f8f, #1e4db7);
    color: #fff;
    font-weight: bold;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 9pt 11pt;
    text-align: left;
    border: 1px solid #1a3f8f;
  }
  tbody td {
    padding: 7pt 11pt;
    border: 1px solid #dbeafe;
    vertical-align: top;
  }
  tbody tr:nth-child(even) td { background: #f8fafc; }
  tbody tr:hover td { background: #eff6ff; }
  .table-caption {
    text-align: center;
    font-style: italic;
    font-size: 9pt;
    color: #6b7280;
    margin-bottom: 16pt;
    margin-top: 5pt;
  }

  /* ── BOXES ── */
  .info-box {
    border-left: 4px solid #00e5ff;
    background: linear-gradient(135deg, #f0fafd, #e8f4fc);
    padding: 12pt 14pt;
    margin: 14pt 0;
    border-radius: 0 8px 8px 0;
    page-break-inside: avoid;
  }
  .info-box p:last-child { margin-bottom: 0; }
  .warning-box {
    border-left: 4px solid #f59e0b;
    background: #fffbeb;
    padding: 12pt 14pt;
    margin: 14pt 0;
    border-radius: 0 8px 8px 0;
    page-break-inside: avoid;
  }
  .case-study-box {
    border: 2px solid #dbeafe;
    border-radius: 10px;
    padding: 14pt 16pt;
    margin: 16pt 0;
    background: #f8faff;
    page-break-inside: avoid;
  }
  .case-study-box h3 {
    border-left: none;
    color: #1a3f8f;
    background: linear-gradient(90deg, #dbeafe, transparent);
    padding: 6pt 10pt;
    border-radius: 4px;
    margin-top: 0;
    font-size: 11pt;
  }
  .case-study-field {
    display: flex;
    gap: 8pt;
    margin-bottom: 6pt;
    font-size: 10.5pt;
  }
  .case-study-field .field-label {
    font-weight: bold;
    color: #1e4db7;
    min-width: 90pt;
    flex-shrink: 0;
  }

  /* ── DIAGRAMS ── */
  .diagram-wrap {
    display: flex;
    justify-content: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14pt;
    margin: 16pt 0 4pt;
    page-break-inside: avoid;
  }
  .fig-caption {
    text-align: center;
    font-style: italic;
    font-size: 9pt;
    color: #6b7280;
    margin-bottom: 18pt;
  }

  /* ── TABLE OF CONTENTS ── */
  .toc-row {
    display: flex;
    align-items: flex-end;
    margin-bottom: 7pt;
  }
  .toc-row.chapter { font-weight: bold; color: #1a3f8f; font-size: 11.5pt; margin-top: 6pt; }
  .toc-row.sub { margin-left: 18pt; font-size: 10.5pt; color: #374151; }
  .toc-row.subsub { margin-left: 36pt; font-size: 10pt; color: #6b7280; }
  .toc-title { flex: 1; }
  .toc-dots {
    flex-grow: 1;
    border-bottom: 1px dotted #b0b8c8;
    margin: 0 8pt;
    align-self: flex-end;
    min-width: 20pt;
    height: 1px;
    margin-bottom: 4pt;
  }
  .toc-page { font-weight: bold; min-width: 24pt; text-align: right; }
  .toc-row.sub .toc-page, .toc-row.subsub .toc-page { font-weight: normal; }

  /* ── SKILL BADGE (for competency tables) ── */
  .badge {
    display: inline-block;
    padding: 2pt 7pt;
    border-radius: 12px;
    font-size: 9pt;
    font-weight: bold;
  }
  .badge-before { background: #fee2e2; color: #991b1b; }
  .badge-after  { background: #d1fae5; color: #065f46; }

  /* ── CODE BLOCKS ── */
  .code-block {
    font-family: 'Courier New', Courier, monospace;
    font-size: 9.5pt;
    background: #0f1c3d;
    color: #e2e8f0;
    border-radius: 8px;
    padding: 14pt 16pt;
    overflow-x: auto;
    margin: 12pt 0 14pt;
    page-break-inside: avoid;
    white-space: pre;
  }
  .code-block .kw { color: #00e5ff; }
  .code-block .str { color: #a5f3a5; }
  .code-block .cm { color: #6b7280; font-style: italic; }
  .code-block .fn { color: #fbbf24; }

  /* ── PROGRESS BAR ── */
  .progress-bar-wrap {
    height: 10px;
    background: #e5e7eb;
    border-radius: 5px;
    overflow: hidden;
    display: inline-block;
    width: 80px;
    vertical-align: middle;
  }
  .progress-bar { height: 100%; background: linear-gradient(90deg, #1a3f8f, #00e5ff); border-radius: 5px; }
`;

// ──────────────────────────────────────────────────────────────────────────────
// SVG DIAGRAMS
// ──────────────────────────────────────────────────────────────────────────────

const svgSystemTopology = `
<svg viewBox="0 0 780 260" width="780" height="260" xmlns="http://www.w3.org/2000/svg" font-family="'Times New Roman', serif">
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10Z" fill="#2563eb"/>
    </marker>
    <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10Z" fill="#10b981"/>
    </marker>
  </defs>
  <!-- Client -->
  <rect x="20" y="80" width="160" height="100" rx="8" fill="#0f172a" stroke="#00e5ff" stroke-width="2"/>
  <text x="100" y="118" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">CLIENT</text>
  <text x="100" y="138" fill="#94a3b8" font-size="10.5" text-anchor="middle">Nuxt 4 / Vue 3</text>
  <text x="100" y="155" fill="#94a3b8" font-size="10.5" text-anchor="middle">Pinia · Tailwind v4</text>
  <!-- arrows -->
  <line x1="180" y1="118" x2="240" y2="118" stroke="#2563eb" stroke-width="2" marker-end="url(#arr)"/>
  <text x="210" y="110" fill="#475569" font-size="9" text-anchor="middle">REST API</text>
  <line x1="240" y1="138" x2="180" y2="138" stroke="#2563eb" stroke-width="2" marker-end="url(#arr)"/>
  <text x="210" y="155" fill="#475569" font-size="9" text-anchor="middle">WS (Socket.IO)</text>
  <!-- Backend -->
  <rect x="250" y="30" width="200" height="200" rx="8" fill="#07112a" stroke="#2563eb" stroke-width="2"/>
  <text x="350" y="70" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">BACKEND NITRO</text>
  <text x="350" y="92" fill="#94a3b8" font-size="10" text-anchor="middle">Route Handlers</text>
  <line x1="350" y1="98" x2="350" y2="110" stroke="#475569" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="350" y="126" fill="#cbd5e1" font-size="10" text-anchor="middle">Controllers (Zod)</text>
  <line x1="350" y1="132" x2="350" y2="144" stroke="#475569" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="350" y="160" fill="#cbd5e1" font-size="10" text-anchor="middle">Services (Domain)</text>
  <line x1="350" y1="166" x2="350" y2="178" stroke="#475569" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="350" y="196" fill="#94a3b8" font-size="10" text-anchor="middle">Repositories (Prisma)</text>
  <!-- arrows to dbs -->
  <line x1="450" y1="100" x2="510" y2="70" stroke="#10b981" stroke-width="2" marker-end="url(#arr2)"/>
  <line x1="450" y1="160" x2="510" y2="160" stroke="#ef4444" stroke-width="2" marker-end="url(#arr2)"/>
  <line x1="450" y1="210" x2="510" y2="230" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr2)"/>
  <!-- PostgreSQL -->
  <rect x="520" y="30" width="150" height="70" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
  <text x="595" y="62" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">PostgreSQL 17</text>
  <text x="595" y="80" fill="#94a3b8" font-size="9.5" text-anchor="middle">Prisma ORM · pg adapter</text>
  <!-- Redis -->
  <rect x="520" y="130" width="150" height="60" rx="8" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
  <text x="595" y="157" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">Redis</text>
  <text x="595" y="175" fill="#94a3b8" font-size="9.5" text-anchor="middle">BullMQ · Socket.IO Adapter</text>
  <!-- Resend -->
  <rect x="520" y="210" width="150" height="55" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="595" y="238" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">Resend API</text>
  <text x="595" y="255" fill="#94a3b8" font-size="9.5" text-anchor="middle">Transactional Emails</text>
</svg>`;

const svgLayeredArch = `
<svg viewBox="0 0 620 300" width="620" height="300" xmlns="http://www.w3.org/2000/svg" font-family="'Times New Roman', serif">
  <defs>
    <marker id="da" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10Z" fill="#1a3f8f"/>
    </marker>
  </defs>
  ${[
    ['Route Handler', 'server/api/auth/*.ts', '#1a3f8f'],
    ['Controller', 'Zod validation · cookie · envelope', '#1e4db7'],
    ['Service', 'Domain logic · bcrypt · JWT · Resend', '#2563eb'],
    ['Repository', 'Prisma queries (IUserDAO)', '#3b82f6'],
    ['DAO / Prisma', 'PostgreSQL · pg connection pool', '#60a5fa'],
    ['DTO / Mapper', 'Type-safe DTOs · field stripping', '#93c5fd'],
  ].map(([name, desc, color], i) => `
    <rect x="100" y="${20 + i * 45}" width="420" height="36" rx="6" fill="${color}" opacity="${1 - i * 0.05}"/>
    <text x="200" y="${43 + i * 45}" fill="#fff" font-size="12" font-weight="bold">${name}</text>
    <text x="320" y="${43 + i * 45}" fill="rgba(255,255,255,0.75)" font-size="10.5">${desc}</text>
    ${i < 5 ? `<line x1="310" y1="${56 + i * 45}" x2="310" y2="${65 + i * 45}" stroke="#fff" stroke-width="1.5" stroke-dasharray="3" marker-end="url(#da)"/>` : ''}
  `).join('')}
</svg>`;

const svgUseCaseDiagram = `
<svg viewBox="0 0 720 310" width="720" height="310" xmlns="http://www.w3.org/2000/svg" font-family="'Times New Roman', serif">
  <!-- Actor -->
  <circle cx="60" cy="100" r="20" fill="#1e4db7" stroke="#fff" stroke-width="2"/>
  <line x1="60" y1="120" x2="60" y2="175" stroke="#1e4db7" stroke-width="2.5"/>
  <line x1="35" y1="145" x2="85" y2="145" stroke="#1e4db7" stroke-width="2.5"/>
  <line x1="60" y1="175" x2="35" y2="210" stroke="#1e4db7" stroke-width="2.5"/>
  <line x1="60" y1="175" x2="85" y2="210" stroke="#1e4db7" stroke-width="2.5"/>
  <text x="60" y="228" fill="#1a1a2e" font-size="11" text-anchor="middle" font-weight="bold">Utilisateur</text>
  <!-- System boundary -->
  <rect x="110" y="10" width="590" height="290" rx="10" fill="none" stroke="#bfdbfe" stroke-width="2" stroke-dasharray="6"/>
  <text x="405" y="300" fill="#6b7280" font-size="10" text-anchor="middle">Système Aligno — Module Authentification</text>
  <!-- Use cases -->
  ${[
    ['Inscription (Register)', 60],
    ['Connexion (Login)', 110],
    ['Vérification Email', 160],
    ['Mot de passe oublié', 210],
    ['Réinitialisation MDP', 260],
    ['Consultation Profil', 60+250],
    ['Mise à jour Profil', 110+250],
    ['Déconnexion (Logout)', 160+250],
  ].map(([label, cy], i) => {
    const col = i < 5 ? 180 : 430;
    const row = i < 5 ? cy : cy - 250;
    return `
      <ellipse cx="${col}" cy="${row}" rx="95" ry="22" fill="#f0f9ff" stroke="#2563eb" stroke-width="1.8"/>
      <text x="${col}" y="${row + 5}" fill="#1a3f8f" font-size="10" text-anchor="middle">${label}</text>
      <line x1="90" y1="120" x2="${col - 95}" y2="${row}" stroke="#94a3b8" stroke-dasharray="4" stroke-width="1.5"/>
    `;
  }).join('')}
</svg>`;

const svgSequenceDiagram = `
<svg viewBox="0 0 720 380" width="720" height="380" xmlns="http://www.w3.org/2000/svg" font-family="'Times New Roman', serif" font-size="10">
  <defs>
    <marker id="sa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0 L10 5 L0 10Z" fill="#1a3f8f"/>
    </marker>
    <marker id="sa2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0 L10 5 L0 10Z" fill="#6b7280"/>
    </marker>
  </defs>
  <!-- Actors -->
  ${[['Client', 80], ['Controller', 220], ['Service', 360], ['Repo/DB', 500], ['Resend', 640]].map(([n,x]) => `
    <rect x="${x-55}" y="10" width="110" height="30" rx="5" fill="#1a3f8f"/>
    <text x="${x}" y="30" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">${n}</text>
    <line x1="${x}" y1="40" x2="${x}" y2="360" stroke="#dbeafe" stroke-width="1.5" stroke-dasharray="5"/>
  `).join('')}
  <!-- Messages -->
  ${[
    [80, 220, 70, 'POST /api/auth/register', true],
    [220, 360, 95, 'createUser(data)', true],
    [360, 500, 120, 'INSERT user (bcrypt hash)', true],
    [500, 360, 145, 'user record', false],
    [360, 640, 170, 'sendVerificationEmail(token)', true],
    [640, 360, 195, 'email queued ✓', false],
    [360, 220, 220, '{ user, token }', false],
    [220, 80, 245, '201 Created + cookie', false],
    [80, 220, 285, 'GET /api/auth/email/validation?token=...', true],
    [220, 360, 310, 'verifyEmailToken(token)', true],
    [360, 500, 335, 'UPDATE email_verified=true', true],
    [220, 80, 360, '200 OK — Account verified', false],
  ].map(([x1, x2, y, label, solid]) => {
    const dir = x1 < x2;
    return `
      <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${solid ? '#1a3f8f' : '#6b7280'}" stroke-width="${solid ? 1.8 : 1.5}" ${solid ? '' : 'stroke-dasharray="5"'} marker-end="${solid ? 'url(#sa)' : 'url(#sa2)'}"/>
      <text x="${(x1+x2)/2}" y="${y - 4}" fill="${solid ? '#1a3f8f' : '#6b7280'}" font-size="9" text-anchor="middle">${label}</text>
    `;
  }).join('')}
</svg>`;

const svgDeploymentDiagram = `
<svg viewBox="0 0 720 320" width="720" height="320" xmlns="http://www.w3.org/2000/svg" font-family="'Times New Roman', serif">
  <defs>
    <marker id="ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0 L10 5 L0 10Z" fill="#475569"/>
    </marker>
  </defs>
  <!-- GitHub -->
  <rect x="10" y="120" width="130" height="80" rx="8" fill="#1f2937" stroke="#475569" stroke-width="1.5"/>
  <text x="75" y="152" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">GitHub Repo</text>
  <text x="75" y="170" fill="#94a3b8" font-size="9.5" text-anchor="middle">Push to main/dev</text>
  <text x="75" y="185" fill="#94a3b8" font-size="9.5" text-anchor="middle">PR Triggers CI</text>
  <!-- GH Actions -->
  <rect x="190" y="100" width="160" height="120" rx="8" fill="#0f172a" stroke="#2563eb" stroke-width="1.8"/>
  <text x="270" y="130" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">GitHub Actions</text>
  <text x="270" y="150" fill="#94a3b8" font-size="9.5" text-anchor="middle">1. npm ci</text>
  <text x="270" y="165" fill="#94a3b8" font-size="9.5" text-anchor="middle">2. prisma generate</text>
  <text x="270" y="180" fill="#94a3b8" font-size="9.5" text-anchor="middle">3. vue-tsc --noEmit</text>
  <text x="270" y="195" fill="#94a3b8" font-size="9.5" text-anchor="middle">4. vitest run</text>
  <text x="270" y="210" fill="#10b981" font-size="9.5" text-anchor="middle">5. SSH Deploy</text>
  <!-- VPS -->
  <rect x="420" y="60" width="280" height="200" rx="8" fill="#07112a" stroke="#10b981" stroke-width="2"/>
  <text x="560" y="90" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">VPS Hostinger (Ubuntu)</text>
  <rect x="440" y="100" width="110" height="50" rx="5" fill="#1e293b" stroke="#2563eb" stroke-width="1.5"/>
  <text x="495" y="122" fill="#fff" font-size="10" text-anchor="middle">Nuxt 4 App</text>
  <text x="495" y="138" fill="#94a3b8" font-size="9" text-anchor="middle">port 4000</text>
  <rect x="565" y="100" width="110" height="50" rx="5" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="620" y="122" fill="#fff" font-size="10" text-anchor="middle">PostgreSQL 17</text>
  <text x="620" y="138" fill="#94a3b8" font-size="9" text-anchor="middle">port 5432</text>
  <rect x="440" y="165" width="110" height="50" rx="5" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
  <text x="495" y="187" fill="#fff" font-size="10" text-anchor="middle">Redis 7</text>
  <text x="495" y="203" fill="#94a3b8" font-size="9" text-anchor="middle">BullMQ + Socket.IO</text>
  <rect x="565" y="165" width="110" height="50" rx="5" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="620" y="187" fill="#fff" font-size="10" text-anchor="middle">Nginx Proxy</text>
  <text x="620" y="203" fill="#94a3b8" font-size="9" text-anchor="middle">SSL + Domaine</text>
  <!-- Arrows -->
  <line x1="140" y1="160" x2="190" y2="160" stroke="#475569" stroke-width="2" marker-end="url(#ca)"/>
  <line x1="350" y1="160" x2="420" y2="160" stroke="#10b981" stroke-width="2" stroke-dasharray="6" marker-end="url(#ca)"/>
  <text x="385" y="152" fill="#10b981" font-size="9" text-anchor="middle">SSH + Docker</text>
</svg>`;

const svgERD = `
<svg viewBox="0 0 720 360" width="720" height="360" xmlns="http://www.w3.org/2000/svg" font-family="'Times New Roman', serif" font-size="10">
  <!-- User Table -->
  <rect x="10" y="10" width="220" height="340" rx="6" fill="#f8fafc" stroke="#1a3f8f" stroke-width="2"/>
  <rect x="10" y="10" width="220" height="36" rx="6" fill="#1a3f8f"/>
  <text x="120" y="33" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">users</text>
  ${['id (PK, cuid)', 'first_name', 'last_name', 'age', 'email (UNIQUE)', 'phone (UNIQUE)', 'password_hash', 'profile_picture_url', 'email_verified', 'email_verify_token', 'email_verify_expires', 'refresh_token', 'reset_password_token', 'reset_password_expires', 'created_at', 'updated_at'].map((f, i) => `
    <text x="20" y="${58 + i * 18}" fill="${i === 0 ? '#1a3f8f' : '#374151'}" font-size="9.5" font-weight="${i === 0 ? 'bold' : 'normal'}">${f}</text>
    ${i < 15 ? `<line x1="10" y1="${65 + i * 18}" x2="230" y2="${65 + i * 18}" stroke="#e2e8f0" stroke-width="0.8"/>` : ''}
  `).join('')}

  <!-- Project Table -->
  <rect x="250" y="10" width="200" height="180" rx="6" fill="#f8fafc" stroke="#2563eb" stroke-width="2"/>
  <rect x="250" y="10" width="200" height="36" rx="6" fill="#2563eb"/>
  <text x="350" y="33" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">projects</text>
  ${['id (PK)', 'name', 'description', 'color', 'is_archived', 'owner_id (FK → users)', 'created_at', 'updated_at'].map((f, i) => `
    <text x="260" y="${58 + i * 18}" fill="${f.includes('FK') ? '#1e4db7' : '#374151'}" font-size="9.5">${f}</text>
    ${i < 7 ? `<line x1="250" y1="${65 + i * 18}" x2="450" y2="${65 + i * 18}" stroke="#e2e8f0" stroke-width="0.8"/>` : ''}
  `).join('')}

  <!-- BankAccount Table -->
  <rect x="250" y="205" width="200" height="165" rx="6" fill="#f8fafc" stroke="#10b981" stroke-width="2"/>
  <rect x="250" y="205" width="200" height="36" rx="6" fill="#10b981"/>
  <text x="350" y="228" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">bank_accounts</text>
  ${['id (PK)', 'name', 'bank_name', 'account_number', 'balance', 'currency', 'user_id (FK → users)', 'created_at'].map((f, i) => `
    <text x="260" y="${252 + i * 18}" fill="${f.includes('FK') ? '#1e4db7' : '#374151'}" font-size="9.5">${f}</text>
    ${i < 7 ? `<line x1="250" y1="${258 + i * 18}" x2="450" y2="${258 + i * 18}" stroke="#e2e8f0" stroke-width="0.8"/>` : ''}
  `).join('')}

  <!-- Kanban Column -->
  <rect x="470" y="10" width="240" height="160" rx="6" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/>
  <rect x="470" y="10" width="240" height="36" rx="6" fill="#f59e0b"/>
  <text x="590" y="33" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">kanban_columns</text>
  ${['id (PK)', 'title', 'position', 'project_id (FK → projects)', 'created_at'].map((f, i) => `
    <text x="480" y="${58 + i * 18}" fill="${f.includes('FK') ? '#1e4db7' : '#374151'}" font-size="9.5">${f}</text>
    ${i < 4 ? `<line x1="470" y1="${65 + i * 18}" x2="710" y2="${65 + i * 18}" stroke="#e2e8f0" stroke-width="0.8"/>` : ''}
  `).join('')}

  <!-- Transactions -->
  <rect x="470" y="185" width="240" height="185" rx="6" fill="#f8fafc" stroke="#ef4444" stroke-width="2"/>
  <rect x="470" y="185" width="240" height="36" rx="6" fill="#ef4444"/>
  <text x="590" y="208" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">transactions</text>
  ${['id (PK)', 'amount', 'type (INCOME/EXPENSE)', 'category', 'description', 'date', 'bank_account_id (FK)', 'created_at'].map((f, i) => `
    <text x="480" y="${232 + i * 18}" fill="${f.includes('FK') ? '#1e4db7' : '#374151'}" font-size="9.5">${f}</text>
    ${i < 7 ? `<line x1="470" y1="${238 + i * 18}" x2="710" y2="${238 + i * 18}" stroke="#e2e8f0" stroke-width="0.8"/>` : ''}
  `).join('')}

  <!-- Relations -->
  <line x1="230" y1="80" x2="250" y2="80" stroke="#1a3f8f" stroke-width="1.8" stroke-dasharray="4"/>
  <line x1="230" y1="260" x2="250" y2="260" stroke="#10b981" stroke-width="1.8" stroke-dasharray="4"/>
  <line x1="450" y1="80" x2="470" y2="80" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="4"/>
  <line x1="450" y1="260" x2="470" y2="260" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4"/>
</svg>`;

const svgGitFlow = `
<svg viewBox="0 0 720 200" width="720" height="200" xmlns="http://www.w3.org/2000/svg" font-family="'Times New Roman', serif" font-size="10">
  <!-- Branches -->
  ${[
    ['main', 30, '#1a3f8f'],
    ['dev', 80, '#2563eb'],
    ['feature/*', 130, '#10b981'],
    ['fix/*', 170, '#f59e0b'],
  ].map(([name, y, color]) => `
    <line x1="60" y1="${y}" x2="680" y2="${y}" stroke="${color}" stroke-width="2.5"/>
    <text x="10" y="${y + 4}" fill="${color}" font-size="10" font-weight="bold">${name}</text>
  `).join('')}
  <!-- Commits on main -->
  ${[120, 340, 560, 680].map(x => `<circle cx="${x}" cy="30" r="7" fill="#1a3f8f" stroke="#fff" stroke-width="2"/>`).join('')}
  <!-- Commits on dev -->
  ${[120, 200, 280, 400, 480, 560].map(x => `<circle cx="${x}" cy="80" r="6" fill="#2563eb" stroke="#fff" stroke-width="1.5"/>`).join('')}
  <!-- Feature branch -->
  <path d="M200 80 Q220 105 240 130" stroke="#10b981" stroke-width="2" fill="none"/>
  <circle cx="280" cy="130" r="6" fill="#10b981" stroke="#fff" stroke-width="1.5"/>
  <circle cx="350" cy="130" r="6" fill="#10b981" stroke="#fff" stroke-width="1.5"/>
  <path d="M350 130 Q380 105 400 80" stroke="#10b981" stroke-width="2" fill="none"/>
  <!-- Fix branch -->
  <path d="M480 80 Q500 125 520 170" stroke="#f59e0b" stroke-width="2" fill="none"/>
  <circle cx="560" cy="170" r="6" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/>
  <path d="M560 170 Q580 125 560 80" stroke="#f59e0b" stroke-width="2" fill="none"/>
  <!-- Merge to main arrows -->
  <path d="M560 80 Q570 55 560 30" stroke="#10b981" stroke-width="2" stroke-dasharray="5" fill="none"/>
  <!-- Labels -->
  <text x="280" y="150" fill="#10b981" font-size="9" text-anchor="middle">feature/auth-module</text>
  <text x="560" y="190" fill="#f59e0b" font-size="9" text-anchor="middle">fix/resend-test</text>
  <text x="560" y="15" fill="#1a3f8f" font-size="9" text-anchor="middle">PR → Release</text>
</svg>`;

// ──────────────────────────────────────────────────────────────────────────────
// HTML SECTIONS
// ──────────────────────────────────────────────────────────────────────────────

function section(html) { return `<div class="front-section">${html}</div>`; }

function chapterHeader(num, title) {
  return `<h1 class="chapter-title">Chapitre ${num} — ${title}</h1>`;
}

function table(headers, rows, caption) {
  return `
<table class="avoid-break">
  <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
</table>
<p class="table-caption">${caption}</p>`;
}

function fig(svgContent, caption) {
  return `<div class="diagram-wrap avoid-break">${svgContent}</div><p class="fig-caption">${caption}</p>`;
}

function caseStudy(title, ctx, problem, analysis, solution, result, lesson) {
  return `
<div class="case-study-box avoid-break">
  <h3>&#9654; ${title}</h3>
  <div class="case-study-field"><span class="field-label">Contexte :</span><span>${ctx}</span></div>
  <div class="case-study-field"><span class="field-label">Problème :</span><span>${problem}</span></div>
  <div class="case-study-field"><span class="field-label">Analyse :</span><span>${analysis}</span></div>
  <div class="case-study-field"><span class="field-label">Solution :</span><span>${solution}</span></div>
  <div class="case-study-field"><span class="field-label">Résultat :</span><span>${result}</span></div>
  <div class="case-study-field"><span class="field-label">Enseignement :</span><span>${lesson}</span></div>
</div>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// CONTENT
// ──────────────────────────────────────────────────────────────────────────────

const COVER = `
<div class="cover">
  <div class="cover-header">
    ${youcodeB64 ? `<img src="${youcodeB64}" alt="YouCode Safi">` : '<span style="color:#00e5ff;font-size:14pt;font-weight:bold;">YouCode Safi</span>'}
    <span class="cover-header-sep">×</span>
    ${landmarkB64 ? `<img src="${landmarkB64}" alt="Landmark Agency">` : '<span style="color:#00e5ff;font-size:14pt;font-weight:bold;">Landmark Agency</span>'}
  </div>
  <div class="cover-body">
    <div class="cover-tag">Rapport de Stage &nbsp;·&nbsp; Fin de Formation 2025–2026</div>
    <div class="cover-main-title">
      Développement Full-Stack &amp; Coordination Agile<br>
      <span style="font-size:18pt;color:rgba(255,255,255,0.75);">Chez Landmark Agency — Oujda</span>
    </div>
    <div class="cover-separator"></div>
    <div class="cover-sub-title">
      Migration Next.js · Architecture en 6 Couches · CI/CD · DevOps<br>
      Sécurité JWT · Tests Vitest · Scrum Master · Aligno &amp; SikBeauty
    </div>
  </div>
  <div class="cover-footer">
    <div class="cover-grid">
      <div class="cover-info-item">
        <span class="label">Stagiaire</span>
        <span class="value accent">Badr Eddine Slaoui</span>
      </div>
      <div class="cover-info-item">
        <span class="label">Encadrant Entreprise</span>
        <span class="value">M. LATRACH Mohammed</span>
      </div>
      <div class="cover-info-item">
        <span class="label">Formateur Référent</span>
        <span class="value">M. Saad Shaimer (YouCode)</span>
      </div>
      <div class="cover-info-item">
        <span class="label">CME</span>
        <span class="value">Mme Kaoutar Darroufi</span>
      </div>
      <div class="cover-info-item">
        <span class="label">Période</span>
        <span class="value">7 Mai — 7 Juillet 2026</span>
      </div>
      <div class="cover-info-item">
        <span class="label">Établissement</span>
        <span class="value">YouCode Safi &nbsp;·&nbsp; 2025–2026</span>
      </div>
    </div>
  </div>
</div>`;

const RESUME = `<div class="page-break"></div>
${section(`
<h1>Résumé</h1>
<p>Ce rapport de stage présente le bilan de deux mois d'immersion professionnelle au sein de <strong>Landmark Agency</strong> (Oujda), du 7 mai au 7 juillet 2026. Au cours de cette période, j'ai exercé un double rôle de <strong>Scrum Master</strong> et de <strong>Développeur Full-Stack Lead</strong> sur deux projets de natures différentes mais complémentaires.</p>
<p>Le premier projet, <strong>SikBeauty</strong>, est une marketplace e-commerce de cosmétiques coréens. Ma mission a consisté à orchestrer la migration technique d'une Single Page Application React vers une architecture Next.js avec Server-Side Rendering, afin d'améliorer drastiquement l'indexation SEO et les performances. J'ai également déployé une infrastructure DevOps complète comprenant Docker, un pipeline CI/CD GitHub Actions et un hébergement sur VPS Hostinger.</p>
<p>Le second projet, <strong>Aligno</strong>, est un écosystème de productivité complet développé entièrement de zéro, intégrant un tableau Kanban collaboratif en temps réel, un gestionnaire de temps par blueprints et un module de finances personnelles. J'ai conçu et implémenté l'architecture backend en 6 couches (Route Handler, Controller, Service, Repository, DAO, DTO/Mapper), et développé le module d'authentification sécurisé complet, avec validation des e-mails via Resend, gestion des tokens JWT, cookies HttpOnly et une suite de 35 tests d'intégration avec Vitest.</p>
<p>En tant que Scrum Master, j'ai planifié et coordonné 4 sprints hebdomadaires, géré le backlog Jira, structuré le workflow Git, réalisé les revues de code et accompagné techniquement mes 4 collègues développeurs.</p>
<p><strong>Mots-clés :</strong> Nuxt 4, Vue 3, Next.js, TypeScript, Prisma ORM, PostgreSQL, Docker, GitHub Actions, Scrum Master, JWT, bcrypt, Zod, Vitest, SEO, DevOps, Architecture en Couches.</p>

<h1 style="margin-top:30pt;">Abstract</h1>
<p>This internship report documents two months of professional immersion at <strong>Landmark Agency</strong> (Oujda, Morocco), from May 7 to July 7, 2026. During this period, I held a dual role as <strong>Scrum Master</strong> and <strong>Lead Full-Stack Developer</strong> on two complementary projects.</p>
<p>The first project, <strong>SikBeauty</strong>, is a Korean cosmetics e-commerce marketplace. I led the technical migration from a React SPA to a Next.js SSR architecture, dramatically improving SEO indexation and page performance. I also set up a complete DevOps infrastructure including Docker, a GitHub Actions CI/CD pipeline, and VPS deployment on Hostinger.</p>
<p>The second project, <strong>Aligno</strong>, is a comprehensive productivity ecosystem built from scratch, featuring a real-time collaborative Kanban board, a time management module with daily blueprints, and a personal finance tracker. I designed and implemented a 6-layer clean backend architecture and built the entire secure authentication module with email verification via Resend, JWT tokens, HttpOnly cookies, and a suite of 35 integration tests using Vitest.</p>
<p><strong>Keywords:</strong> Nuxt 4, Vue 3, Next.js, TypeScript, Prisma ORM, PostgreSQL, Docker, GitHub Actions, Scrum Master, JWT, bcrypt, Zod, Vitest, SEO, DevOps, Layered Architecture.</p>
`)}`;

const REMERCIEMENTS = `<div class="page-break"></div>
${section(`
<h1>Remerciements</h1>
<p>À l'issue de ce stage de fin de formation, il m'est particulièrement agréable de pouvoir exprimer ma reconnaissance à toutes les personnes qui ont contribué, de près ou de loin, au bon déroulement de cette expérience professionnelle marquante.</p>
<p>Je tiens tout d'abord à adresser mes remerciements les plus sincères à <strong>M. LATRACH Mohammed</strong>, encadrant de stage chez Landmark Agency, pour la confiance qu'il m'a accordée en me confiant des responsabilités techniques de haut niveau dès le premier jour. Ses retours réguliers, ses orientations précises et sa vision professionnelle exigeante ont constitué une source d'apprentissage permanente et ont profondément influencé ma manière d'aborder le développement logiciel.</p>
<p>Je remercie également <strong>M. Saad Shaimer</strong>, formateur référent au sein de YouCode Safi, dont l'enseignement rigoureux et la pédagogie bienveillante ont constitué le socle de mes compétences techniques. Ses évaluations régulières et ses orientations judicieuses durant toute la durée de la formation ont guidé mon évolution.</p>
<p>Ma gratitude va aussi à <strong>Mme Kaoutar Darroufi</strong>, CME, pour son suivi attentif et humain, ses encouragements constants et l'intérêt sincère qu'elle a toujours porté au développement personnel et professionnel des apprenants.</p>
<p>Je souhaite enfin remercier chaleureusement mes collègues de stage, sans qui la réalisation de ces deux projets d'envergure n'aurait pas été possible :</p>
<ul>
  <li><strong>Mouna Saoui</strong> — pour sa rigueur, son sens du détail et son investissement constant dans chacune de ses contributions.</li>
  <li><strong>Brahim El Habchi</strong> — pour sa créativité, sa réactivité et sa capacité à concevoir des solutions techniques élégantes.</li>
  <li><strong>Yassine Nmila</strong> — pour sa polyvalence, son esprit d'initiative et sa contribution précieuse à chaque sprint.</li>
  <li><strong>Khadija El Haddad</strong> — pour son professionnalisme, sa persévérance et la qualité irréprochable de son travail.</li>
</ul>
<p>À tous, merci.</p>
`)}`;

const TOC = `<div class="page-break"></div>
${section(`
<h1>Sommaire</h1>
${[
  ['chapter','Résumé / Abstract', 'II'],
  ['chapter','Remerciements', 'III'],
  ['chapter','Introduction Générale', '1'],
  ['chapter','Chapitre 1 : Contexte et Environnement de Stage', '3'],
  ['sub','1.1 Présentation de Landmark Agency', '3'],
  ['sub','1.2 Présentation de YouCode Safi', '5'],
  ['sub','1.3 Présentation de l\'équipe de stage', '6'],
  ['chapter','Chapitre 2 : Méthodes de Travail et Rôle de Scrum Master', '7'],
  ['sub','2.1 La méthodologie Agile Scrum', '7'],
  ['sub','2.2 Rôle et responsabilités du Scrum Master', '8'],
  ['sub','2.3 Gestion du Git Flow et revues de code', '10'],
  ['chapter','Chapitre 3 : Architecture Globale des Projets', '11'],
  ['sub','3.1 Topologie système d\'Aligno', '11'],
  ['sub','3.2 Architecture Backend en 6 couches', '12'],
  ['sub','3.3 Diagrammes UML et ERD', '13'],
  ['sub','3.4 Déploiement et Infrastructure', '15'],
  ['chapter','Chapitre 4 : Projet SikBeauty — Migration et Industrialisation', '16'],
  ['sub','4.1 Présentation et contexte', '16'],
  ['sub','4.2 Migration React vers Next.js et optimisation SSR/SEO', '17'],
  ['sub','4.3 DevOps, Docker et CI/CD GitHub Actions', '20'],
  ['sub','4.4 Déploiement sur VPS Hostinger', '22'],
  ['sub','4.5 Contributions Backend', '23'],
  ['chapter','Chapitre 5 : Projet Aligno — Conception et Développement from Scratch', '24'],
  ['sub','5.1 Présentation d\'Aligno', '24'],
  ['sub','5.2 Initialisation du projet et configuration', '25'],
  ['sub','5.3 Développement Backend du module Authentification', '26'],
  ['sub','5.4 Tests unitaires et d\'intégration avec Vitest', '31'],
  ['sub','5.5 Planification Frontend sur Jira', '33'],
  ['sub','5.6 Développement Frontend — Module Auth (Nuxt 4)', '34'],
  ['sub','5.7 Phase de finalisation du projet', '37'],
  ['chapter','Chapitre 6 : Présentation des Technologies', '39'],
  ['chapter','Chapitre 7 : Difficultés Rencontrées — Études de Cas', '44'],
  ['chapter','Chapitre 8 : Bilan des Compétences Acquises', '47'],
  ['chapter','Chapitre 9 : Résultats Obtenus', '50'],
  ['chapter','Conclusion Générale', '52'],
  ['chapter','Annexes', '54'],
].map(([type, title, page]) => `
  <div class="toc-row ${type}">
    <span class="toc-title">${title}</span>
    <span class="toc-dots"></span>
    <span class="toc-page">${page}</span>
  </div>`).join('')}
`)}`;

const LIST_FIGS_TABLES = `<div class="page-break"></div>
${section(`
<h1>Liste des Figures</h1>
${[
  ['Fig. 1', 'Topologie générale du système distribué Aligno', '11'],
  ['Fig. 2', 'Architecture Backend en 6 couches (layered architecture)', '12'],
  ['Fig. 3', 'Diagramme de cas d\'utilisation (Use Case) — Module Auth', '13'],
  ['Fig. 4', 'Diagramme de séquence — Inscription et validation e-mail', '14'],
  ['Fig. 5', 'Diagramme Entité-Association (ERD) simplifié d\'Aligno', '14'],
  ['Fig. 6', 'Diagramme de déploiement — Pipeline CI/CD et VPS', '15'],
  ['Fig. 7', 'Schéma du Git Flow appliqué aux deux projets', '10'],
  ['Fig. 8', 'Structure des répertoires du projet Aligno', 'Annexe A'],
  ['Fig. 9', 'Capture — Tableau Kanban (Jira) en Sprint 3', 'Annexe B'],
  ['Fig. 10', 'Capture — Rapport Lighthouse SEO de SikBeauty', 'Annexe C'],
  ['Fig. 11', 'Capture — Pipeline GitHub Actions (CI/CD)', 'Annexe D'],
].map(([num, title, page]) => `<p><strong>${num} :</strong> ${title} .......... ${page}</p>`).join('')}

<h1 style="margin-top:28pt;">Liste des Tableaux</h1>
${[
  ['Tableau 1', 'Équipe projet et répartition des rôles', '6'],
  ['Tableau 2', 'Cérémonies Scrum et planning hebdomadaire', '9'],
  ['Tableau 3', 'Comparatif React SPA vs Next.js SSR (performances)', '18'],
  ['Tableau 4', 'Métriques SEO Lighthouse avant/après migration', '19'],
  ['Tableau 5', 'Variables d\'environnement du projet Aligno', '25'],
  ['Tableau 6', 'Registre des endpoints API du module Authentification', '28'],
  ['Tableau 7', 'Règles de validation Zod par endpoint', '30'],
  ['Tableau 8', 'Contrôles de sécurité implémentés dans Aligno', '31'],
  ['Tableau 9', 'Couverture des tests Vitest (35 tests)', '32'],
  ['Tableau 10', 'Fiches technologiques — Stack Frontend', '39'],
  ['Tableau 11', 'Fiches technologiques — Stack Backend et Temps Réel', '41'],
  ['Tableau 12', 'Fiches technologiques — DevOps et Qualité', '43'],
  ['Tableau 13', 'Bilan comparatif compétences techniques Avant/Après', '48'],
  ['Tableau 14', 'Bilan compétences transversales et managériales', '49'],
  ['Tableau 15', 'Récapitulatif des indicateurs clés du stage', '50'],
].map(([num, title, page]) => `<p><strong>${num} :</strong> ${title} .......... ${page}</p>`).join('')}
`)}`;

const INTRODUCTION = `<div class="page-break"></div>
<h1 class="chapter-title">Introduction Générale</h1>
<p>Le secteur du développement logiciel est aujourd'hui marqué par une transformation continue, alimentée par l'émergence de frameworks meta performants, la démocratisation des architectures microservices et l'adoption généralisée des pratiques DevOps au sein des organisations numériques. Dans ce contexte d'évolution rapide, la formation théorique dispensée en école doit impérativement se confronter aux réalités du terrain, aux contraintes de production et aux exigences de la livraison continue de valeur logicielle.</p>
<p>C'est dans cette perspective que s'inscrit mon stage de fin d'études, effectué au sein de <strong>Landmark Agency</strong>, une agence numérique innovante basée à Oujda, du 7 mai au 7 juillet 2026. Ce stage de deux mois a représenté l'opportunité rare et exigeante d'occuper simultanément un rôle de coordination agile et de développement technique de haut niveau, sur deux projets distincts aux natures complémentaires.</p>
<p>D'un côté, le projet <strong>SikBeauty</strong> a demandé une intervention d'industrialisation : transformer une application React existante en plateforme Next.js performante, outillée d'un pipeline CI/CD robuste et d'une infrastructure Docker déployée en production. De l'autre, <strong>Aligno</strong> a représenté le défi de concevoir et de construire from scratch un écosystème logiciel complet — un système de productivité intégrant gestion de projets Kanban, planification du temps et suivi des finances personnelles — avec une architecture rigoureuse, des tests automatisés et une interface soignée.</p>
<p>Ma double casquette de <strong>Scrum Master</strong> et de <strong>Développeur Full-Stack Lead</strong> m'a amené à opérer à plusieurs niveaux : planification des sprints et gestion du backlog Jira, revues de code et coordination d'une équipe de cinq personnes, conception architecturale, développement de fonctionnalités critiques, écriture de tests d'intégration et optimisation des performances en production.</p>
<p>Ce rapport constitue le compte-rendu académique et professionnel de cette expérience. Il est structuré de manière à refléter la progression logique de notre travail : après une présentation du contexte (Landmark Agency, YouCode), des méthodes de travail (Scrum, Git Flow), et de l'architecture technique globale, nous détaillons nos contributions sur chacun des deux projets, puis nous dressons un bilan des compétences acquises, des difficultés surmontées et des résultats obtenus.</p>`;

const CHAPTER1 = `<div class="page-break"></div>
${chapterHeader(1, 'Contexte et Environnement de Stage')}
<h2>1.1 Présentation de Landmark Agency</h2>
<p>Fondée à Oujda dans le nord-est du Maroc, <strong>Landmark Agency</strong> est une agence de services numériques spécialisée dans la création d'applications web et mobiles sur mesure, le conseil en architecture logicielle et l'accompagnement à la transformation digitale de ses clients. L'agence se distingue par une capacité à prendre en charge des projets complexes de bout en bout, depuis la conception fonctionnelle jusqu'au déploiement en production, en passant par la définition de l'architecture technique et la mise en place des processus qualité.</p>
<p>La culture d'entreprise de Landmark Agency repose sur trois piliers fondamentaux : <strong>l'exigence technique</strong>, <strong>la formation continue</strong> et <strong>l'adoption proactive de technologies modernes</strong>. Les équipes évoluent dans un environnement de travail stimulant, où la veille technologique est encouragée et où chaque projet constitue une opportunité d'explorer de nouveaux paradigmes. La stack technologique de l'agence est résolument orientée JavaScript : Node.js, React/Next.js, Nuxt/Vue.js, TypeScript, avec une expertise forte en DevOps (Docker, GitHub Actions, VPS).</p>
<p>La méthodologie de développement adoptée est le <strong>Scrum Agile</strong>, avec des sprints hebdomadaires structurés autour des cérémonies classiques (Planning, Daily, Review, Retrospective). Cette organisation permet une livraison rapide et continue de valeur, tout en maintenant une visibilité claire sur l'avancement de chaque projet. Les outils utilisés sont Jira pour la gestion de projet, GitHub pour le versioning et la collaboration, et Slack pour la communication interne.</p>

<h2>1.2 Présentation de YouCode Safi</h2>
<p><strong>YouCode Safi</strong> est une école de formation aux métiers du numérique, fruit d'un partenariat pédagogique avec le réseau Simplon. Sa pédagogie repose sur l'apprentissage par projets (<em>learning by doing</em>), sans cours magistraux traditionnels : les apprenants progressent en résolvant des problèmes réels, en travaillant en équipe et en se confrontant quotidiennement aux technologies du marché. Cette approche développe chez les stagiaires une forte capacité d'adaptation, d'auto-apprentissage et de collaboration professionnelle.</p>
<p>L'objectif de YouCode est de former des développeurs Full-Stack opérationnels, capables de s'intégrer immédiatement dans une équipe professionnelle. La formation aborde les fondamentaux du développement web (HTML, CSS, JavaScript), puis progresse vers des technologies avancées (Node.js, React/Vue, bases de données relationnelles, DevOps), tout en intégrant des modules de développement personnel et de soft skills.</p>

<h2>1.3 Présentation de l'équipe de stage</h2>
<p>L'équipe projet était constituée de cinq développeurs stagiaires, coordonnés par l'encadrant de l'entreprise. La répartition des rôles a été définie dès le premier sprint, lors d'une session de planning collective :</p>
${table(
  ['Nom & Prénom', 'Rôle principal', 'Modules principaux contribués'],
  [
    ['M. LATRACH Mohammed', 'Encadrant / Product Owner', 'Supervision, arbitrage fonctionnel et technique, revue finale.'],
    ['Badr Eddine Slaoui', 'Scrum Master & Dev Full-Stack Lead', 'Auth (Backend + Frontend), DevOps, SEO, Architecture, Tests, Git.'],
    ['Brahim El Habchi', 'Développeur Full-Stack', 'Module Kanban (Backend + Frontend), intégration Socket.IO.'],
    ['Yassine Nmila', 'Développeur Full-Stack', 'Module Wallet (Backend), gestion des transactions et budgets.'],
    ['Khadija El Haddad', 'Développeuse Full-Stack', 'Module Time Management (Frontend), composants UI partagés.'],
    ['Mouna Saoui', 'Développeuse Full-Stack', 'Module Wallet (Frontend), ApexCharts, Dashboard analytique.'],
  ],
  'Tableau 1 : Équipe projet et répartition des rôles'
)}`;

const CHAPTER2 = `<div class="page-break"></div>
${chapterHeader(2, 'Méthodes de Travail et Rôle de Scrum Master')}
<h2>2.1 La méthodologie Agile Scrum</h2>
<p>Scrum est un cadre de travail agile fondé sur des itérations courtes, appelées sprints, et sur une livraison incrémentale de valeur. Contrairement aux méthodologies en cascade (<em>waterfall</em>), Scrum privilégie l'adaptation continue aux changements et la communication permanente entre les membres de l'équipe. Les trois piliers fondamentaux de Scrum sont la <strong>transparence</strong> (tout le monde partage le même niveau d'information), l'<strong>inspection</strong> (le travail est régulièrement évalué) et l'<strong>adaptation</strong> (le plan est ajusté en fonction des observations).</p>
<p>Nos sprints avaient une durée d'une semaine. Chaque sprint débutait par une session de Sprint Planning où l'équipe sélectionnait les tickets du backlog à traiter, se terminait par une Sprint Review de démonstration des fonctionnalités réalisées, et une Sprint Retrospective d'amélioration continue. Les Daily Meetings quotidiens (15 minutes maximum) permettaient de synchroniser l'équipe et d'identifier immédiatement les blocages.</p>
${table(
  ['Cérémonie', 'Fréquence', 'Durée', 'Objectif'],
  [
    ['Sprint Planning', 'Début de sprint (lundi)', '1h – 1h30', 'Sélection des tickets, estimation, attribution des tâches.'],
    ['Daily Meeting', 'Chaque matin', '15 min max', 'Synchronisation : fait hier, prévu aujourd\'hui, blocages.'],
    ['Sprint Review', 'Fin de sprint (vendredi)', '30 – 45 min', 'Démonstration des fonctionnalités à l\'encadrant (Product Owner).'],
    ['Sprint Retrospective', 'Fin de sprint', '30 min', 'Analyse collective des points forts et axes d\'amélioration.'],
  ],
  'Tableau 2 : Cérémonies Scrum et planning hebdomadaire'
)}

<h2>2.2 Rôle et responsabilités du Scrum Master</h2>
<p>Tout au long du stage, j'ai exercé le rôle de <strong>Scrum Master</strong> sur les deux projets simultanément. Ce rôle est bien plus qu'une simple coordination administrative : il s'agit de mettre en place et de maintenir un environnement propice à la haute performance d'une équipe agile. Mes responsabilités étaient multiples et entrelacées.</p>
<p>En amont de chaque sprint, j'assurais la <strong>gestion et le raffinage du backlog produit</strong> sur Jira. Cela impliquait de créer les Epics structurant chaque module fonctionnel (Authentification, Kanban, Wallet, Time Management, Dashboard), puis de rédiger des User Stories précises respectant la structure : <em>"En tant que [rôle], je veux [fonctionnalité] afin de [bénéfice]"</em>. Chaque User Story était ensuite décomposée en tâches de développement atomiques (moins de 8 heures chacune), accompagnées de critères d'acceptation clairs et testables.</p>
<p>Lors du Sprint Planning, j'animais la session d'estimation en utilisant la technique du <strong>Planning Poker</strong> (adaptée à notre contexte). Chaque développeur estimait la charge de chaque tâche en story points, ce qui permettait d'équilibrer la charge de travail et d'éviter la sur-allocation. J'attribuais ensuite les tickets à chaque membre en fonction de ses compétences, de sa disponibilité et des dépendances entre les tâches.</p>
<p>Au quotidien, j'animais les <strong>Daily Meetings</strong> en garantissant leur concision et leur efficacité. Lorsqu'un développeur signalait un blocage, j'intervenais soit pour apporter une solution technique immédiate, soit pour planifier une session de pair-programming. Je maintenais le tableau Kanban de Jira à jour en temps réel, ce qui offrait une visibilité complète sur l'état du sprint à tout moment.</p>
<p>En fin de sprint, j'organisais les <strong>Sprint Reviews</strong> en préparant la démonstration des fonctionnalités et en coordonnant les présentations des développeurs. Les <strong>Sprint Retrospectives</strong> étaient structurées autour de trois axes : ce qui a bien fonctionné, ce qui doit être amélioré, et les actions concrètes à mettre en place dès le sprint suivant.</p>

<h2>2.3 Gestion du Git Flow et revues de code</h2>
<p>En tant que Lead technique, j'ai défini et imposé un <strong>Git Flow</strong> rigoureux pour les deux projets. L'arbre des branches était structuré ainsi :</p>
<ul>
  <li><code>main</code> : branche de production, protégée, accessible uniquement via PR approuvées.</li>
  <li><code>dev</code> : branche d'intégration continue, base de toutes les branches de fonctionnalité.</li>
  <li><code>feature/[ticket-id]-[description]</code> : branches de développement par fonctionnalité.</li>
  <li><code>fix/[ticket-id]-[description]</code> : branches de correction de bugs.</li>
  <li><code>chore/[description]</code> : branches de maintenance (mises à jour de dépendances, configuration).</li>
</ul>
<p>Toutes les fusions dans <code>dev</code> passaient obligatoirement par une <strong>Pull Request</strong> sur GitHub, que je relisais systématiquement. Mes revues de code portaient sur plusieurs dimensions : conformité aux critères d'acceptation de la User Story, respect des standards de codage TypeScript, sécurité (absence de secrets en dur, validation Zod présente), qualité de l'architecture (respect des couches), et passage des tests automatiques dans le pipeline CI.</p>
${fig(svgGitFlow, 'Fig. 7 : Schéma du Git Flow appliqué aux deux projets (main → dev → feature / fix)')}`;

const CHAPTER3 = `<div class="page-break"></div>
${chapterHeader(3, 'Architecture Globale des Projets')}
<h2>3.1 Topologie système d'Aligno</h2>
<p>Aligno est construit sur une topologie de système distribué exploitant pleinement les capacités Full-Stack de Nuxt 4. Le serveur Nitro intégré à Nuxt sert simultanément les pages Vue.js (SSR) et les endpoints REST de l'API. La communication en temps réel pour les fonctionnalités collaboratives (Kanban, notifications) est assurée par Socket.IO, dont le bus de messages est synchronisé entre instances via un adaptateur Redis.</p>
${fig(svgSystemTopology, 'Fig. 1 : Topologie générale du système distribué Aligno')}

<h2>3.2 Architecture Backend en 6 couches</h2>
<p>Le backend d'Aligno applique un pattern d'architecture en couches (<em>Layered Architecture</em>) strict, inspiré du Domain-Driven Design. Ce choix architectural garantit la séparation des préoccupations, la testabilité unitaire de chaque couche et la maintenabilité à long terme du code. Chaque couche a une responsabilité unique et ne peut communiquer qu'avec les couches adjacentes.</p>
${fig(svgLayeredArch, 'Fig. 2 : Architecture Backend en 6 couches (layered architecture) d\'Aligno')}

<h2>3.3 Diagrammes UML et ERD</h2>
<h3>3.3.1 Diagramme de cas d'utilisation — Module Authentification</h3>
${fig(svgUseCaseDiagram, 'Fig. 3 : Diagramme de cas d\'utilisation (Use Case) — Module Authentification d\'Aligno')}

<h3>3.3.2 Diagramme de séquence — Inscription et validation e-mail</h3>
${fig(svgSequenceDiagram, 'Fig. 4 : Diagramme de séquence UML — Inscription (Register) et validation de l\'adresse e-mail via Resend')}

<div class="page-break"></div>
<h3>3.3.3 Diagramme Entité-Association (ERD)</h3>
${fig(svgERD, 'Fig. 5 : Diagramme Entité-Association simplifié d\'Aligno (tables principales : users, projects, bank_accounts, kanban_columns, transactions)')}

<h2>3.4 Déploiement et Infrastructure</h2>
${fig(svgDeploymentDiagram, 'Fig. 6 : Diagramme de déploiement — Pipeline CI/CD GitHub Actions et infrastructure VPS Hostinger')}`;

const CHAPTER4 = `<div class="page-break"></div>
${chapterHeader(4, 'Projet SikBeauty — Migration et Industrialisation')}
<h2>4.1 Présentation et contexte</h2>
<p><strong>SikBeauty</strong> est une marketplace e-commerce spécialisée dans la vente de cosmétiques coréens (K-Beauty). La plateforme propose un catalogue de produits organisés par catégories et marques, un système de panier d'achat, une gestion des commandes et un espace client complet. Au moment de notre intervention, l'application était développée avec React (Create React App), une Single Page Application (SPA) standard, et souffrait de deux problèmes majeurs affectant directement son potentiel commercial.</p>
<p>Le premier problème était d'ordre <strong>technique</strong> : les temps de chargement initiaux étaient élevés (FCP > 2.5s) en raison du bundle JavaScript important à télécharger et à exécuter côté client avant tout rendu. Le second était d'ordre <strong>commercial</strong> : les moteurs de recherche (Google, Bing) ne pouvaient pas indexer correctement les fiches produits, car leur contenu était généré dynamiquement par JavaScript après le chargement initial. Le score SEO Lighthouse de la page d'accueil était de 68/100, et celui des fiches produits était encore plus faible.</p>

<h2>4.2 Migration React vers Next.js et optimisation SSR/SEO</h2>
<p>Face à ces enjeux, la décision a été prise de migrer la partie commerciale critique de l'application (page d'accueil, catalogue, fiches produits) vers <strong>Next.js avec l'App Router</strong>. Cette architecture permet le Server-Side Rendering (SSR) pour les contenus dynamiques et le Static Site Generation (SSG) pour les contenus peu changeants, offrant le meilleur de deux mondes : contenu pré-rendu accessible aux robots de recherche et expérience utilisateur réactive.</p>
<p>J'ai débuté par une phase d'<strong>audit complet</strong> des composants React existants, identifiant les trois catégories de problèmes à résoudre lors de la migration :</p>
<ul>
  <li>Les dépendances aux APIs du navigateur (<code>window</code>, <code>localStorage</code>) incompatibles avec l'exécution côté serveur.</li>
  <li>Les hooks React utilisant <code>useEffect</code> avec des effets de bord immédiats, incompatibles avec le rendu serveur.</li>
  <li>Les bibliothèques tierces sans support SSR (notamment les bibliothèques de graphiques et de carrousels).</li>
</ul>
<p>Pour chaque page migrée, j'ai appliqué la même démarche systématique : transformer les composants statiques en <strong>Server Components</strong> (pour les données ne nécessitant pas d'interactivité), annoter les composants interactifs avec la directive <code>'use client'</code>, et gérer les imports de bibliothèques non-SSR via <code>next/dynamic</code> avec l'option <code>ssr: false</code>.</p>
<p>Grâce à mon expérience préalable avec React et Next.js, j'ai également assuré un rôle de <strong>mentor technique</strong> auprès des autres développeurs de l'équipe SikBeauty, qui découvraient les spécificités de l'App Router pour la première fois. J'ai organisé des sessions de pair-programming ciblées et rédigé des guides internes documentant les patterns à suivre et les anti-patterns à éviter.</p>

<h3>4.2.1 Optimisation SEO technique</h3>
<p>En tant que responsable SEO du projet, j'ai implémenté une stratégie complète d'optimisation du référencement naturel, tirant parti des capacités natives de Next.js. La génération des métadonnées est entièrement dynamique, calculée côté serveur à partir des données produit récupérées en base.</p>
${table(
  ['Technique SEO', 'Avant (React SPA)', 'Après (Next.js SSR)', 'Impact'],
  [
    ['Time To First Byte (TTFB)', '1.2s', '0.25s', '↓ 79% — Réponse quasi instantanée.'],
    ['First Contentful Paint (FCP)', '2.8s', '0.8s', '↓ 71% — Affichage immédiat du contenu.'],
    ['Largest Contentful Paint (LCP)', '4.1s', '1.4s', '↓ 66% — Core Web Vital dans la zone verte.'],
    ['Indexation fiches produits', 'Partielle (JS requis)', '100% automatique', 'Toutes les fiches indexées par Google.'],
    ['Score Performance Lighthouse', '52/100', '91/100', '+39 points — Amélioration majeure.'],
    ['Score SEO Lighthouse', '68/100', '98/100', '+30 points — SEO quasi parfait.'],
    ['Meta description dynamique', 'Absente', 'Générée par produit', 'CTR amélioré dans les SERP.'],
    ['Open Graph + Twitter Cards', 'Statiques', 'Dynamiques par page', 'Partage sur réseaux sociaux optimisé.'],
  ],
  'Tableau 3 : Comparatif React SPA vs Next.js SSR — Métriques de performance et SEO'
)}
${table(
  ['Optimisation SEO', 'Description'],
  [
    ['title dynamique', 'Généré avec generateMetadata() par page — format : "Produit | SikBeauty".'],
    ['meta description', 'Extrait des 160 premiers caractères de la description produit.'],
    ['canonical URLs', 'Attribut canonical sur chaque page pour éviter le contenu dupliqué.'],
    ['Open Graph (og:*)', 'og:title, og:description, og:image, og:type — pour le partage réseaux sociaux.'],
    ['Twitter Cards', 'twitter:card, twitter:title, twitter:image — pour l\'aperçu sur Twitter/X.'],
    ['sitemap.xml', 'Généré dynamiquement via sitemap.ts — toutes les fiches produits incluses.'],
    ['robots.txt', 'Fichier configuré pour autoriser l\'indexation des pages publiques.'],
    ['next/image', 'Lazy loading automatique, formats WebP/AVIF, dimensionnement responsive.'],
    ['Structured Data (JSON-LD)', 'Markup Product pour une éligibilité aux Rich Results Google.'],
  ],
  'Tableau 4 : Métriques SEO Lighthouse avant et après migration'
)}

<div class="page-break"></div>
<h2>4.3 DevOps, Docker et CI/CD GitHub Actions</h2>
<p>Une fois la migration technique réalisée, j'ai conçu et mis en place l'intégralité de l'infrastructure de déploiement et de livraison continue du projet SikBeauty.</p>
<h3>4.3.1 Conteneurisation Docker multi-stage</h3>
<p>J'ai rédigé un <strong>Dockerfile multi-stage</strong> optimisé pour Next.js en mode standalone. Cette approche réduit drastiquement la taille de l'image de production en séparant la phase de build (qui inclut toutes les dépendances de développement, les outils de compilation TypeScript, etc.) de la phase de production (qui ne contient que le serveur Node.js standalone et les assets statiques).</p>
<div class="code-block"><span class="cm"># Étape 1 : Builder (inclut devDependencies + compilation)</span>
<span class="kw">FROM</span> node:20-alpine <span class="kw">AS</span> builder
<span class="kw">WORKDIR</span> /app
<span class="kw">COPY</span> package*.json ./
<span class="kw">RUN</span> npm ci
<span class="kw">COPY</span> . .
<span class="kw">RUN</span> npm run build

<span class="cm"># Étape 2 : Production (image minimale ~140Mo vs ~950Mo)</span>
<span class="kw">FROM</span> node:20-alpine <span class="kw">AS</span> runner
<span class="kw">WORKDIR</span> /app
<span class="kw">ENV</span> NODE_ENV=production
<span class="kw">COPY</span> --from=builder /app/.next/standalone ./
<span class="kw">COPY</span> --from=builder /app/.next/static ./.next/static
<span class="kw">EXPOSE</span> 3000
<span class="kw">CMD</span> [<span class="str">"node"</span>, <span class="str">"server.js"</span>]</div>
<p>Le fichier <code>docker-compose.yml</code> orchestre les services de l'environnement de développement : l'application Next.js, un conteneur PostgreSQL (pour le backend), et un service Redis. Les volumes Docker garantissent la persistance des données entre les redémarrages et le hot-reload du code pendant le développement.</p>

<h3>4.3.2 Pipeline CI/CD GitHub Actions</h3>
<p>J'ai rédigé le workflow GitHub Actions (fichier <code>.github/workflows/deploy.yml</code>) assurant un pipeline de livraison continue fiable. Le pipeline est déclenché sur chaque push vers les branches <code>main</code> et <code>dev</code> et se compose des étapes suivantes :</p>
<ol>
  <li><strong>Installation des dépendances</strong> (<code>npm ci</code>) avec mise en cache des <code>node_modules</code>.</li>
  <li><strong>Vérification des types TypeScript</strong> (<code>npx tsc --noEmit</code>) — bloquant en cas d'erreur.</li>
  <li><strong>Lint du code</strong> (ESLint) — bloquant en cas de violations de règles critiques.</li>
  <li><strong>Build de production</strong> (<code>npm run build</code>) — vérification de la compilation.</li>
  <li><strong>Connexion SSH au VPS Hostinger</strong> via la clé stockée dans les GitHub Secrets.</li>
  <li><strong>Déploiement via Docker Compose</strong> : pull de la dernière image, recréation du conteneur, migration de la base de données.</li>
</ol>

<h2>4.4 Déploiement sur VPS Hostinger</h2>
<p>Le déploiement en production s'est fait sur un VPS Ubuntu hébergé chez <strong>Hostinger</strong>. La configuration du serveur a nécessité plusieurs étapes : installation de Docker Engine et Docker Compose, configuration du firewall (UFW) pour n'exposer que les ports 80, 443 et 22, installation et configuration de <strong>Nginx</strong> comme reverse proxy pour acheminer le trafic vers le conteneur applicatif, et mise en place d'un certificat SSL automatique via <strong>Let's Encrypt</strong> (Certbot). Le nom de domaine a été configuré dans l'interface Hostinger en pointant les enregistrements DNS A vers l'adresse IP publique du VPS.</p>

<h2>4.5 Contributions Backend</h2>
<p>En complément de mes contributions principales, j'ai également apporté mon aide à l'équipe backend de SikBeauty en corrigeant plusieurs problèmes identifiés lors des revues de code et des tests : correction d'une fuite de connexions Prisma en environnement de test, résolution d'une incohérence de validation des données d'entrée sur l'API de gestion des commandes, et optimisation d'une requête Prisma générant des appels N+1 sur la liste des produits.</p>`;

const CHAPTER5 = `<div class="page-break"></div>
${chapterHeader(5, 'Projet Aligno — Conception et Développement from Scratch')}
<h2>5.1 Présentation d'Aligno</h2>
<p><strong>Aligno</strong> est une application web Full-Stack de gestion de la productivité et du mode de vie, conçue pour harmoniser le travail, la gestion du temps et les finances personnelles sous une interface unique et cohérente. L'application intègre quatre modules fonctionnels principaux :</p>
<ul>
  <li><strong>Kanban (Project Management)</strong> : tableaux de bord collaboratifs avec colonnes, cartes, sous-tâches, labels et assignations, synchronisés en temps réel via Socket.IO.</li>
  <li><strong>Time Management</strong> : système de blueprints de journée (templates de blocs de temps) permettant d'activer des plannings quotidiens personnalisés.</li>
  <li><strong>Wallet</strong> : gestion multi-comptes bancaires, suivi des revenus et dépenses, gestion des abonnements récurrents, budgets mensuels et analyses graphiques.</li>
  <li><strong>Dashboard</strong> : vue synthétique agrégeant les indicateurs clés de productivité et de santé financière.</li>
</ul>
<p>La stack technique d'Aligno reflète une ambition de modernité et de performance : <strong>Nuxt 4</strong> comme framework Full-Stack, <strong>Vue 3 avec Composition API</strong>, <strong>TypeScript</strong> strict, <strong>Tailwind CSS v4</strong> avec le design system Midnight Obsidian, <strong>Nuxt UI</strong> pour les composants, <strong>Pinia</strong> pour la gestion d'état, <strong>Prisma ORM</strong> avec <strong>PostgreSQL 17</strong>, <strong>Redis</strong> pour le cache et les queues <strong>BullMQ</strong>, et <strong>Socket.IO</strong> pour la collaboration en temps réel.</p>

<h2>5.2 Initialisation du projet et configuration</h2>
<p>J'ai pris en charge l'initialisation complète du projet Aligno. Cette phase fondatrice, souvent sous-estimée, conditionne la qualité et la maintenabilité de l'ensemble du développement. Elle comprenait :</p>
<ul>
  <li>La création du projet Nuxt 4 et la configuration du fichier <code>nuxt.config.ts</code> (modules, runtimeConfig, Tailwind, sécurité).</li>
  <li>La mise en place de la structure de répertoires suivant le pattern layered architecture.</li>
  <li>La configuration de <strong>Prisma ORM</strong> avec les modèles de base de données et le premier schéma.</li>
  <li>La rédaction du <code>docker-compose.yml</code> orchestrant les quatre services : Nuxt App, PostgreSQL 17, Redis 7 Alpine, et pgAdmin 4 pour l'administration de la base.</li>
  <li>La configuration des hooks Git via <strong>Husky</strong> : hook <code>pre-push</code> exécutant automatiquement la suite de tests Vitest dans le conteneur Docker avant chaque push.</li>
  <li>La configuration du pipeline CI GitHub Actions avec les actions PostgreSQL intégrées.</li>
</ul>
${table(
  ['Variable d\'environnement', 'Requis', 'Description'],
  [
    ['DATABASE_URL', '✅', 'Chaîne de connexion PostgreSQL (prisma+pg adapter).'],
    ['JWT_SECRET', '✅', 'Clé secrète pour signer les access tokens (15 min).'],
    ['JWT_REFRESH_SECRET', '✅', 'Clé secrète pour signer les refresh tokens (30 jours).'],
    ['RESEND_API_KEY', '✅', 'Clé API Resend pour les e-mails transactionnels.'],
    ['APP_URL', '❌', 'URL de base de l\'application (défaut : http://localhost:4000).'],
    ['NUXT_PORT', '❌', 'Port d\'écoute du serveur Nitro (défaut : 4000).'],
    ['LOG_LEVEL', '❌', 'Niveau de log Pino (défaut : info).'],
    ['SENTRY_DSN', '❌', 'DSN Sentry pour le tracking des exceptions en production.'],
  ],
  'Tableau 5 : Variables d\'environnement du projet Aligno'
)}

<div class="page-break"></div>
<h2>5.3 Développement Backend du module Authentification</h2>
<p>J'étais responsable de la conception et de l'implémentation complète du <strong>module d'authentification</strong> d'Aligno, qui constitue la fondation sécuritaire de toute l'application. Ce module, d'une complexité technique élevée, implémente un système d'authentification dual-token avec renouvellement silencieux, validation d'e-mail, et récupération de mot de passe.</p>

<h3>5.3.1 Architecture en 6 couches</h3>
<p>Chaque endpoint de l'API d'authentification traverse strictement les 6 couches de l'architecture :</p>
<ol>
  <li><strong>Route Handler</strong> (<code>server/api/auth/*.ts</code>) : point d'entrée HTTP. Définit la méthode HTTP, le path, et les spécifications OpenAPI/Swagger. Délègue immédiatement au Controller.</li>
  <li><strong>Controller</strong> (<code>server/controller/auth.controller.ts</code>) : parse le corps de la requête, déclenche la validation Zod, gère les cookies HttpOnly, formate l'enveloppe de réponse JSON standardisée (<code>{ success, data }</code> ou <code>{ success, message, errors }</code>).</li>
  <li><strong>Service</strong> (<code>server/service/auth.service.ts</code>) : orchestre la logique métier. Ne connaît pas la requête HTTP. Coordonne le hachage des mots de passe (bcrypt), la génération et vérification des tokens JWT, et l'envoi d'e-mails (Resend).</li>
  <li><strong>Repository</strong> (<code>server/repository/user.repository.ts</code>) : implémentation concrète de l'interface DAO. Contient toutes les requêtes Prisma vers PostgreSQL.</li>
  <li><strong>DAO</strong> (<code>server/dao/user.dao.ts</code>) : interface TypeScript définissant le contrat d'accès aux données. Permet de substituer facilement l'implémentation (ex : passer de PostgreSQL à MongoDB sans modifier les couches supérieures).</li>
  <li><strong>DTO / Mapper</strong> (<code>server/dto/auth.dto.ts</code>, <code>server/mapper/user.mapper.ts</code>) : DTOs TypeScript assurant la sécurité de type entre les couches. Le Mapper garantit que les champs sensibles (mot de passe hashé, tokens de reset) ne sont jamais exposés dans les réponses API.</li>
</ol>

<h3>5.3.2 Endpoints développés</h3>
${table(
  ['Endpoint', 'Méthode', 'Auth', 'Description'],
  [
    ['<code>/api/auth/register</code>', 'POST', 'Guest Only', 'Inscription, upload avatar WebP (Sharp), envoi e-mail de vérification Resend.'],
    ['<code>/api/auth/login</code>', 'POST', 'Guest Only', 'Authentification bcrypt, émission du couple JWT (access 15min + refresh 30j cookie HttpOnly).'],
    ['<code>/api/auth/me</code>', 'GET', 'Bearer JWT', 'Récupération du profil utilisateur (champs sensibles strippés par le Mapper).'],
    ['<code>/api/auth/logout</code>', 'POST', 'Bearer JWT', 'Révocation du refresh token en DB, suppression du cookie HttpOnly.'],
    ['<code>/api/auth/email/validation</code>', 'POST', 'Guest Only', 'Vérification du jeton e-mail (SHA-256 comparé avec le hash en DB).'],
    ['<code>/api/auth/forgot-password</code>', 'POST', 'Guest Only', 'Génération d\'un token de reset (1h), envoi e-mail Resend. Réponse identique que l\'e-mail existe ou non (anti-énumération).'],
    ['<code>/api/auth/reset-password</code>', 'POST', 'Guest Only', 'Vérification du token de reset, hachage du nouveau mot de passe, invalidation du token.'],
    ['<code>/api/auth/profile</code>', 'PUT', 'Bearer JWT', 'Mise à jour des informations de profil et/ou de l\'avatar (compression Sharp, suppression de l\'ancienne image).'],
  ],
  'Tableau 6 : Registre complet des endpoints API du module Authentification'
)}

<h3>5.3.3 Sécurité et validations</h3>
${table(
  ['Contrôle de sécurité', 'Implémentation technique'],
  [
    ['Hachage des mots de passe', 'Bcrypt avec 12 rounds de sel. Le mot de passe en clair n\'est jamais stocké ni loggé.'],
    ['Access Token JWT', 'Durée de vie : 15 minutes. Signé avec JWT_SECRET. Transmis en header Authorization: Bearer.'],
    ['Refresh Token JWT', 'Durée de vie : 30 jours. Signé avec JWT_REFRESH_SECRET. Stocké en cookie HttpOnly, Secure, SameSite=Strict. Seul son hash SHA-256 est persisté en base.'],
    ['Renouvellement silencieux', 'Le middleware Auth intercepte les access tokens expirés et tente un renouvellement via le cookie refresh. Le nouveau token est retourné dans X-Access-Token.'],
    ['Tokens de vérification/reset', 'Générés avec crypto.randomBytes(32). Seul leur hash SHA-256 est stocké en base.'],
    ['Anti-énumération utilisateurs', 'forgot-password retourne le même message 200 que l\'e-mail existe ou non.'],
    ['Validation des entrées (Zod)', 'Tous les payloads sont validés par des schémas Zod stricts. Retour 422 avec erreurs par champ.'],
    ['Stripping des champs sensibles', 'UserMapper.toResponseDto() supprime passwordHash, refreshToken, emailVerifyToken des réponses.'],
    ['Traitement des images', 'Sharp redimensionne et compresse en WebP 400×400px. L\'ancienne image est supprimée du disque.'],
  ],
  'Tableau 8 : Contrôles de sécurité implémentés dans le module Auth d\'Aligno'
)}

<div class="page-break"></div>
<h2>5.4 Tests unitaires et d'intégration avec Vitest</h2>
<p>J'ai développé l'ensemble de la suite de tests du module Authentification, couvrant 35 scénarios distincts répartis en 9 fichiers de tests. La stratégie de test adopte une approche d'<strong>intégration complète</strong> : les tests ne mockent pas la base de données mais utilisent un serveur Nuxt réel (<code>@nuxt/test-utils/e2e</code>) connecté à une instance PostgreSQL de test, garantissant que chaque test valide le comportement de bout-en-bout, de la requête HTTP jusqu'à la persistance en base.</p>
<p>La configuration Vitest impose l'exécution <strong>séquentielle des fichiers</strong> (<code>fileParallelism: false</code>) pour éviter les race conditions sur la base de données partagée. Chaque fichier de test nettoie la base de données dans un <code>beforeEach()</code> via la fonction <code>clearDatabase()</code>, garantissant l'isolation et le déterminisme des tests.</p>
${table(
  ['Fichier de test', 'Nb tests', 'Scénarios couverts'],
  [
    ['register.test.ts', '8', 'Inscription réussie, e-mail dupliqué, téléphone dupliqué, prénom manquant, e-mail invalide, mot de passe trop court, confirmPassword ne correspond pas, champs obligatoires manquants.'],
    ['login.test.ts', '5', 'Connexion réussie + cookie refresh, utilisateur inexistant (401), mauvais mot de passe (401), e-mail non vérifié (403), e-mail manquant (422).'],
    ['me.test.ts', '3', 'Profil avec token valide (200), token manquant (401), token expiré (401).'],
    ['logout.test.ts', '2', 'Déconnexion réussie + révocation cookie, non autorisé (401).'],
    ['validation.test.ts', '3', 'Token de vérification valide, token invalide (400), token expiré (400).'],
    ['forgot-password.test.ts', '3', 'E-mail existant (200 — réponse générique), e-mail inexistant (200 — anti-énumération), e-mail manquant (422).'],
    ['reset-password.test.ts', '4', 'Reset valide, token invalide (400), token expiré (400), mot de passe manquant (422).'],
    ['auth-middleware.test.ts', '5', 'Access token valide, aucun credential (401), renouvellement silencieux avec X-Access-Token, cookie refresh invalide (401), hash refresh token ne correspond pas en DB (401).'],
    ['guest-middleware.test.ts', '2', 'Utilisateur authentifié bloqué sur /login (403), bloqué sur /register (403).'],
  ],
  'Tableau 9 : Couverture des tests Vitest — Module Authentification (35 tests)'
)}

<h2>5.5 Planification Frontend sur Jira</h2>
<p>Une fois le backend d'authentification terminé et testé, j'ai préparé la <strong>planification complète du développement frontend</strong> sur Jira, avant que les autres développeurs ne commencent à coder les interfaces. Cette phase de planification est cruciale pour éviter les doublons de travail, les conflits Git et les incohérences d'architecture.</p>
<p>J'ai créé une Epic "Module Auth — Frontend" regroupant toutes les User Stories du module. Chaque User Story a été découpée en tâches précises avec des critères d'acceptation détaillés, puis distribuée aux membres de l'équipe en fonction de leur affinité avec chaque fonctionnalité. Les tâches ont été priorisées selon les dépendances fonctionnelles : le store Pinia et la couche API devaient être implémentés en premier, car toutes les pages en dépendaient.</p>

<div class="page-break"></div>
<h2>5.6 Développement Frontend — Module Auth (Nuxt 4)</h2>
<p>J'ai développé toutes les interfaces du module d'authentification avec <strong>Nuxt 4</strong>, <strong>Vue 3 (Composition API)</strong>, <strong>TypeScript</strong>, <strong>Tailwind CSS v4</strong>, <strong>Nuxt UI</strong> et <strong>Pinia</strong>, en respectant le design system Midnight Obsidian défini en Sprint 0.</p>

<h3>5.6.1 Store Pinia et composables</h3>
<p>L'état d'authentification est géré par un store Pinia persisté (<code>pinia-plugin-persistedstate</code>). Contrairement au refresh token (stocké en cookie HttpOnly côté serveur), l'access token est conservé <strong>uniquement en mémoire</strong> (non persisté), pour des raisons de sécurité. Lors d'un rechargement de page, le composable <code>useAuth</code> effectue automatiquement une requête vers <code>/api/auth/me</code>, qui utilise le cookie refresh HttpOnly pour revalider la session et obtenir un nouveau access token.</p>

<h3>5.6.2 Pages développées</h3>
<p>Les pages du module Auth suivent toutes le même layout <code>auth.vue</code>, qui applique le thème Midnight Obsidian (fond sombre avec dégradé, effets glassmorphism). Chaque page implémente la validation côté client avant tout appel API, en utilisant des règles identiques aux schémas Zod côté serveur pour une expérience cohérente :</p>
<ul>
  <li><strong>Register</strong> : formulaire multi-champs avec upload d'avatar (prévisualisation en temps réel), indicateur de force du mot de passe (composant <code>PasswordStrength.vue</code>), sérialisation en <code>FormData</code> pour l'upload multipart.</li>
  <li><strong>Login</strong> : gestion de la redirection post-connexion (<code>?redirect=</code>), affichage spécifique si l'e-mail n'est pas encore vérifié (code 403).</li>
  <li><strong>Forgot Password</strong> : timer de 60 secondes pour éviter le spam de requêtes, avec feedback visuel du compte à rebours.</li>
  <li><strong>Reset Password</strong> : vérification immédiate de la présence du token dans l'URL au montage du composant, avec affichage d'un écran d'erreur adapté si le token est absent ou invalide.</li>
  <li><strong>Verify Email</strong> : validation automatique au montage si un token est présent en query param (<code>?token=</code>), avec un input de fallback pour saisie manuelle du code.</li>
  <li><strong>Profile</strong> : affichage des données utilisateur, formulaire de mise à jour partielle des champs, upload d'un nouvel avatar avec compression et compression d'avertissement.</li>
</ul>

<h2>5.7 Phase de finalisation du projet</h2>
<p>J'ai été responsable de la <strong>phase de finalisation</strong> du projet Aligno, précédant la livraison de la version de production. Cette phase, souvent sous-estimée, est pourtant déterminante pour la qualité perçue de l'application et sa viabilité à long terme.</p>
<ul>
  <li><strong>SEO et métadonnées</strong> : Implémentation de useHead() sur toutes les pages de l'application avec des titres, meta descriptions, Open Graph et URLs canoniques pertinents.</li>
  <li><strong>Optimisation des performances</strong> : Audit des bundles JavaScript avec <code>nuxt analyze</code>, lazy loading des composants non critiques, optimisation des images avec <code>@nuxt/image</code>.</li>
  <li><strong>Accessibilité (WCAG AA)</strong> : Audit de l'arborescence ARIA, contraste des couleurs, navigation clavier, labels des formulaires, attributs alt sur toutes les images.</li>
  <li><strong>Dark Mode / Light Mode</strong> : Intégration du mécanisme de thème système de Nuxt UI, persistance du choix dans le store Pinia.</li>
  <li><strong>Système de notifications</strong> : Intégration de <strong>Notivue</strong> comme système de toast global, avec des notifiations de succès, d'erreur et d'information cohérentes dans toute l'application.</li>
  <li><strong>Fusion des branches et livraison</strong> : Gestion des Pull Requests finales, résolution des conflits Git, merge dans <code>main</code>, validation du pipeline CI complet, livraison du build de production.</li>
</ul>`;

const CHAPTER6 = `<div class="page-break"></div>
${chapterHeader(6, 'Présentation des Technologies')}
${table(
  ['Technologie', 'Version', 'Rôle', 'Avantages / Utilisation concrète'],
  [
    ['Nuxt 4', '4.x', 'Framework Full-Stack', 'SSR, file-based routing, server Nitro intégré. Utilisé comme unique framework pour le frontend ET le backend d\'Aligno.'],
    ['Vue 3', '3.5+', 'Framework UI', 'Composition API, réactivité fine, slots scopés. Tous les composants d\'interface d\'Aligno sont en Vue 3.'],
    ['TypeScript', '5.x', 'Typage statique', 'Détection d\'erreurs à la compilation, contrats d\'interface entre les couches. Strict mode activé.'],
    ['Tailwind CSS v4', '4.x', 'Framework CSS', 'Utility-first, Vite plugin natif, sans conflict avec Nuxt UI. Design system Midnight Obsidian défini avec des variables CSS.'],
    ['Nuxt UI', '3.x', 'Composants UI', 'Bibliothèque de composants (Button, Input, Modal, Table…) construite sur Tailwind v4. Système de thèmes intégré.'],
    ['Pinia', '2.x', 'State Management', 'Store réactif avec support TypeScript natif. Stores : useAuthStore, useWalletStore, useKanbanStore…'],
    ['Pinia Persisted', '3.x', 'Persistance', 'Persistance sélective des stores dans localStorage (user, préférences de thème). Access token non persisté.'],
    ['ApexCharts', '3.x', 'Graphiques', 'Graphiques analytiques du module Wallet (revenus/dépenses par mois, répartition par catégorie).'],
    ['VueUse', '12.x', 'Composables utils', 'useLocalStorage, useEventListener, useMediaQuery… Réutilisation de patterns courants.'],
    ['Next.js', '14.x', 'Framework SSR', 'App Router avec SSR/SSG pour SikBeauty. generateMetadata pour le SEO dynamique.'],
  ],
  'Tableau 10 : Fiches technologiques — Stack Frontend'
)}
${table(
  ['Technologie', 'Version', 'Rôle', 'Avantages / Utilisation concrète'],
  [
    ['Prisma ORM', '5.x', 'Accès BDD', 'Schéma typé, migrations auto, requêtes type-safe. Adapter pg pour pool de connexions PostgreSQL.'],
    ['PostgreSQL', '17', 'Base de données', 'ACID, relations, UUID/CUID. Tables : users, projects, kanban_columns, cards, transactions, bank_accounts…'],
    ['Zod', '3.x', 'Validation', 'Schémas de validation runtime avec inférence TypeScript. Chaque endpoint API dispose de son schéma Zod dédié.'],
    ['JWT (jose)', '5.x', 'Tokens', 'Génération et vérification des access (15min) et refresh (30j) tokens. jose pour un support ESM natif.'],
    ['bcrypt', '5.x', 'Hachage MDP', '12 rounds de sel. Comparaison à temps constant pour résister aux attaques timing.'],
    ['Resend', '3.x', 'E-mails', 'API d\'envoi d\'e-mails transactionnels. Templates en Vue Email (VerificationEmail, PasswordResetEmail).'],
    ['Socket.IO', '4.x', 'Temps réel', 'Mise à jour en temps réel du Kanban (déplacement de cartes, notifications). Connecté avec Redis Adapter.'],
    ['Redis', '7.x', 'Cache + Queue', 'Broker pour Socket.IO Adapter (sync multi-instances) et backend de BullMQ (queues d\'e-mails différés).'],
    ['BullMQ', '5.x', 'File de messages', 'Jobs de rappels de dates d\'échéance (due date reminders) pour les cartes Kanban.'],
    ['Pino', '9.x', 'Logging', 'Logger JSON structuré haute performance. pino-pretty pour le dev, JSON brut pour la production/Sentry.'],
    ['Sentry', '8.x', 'Monitoring', 'Capture des exceptions runtime (désactivé en NODE_ENV=test). DSN configuré en variable d\'environnement.'],
  ],
  'Tableau 11 : Fiches technologiques — Stack Backend et Temps Réel'
)}
${table(
  ['Technologie', 'Rôle', 'Utilisation concrète'],
  [
    ['Docker', 'Conteneurisation', 'Dockerfile multi-stage pour Next.js (SikBeauty) et Nuxt 4 (Aligno). Image de prod ~140Mo.'],
    ['Docker Compose', 'Orchestration', 'Services : app, postgres_db, redis, pgadmin. Health checks et depends_on pour l\'ordre de démarrage.'],
    ['GitHub Actions', 'CI/CD', 'Pipelines : install, generate, type-check, migrate, test, (deploy SSH). Déclenchés sur PR vers main/dev.'],
    ['Hostinger VPS', 'Hébergement', 'Ubuntu Server. Nginx reverse proxy + Let\'s Encrypt SSL + Docker Compose en prod.'],
    ['Git / GitHub', 'Versioning', 'Git Flow : main, dev, feature/*, fix/*. PRs obligatoires, revues de code systématiques.'],
    ['Vitest', 'Tests', '35 tests d\'intégration Auth (Aligno). Sequential mode pour éviter les race conditions PostgreSQL.'],
    ['Husky', 'Git Hooks', 'Hook pre-push : exécute vitest run dans le conteneur Docker avant chaque push.'],
    ['Nuxt Security', 'Sécurité', 'Headers CSP, X-Frame-Options, X-Content-Type-Options, CORS configurés automatiquement.'],
  ],
  'Tableau 12 : Fiches technologiques — DevOps, Qualité et Sécurité'
)}`;

const CHAPTER7 = `<div class="page-break"></div>
${chapterHeader(7, 'Difficultés Rencontrées — Études de Cas')}
<p>Cette section présente les difficultés techniques et organisationnelles les plus significatives rencontrées durant le stage, sous forme d'études de cas structurées. Chaque cas est analysé rigoureusement afin d'en tirer des enseignements durables.</p>

${caseStudy(
  'Cas 1 : Erreur de compilation vue-tsc dans le pipeline CI/CD',
  'Configuration du pipeline GitHub Actions pour le projet Aligno. Node.js v24 était utilisé dans l\'environnement CI.',
  'La commande <code>npx vue-tsc --noEmit</code> échouait avec l\'erreur <code>ERR_PACKAGE_PATH_NOT_EXPORTED</code> : le sous-chemin <code>./lib/tsc</code> n\'était pas exporté par le package TypeScript installé. Le pipeline CI était bloquant.',
  'L\'exécuteur <code>npx</code> installait une version globale de <code>vue-tsc</code> (3.3.7) qui tentait d\'importer <code>./lib/tsc</code> depuis TypeScript. Cette exportation n\'est plus disponible dans TypeScript ≥ 5.0 via le nouveau champ <code>exports</code> du package.json. La version globale de vue-tsc était incompatible avec la version locale de TypeScript.',
  'Remplacement de <code>npx vue-tsc --noEmit</code> par <code>./node_modules/.bin/vue-tsc --noEmit</code> dans le workflow CI. Ajout de <code>vue-tsc</code> dans les <code>devDependencies</code> du <code>package.json</code> pour garantir sa présence après <code>npm ci</code>.',
  'Le pipeline CI passe en totalité. La vérification des types TypeScript est désormais stable et reproductible dans tous les environnements (local et CI).',
  'Toujours préférer les binaires locaux (via <code>node_modules/.bin/</code>) aux outils globaux installés via <code>npx</code> dans les pipelines CI, afin d\'assurer la cohérence des versions entre développement et intégration continue.'
)}

${caseStudy(
  'Cas 2 : Intégration de Resend dans les tests Vitest',
  'Exécution de la suite de tests d\'authentification en environnement de CI GitHub Actions, avec une clé API Resend de test factice.',
  'Les tests de l\'endpoint <code>/api/auth/register</code> et <code>/api/auth/forgot-password</code> échouaient avec une erreur 401 de l\'API Resend, car la clé API configurée dans les secrets CI était invalide. La fonctionnalité d\'envoi d\'e-mail est obligatoire dans le flux d\'inscription.',
  'En environnement de test, les e-mails ne doivent pas être réellement envoyés. Mock complet du service Resend aurait été une option, mais cela aurait réduit la valeur des tests d\'intégration. La solution devait être transparente pour le reste du code.',
  'Implémentation d\'une logique <code>shouldSkip()</code> dans le EmailService : si <code>NODE_ENV === \'test\'</code> OU si le domaine de l\'e-mail destinataire est <code>example.com</code>, l\'appel Resend est bypassé et un message est loggué. Les tokens de vérification sont quand même générés et persistés, permettant aux tests de les récupérer directement en base.',
  'Les 35 tests passent en CI sans aucun appel réel à l\'API Resend. La logique d\'authentification est testée de bout-en-bout sans dépendance externe. Le comportement en production reste inchangé.',
  'La gestion des dépendances externes (APIs tierces, services e-mail) dans les tests d\'intégration nécessite des mécanismes de contournement conditionnels. Il vaut mieux implémenter un bypass basé sur l\'environnement que de mocker entièrement un service, car cela préserve la valeur des tests d\'intégration.'
)}

${caseStudy(
  'Cas 3 : Migration React vers Next.js — Incompatibilités SSR',
  'Migration des pages de la marketplace SikBeauty de React (Create React App) vers Next.js App Router.',
  'Plusieurs composants React utilisaient directement des APIs du navigateur (<code>window.scrollY</code>, <code>localStorage.getItem</code>, <code>document.querySelector</code>) dans des hooks <code>useEffect</code> ou dans le corps de composants fonctionnels. Ces accès provoquaient des erreurs de type <code>ReferenceError: window is not defined</code> lors du rendu côté serveur.',
  'Next.js exécute les Server Components et le rendu initial des Client Components côté serveur (Node.js), où <code>window</code>, <code>document</code> et <code>localStorage</code> n\'existent pas. Ces accès doivent être soit protégés par une condition <code>typeof window !== \'undefined\'</code>, soit déplacés dans des hooks <code>useEffect</code> qui s\'exécutent uniquement côté client.',
  'Audit systématique de tous les composants avec un script de recherche grep identifiant les occurrences de <code>window</code>, <code>document</code> et <code>localStorage</code>. Refactorisation : (1) extraction dans des <code>useEffect</code> avec tableau de dépendances vide, (2) utilisation de <code>next/dynamic</code> avec <code>ssr: false</code> pour les composants non-SSR-compatibles, (3) remplacement de <code>localStorage</code> par <code>useCookie</code> de Nuxt (accessible côté serveur).',
  'Tous les composants migrés s\'exécutent sans erreur en SSR. Le TTFB passe de 1.2s à 0.25s. L\'indexation Google des fiches produits passe de partielle à 100%.',
  'La migration vers SSR requiert une revue architecturale préalable rigoureuse. Les patterns React classiques (accès DOM dans le corps des composants) ne sont pas directement transposables. Une migration réussie impose un audit complet avant de commencer.'
)}`;

const CHAPTER8 = `<div class="page-break"></div>
${chapterHeader(8, 'Bilan des Compétences Acquises')}
${table(
  ['Compétence technique', 'Niveau avant le stage', 'Niveau après le stage', 'Preuve concrète'],
  [
    ['Architecture logicielle (couches)', '<span class="badge badge-before">Débutant</span>', '<span class="badge badge-after">Avancé</span>', 'Conception et implémentation de l\'architecture 6 couches d\'Aligno.'],
    ['Développement Backend Node.js', '<span class="badge badge-before">Intermédiaire</span>', '<span class="badge badge-after">Expert</span>', 'Module Auth complet avec sécurité avancée JWT, bcrypt, Zod.'],
    ['Tests d\'intégration (Vitest)', '<span class="badge badge-before">Débutant</span>', '<span class="badge badge-after">Avancé</span>', '35 tests d\'intégration couvrant 9 fichiers et 100% des endpoints Auth.'],
    ['DevOps & CI/CD', '<span class="badge badge-before">Débutant</span>', '<span class="badge badge-after">Autonome</span>', 'Pipelines GitHub Actions, Dockerfiles multi-stage, déploiement VPS.'],
    ['SSR / Next.js App Router', '<span class="badge badge-before">Intermédiaire</span>', '<span class="badge badge-after">Expert</span>', 'Migration SikBeauty : SEO 98/100 Lighthouse, TTFB 0.25s.'],
    ['SEO technique', '<span class="badge badge-before">Notions</span>', '<span class="badge badge-after">Avancé</span>', 'Métadonnées dynamiques, sitemap, Open Graph, robots.txt, Structured Data.'],
    ['Sécurité Web', '<span class="badge badge-before">Notions</span>', '<span class="badge badge-after">Avancé</span>', 'Dual-token JWT, HttpOnly cookies, anti-énumération, hachage SHA-256.'],
    ['TypeScript avancé', '<span class="badge badge-before">Intermédiaire</span>', '<span class="badge badge-after">Expert</span>', 'DTOs génériques, interfaces DAO, type guards, strict mode complet.'],
    ['PostgreSQL + Prisma ORM', '<span class="badge badge-before">Intermédiaire</span>', '<span class="badge badge-after">Avancé</span>', 'Schéma complet, migrations, requêtes complexes avec relations include.'],
    ['Accessibilité (WCAG)', '<span class="badge badge-before">Notions</span>', '<span class="badge badge-after">Intermédiaire</span>', 'Audit ARIA, contraste, navigation clavier appliqués en phase finale.'],
  ],
  'Tableau 13 : Bilan comparatif des compétences techniques — Avant et Après le stage'
)}

${table(
  ['Compétence transversale', 'Niveau avant', 'Niveau après', 'Situation révélatrice'],
  [
    ['Leadership technique', '<span class="badge badge-before">Aucun</span>', '<span class="badge badge-after">Confirmé</span>', 'Direction de l\'équipe de 5 développeurs sur 2 projets simultanés.'],
    ['Scrum Master', '<span class="badge badge-before">Théorique</span>', '<span class="badge badge-after">Opérationnel</span>', 'Animation de 8 sprints, planification, résolution des blocages.'],
    ['Revue de code', '<span class="badge badge-before">Notions</span>', '<span class="badge badge-after">Avancé</span>', 'Review de 100% des PR sur les deux projets, refactorisation guidée.'],
    ['Communication technique', '<span class="badge badge-before">Intermédiaire</span>', '<span class="badge badge-after">Expert</span>', 'Documentation, User Stories, sessions de pair-programming, Daily Meetings.'],
    ['Résolution de problèmes', '<span class="badge badge-before">Intermédiaire</span>', '<span class="badge badge-after">Expert</span>', 'Résolution des 3 cas d\'étude présentés dans le chapitre précédent.'],
    ['Gestion du temps & priorisation', '<span class="badge badge-before">Intermédiaire</span>', '<span class="badge badge-after">Avancé</span>', 'Gestion simultanée de 2 projets avec planification Jira rigoureuse.'],
    ['Mentorat', '<span class="badge badge-before">Aucun</span>', '<span class="badge badge-after">Confirmé</span>', 'Accompagnement des développeurs lors de la migration Next.js.'],
  ],
  'Tableau 14 : Bilan des compétences transversales et managériales — Avant et Après le stage'
)}`;

const CHAPTER9 = `<div class="page-break"></div>
${chapterHeader(9, 'Résultats Obtenus')}
${table(
  ['Livrable / Objectif', 'Indicateur de succès', 'Résultat obtenu', 'Statut'],
  [
    ['Migration SikBeauty (Next.js)', 'Score SEO Lighthouse ≥ 90', '98/100 Lighthouse SEO', '✅ Dépassé'],
    ['Performance SikBeauty', 'FCP < 1.5s', 'FCP = 0.8s', '✅ Dépassé'],
    ['Infrastructure CI/CD', 'Pipeline fonctionnel sur PR', 'Pipeline en 5 étapes complet', '✅ Atteint'],
    ['Déploiement VPS', 'Application accessible en prod', 'App + SSL + Domaine configurés', '✅ Atteint'],
    ['Module Auth Backend (Aligno)', 'Tous les endpoints implémentés', '8 endpoints + 2 middlewares', '✅ Complet'],
    ['Tests d\'intégration Auth', 'Couverture ≥ 30 tests', '35 tests, 100% passing', '✅ Dépassé'],
    ['Module Auth Frontend', 'Toutes les pages Auth livrées', '6 pages + composants réutilisables', '✅ Complet'],
    ['Coordination Scrum Master', '4 sprints livrés dans les délais', '4 sprints, 0 retard de livraison', '✅ Atteint'],
    ['Phase finale Aligno', 'Dark Mode + SEO + Accessibilité', 'Tous les critères validés', '✅ Complet'],
    ['Documentation technique', 'Docs à jour (READMEs + Swagger)', 'Swagger + 11 fichiers docs/', '✅ Atteint'],
  ],
  'Tableau 15 : Récapitulatif des indicateurs clés et résultats du stage'
)}`;

const CONCLUSION = `<div class="page-break"></div>
<h1 class="chapter-title">Conclusion Générale</h1>
<p>Ce stage de fin de formation au sein de Landmark Agency a représenté bien plus qu'une simple validation des acquis théoriques. Il s'est révélé être une véritable immersion dans la réalité des défis d'un développement professionnel : gestion de la complexité technique, coordination humaine, respect des délais, prise de décision sous contrainte et responsabilité vis-à-vis d'une équipe et d'un client.</p>
<p>Sur le plan <strong>technique</strong>, les deux mois de stage m'ont permis de consolider et d'approfondir un spectre de compétences très large. La migration de SikBeauty m'a confronté aux réalités de la modernisation d'un système existant, avec toutes ses contraintes de compatibilité et ses exigences de performance. Le développement d'Aligno m'a offert l'opportunité, rare en stage, de concevoir et d'implémenter une architecture logicielle complète de zéro, en faisant des choix techniques réfléchis et en les assumant tout au long du projet. La mise en place du pipeline DevOps et la gestion de l'infrastructure de production m'ont donné une vision globale du cycle de vie d'une application web moderne, de la première ligne de code jusqu'au déploiement en production.</p>
<p>Sur le plan <strong>méthodologique et humain</strong>, le rôle de Scrum Master a été la dimension la plus formatrice de ce stage. Coordonner une équipe de cinq personnes, animer des cérémonies Scrum, résoudre des conflits et maintenir une cadence de livraison régulière ont développé des compétences de leadership que l'apprentissage individuel ne peut pas reproduire. J'ai appris que la qualité d'une livraison logicielle dépend autant de la qualité de la communication et de l'organisation que de la qualité du code lui-même.</p>
<p>L'expérience chez Landmark Agency m'a également confirmé dans mon orientation professionnelle. Le double rôle de Lead Developer et de Scrum Master correspond parfaitement à mes ambitions : je souhaite évoluer vers un profil d'ingénieur Full-Stack spécialisé en architecture logicielle et DevOps, capable à la fois de concevoir des systèmes complexes et de conduire une équipe technique vers ses objectifs.</p>
<p>Les perspectives ouvertes par ce stage sont nombreuses. Les projets SikBeauty et Aligno continueront d'évoluer et d'accueillir de nouvelles fonctionnalités. La qualité de l'architecture mise en place sur Aligno garantit une scalabilité sereine de l'application. À titre personnel, ce stage constitue un tremplin solide vers une carrière d'ingénieur en développement logiciel, avec une feuille de route claire : approfondir mes connaissances en architecture distribuée, en orchestration Kubernetes et en pratiques de sécurité avancées.</p>`;

const ANNEXES = `<div class="page-break"></div>
${chapterHeader('—', 'Annexes')}
<h2>Annexe A : Structure des répertoires du projet Aligno</h2>
<div class="code-block">Aligno/
├── app/                        <span class="cm"># Frontend Nuxt 4 (Vue 3)</span>
│   ├── pages/                  <span class="cm"># Routes (login, register, dashboard...)</span>
│   ├── components/             <span class="cm"># Composants Vue réutilisables</span>
│   ├── stores/                 <span class="cm"># Stores Pinia (auth, wallet, kanban)</span>
│   ├── composables/            <span class="cm"># Composables (useAuth, useWallet...)</span>
│   ├── layouts/                <span class="cm"># Layouts (auth, default)</span>
│   └── types/                  <span class="cm"># Interfaces TypeScript partagées</span>
├── server/                     <span class="cm"># Backend Nitro (API REST)</span>
│   ├── api/                    <span class="cm"># Route Handlers (GET, POST, PUT...)</span>
│   ├── controller/             <span class="cm"># Controllers (validation, réponses)</span>
│   ├── service/                <span class="cm"># Services (logique métier)</span>
│   ├── repository/             <span class="cm"># Repositories (Prisma queries)</span>
│   ├── dao/                    <span class="cm"># Interfaces DAO (contrats)</span>
│   ├── dto/                    <span class="cm"># Data Transfer Objects</span>
│   ├── mapper/                 <span class="cm"># Mappers (entity → DTO)</span>
│   ├── middleware/             <span class="cm"># Auth + Guest middleware</span>
│   ├── validations/            <span class="cm"># Schémas Zod par endpoint</span>
│   ├── emails/                 <span class="cm"># Templates Vue Email (Resend)</span>
│   └── utils/                  <span class="cm"># Prisma, Logger, Crypto, Sentry</span>
├── prisma/                     <span class="cm"># Schémas Prisma + migrations</span>
│   ├── models/                 <span class="cm"># user.prisma, project.prisma...</span>
│   └── migrations/             <span class="cm"># Historique des migrations SQL</span>
├── server/test/                <span class="cm"># Suite de tests Vitest</span>
│   └── auth/                   <span class="cm"># 9 fichiers × 35 tests</span>
├── .github/workflows/          <span class="cm"># CI/CD GitHub Actions</span>
├── docker-compose.yml          <span class="cm"># Orchestration locale</span>
├── Dockerfile                  <span class="cm"># Image Docker Nuxt 4</span>
└── nuxt.config.ts              <span class="cm"># Configuration Nuxt</span></div>

<h2>Annexe B : Extrait du schéma Prisma (modèle User)</h2>
<div class="code-block"><span class="kw">model</span> <span class="fn">User</span> {
  id                     <span class="kw">String</span>    <span class="kw">@id</span> <span class="kw">@default</span>(<span class="fn">cuid</span>())
  first_name             <span class="kw">String</span>
  last_name              <span class="kw">String</span>
  age                    <span class="kw">Int</span>
  email                  <span class="kw">String</span>    <span class="kw">@unique</span>
  phone                  <span class="kw">String</span>    <span class="kw">@unique</span>
  password_hash          <span class="kw">String</span>
  profile_picture_url    <span class="kw">String</span>?
  email_verified         <span class="kw">Boolean</span>   <span class="kw">@default</span>(<span class="str">false</span>)
  email_verify_token     <span class="kw">String</span>?   <span class="cm">// SHA-256 hash</span>
  email_verify_expires   <span class="kw">DateTime</span>? <span class="cm">// 24h TTL</span>
  refresh_token          <span class="kw">String</span>?   <span class="cm">// SHA-256 hash</span>
  reset_password_token   <span class="kw">String</span>?   <span class="cm">// SHA-256 hash</span>
  reset_password_expires <span class="kw">DateTime</span>? <span class="cm">// 1h TTL</span>
  created_at             <span class="kw">DateTime</span>  <span class="kw">@default</span>(<span class="fn">now</span>())
  updated_at             <span class="kw">DateTime</span>  <span class="kw">@updatedAt</span>

  <span class="cm">// Relations</span>
  projects     <span class="fn">ProjectMember</span>[]
  bank_accounts <span class="fn">BankAccount</span>[]

  <span class="kw">@@map</span>(<span class="str">"users"</span>)
}</div>

<h2>Annexe C : Extrait du pipeline CI/CD (.github/workflows/ci.yml)</h2>
<div class="code-block"><span class="kw">name</span>: <span class="str">Aligno CI Quality Gate</span>
<span class="kw">on</span>:
  pull_request:
    <span class="kw">branches</span>: [main, dev]

<span class="kw">jobs</span>:
  <span class="fn">validate</span>:
    <span class="kw">runs-on</span>: ubuntu-latest
    <span class="kw">services</span>:
      <span class="fn">postgres</span>:
        <span class="kw">image</span>: postgres:16
        <span class="kw">env</span>:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: password
    <span class="kw">steps</span>:
      - <span class="kw">uses</span>: actions/checkout@v4
      - <span class="kw">name</span>: <span class="str">Install dependencies</span>
        <span class="kw">run</span>: npm ci
      - <span class="kw">name</span>: <span class="str">Generate Prisma Client & Nuxt Types</span>
        <span class="kw">run</span>: npx prisma generate && npx nuxt prepare
      - <span class="kw">name</span>: <span class="str">Apply DB migrations</span>
        <span class="kw">run</span>: npx prisma migrate deploy
      - <span class="kw">name</span>: <span class="str">TypeScript type check</span>
        <span class="kw">run</span>: ./node_modules/.bin/vue-tsc --noEmit
      - <span class="kw">name</span>: <span class="str">Run full test suite</span>
        <span class="kw">run</span>: npm run test</div>

<div class="info-box">
  <p><strong>[Réservé — Figure 8]</strong> Capture d'écran du tableau Kanban sur Jira en fin de Sprint 3. Le tableau montre les tickets répartis en colonnes : Todo, In Progress, In Review, Done.</p>
</div>
<div class="info-box">
  <p><strong>[Réservé — Figure 9]</strong> Capture d'écran du rapport Lighthouse SEO de la marketplace SikBeauty après migration Next.js — Score : 98/100.</p>
</div>
<div class="info-box">
  <p><strong>[Réservé — Figure 10]</strong> Capture d'écran du pipeline GitHub Actions en cours d'exécution — Étapes : Install, Generate, Type-check, Test (35/35 passed).</p>
</div>`;

// ──────────────────────────────────────────────────────────────────────────────
// ASSEMBLE FINAL HTML
// ──────────────────────────────────────────────────────────────────────────────

const FULL_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Stage — Badr Eddine Slaoui</title>
  <style>${CSS}</style>
</head>
<body>
${COVER}
${RESUME}
${REMERCIEMENTS}
${TOC}
${LIST_FIGS_TABLES}
${INTRODUCTION}
${CHAPTER1}
${CHAPTER2}
${CHAPTER3}
${CHAPTER4}
${CHAPTER5}
${CHAPTER6}
${CHAPTER7}
${CHAPTER8}
${CHAPTER9}
${CONCLUSION}
${ANNEXES}
</body>
</html>`;

// ──────────────────────────────────────────────────────────────────────────────
// WRITE AND COMPILE
// ──────────────────────────────────────────────────────────────────────────────
const htmlPath = path.join(DIR, 'index.html');
fs.writeFileSync(htmlPath, FULL_HTML, 'utf8');
console.log(`✅ index.html written (${Math.round(fs.statSync(htmlPath).size / 1024)} Ko)`);

const pdfPath = path.join(DIR, 'Rapport_de_Stage_Badr_Eddine_Slaoui.pdf');
console.log('⏳ Compiling PDF with Chromium headless...');
try {
  execSync(`chromium --headless=new --disable-gpu --no-sandbox --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${htmlPath}" 2>&1`, { stdio: 'inherit' });
  const kb = Math.round(fs.statSync(pdfPath).size / 1024);
  console.log(`✅ PDF generated: ${pdfPath} (${kb} Ko)`);
} catch (e) {
  // Fallback to old flag
  try {
    execSync(`chromium --headless --disable-gpu --no-sandbox --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${htmlPath}" 2>&1`, { stdio: 'inherit' });
    const kb = Math.round(fs.statSync(pdfPath).size / 1024);
    console.log(`✅ PDF generated: ${pdfPath} (${kb} Ko)`);
  } catch (e2) {
    console.error('❌ Chromium error:', e2.message);
    process.exit(1);
  }
}
