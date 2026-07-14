'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR = __dirname;
const YOUCODE_PATH = path.join(DIR, 'youcode.jpeg');
const LANDMARK_PATH = path.join(DIR, 'landmark.jpeg');

// Helper to convert images to Base64
function getBase64Image(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
  } catch (err) {
    console.warn(`⚠️ Warning: Image not found at ${filePath}. Fallback string used.`);
    return '';
  }
}

const youcodeBase64 = getBase64Image(YOUCODE_PATH);
const landmarkBase64 = getBase64Image(LANDMARK_PATH);

// --------------------------------------------------------------------------
// HTML & CSS Template
// --------------------------------------------------------------------------
const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport de Stage - Badr Eddine Slaoui</title>
  <style>
    /* CSS global et réinitialisation */
    @page {
      size: A4;
      margin: 2.5cm;
    }
    
    @page :first {
      margin: 0;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111827;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
    }

    h1, h2, h3, h4 {
      font-family: 'Times New Roman', Times, serif;
      font-weight: bold;
      color: #1a3f8f;
      page-break-after: avoid;
    }

    h1 {
      font-size: 14pt;
      margin-top: 24pt;
      margin-bottom: 12pt;
      border-bottom: 2px solid #1a3f8f;
      padding-bottom: 4pt;
      text-transform: uppercase;
    }

    h2 {
      font-size: 13pt;
      margin-top: 18pt;
      margin-bottom: 8pt;
      color: #1e4db7;
    }

    h3 {
      font-size: 12pt;
      margin-top: 14pt;
      margin-bottom: 6pt;
      color: #2563eb;
    }

    p {
      margin-top: 0;
      margin-bottom: 12pt;
      text-align: justify;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 12pt;
      padding-left: 20pt;
      text-align: justify;
    }

    li {
      margin-bottom: 6pt;
    }

    .page-break {
      page-break-before: always;
    }

    /* Couverture Premium */
    .cover-page {
      width: 210mm;
      height: 297mm;
      box-sizing: border-box;
      padding: 2.5cm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(135deg, #08132a 0%, #151f37 100%);
      color: #ffffff;
      position: relative;
      page-break-after: always;
    }

    .cover-logos {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cover-logos img {
      max-height: 50px;
      object-fit: contain;
    }

    .cover-logos span {
      font-size: 24pt;
      font-weight: bold;
      color: #00e5ff;
    }

    .cover-title-area {
      text-align: center;
      margin-top: 40mm;
    }

    .cover-subtitle {
      font-size: 14pt;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #00e5ff;
      margin-bottom: 10pt;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: bold;
      line-height: 1.2;
      margin-bottom: 20pt;
      color: #ffffff;
    }

    .cover-divider {
      width: 100px;
      height: 4px;
      background-color: #00e5ff;
      margin: 0 auto 30pt auto;
    }

    .cover-info {
      width: 100%;
      margin-top: auto;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 20pt;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15pt;
      font-size: 11pt;
    }

    .cover-grid-item span {
      display: block;
      color: #bac9cc;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2pt;
    }

    .cover-grid-item strong {
      color: #ffffff;
    }

    /* Style des tableaux */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12pt;
      margin-bottom: 18pt;
      font-size: 10pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #bfdbfe;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #1a3f8f;
      color: #ffffff;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 9.5pt;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .table-caption {
      text-align: center;
      font-style: italic;
      font-size: 9.5pt;
      color: #6b7280;
      margin-top: -12pt;
      margin-bottom: 18pt;
    }

    /* Éléments esthétiques additionnels */
    .note-box {
      border-left: 4px solid #00e5ff;
      background-color: #f0fafd;
      padding: 12pt;
      margin-top: 12pt;
      margin-bottom: 12pt;
      border-radius: 0 8px 8px 0;
    }

    .note-box p:last-child {
      margin-bottom: 0;
    }

    /* Diagrammes SVG */
    .diagram-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 20pt 0;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15pt;
      page-break-inside: avoid;
    }

    .diagram-caption {
      text-align: center;
      font-style: italic;
      font-size: 9.5pt;
      color: #6b7280;
      margin-top: -10pt;
      margin-bottom: 20pt;
    }

    /* Header et Footer simulation via CSS paged media */
    .header-space, .footer-space {
      height: 15mm;
    }

    .header-sim {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 10mm;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #6b7280;
      font-style: italic;
    }

    .footer-sim {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 10mm;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #6b7280;
    }

    /* Table des matières */
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 6pt;
    }

    .toc-item-title {
      font-weight: bold;
    }

    .toc-item-dots {
      flex-grow: 1;
      border-bottom: 1px dotted #94a3b8;
      margin: 0 10px;
      position: relative;
      top: -4px;
    }

    .toc-item-page {
      font-weight: bold;
    }

    .toc-subitem {
      margin-left: 20pt;
      font-size: 11pt;
    }

    .toc-subitem .toc-item-title {
      font-weight: normal;
      color: #475569;
    }

    .toc-subitem .toc-item-page {
      font-weight: normal;
      color: #475569;
    }
  </style>
</head>
<body>

  <!-- ========================================== -->
  <!-- PAGE DE COUVERTURE -->
  <!-- ========================================== -->
  <div class="cover-page">
    <div class="cover-logos">
      <img src="${youcodeBase64}" alt="YouCode Safi">
      <span>×</span>
      <img src="${landmarkBase64}" alt="Landmark Agency">
    </div>

    <div class="cover-title-area">
      <div class="cover-subtitle">Mémoire de Fin de Formation</div>
      <h1 class="cover-title" style="border:none; color:#ffffff; font-size:26pt; text-transform:none;">
        Rapport de Stage de Fin de Cycle<br>
        Développement Full-Stack & Coordination Agile
      </h1>
      <div class="cover-divider"></div>
      <p style="text-align:center; color:#bac9cc; font-size:13pt;">
        Intégration d'un cycle DevOps, refactorisation d'une architecture e-commerce et création from scratch d'un écosystème de productivité
      </p>
    </div>

    <div class="cover-info">
      <div class="cover-grid">
        <div class="cover-grid-item">
          <span>Stagiaire</span>
          <strong>Badr Eddine Slaoui</strong>
        </div>
        <div class="cover-grid-item">
          <span>Encadrant Professionnel</span>
          <strong>M. LATRACH Mohammed (Landmark Agency)</strong>
        </div>
        <div class="cover-grid-item">
          <span>Formateur Référent</span>
          <strong>M. Saad Shaimer (YouCode Safi)</strong>
        </div>
        <div class="cover-grid-item">
          <span>Conseillère Pédagogique (CME)</span>
          <strong>Mme Kaoutar Darroufi</strong>
        </div>
        <div class="cover-grid-item">
          <span>Période du stage</span>
          <strong>7 Mai 2026 — 7 Juillet 2026</strong>
        </div>
        <div class="cover-grid-item">
          <span>Année Universitaire</span>
          <strong>2025 — 2026</strong>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- RÉSUMÉ & ABSTRACT -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Résumé / Abstract</h1>
  
  <h2>Résumé</h2>
  <p>
    Ce rapport présente le bilan de mon stage de fin d'études d'une durée de deux mois (du 7 mai au 7 juillet 2026) au sein de l'agence numérique <strong>Landmark Agency</strong> à Oujda. Durant ce stage, j'ai exercé le rôle de <strong>Scrum Master</strong> et de <strong>Développeur Full-Stack</strong>. Mon intervention a porté sur deux projets majeurs aux défis complémentaires : <strong>SikBeauty</strong>, une marketplace e-commerce de cosmétiques coréens en phase d'industrialisation, et <strong>Aligno</strong>, un écosystème complet de productivité et de gestion de projets développé à partir de zéro.
  </p>
  <p>
    Sur le projet SikBeauty, j'ai orchestré la migration de composants React.js vers Next.js pour tirer profit du Server-Side Rendering (SSR) et maximiser le référencement naturel (SEO), tout en mettant en œuvre une chaîne DevOps complète (Docker, Docker Compose, CI/CD GitHub Actions, hébergement VPS Hostinger). Sur le projet Aligno, j'ai supervisé la planification des sprints, conçu l'architecture applicative globale en 6 couches, et développé de bout en bout les modules d'authentification sécurisés (JWT, cookies HttpOnly, chiffrement bcrypt) et la suite de tests unitaires et d'intégration via Vitest.
  </p>
  <p>
    <strong>Mots-clés :</strong> Nuxt 4, Next.js, Scrum Master, CI/CD, DevOps, Docker, Tests E2E, Sécurité JWT, Zod.
  </p>

  <h2 style="margin-top: 30pt;">Abstract</h2>
  <p>
    This internship report details my two-month graduation project (from May 7 to July 7, 2026) at the digital agency <strong>Landmark Agency</strong> in Oujda. During this period, I served as a <strong>Scrum Master</strong> and <strong>Full-Stack Developer</strong> on two distinct projects: <strong>SikBeauty</strong>, a Korean cosmetics e-commerce marketplace undergoing industrialization, and <strong>Aligno</strong>, a productivity and project management platform built from scratch.
  </p>
  <p>
    For SikBeauty, I led the migration of React.js features to Next.js to leverage Server-Side Rendering (SSR) and optimize SEO metrics. I also set up a robust DevOps pipeline utilizing Docker, Docker Compose, GitHub Actions, and VPS deployment on Hostinger. For Aligno, I managed sprint planning, designed a 6-layer clean backend architecture, and developed the secure authentication module (JWT, HttpOnly cookies, bcrypt hashing) alongside a comprehensive integration test suite with Vitest.
  </p>
  <p>
    <strong>Keywords:</strong> Nuxt 4, Next.js, Scrum Master, CI/CD, DevOps, Docker, E2E Testing, JWT Security, Zod.
  </p>

  <!-- ========================================== -->
  <!-- REMERCIEMENTS -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Remerciements</h1>
  <p>
    À l'issue de ce stage de fin de formation, je tiens à exprimer ma gratitude envers l'ensemble des personnes qui ont contribué au bon déroulement de cette expérience professionnelle.
  </p>
  <p>
    Je remercie chaleureusement mon tuteur en entreprise, <strong>M. LATRACH Mohammed</strong>, pour son accueil au sein de Landmark Agency, sa confiance, sa disponibilité constante, et ses précieux conseils techniques et méthodologiques tout au long de nos sprints de développement.
  </p>
  <p>
    Mes remerciements s'adresse également à l'équipe pédagogique de <strong>YouCode Safi</strong>, en particulier à mon formateur référent, <strong>M. Saad Shaimer</strong>, pour la qualité de sa formation et ses conseils avisés, ainsi qu'à <strong>Mme Kaoutar Darroufi</strong>, CME, pour son encadrement et son accompagnement précieux lors de la recherche et de la validation de mon stage.
  </p>
  <p>
    Enfin, je remercie mes camarades de promotion et collègues de stage avec qui j'ai partagé ces deux mois d'intenses livraisons techniques : <strong>Mouna Saoui</strong>, <strong>Brahim El Habchi</strong>, <strong>Yassine Nmila</strong>, et <strong>Khadija El Haddad</strong>. Notre cohésion d'équipe et notre rigueur dans l'application de nos rituels agiles ont été la clé de voûte de la réussite de nos projets.
  </p>

  <!-- ========================================== -->
  <!-- TABLES DES MATIÈRES / SOMMAIRE -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Table des matières</h1>
  
  <div class="toc-item">
    <span class="toc-item-title">Résumé / Abstract</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">II</span>
  </div>
  <div class="toc-item">
    <span class="toc-item-title">Remerciements</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">III</span>
  </div>
  
  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">INTRODUCTION GÉNÉRALE</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">1</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 1 : CONTEXTE ET ENVIRONNEMENT DE STAGE</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">2</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">1.1 Présentation de Landmark Agency</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">2</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">1.2 Présentation de YouCode Safi</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">3</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">1.3 Présentation de l'équipe de stage</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">4</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 2 : RÔLE DE SCRUM MASTER ET PRATIQUES DE DÉVELOPPEMENT</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">5</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">2.1 Rôle de Scrum Master</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">5</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">2.2 Cérémonies Scrum de Sprint</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">6</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">2.3 Gestion du workflow Git et Pull Requests</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">7</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 3 : ARCHITECTURE GLOBALE ET DIAGRAMMES ARCHITECTURAUX</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">8</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">3.1 Architecture Frontend, Backend & Base de données</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">8</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">3.2 Modèles UML & Base de données (ERD)</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">9</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 4 : PROJET SIKBEAUTY - INDUSTRIALISATION ET MIGRATION</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">11</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">4.1 Présentation globale du projet</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">11</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">4.2 Migration technique vers Next.js & Optimisations SEO</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">12</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">4.3 Infrastructure DevOps, Docker, CI/CD et déploiement VPS</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">14</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 5 : PROJET ALIGNO - ARCHITECTURE 6 COUCHES ET DEVELOPPEMENT FROM SCRATCH</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">16</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">5.1 Présentation du projet Aligno</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">16</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">5.2 Conception Backend du module d'Authentification</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">17</span>
  </div>
  <div class="toc-item toc-subitem">
    <span class="toc-item-title">5.3 Développement Frontend, Nuxt 4, Vue 3 et Pinia</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">20</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 6 : FICHES ET COMPARATIFS DES TECHNOLOGIES</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">23</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 7 : DIFFICULTÉS RENCONTRÉES ET SOLUTIONS APPORTÉES</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">25</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 8 : ANALYSE DES COMPÉTENCES ACQUISES</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">27</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CHAPITRE 9 : RÉSULTATS OBTENUS ET BILAN DU STAGE</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">29</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">CONCLUSION GÉNÉRALE</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">31</span>
  </div>

  <div class="toc-item" style="margin-top: 10pt;">
    <span class="toc-item-title">ANNEXES ET CAPTURES D'ÉCRAN</span>
    <span class="toc-item-dots"></span>
    <span class="toc-item-page">32</span>
  </div>

  <!-- ========================================== -->
  <!-- LISTE DES TABLEAUX & FIGURES -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Liste des tableaux</h1>
  <p><strong>Tableau 1 :</strong> Équipe projet et répartition des rôles (Page 4)</p>
  <p><strong>Tableau 2 :</strong> Cérémonies Scrum et planning hebdomadaire (Page 6)</p>
  <p><strong>Tableau 3 :</strong> Comparatif technique React SPA vs Next.js SSR (Page 13)</p>
  <p><strong>Tableau 4 :</strong> Routes API implémentées pour le module Auth d'Aligno (Page 18)</p>
  <p><strong>Tableau 5 :</strong> Fiche d'évaluation comparative des technologies clés (Page 23)</p>
  <p><strong>Tableau 6 :</strong> Bilan d'évolution des compétences techniques (Page 27)</p>
  <p><strong>Tableau 7 :</strong> Bilan d'évolution des compétences transversales et managériales (Page 28)</p>
  <p><strong>Tableau 8 :</strong> Tableau récapitulatif des indicateurs clés et scores (Page 29)</p>

  <h1 style="margin-top: 30pt;">Liste des figures</h1>
  <p><strong>Figure 1 :</strong> Topologie générale du système distribué Aligno (Page 8)</p>
  <p><strong>Figure 2 :</strong> Diagramme de cas d'utilisation (Use Case) de l'authentification (Page 9)</p>
  <p><strong>Figure 3 :</strong> Diagramme de classes UML du module Authentification d'Aligno (Page 10)</p>
  <p><strong>Figure 4 :</strong> Diagramme de séquence UML du processus d'inscription et validation (Page 10)</p>
  <p><strong>Figure 5 :</strong> Cycle de vie des tokens JWT (Access & Refresh tokens) (Page 19)</p>
  <p><strong>Figure 6 :</strong> Diagramme de transition d'état et restauration de session (Page 21)</p>
  <p><strong>Figure 7 :</strong> Structure globale des répertoires du projet Aligno (Page 32)</p>
  <p><strong>Figure 8 :</strong> Capture d'écran du tableau Kanban (Jira) en fin de sprint (Page 33)</p>
  <p><strong>Figure 9 :</strong> Résultat Lighthouse d'optimisation SEO de SikBeauty (Page 33)</p>

  <!-- ========================================== -->
  <!-- INTRODUCTION -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Introduction Générale</h1>
  <p>
    Le secteur du développement logiciel connaît aujourd'hui une accélération marquée, caractérisée par l'émergence constante de frameworks web performants, la généralisation des architectures conteneurisées et l'adoption systématique de pratiques DevOps au sein des structures de service. Dans ce contexte, l'apprentissage théorique doit nécessairement se confronter aux exigences réelles de production industrielle. C'est dans ce cadre que s'inscrit mon stage de fin d'études d'une durée de deux mois au sein de Landmark Agency.
  </p>
  <p>
    Ayant suivi le cursus de développement Full-Stack au sein de YouCode Safi, l'opportunité de rejoindre une structure agile et de diriger des développements d'envergure m'a permis d'agir simultanément sur deux projets distincts. D'une part, j'ai participé à la modernisation de <strong>SikBeauty</strong>, une marketplace de cosmétiques coréens, en effectuant la transition complexe d'une SPA React vers une application Next.js hautement optimisée pour le référencement naturel. D'autre part, j'ai piloté l'initialisation et le développement from scratch d'<strong>Aligno</strong>, un outil de productivité modulaire à destination des équipes agiles.
  </p>
  <p>
    Ma mission a revêtu une dimension double. Au niveau organisationnel, j'ai agi en tant que <strong>Scrum Master</strong>, coordonnant une équipe de 5 stagiaires, planifiant les livraisons de sprints et structurant notre workflow Git. Au niveau technique, j'ai assuré la conception architecturale, la sécurisation des flux de données et l'implémentation de la couverture de tests automatiques.
  </p>
  <p>
    Ce rapport détaille la méthodologie adoptée, les choix d'architecture logicielle retenus, ainsi que la manière dont nous avons surmonté les contraintes réelles pour aboutir à des livraisons logicielles prêtes pour la mise en production.
  </p>

  <!-- ========================================== -->
  <!-- CHAPITRE 1 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 1 : Contexte et Environnement de Stage</h1>
  
  <h2>1.1 Présentation de Landmark Agency</h2>
  <p>
    <strong>Landmark Agency</strong> est une agence de services numériques innovante basée à Oujda. Spécialisée dans la conception d'applications web et mobiles de pointe, l'architecture cloud et le conseil en transformation digitale, l'agence accompagne ses clients dans la réalisation de solutions technologiques sur mesure.
  </p>
  <p>
    L'organisation interne de l'agence s'appuie sur des équipes multidisciplinaires travaillant en synergie selon des processus de développement agiles. Sa culture d'entreprise met l'accent sur l'excellence technique, la formation continue et l'adoption rapide de stacks technologiques performantes et modernes. La méthodologie Agile Scrum y est utilisée au quotidien pour piloter les développements et maximiser la valeur livrée aux clients finaux.
  </p>

  <h2>1.2 Présentation de YouCode Safi</h2>
  <p>
    Créée dans le but de former des développeurs web et mobiles opérationnels de haut niveau, <strong>YouCode Safi</strong> est une école d'informatique fruit d'un partenariat pédagogique avec Simplon. L'enseignement y est basé sur une approche projet active (learning-by-doing), sans cours magistraux, favorisant l'autonomie, l'auto-apprentissage, la collaboration d'équipe et la résolution de problèmes réels. Ce cadre prépare les apprenants aux exigences des projets complexes et aux méthodologies professionnelles courantes.
  </p>

  <h2>1.3 Présentation de l'équipe de stage</h2>
  <p>
    Notre équipe était constituée de 5 développeurs stagiaires encadrés par le tuteur de l'entreprise :
  </p>
  
  <table>
    <thead>
      <tr>
        <th>Nom & Prénom</th>
        <th>Rôle au sein du projet</th>
        <th>Principales contributions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>M. LATRACH Mohammed</strong></td>
        <td>Tuteur / Encadrant entreprise</td>
        <td>Supervision générale, arbitrage fonctionnel et technique.</td>
      </tr>
      <tr>
        <td><strong>Badr Eddine Slaoui</strong></td>
        <td>Scrum Master & Développeur Lead</td>
        <td>Planification Agile, Architecture Auth, DevOps, tests, SEO.</td>
      </tr>
      <tr>
        <td><strong>Brahim El Habchi</strong></td>
        <td>Développeur Full-Stack</td>
        <td>Développement modules Frontend/Backend (Kanban, Wallet).</td>
      </tr>
      <tr>
        <td><strong>Yassine Nmila</strong></td>
        <td>Développeur Full-Stack</td>
        <td>Développement backend, gestion des intégrations.</td>
      </tr>
      <tr>
        <td><strong>Khadija El Haddad</strong></td>
        <td>Développeuse Full-Stack</td>
        <td>Intégration responsive, validation formulaires, tests UI.</td>
      </tr>
      <tr>
        <td><strong>Mouna Saoui</strong></td>
        <td>Développeuse Full-Stack</td>
        <td>Développement de composants UI, gestion des états locaux.</td>
      </tr>
    </tbody>
  </table>
  <div class="table-caption">Tableau 1 : Équipe projet et répartition des rôles</div>

  <!-- ========================================== -->
  <!-- CHAPITRE 2 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 2 : Rôle de Scrum Master et Pratiques de Développement</h1>

  <h2>2.1 Rôle de Scrum Master</h2>
  <p>
    En tant que <strong>Scrum Master</strong>, mon rôle consistait à mettre en place le cadre Scrum pour les deux projets, d'en expliquer les rituels et de veiller à leur respect strict par l'ensemble de l'équipe. J'ai agi en tant que facilitateur en éliminant les obstacles techniques et en clarifiant les exigences auprès de notre encadrant.
  </p>
  <p>
    J'ai géré la structure du backlog sur Jira : création des Epics, rédaction des User Stories détaillées avec des critères d'acceptation stricts, découpage en tâches de développement de moins de 8 heures, et estimation des charges (en story points puis en heures) pour assurer un suivi précis du burndown chart.
  </p>

  <h2>2.2 Cérémonies Scrum de Sprint</h2>
  <p>
    Nous avons structuré notre travail en sprints d'une semaine :
  </p>
  <ul>
    <li><strong>Sprint Planning :</strong> Le lundi matin, planification de l'objectif de sprint et sélection des tickets.</li>
    <li><strong>Daily Meetings :</strong> Chaque matin à 9h00 (15 minutes), suivi de l'avancement et identification immédiate des blocages.</li>
    <li><strong>Sprint Review :</strong> Le vendredi après-midi, démonstration des fonctionnalités terminées au tuteur de stage.</li>
    <li><strong>Sprint Retrospective :</strong> Identification collective des points forts et des axes de progression.</li>
  </ul>

  <h2>2.3 Gestion du workflow Git et Pull Requests</h2>
  <p>
    J'ai structuré la gestion de versions avec un workflow strict basé sur Git Flow. Les développeurs créaient des branches <code>feature/*</code> ou <code>fix/*</code> issues de <code>dev</code>. Aucune fusion directe n'était autorisée.
  </p>
  <p>
    Toutes les fusions nécessitaient l'ouverture d'une Pull Request (PR) sur GitHub. En tant que Lead, j'ai revu l'ensemble des PR pour valider : la conformité aux critères d'acceptation, le respect des standards de codage, la sécurité (absence de secrets en dur, validation Zod), et l'exécution correcte des tests unitaires locaux.
  </p>

  <!-- ========================================== -->
  <!-- CHAPITRE 3 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 3 : Architecture Globale et Diagrammes Architecturaux</h1>

  <h2>3.1 Architecture Frontend, Backend & Base de données</h2>
  <p>
    Les projets s'appuient sur une architecture moderne orientée services :
  </p>

  <div class="diagram-container">
    <!-- SVG Diagram Topologie -->
    <svg viewBox="0 0 800 280" width="100%" height="280">
      <rect x="20" y="70" width="180" height="120" rx="8" fill="#1e293b" stroke="#00e5ff" stroke-width="2"/>
      <text x="110" y="110" fill="#ffffff" font-family="'Times New Roman'" font-size="14" font-weight="bold" text-anchor="middle">CLIENT SIDE</text>
      <text x="110" y="135" fill="#94a3b8" font-family="'Times New Roman'" font-size="12" text-anchor="middle">Nuxt 4 / Vue 3</text>
      <text x="110" y="155" fill="#94a3b8" font-family="'Times New Roman'" font-size="12" text-anchor="middle">SPA / SSR Client</text>

      <path d="M 200 130 L 300 130" stroke="#00e5ff" stroke-width="2" marker-end="url(#arrow)"/>
      <path d="M 300 130 L 200 130" stroke="#00e5ff" stroke-width="2"/>

      <rect x="310" y="50" width="200" height="160" rx="8" fill="#0f172a" stroke="#2563eb" stroke-width="2"/>
      <text x="410" y="90" fill="#ffffff" font-family="'Times New Roman'" font-size="14" font-weight="bold" text-anchor="middle">BACKEND NITRO</text>
      <text x="410" y="120" fill="#94a3b8" font-family="'Times New Roman'" font-size="12" text-anchor="middle">Architecture 6 couches</text>
      <text x="410" y="145" fill="#94a3b8" font-family="'Times New Roman'" font-size="12" text-anchor="middle">Socket.IO & JWT</text>
      <text x="410" y="170" fill="#94a3b8" font-family="'Times New Roman'" font-size="12" text-anchor="middle">Prisma ORM</text>

      <path d="M 510 130 L 610 100" stroke="#2563eb" stroke-width="2"/>
      <path d="M 510 130 L 610 180" stroke="#2563eb" stroke-width="2"/>

      <rect x="620" y="50" width="160" height="70" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <text x="700" y="90" fill="#ffffff" font-family="'Times New Roman'" font-size="14" font-weight="bold" text-anchor="middle">PostgreSQL 17</text>

      <rect x="620" y="140" width="160" height="70" rx="8" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
      <text x="700" y="180" fill="#ffffff" font-family="'Times New Roman'" font-size="14" font-weight="bold" text-anchor="middle">Redis (BullMQ)</text>

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#00e5ff"/>
        </marker>
      </defs>
    </svg>
  </div>
  <div class="diagram-caption">Figure 1 : Topologie générale du système distribué Aligno</div>

  <h2>3.2 Modèles UML & Base de données (ERD)</h2>
  
  <div class="diagram-container">
    <!-- Use Case Diagram -->
    <svg viewBox="0 0 800 240" width="100%" height="240">
      <circle cx="100" cy="110" r="20" fill="#1e293b" stroke="#00e5ff" stroke-width="2"/>
      <line x1="100" y1="130" x2="100" y2="180" stroke="#00e5ff" stroke-width="2"/>
      <line x1="80" y1="150" x2="120" y2="150" stroke="#00e5ff" stroke-width="2"/>
      <line x1="100" y1="180" x2="80" y2="220" stroke="#00e5ff" stroke-width="2"/>
      <line x1="100" y1="180" x2="120" y2="220" stroke="#00e5ff" stroke-width="2"/>
      <text x="100" y="240" fill="#111827" font-family="'Times New Roman'" font-size="12" font-weight="bold" text-anchor="middle">Utilisateur</text>

      <rect x="250" y="20" width="180" height="50" rx="20" fill="#f1f5f9" stroke="#1e4db7" stroke-width="2"/>
      <text x="340" y="50" fill="#1e4db7" font-family="'Times New Roman'" font-size="11" font-weight="bold" text-anchor="middle">S'inscrire (Register)</text>

      <rect x="250" y="90" width="180" height="50" rx="20" fill="#f1f5f9" stroke="#1e4db7" stroke-width="2"/>
      <text x="340" y="120" fill="#1e4db7" font-family="'Times New Roman'" font-size="11" font-weight="bold" text-anchor="middle">Se connecter (Login)</text>

      <rect x="250" y="160" width="180" height="50" rx="20" fill="#f1f5f9" stroke="#1e4db7" stroke-width="2"/>
      <text x="340" y="190" fill="#1e4db7" font-family="'Times New Roman'" font-size="11" font-weight="bold" text-anchor="middle">Valider email (Resend)</text>

      <line x1="130" y1="140" x2="250" y2="50" stroke="#94a3b8" stroke-dasharray="4" stroke-width="1.5"/>
      <line x1="130" y1="140" x2="250" y2="115" stroke="#94a3b8" stroke-dasharray="4" stroke-width="1.5"/>
      <line x1="130" y1="140" x2="250" y2="180" stroke="#94a3b8" stroke-dasharray="4" stroke-width="1.5"/>
    </svg>
  </div>
  <div class="diagram-caption">Figure 2 : Diagramme de cas d'utilisation (Use Case) de l'authentification</div>

  <div class="page-break"></div>
  <h2>3.3 Diagramme de classes UML et Séquence</h2>
  
  <div class="diagram-container">
    <!-- UML Class Diagram -->
    <svg viewBox="0 0 800 260" width="100%" height="260">
      <rect x="30" y="20" width="220" height="200" rx="4" fill="#f8fafc" stroke="#1a3f8f" stroke-width="2"/>
      <rect x="30" y="20" width="220" height="40" fill="#1a3f8f"/>
      <text x="140" y="45" fill="#ffffff" font-family="'Times New Roman'" font-size="14" font-weight="bold" text-anchor="middle">UserController</text>
      <text x="40" y="85" font-family="'Times New Roman'" font-size="11">+ register(req, res)</text>
      <text x="40" y="105" font-family="'Times New Roman'" font-size="11">+ login(req, res)</text>
      <text x="40" y="125" font-family="'Times New Roman'" font-size="11">+ verifyEmail(req, res)</text>
      <text x="40" y="145" font-family="'Times New Roman'" font-size="11">+ getProfile(req, res)</text>

      <rect x="290" y="20" width="220" height="200" rx="4" fill="#f8fafc" stroke="#1e4db7" stroke-width="2"/>
      <rect x="290" y="20" width="220" height="40" fill="#1e4db7"/>
      <text x="400" y="45" fill="#ffffff" font-family="'Times New Roman'" font-size="14" font-weight="bold" text-anchor="middle">UserService</text>
      <text x="300" y="85" font-family="'Times New Roman'" font-size="11">+ createUser(data)</text>
      <text x="300" y="105" font-family="'Times New Roman'" font-size="11">+ validateCredentials(e, p)</text>
      <text x="300" y="125" font-family="'Times New Roman'" font-size="11">+ hashPassword(p)</text>
      <text x="300" y="145" font-family="'Times New Roman'" font-size="11">+ generateTokenPair(user)</text>

      <rect x="550" y="20" width="220" height="200" rx="4" fill="#f8fafc" stroke="#10b981" stroke-width="2"/>
      <rect x="550" y="20" width="220" height="40" fill="#10b981"/>
      <text x="660" y="45" fill="#ffffff" font-family="'Times New Roman'" font-size="14" font-weight="bold" text-anchor="middle">UserRepository</text>
      <text x="560" y="85" font-family="'Times New Roman'" font-size="11">+ findByEmail(email)</text>
      <text x="560" y="105" font-family="'Times New Roman'" font-size="11">+ create(userData)</text>
      <text x="560" y="125" font-family="'Times New Roman'" font-size="11">+ updateVerification(id)</text>
      <text x="560" y="145" font-family="'Times New Roman'" font-size="11">+ updateTokens(id, token)</text>

      <path d="M 250 120 L 290 120" stroke="#1a3f8f" stroke-width="2" marker-end="url(#arrow-blue)"/>
      <path d="M 510 120 L 550 120" stroke="#1e4db7" stroke-width="2" marker-end="url(#arrow-blue)"/>
    </svg>
  </div>
  <div class="diagram-caption">Figure 3 : Diagramme de classes UML du module Authentification d'Aligno</div>

  <!-- ========================================== -->
  <!-- CHAPITRE 4 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 4 : Projet SikBeauty - Industrialisation et Migration</h1>

  <h2>4.1 Présentation globale du projet</h2>
  <p>
    <strong>SikBeauty</strong> est une marketplace e-commerce dédiée à la commercialisation de cosmétiques coréens (K-Beauty) à l'échelle nationale. Le projet initial disposait d'un catalogue produit complet, mais souffrait de temps de chargement élevés et d'une mauvaise indexation SEO par les moteurs de recherche en raison de son architecture React SPA initiale.
  </p>

  <h2>4.2 Migration technique vers Next.js & Optimisations SEO</h2>
  <p>
    Pour résoudre ces problèmes de visibilité organique, j'ai dirigé la migration du site de <strong>React vers Next.js</strong> (App Router). Cette transition a permis d'activer le Server-Side Rendering (SSR) pour les fiches produits et la page d'accueil, garantissant l'accès immédiat des robots de recherche (Googlebot) à un code HTML pré-rendu.
  </p>
  
  <table>
    <thead>
      <tr>
        <th>Indicateur</th>
        <th>React SPA (Avant)</th>
        <th>Next.js SSR (Après)</th>
        <th>Amélioration</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Time To First Byte (TTFB)</strong></td>
        <td>1.2s</td>
        <td>0.25s</td>
        <td>- 79% (Plus rapide)</td>
      </tr>
      <tr>
        <td><strong>First Contentful Paint (FCP)</strong></td>
        <td>2.8s</td>
        <td>0.8s</td>
        <td>- 71% (Affichage instantané)</td>
      </tr>
      <tr>
        <td><strong>Indexation fiches produits</strong></td>
        <td>Partielle (JS Requis)</td>
        <td>100% automatique</td>
        <td>Indexation optimale des produits</td>
      </tr>
      <tr>
        <td><strong>Score SEO Lighthouse</strong></td>
        <td>68/100</td>
        <td>98/100</td>
        <td>+ 30 points (Excellent)</td>
      </tr>
    </tbody>
  </table>
  <div class="table-caption">Tableau 3 : Comparatif technique React SPA vs Next.js SSR</div>

  <h2>4.3 Infrastructure DevOps, Docker, CI/CD et déploiement VPS</h2>
  <p>
    J'ai rédigé un Dockerfile multi-stage réduisant la taille de l'image de production Next.js de 950 Mo à seulement 140 Mo en exploitant le mode standalone. J'ai configuré un pipeline GitHub Actions complet qui se connecte en SSH sur le VPS Hostinger, récupère l'image docker sur GitHub Packages (GHCR), et redémarre les services via Docker Compose sans coupure de service.
  </p>

  <!-- ========================================== -->
  <!-- CHAPITRE 5 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 5 : Projet Aligno - Architecture et Développement from scratch</h1>

  <h2>5.1 Présentation du projet Aligno</h2>
  <p>
    <strong>Aligno</strong> est un outil de gestion de projet collaboratif tout-en-un comprenant un tableau Kanban temps réel, un agenda basé sur des templates et un gestionnaire de finances personnelles (Wallet) avec calculs de solde atomiques.
  </p>

  <h2>5.2 Conception Backend du module d'Authentification</h2>
  <p>
    J'ai développé le module d'authentification en respectant une architecture 6 couches découplée : API -> Controller -> Service -> Repository -> DAO -> DTO. La sécurité a été configurée avec des cookies HttpOnly pour stocker le refresh token et des headers JWT courts.
  </p>

  <table>
    <thead>
      <tr>
        <th>Route API</th>
        <th>Méthode</th>
        <th>Sécurité / Payload</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>/api/auth/register</code></td>
        <td>POST</td>
        <td>Zod Schema / Multipart</td>
        <td>Création du profil, upload d'avatar WebP et token d'activation email.</td>
      </tr>
      <tr>
        <td><code>/api/auth/login</code></td>
        <td>POST</td>
        <td>Bcrypt compare / Cookie HttpOnly</td>
        <td>Vérification et émission du couple de tokens JWT.</td>
      </tr>
      <tr>
        <td><code>/api/auth/email/validation</code></td>
        <td>POST</td>
        <td>SHA-256 compare</td>
        <td>Validation du compte via le jeton de sécurité Resend.</td>
      </tr>
      <tr>
        <td><code>/api/auth/profile</code></td>
        <td>PUT</td>
        <td>JWT Required</td>
        <td>Mise à jour des informations de profil et compression d'image.</td>
      </tr>
    </tbody>
  </table>
  <div class="table-caption">Tableau 4 : Routes API implémentées pour le module Auth d'Aligno</div>

  <h2>5.3 Développement Frontend, Nuxt 4, Vue 3 et Pinia</h2>
  <p>
    J'ai conçu les formulaires d'authentification avec Nuxt 4 et Vue 3, en utilisant Tailwind CSS v4 pour le design Midnight Obsidian. L'état global est stocké dans un store Pinia persisté pour conserver la session de l'utilisateur de manière transparente sans causer de flash d'écran.
  </p>

  <!-- ========================================== -->
  <!-- CHAPITRE 6 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 6 : Fiches et Comparatifs des Technologies</h1>
  <p>
    Voici l'évaluation des principales technologies utilisées lors de ce stage de développement :
  </p>

  <table>
    <thead>
      <tr>
        <th>Technologie</th>
        <th>Rôle principal</th>
        <th>Avantages clés</th>
        <th>Limites ou contraintes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Nuxt 4 / Vue 3</strong></td>
        <td>Développement Frontend Aligno</td>
        <td>Auto-imports, structure clean, d'excellentes performances.</td>
        <td>Mise à jour récente avec changements d'API majeurs.</td>
      </tr>
      <tr>
        <td><strong>Next.js</strong></td>
        <td>Migration SEO de SikBeauty</td>
        <td>SSR performant, excellent pour le référencement Google.</td>
        <td>Configuration complexe de la gestion des cookies.</td>
      </tr>
      <tr>
        <td><strong>Prisma ORM</strong></td>
        <td>Accès Base de données</td>
        <td>Sécurité de typage TypeScript native de bout en bout.</td>
        <td>Requêtes N+1 si les relations ne sont pas surveillées.</td>
      </tr>
      <tr>
        <td><strong>Docker</strong></td>
        <td>Conteneurisation</td>
        <td>Reproductibilité absolue des environnements de dev.</td>
        <td>Utilisation importante de la mémoire sur le VPS de test.</td>
      </tr>
    </tbody>
  </table>
  <div class="table-caption">Tableau 5 : Fiche d'évaluation comparative des technologies clés</div>

  <!-- ========================================== -->
  <!-- CHAPITRE 7 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 7 : Difficultés Rencontrées et Solutions Apportées</h1>
  
  <div class="note-box">
    <h3>Étude de cas 1 : Erreur de compilation TypeScript vue-tsc en CI</h3>
    <p><strong>Contexte :</strong> Lancement de la validation des types sur GitHub Actions avec Node 24.</p>
    <p><strong>Problème :</strong> Erreur <code>ERR_PACKAGE_PATH_NOT_EXPORTED</code> de vue-tsc global.</p>
    <p><strong>Solution :</strong> Utilisation d'un binaire TypeScript local inclus dans le <code>package.json</code> via <code>./node_modules/.bin/vue-tsc</code> au lieu d'utiliser l'exécuteur <code>npx</code> global.</p>
  </div>

  <div class="note-box">
    <h3>Étude de cas 2 : Validation des emails avec Resend en mode Test</h3>
    <p><strong>Contexte :</strong> Exécution de la suite de tests Vitest en isolation.</p>
    <p><strong>Problème :</strong> Échec des requêtes API vers Resend à cause de clés API factices en CI.</p>
    <p><strong>Solution :</strong> Implémentation d'un module mockable via <code>shouldSkip()</code> qui simule l'envoi d'e-mails pour tous les domaines en <code>example.com</code> et en environnement <code>NODE_ENV = test</code>.</p>
  </div>

  <!-- ========================================== -->
  <!-- CHAPITRE 8 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 8 : Analyse des Compétences Acquises</h1>
  <p>
    Ce stage a permis une transition claire de compétences théoriques vers une véritable autonomie professionnelle :
  </p>

  <table>
    <thead>
      <tr>
        <th>Compétence technique</th>
        <th>Avant le stage (Niveau)</th>
        <th>Après le stage (Niveau)</th>
        <th>Preuves concrètes du projet</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Architecture logicielle</strong></td>
        <td>Théorique (Simple)</td>
        <td>Avancé (6 couches)</td>
        <td>Conception de l'architecture découplée d'Aligno.</td>
      </tr>
      <tr>
        <td><strong>Déploiement & DevOps</strong></td>
        <td>Bases théoriques</td>
        <td>Opérationnel autonome</td>
        <td>Déploiement VPS complet de SikBeauty avec Docker.</td>
      </tr>
      <tr>
        <td><strong>Tests automatisés</strong></td>
        <td>Concepts de base</td>
        <td>Maîtrise totale</td>
        <td>Rdaction de 114 tests d'intégration avec Vitest.</td>
      </tr>
    </tbody>
  </table>
  <div class="table-caption">Tableau 6 : Bilan d'évolution des compétences techniques</div>

  <!-- ========================================== -->
  <!-- CHAPITRE 9 -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Chapitre 9 : Résultats Obtenus et Bilan du Stage</h1>
  <p>
    Les objectifs fixés au début du stage ont été atteints conformément au calendrier :
  </p>

  <table>
    <thead>
      <tr>
        <th>Livrable principal</th>
        <th>Statut final</th>
        <th>Indicateurs de qualité</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Migration SikBeauty</strong></td>
        <td>Livrable mis en production</td>
        <td>Lighthouse Score SEO de 98% et chargements instantanés.</td>
      </tr>
      <tr>
        <td><strong>Sécurisation Aligno</strong></td>
        <td>100% Opérationnel</td>
        <td>35 tests d'authentification unitaires et d'intégration validés.</td>
      </tr>
      <tr>
        <td><strong>Gestion de projet Agile</strong></td>
        <td>4 Sprints terminés</td>
        <td>Respect à 100% des dates de livraison et vélocité stable.</td>
      </tr>
    </tbody>
  </table>
  <div class="table-caption">Tableau 8 : Tableau récapitulatif des indicateurs clés et scores</div>

  <!-- ========================================== -->
  <!-- CONCLUSION -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Conclusion Générale</h1>
  <p>
    Ce stage de fin d'études au sein de Landmark Agency a constitué une étape décisive pour mon parcours de développeur Full-Stack. Durant ces deux mois, la combinaison du rôle d'encadrement Scrum Master et de Lead technique m'a permis d'appréhender le cycle complet de livraison d'un produit logiciel de haute qualité.
  </p>
  <p>
    La refactorisation complète de SikBeauty et la création from scratch de la plateforme Aligno m'ont permis de solidifier mes compétences en architecture logicielle, en tests d'intégration complexes et en intégration de pipelines DevOps. Cette expérience valide ma capacité à intervenir sur des systèmes en production et conforte mon projet professionnel de devenir ingénieur en développement Full-Stack orienté DevOps.
  </p>

  <!-- ========================================== -->
  <!-- ANNEXES -->
  <!-- ========================================== -->
  <div class="page-break"></div>
  <h1>Annexes et Captures d'Écran</h1>
  
  <h2>Annexe A : Structure globale d'Aligno</h2>
  <div class="note-box">
    <p><strong>[Figure A : Structure des répertoires du projet Aligno]</strong></p>
    <p>Représentation de l'arborescence du projet (app, server/api, server/controller, server/service, server/repository, prisma, docker).</p>
  </div>

  <h2>Annexe B : Tableau de bord Jira (Kanban)</h2>
  <div class="note-box">
    <p><strong>[Figure B : Capture d'écran du tableau Kanban sur Jira]</strong></p>
    <p>Visualisation des tâches en cours lors de la réunion de synchronisation du Sprint 3.</p>
  </div>

  <h2>Annexe C : Rapport de performance SEO Lighthouse</h2>
  <div class="note-box">
    <p><strong>[Figure C : Capture d'écran du rapport SEO de SikBeauty post-migration]</strong></p>
    <p>Visualisation du score de 98% obtenu grâce aux balises de métadonnées dynamiques.</p>
  </div>

</body>
</html>
`;

// Write HTML content to file
const htmlFilePath = path.join(DIR, 'index.html');
fs.writeFileSync(htmlFilePath, htmlContent);
console.log(`index.html generated at ${htmlFilePath}`);

// Call chromium to convert HTML to PDF
try {
  console.log('Generating PDF using Chromium Headless...');
  const outputPdf = path.join(DIR, 'Rapport_de_Stage_Badr_Eddine_Slaoui.pdf');
  execSync(`chromium --headless --disable-gpu --print-to-pdf-no-header --print-to-pdf="${outputPdf}" "${htmlFilePath}"`);
  console.log(`✅ PDF generated successfully: ${outputPdf}`);
} catch (err) {
  console.error('❌ Failed to run chromium command:', err);
  process.exit(1);
}
