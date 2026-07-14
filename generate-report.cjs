'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
//  Aligno — Rapport de Stage Badr Eddine Slaoui
//  Générateur de document Word (.docx)
//  Police : Times New Roman 12 pt (corps) / 14 pt (titres)
//  Interligne : 1.5 — Marges : 2.5 cm
// ═══════════════════════════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  HeadingLevel, Header, Footer, PageNumber,
  ImageRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, VerticalAlign,
  TableLayoutType, ShadingType, UnderlineType,
  LineRuleType, Tab, TabStopType,
} = docx;

// ─── Chemins ────────────────────────────────────────────────────────────────
const DIR            = __dirname;
const YOUCODE_PATH   = path.join(DIR, 'youcode.jpeg');
const LANDMARK_PATH  = path.join(DIR, 'landmark.jpeg');

// ─── Palette couleurs (inspirée du design bleu) ─────────────────────────────
const C = {
  blue     : '1A3F8F',   // bleu profond — primaire (bleu de la couverture)
  blueLight: '2563EB',   // bleu vif — accents
  blueMid  : '1E4DB7',   // bleu moyen — titres sections
  bluePale : 'DBEAFE',   // fond bleu pâle
  white    : 'FFFFFF',
  black    : '111827',
  gray     : '374151',
  grayLight: '6B7280',
  border   : 'BFDBFE',
};

// ─── Marges (2.5 cm = 1418 twips) ───────────────────────────────────────────
const PAGE_MARGINS = { top: 1418, bottom: 1418, left: 1418, right: 1418 };

// ─── Espacement et interligne ────────────────────────────────────────────────
const LS  = { line: 360, lineRule: LineRuleType.AUTO };   // 1.5 interligne
const LS2 = { line: 276, lineRule: LineRuleType.AUTO };   // ~1.15 pour tableaux

// ─── Pas de bordures (helper) ────────────────────────────────────────────────
const NB = { style: BorderStyle.NONE, size: 0, color: C.white };
const NO_BORDERS = { top: NB, bottom: NB, left: NB, right: NB, insideH: NB, insideV: NB };

// ════════════════════════════════════════════════════════════════════════════
//  FONCTIONS UTILITAIRES
// ════════════════════════════════════════════════════════════════════════════

/** TextRun typé Times New Roman */
function tr(text, opts = {}) {
  return new TextRun({
    text,
    font: 'Times New Roman',
    size:    opts.size    ?? 24,          // 12 pt
    bold:    opts.bold    ?? false,
    italics: opts.italic  ?? false,
    color:   opts.color   ?? C.black,
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
    break: opts.break ?? 0,
  });
}

/** Paragraphe avec espacement par défaut */
function p(children, opts = {}) {
  const runs = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);
  return new Paragraph({
    alignment:       opts.align       ?? AlignmentType.JUSTIFY,
    spacing:         { ...LS, before: opts.before ?? 80, after: opts.after ?? 80 },
    pageBreakBefore: opts.pageBreak   ?? false,
    children:        runs,
    heading:         opts.heading     ?? undefined,
    bullet:          opts.bullet      ? { level: opts.bulletLevel ?? 0 } : undefined,
    indent:          opts.indent      ? { left: opts.indent, hanging: opts.hanging ?? 0 } : undefined,
    border:          opts.bottomBorder ? {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: C.blue, space: 4 },
    } : undefined,
    shading: opts.bg ? { type: ShadingType.SOLID, color: opts.bg, fill: opts.bg } : undefined,
  });
}

/** Ligne vide */
const blank = (n = 1) => {
  const res = [];
  for (let i = 0; i < n; i++) res.push(p([tr('')]));
  return res;
};

// ─── HIÉRARCHIE DES TITRES ──────────────────────────────────────────────────

/** Titre de chapitre H1 — barre bleue en dessous */
function h1(text, pageBreak = false) {
  return p([tr(text, { size: 32, bold: true, color: C.blue })], {
    align:        AlignmentType.LEFT,
    heading:      HeadingLevel.HEADING_1,
    before:       pageBreak ? 0 : 400,
    after:        200,
    pageBreak,
    bottomBorder: true,
  });
}

/** Titre de section H2 */
function h2(text) {
  return p([tr(text, { size: 28, bold: true, color: C.blueMid })], {
    align:   AlignmentType.LEFT,
    heading: HeadingLevel.HEADING_2,
    before:  320,
    after:   120,
  });
}

/** Titre de sous-section H3 */
function h3(text) {
  return p([tr(text, { size: 24, bold: true, color: C.blueLight })], {
    align:   AlignmentType.LEFT,
    heading: HeadingLevel.HEADING_3,
    before:  200,
    after:   80,
  });
}

/** Corps de texte justifié */
function body(text, opts = {}) {
  return p([tr(text, opts)], { ...opts });
}

/** Élément de liste à puce */
function li(text, bold = '') {
  return p(
    [
      bold ? tr(bold, { bold: true }) : null,
      tr(text),
    ].filter(Boolean),
    { bullet: true, before: 40, after: 40, align: AlignmentType.LEFT }
  );
}

/** Élément de liste à puce niveau 2 */
function li2(text) {
  return p([tr(text)], { bullet: true, bulletLevel: 1, before: 20, after: 20, align: AlignmentType.LEFT });
}

/** Image */
function img(filePath, w, h) {
  return new ImageRun({
    data: fs.readFileSync(filePath),
    transformation: { width: w, height: h },
    type: 'jpeg',
  });
}

// ─── TABLEAUX ────────────────────────────────────────────────────────────────

/** Cellule tableau générique */
function cell(children, opts = {}) {
  const runs = Array.isArray(children) ? children : [children];
  return new TableCell({
    width:         opts.width   ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: opts.vAlign  ?? VerticalAlign.CENTER,
    borders:       opts.borders ?? NO_BORDERS,
    shading:       opts.bg      ? { type: ShadingType.SOLID, color: opts.bg, fill: opts.bg } : undefined,
    margins:       { top: 80, bottom: 80, left: 120, right: 120 },
    children: [p(runs, { align: opts.align ?? AlignmentType.LEFT, before: 0, after: 0 })],
  });
}

/** Ligne de tableau */
function row(...cells) { return new TableRow({ children: cells }); }

/** Tableau générique */
function table(rows, opts = {}) {
  return new Table({
    width:  { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: opts.borders ?? {
      top:     { style: BorderStyle.SINGLE, size: 4, color: C.blue },
      bottom:  { style: BorderStyle.SINGLE, size: 4, color: C.blue },
      left:    NB,
      right:   NB,
      insideH: { style: BorderStyle.DOTTED, size: 2, color: C.border },
      insideV: { style: BorderStyle.SINGLE, size: 2, color: C.border },
    },
    rows,
  });
}

/** En-tête de tableau bleu */
function thead(...labels) {
  return new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => cell(
      [tr(l, { bold: true, color: C.white, size: 22 })],
      { bg: C.blue, width: 100 / labels.length, align: AlignmentType.CENTER }
    )),
  });
}

/** Ligne de données alternée */
function trow(odd, ...values) {
  const bg = odd ? C.bluePale : undefined;
  return new TableRow({
    children: values.map((v, i) => {
      const isFirst = i === 0;
      return cell(
        [tr(v, { size: 22, bold: isFirst, color: isFirst ? C.blueMid : C.black })],
        { bg, align: AlignmentType.LEFT }
      );
    }),
  });
}

// ─── LIGNE DE TABLE DES MATIÈRES ─────────────────────────────────────────────
function tocRow(text, page, indent = 0) {
  return new Paragraph({
    spacing: { line: 300, before: 50, after: 50 },
    indent:  indent ? { left: indent } : undefined,
    tabStops: [{ type: TabStopType.RIGHT, position: 8600 }],
    children: [
      new TextRun({ text, font: 'Times New Roman', size: indent ? 22 : 24, bold: !indent, color: indent ? C.grayLight : C.black }),
      new TextRun({ children: [new Tab()], font: 'Times New Roman', size: 22 }),
      new TextRun({ text: String(page), font: 'Times New Roman', size: 22, bold: !indent }),
    ],
  });
}

// ─── EN-TÊTE DE PAGE ─────────────────────────────────────────────────────────
function makeHeader() {
  return new Header({
    children: [
      table(
        [row(
          cell([tr('Rapport de Stage — Badr Eddine Slaoui', { size: 18, italic: true, color: C.grayLight })], { width: 65 }),
          cell([tr('Landmark Agency / YouCode Safi — 2025/2026', { size: 18, italic: true, color: C.grayLight })], { width: 35, align: AlignmentType.RIGHT }),
        )],
        {
          borders: {
            top: NB, left: NB, right: NB,
            insideH: NB, insideV: NB,
            bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          },
        }
      ),
    ],
  });
}

// ─── PIED DE PAGE ─────────────────────────────────────────────────────────────
function makeFooter() {
  return new Footer({
    children: [
      table(
        [row(
          cell([tr('YouCode Safi — Développement Full-Stack & Gestion de Projet Agile', { size: 18, italic: true, color: C.grayLight })], { width: 70 }),
          cell(
            [new TextRun({ children: ['Page ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], font: 'Times New Roman', size: 18, color: C.grayLight })],
            { width: 30, align: AlignmentType.RIGHT }
          ),
        )],
        {
          borders: {
            bottom: NB, left: NB, right: NB,
            insideH: NB, insideV: NB,
            top: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          },
        }
      ),
    ],
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  CONTENU DU RAPPORT
// ════════════════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────────────
// SECTION A : Couverture, Remerciements, Tables
// ──────────────────────────────────────────────────────────────────────────
const SECTION_A = {
  properties: { page: { margin: PAGE_MARGINS } },
  children: [

    // ═══ PAGE DE COUVERTURE ═══════════════════════════════════════════════

    // Ligne décorative supérieure
    new Paragraph({
      spacing: { before: 0, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 40, color: C.blue } },
      children: [],
    }),

    // Logos côte à côte
    table([
      row(
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: NO_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 0, after: 0 }, children: [img(YOUCODE_PATH, 90, 70)] })],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          borders: NO_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          children: [p([tr('×', { size: 36, bold: true, color: C.blue })], { align: AlignmentType.CENTER, before: 0, after: 0 })],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: NO_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 }, children: [img(LANDMARK_PATH, 140, 50)] })],
        }),
      ),
    ], { borders: { top: NB, bottom: NB, left: NB, right: NB, insideH: NB, insideV: NB } }),

    // Espace avant le titre
    ...blank(3),

    // Titre principal
    p([tr('RAPPORT DE STAGE', { size: 56, bold: true, color: C.blue })], { align: AlignmentType.CENTER, before: 0, after: 120 }),
    p([tr('DE FIN DE FORMATION', { size: 40, bold: true, color: C.blue })], { align: AlignmentType.CENTER, before: 0, after: 200 }),

    // Ligne bleue décorative
    new Paragraph({
      spacing: { before: 0, after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: C.blue } },
      children: [],
    }),

    // Sous-titre
    p([tr('Développement Full-Stack & Coordination Agile', { size: 28, italic: true, color: C.blueLight })], { align: AlignmentType.CENTER, before: 0, after: 600 }),

    // Tableau d\'informations de stage
    table([
      row(
        cell([tr('Apprenant', { bold: true, size: 22, color: C.white })], { bg: C.blue, width: 38, align: AlignmentType.LEFT }),
        cell([tr('Badr Eddine Slaoui', { size: 22 })], { bg: C.bluePale, width: 62 }),
      ),
      row(
        cell([tr('Établissement', { bold: true, size: 22, color: C.white })], { bg: C.blue, width: 38 }),
        cell([tr('YouCode Safi', { size: 22 })], { width: 62 }),
      ),
      row(
        cell([tr("Entreprise d\'accueil", { bold: true, size: 22, color: C.white })], { bg: C.blue, width: 38 }),
        cell([tr('Landmark Agency — Oujda', { size: 22 })], { bg: C.bluePale, width: 62 }),
      ),
      row(
        cell([tr('Période', { bold: true, size: 22, color: C.white })], { bg: C.blue, width: 38 }),
        cell([tr('7 Mai 2026 — 7 Juillet 2026', { size: 22 })], { width: 62 }),
      ),
      row(
        cell([tr('Encadrant entreprise', { bold: true, size: 22, color: C.white })], { bg: C.blue, width: 38 }),
        cell([tr('M. LATRACH Mohammed', { size: 22 })], { bg: C.bluePale, width: 62 }),
      ),
      row(
        cell([tr('Formateur référent', { bold: true, size: 22, color: C.white })], { bg: C.blue, width: 38 }),
        cell([tr('M. Saad Shaimer', { size: 22 })], { width: 62 }),
      ),
      row(
        cell([tr('CME', { bold: true, size: 22, color: C.white })], { bg: C.blue, width: 38 }),
        cell([tr('Mme Kaoutar Darroufi', { size: 22 })], { bg: C.bluePale, width: 62 }),
      ),
      row(
        cell([tr('Année de formation', { bold: true, size: 22, color: C.white })], { bg: C.blue, width: 38 }),
        cell([tr('2025 — 2026', { size: 22 })], { width: 62 }),
      ),
    ]),

    // Ligne de bas de couverture
    new Paragraph({
      spacing: { before: 400, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 40, color: C.blue } },
      children: [],
    }),

    // ═══ PAGE REMERCIEMENTS ═══════════════════════════════════════════════

    h1('REMERCIEMENTS', true),

    body("À l\'issue de ce stage de deux mois au sein de Landmark Agency, je tiens à exprimer ma sincère et profonde gratitude envers toutes les personnes qui ont contribué à faire de cette expérience une étape aussi riche que déterminante dans mon parcours professionnel."),

    ...blank(),

    body("Ma reconnaissance va en premier lieu à mon encadrant en entreprise, Monsieur LATRACH Mohammed, pour m\'avoir accordé sa confiance dès le premier jour et pour la qualité de son suivi tout au long de ces deux mois. Sa disponibilité, sa rigueur et ses précieux conseils techniques m\'ont permis de progresser avec sérénité et ambition."),

    ...blank(),

    body("Je souhaite également adresser mes plus vifs remerciements à l'équipe pédagogique de YouCode Safi :"),

    ...blank(),

    li("Monsieur Saad Shaimer, formateur référent, dont l\'enseignement exigeant et la pédagogie bienveillante ont constitué le socle de mes compétences techniques. Ses retours réguliers et ses orientations judicieuses ont guidé mon évolution tout au long de la formation.", "M. Saad Shaimer — "),
    li("Madame Kaoutar Darroufi, CME, pour son suivi attentif et humain, ses encouragements constants et l\'intérêt sincère qu\'elle a toujours porté au développement personnel et professionnel des apprenants.", "Mme Kaoutar Darroufi — "),

    ...blank(),

    body("Je tiens à exprimer ma gratitude la plus sincère envers mes camarades et collègues de stage, avec lesquels j\'ai eu le privilège de collaborer. Leur sérieux, leur esprit d'équipe et leur implication ont été des moteurs essentiels de notre réussite collective :"),

    ...blank(),

    li("Pour sa rigueur, son sens du détail et son investissement constant dans chacune de ses contributions au projet Aligno.", "Mouna Saoui — "),
    li("Pour sa créativité, sa réactivité et sa capacité à concevoir des solutions techniques élégantes face aux problématiques les plus complexes.", "Brahim El Habchi — "),
    li("Pour sa polyvalence, son esprit d\'initiative et sa contribution précieuse à chaque sprint du projet.", "Yassine Nmila — "),
    li("Pour son professionnalisme, sa persévérance et la qualité irréprochable de son travail tout au long du stage.", "Khadija El Haddad — "),

    ...blank(),

    body("Enfin, je dédie ce rapport à ma famille, dont le soutien indéfectible et les encouragements permanents ont été ma plus grande source de motivation."),

    // ═══ TABLE DES MATIÈRES ═══════════════════════════════════════════════

    h1('TABLE DES MATIÈRES', true),

    tocRow('REMERCIEMENTS', 'II'),
    tocRow('TABLE DES MATIÈRES', 'III'),
    tocRow('LISTE DES TABLEAUX', 'IV'),
    tocRow('LISTE DES FIGURES', 'V'),
    ...blank(),
    tocRow('INTRODUCTION GÉNÉRALE', 1),
    ...blank(),
    tocRow('CHAPITRE 1 — PRÉSENTATION DU CONTEXTE', 2),
    tocRow('1.1  Présentation de Landmark Agency', 2, 360),
    tocRow('1.2  Présentation de YouCode Safi', 3, 360),
    tocRow("1.3  Objectifs du stage", 3, 360),
    tocRow('1.4  Présentation de l\'équipe de stage', 4, 360),
    ...blank(),
    tocRow('CHAPITRE 2 — ENVIRONNEMENT ET MÉTHODES DE TRAVAIL', 5),
    tocRow('2.1  Environnement technique', 5, 360),
    tocRow('2.2  Méthodologie Agile Scrum', 6, 360),
    tocRow('2.3  Mon rôle de Scrum Master', 7, 360),
    tocRow("2.4  Gestion du workflow Git", 9, 360),
    ...blank(),
    tocRow('CHAPITRE 3 — PROJET 1 : SIKBEAUTY', 11),
    tocRow('3.1  Présentation du projet', 11, 360),
    tocRow('3.2  Migration React vers Next.js', 12, 360),
    tocRow('3.3  Optimisation SEO', 14, 360),
    tocRow("3.4  Infrastructure DevOps & Déploiement", 16, 360),
    tocRow('3.5  Contributions Backend', 18, 360),
    ...blank(),
    tocRow('CHAPITRE 4 — PROJET 2 : ALIGNO', 19),
    tocRow('4.1  Présentation de la plateforme', 19, 360),
    tocRow('4.2  Initialisation du projet', 20, 360),
    tocRow('4.3  Développement Backend — Module Authentification', 21, 360),
    tocRow('4.4  Tests automatisés avec Vitest', 28, 360),
    tocRow('4.5  Planification Frontend', 30, 360),
    tocRow('4.6  Développement Frontend — Module Authentification', 31, 360),
    tocRow('4.7  Finalisation & Livraison du projet', 34, 360),
    ...blank(),
    tocRow('CHAPITRE 5 — TECHNOLOGIES UTILISÉES', 36),
    tocRow('5.1  Stack Frontend', 36, 360),
    tocRow('5.2  Stack Backend & Temps réel', 38, 360),
    tocRow('5.3  DevOps & Infrastructure', 39, 360),
    tocRow('5.4  Qualité, Sécurité & Monitoring', 40, 360),
    ...blank(),
    tocRow('CHAPITRE 6 — DIFFICULTÉS ET SOLUTIONS', 42),
    ...blank(),
    tocRow('CHAPITRE 7 — COMPÉTENCES ACQUISES', 45),
    tocRow('7.1  Compétences techniques', 45, 360),
    tocRow('7.2  Compétences professionnelles', 46, 360),
    ...blank(),
    tocRow('CHAPITRE 8 — RÉSULTATS OBTENUS', 47),
    ...blank(),
    tocRow('CONCLUSION GÉNÉRALE', 50),
    ...blank(),
    tocRow('ANNEXES', 51),

    // ═══ LISTE DES TABLEAUX ═══════════════════════════════════════════════

    h1('LISTE DES TABLEAUX', true),

    tocRow('Tableau 1  — Informations du stage', 'Couverture'),
    tocRow("Tableau 2  — Équipe de stage", 4),
    tocRow('Tableau 3  — Stack technologique Frontend', 5),
    tocRow('Tableau 4  — Correspondance cérémonies Scrum', 7),
    tocRow('Tableau 5  — Comparatif React SPA vs Next.js SSR', 13),
    tocRow('Tableau 6  — Optimisations SEO réalisées', 15),
    tocRow("Tableau 7  — Étapes du pipeline GitHub Actions", 17),
    tocRow('Tableau 8  — Inventaire des routes API Auth', 23),
    tocRow('Tableau 9  — Schéma de la base de données utilisateur', 24),
    tocRow('Tableau 10 — Contrôles de sécurité implémentés', 25),
    tocRow('Tableau 11 — Variables d\'environnement', 27),
    tocRow('Tableau 12 — Couverture des tests Vitest (Auth)', 29),
    tocRow('Tableau 13 — Couverture des tests Vitest (Wallet)', 30),
    tocRow('Tableau 14 — Pages Frontend Auth développées', 32),
    tocRow('Tableau 15 — Stack technologies (récapitulatif)', 41),
    tocRow('Tableau 16 — Difficultés et solutions', 44),
    tocRow('Tableau 17 — Compétences techniques acquises', 45),
    tocRow('Tableau 18 — Résultats par domaine', 48),
    tocRow('Tableau 19 — Bilan global du stage', 49),

    // ═══ LISTE DES FIGURES ════════════════════════════════════════════════

    h1('LISTE DES FIGURES', true),

    tocRow("Figure 1  — Architecture générale d\'Aligno (topologie système)", 19),
    tocRow('Figure 2  — Architecture en couches du module Authentification', 21),
    tocRow('Figure 3  — Flux de traitement d\'une requête HTTP Auth', 22),
    tocRow('Figure 4  — Stratégie de tokens JWT (Access + Refresh)', 26),
    tocRow('Figure 5  — Flux de restauration de session (app init)', 33),
    tocRow('Figure 6  — Architecture du module Gestion de Projets', 37),
    tocRow("Figure 7  — Pipeline CI/CD GitHub Actions", 40),
    tocRow("Figure 8  — Workflow Git (Feature Branch)", 10),
    tocRow('Figure 9  — Diagramme des sprints Aligno', 8),
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// SECTION B : Corps du rapport avec en-tête et pied de page
// ──────────────────────────────────────────────────────────────────────────
const SECTION_B = {
  properties: { page: { margin: PAGE_MARGINS } },
  headers:  { default: makeHeader() },
  footers:  { default: makeFooter() },
  children: [

    // ═══════════════════════════════════════════════════════════════════════
    // INTRODUCTION GÉNÉRALE
    // ═══════════════════════════════════════════════════════════════════════

    h1('INTRODUCTION GÉNÉRALE'),

    body("Dans un secteur du numérique en constante évolution, la formation par l\'alternance et les stages professionnels constituent des vecteurs indispensables d\'acquisition de compétences concrètes et d\'immersion dans la réalité du monde de l\'entreprise. C\'est dans cette perspective que s\'inscrit le stage de fin de formation que j\'ai effectué au sein de Landmark Agency, agence de services numériques basée à Oujda, du 7 mai au 7 juillet 2026."),

    ...blank(),

    body("Ce stage, réalisé dans le cadre de ma formation en Développement Full-Stack à YouCode Safi, m\'a offert l\'opportunité de contribuer activement à deux projets d\'envergure aux enjeux distincts : SikBeauty, une marketplace e-commerce de cosmétiques coréens en cours d\'industrialisation, et Aligno, une plateforme de productivité et de gestion de projets développée from scratch au cours du stage."),

    ...blank(),

    body("Au-delà de ma contribution technique, j\'ai endossé la responsabilité de Scrum Master pour les deux projets, assumant un rôle d\'organisation, de coordination et de pilotage qui m\'a permis de développer des compétences managériales et organisationnelles rares pour un développeur en début de carrière."),

    ...blank(),

    body("Ce rapport se propose de rendre compte de manière exhaustive et structurée de l\'ensemble des travaux réalisés, des choix techniques opérés, des difficultés rencontrées et des enseignements tirés de cette expérience. Il est organisé en huit chapitres progressifs, couvrant successivement le contexte du stage, l\'environnement de travail, la description détaillée des deux projets, les technologies mises en œuvre, les difficultés surmontées, les compétences acquises, les résultats obtenus, et enfin une conclusion prospective."),

    // ═══════════════════════════════════════════════════════════════════════
    // CHAPITRE 1
    // ═══════════════════════════════════════════════════════════════════════

    h1('CHAPITRE 1 — PRÉSENTATION DU CONTEXTE', true),

    // 1.1
    h2('1.1  Présentation de Landmark Agency'),

    body("Landmark Agency est une agence de services numériques établie à Oujda, au Maroc. Positionnée comme un partenaire technologique global pour ses clients, elle intervient sur un spectre large de compétences : développement web et mobile sur mesure, stratégie de communication digitale, conception graphique et UX/UI, et accompagnement à la transformation numérique d\'entreprises de toutes tailles."),

    ...blank(),

    body("L\'agence s\'appuie sur des équipes pluridisciplinaires organisées en mode projet, mobilisant développeurs frontend et backend, chefs de projet, designers et consultants selon les besoins de chaque mission. Sa structure agile et sa culture de l\'innovation continue lui permettent de répondre avec efficacité aux exigences de clients variés, en combinant expertise technique et créativité."),

    ...blank(),

    body("Landmark Agency adopte une culture de travail collaborative et orientée vers l\'excellence : les méthodologies de développement modernes (Agile/Scrum), les outils de collaboration professionnels (Jira, GitHub, Figma) et l\'investissement dans le développement des compétences de ses équipes constituent les fondements de son modèle opérationnel."),

    // 1.2
    h2('1.2  Présentation de YouCode Safi'),

    body("YouCode Safi est une école de formation au développement web et mobile, fondée dans le cadre du programme de formation et d\'insertion professionnelle de jeunes talents marocains dans le secteur du numérique. Adossée à l'écosystème de l\'Université Mohammed VI Polytechnique (UM6P) et de OCP Group, YouCode forme des développeurs opérationnels capables de répondre aux standards de l\'industrie."),

    ...blank(),

    body("La pédagogie de YouCode repose sur l\'apprentissage par la pratique : projets concrets, collaboration en équipe, autoévaluation et culture de l\'amélioration continue. Cette approche pragmatique prépare efficacement les apprenants à l\'environnement professionnel, et le stage de fin de formation en constitue l\'aboutissement naturel."),

    // 1.3
    h2("1.3  Objectifs du stage"),

    body("Ce stage poursuivait plusieurs objectifs complémentaires, articulés autour de trois axes :"),

    ...blank(),

    h3("Axe 1 — Consolidation et approfondissement technique"),
    li("Mettre en pratique et approfondir les compétences en développement Full-Stack JavaScript dans un contexte professionnel réel, sur des projets à enjeux."),
    li("Maîtriser des technologies modernes et des architectures logicielles avancées (Nuxt 4, architecture en couches, DevOps) que la formation avait abordées de manière théorique."),
    li("Développer une culture de la qualité logicielle : tests automatisés, CI/CD, revue de code et documentation technique."),

    h3("Axe 2 — Responsabilité organisationnelle"),
    li("Exercer un rôle de Scrum Master, en prenant en charge la planification, la coordination et le suivi de deux projets simultanés."),
    li("Développer des compétences managériales : animation de réunions, gestion des priorités, résolution de conflits, communication avec l'équipe et l\'encadrant."),

    h3("Axe 3 — Intégration professionnelle"),
    li("S\'intégrer dans un environnement professionnel réel, comprendre les codes et les exigences du milieu de l\'entreprise."),
    li("Contribuer de manière significative et mesurable aux produits livrés, en assumant une responsabilité individuelle sur des fonctionnalités critiques."),

    // 1.4
    h2("1.4  Présentation de l'équipe de stage"),

    body("Le stage s\'est déroulé au sein d\'une équipe multidisciplinaire de six personnes, dont cinq développeurs stagiaires issus de YouCode Safi, tous placés sous la supervision de l\'encadrant entreprise. La composition et les responsabilités de l'équipe sont résumées dans le tableau suivant :"),

    ...blank(),

    table([
      thead('Nom & Prénom', 'Rôle', 'Responsabilités principales'),
      trow(true,  'M. LATRACH Mohammed', 'Encadrant de stage',          "Supervision technique, orientation stratégique, validation des livrables"),
      trow(false, 'Badr Eddine Slaoui',  'Scrum Master & Développeur',  "Pilotage Agile, architecture Auth, DevOps, SEO, QA, coordination équipe"),
      trow(true,  'Brahim El Habchi',    'Développeur Full-Stack',       'Développement frontend et backend — modules Aligno'),
      trow(false, 'Yassine Nmila',       'Développeur Full-Stack',       'Développement frontend et backend — modules Aligno'),
      trow(true,  'Khadija El Haddad',  'Développeuse Full-Stack',      'Développement frontend et backend — modules Aligno & SikBeauty'),
      trow(false, 'Mouna Saoui',         'Développeuse Full-Stack',      'Développement frontend et backend — modules Aligno & SikBeauty'),
    ]),

    p([tr('Tableau 2 — Équipe de stage et répartition des responsabilités', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    // ═══════════════════════════════════════════════════════════════════════
    // CHAPITRE 2
    // ═══════════════════════════════════════════════════════════════════════

    h1('CHAPITRE 2 — ENVIRONNEMENT ET MÉTHODES DE TRAVAIL', true),

    // 2.1
    h2('2.1  Environnement technique'),

    body("L\'environnement de développement mis en place au sein de Landmark Agency repose sur un ensemble cohérent d\'outils professionnels couvrant l\'intégralité du cycle de vie logiciel. Le tableau ci-dessous en présente une vue synthétique :"),

    ...blank(),

    table([
      thead('Domaine', 'Outils et technologies'),
      trow(true,  'Développement',       'Nuxt 4, Vue 3, TypeScript, Node.js, Prisma ORM, PostgreSQL'),
      trow(false, 'Temps réel',          'Socket.IO, Redis, ioredis, BullMQ'),
      trow(true,  'DevOps',              'Docker, Docker Compose, GitHub Actions, VPS Hostinger, Nginx'),
      trow(false, 'Qualité',             'Vitest, Husky, vue-tsc, Sentry, Pino'),
      trow(true,  'Collaboration',       'Git, GitHub, Jira, Figma, Scrum/Agile'),
      trow(false, 'Environnement local', 'Docker Compose (PostgreSQL 17, Redis 7, pgAdmin 4, app Nuxt)'),
    ]),

    p([tr('Tableau 3 — Stack technologique globale', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    // 2.2
    h2('2.2  Méthodologie Agile Scrum'),

    body("Landmark Agency adopte la méthodologie Agile Scrum comme cadre de travail pour l\'ensemble de ses projets de développement. Cette approche, fondée sur des cycles de développement courts (sprints) et une livraison régulière de valeur, offre une grande adaptabilité aux changements de priorité et favorise la communication et la collaboration au sein des équipes."),

    ...blank(),

    body("Le cadre Scrum repose sur trois piliers fondamentaux — transparence, inspection et adaptation — et s\'articule autour de rôles définis (Product Owner, Scrum Master, équipe de développement), d\'artefacts (Product Backlog, Sprint Backlog, Increment) et de cérémonies ritualisées. Le tableau ci-dessous résume les cérémonies pratiquées au cours du stage :"),

    ...blank(),

    table([
      thead('Cérémonie', 'Fréquence', 'Durée', 'Objectif principal'),
      trow(true,  'Sprint Planning',    'Début de sprint', '2–3 h',  'Sélection des User Stories, estimation, attribution des tâches'),
      trow(false, 'Daily Stand-up',     'Quotidien',       '15 min', 'Synchronisation, identification des blocages, réajustement'),
      trow(true,  'Sprint Review',      'Fin de sprint',   '1 h',    "Démonstration des livrables à l\'encadrant, validation fonctionnelle"),
      trow(false, 'Rétrospective',      'Fin de sprint',   '45 min', 'Analyse collective des points forts et axes d\'amélioration'),
      trow(true,  'Backlog Refinement', 'Milieu de sprint','1 h',    'Affinement des User Stories du prochain sprint'),
    ]),

    p([tr('Tableau 4 — Cérémonies Scrum pratiquées durant le stage', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    // 2.3
    h2('2.3  Mon rôle de Scrum Master'),

    body("Tout au long du stage, j\'ai assumé le rôle de Scrum Master pour les deux projets menés en parallèle. Ce rôle, bien plus qu\'une simple fonction d\'organisation, constitue un véritable rôle de service au bénéfice de l'équipe de développement, de l\'encadrant et de la réussite du projet. Il exige à la fois rigueur organisationnelle, intelligence relationnelle et vision technique."),

    ...blank(),

    h3('Gestion du Product Backlog et des User Stories'),

    body("Ma première responsabilité a consisté à construire et maintenir le Product Backlog de chaque projet. Pour Aligno notamment, en l\'absence d\'un Product Owner formellement identifié, j\'ai pris en charge la traduction des besoins fonctionnels en User Stories structurées selon le format standard : « En tant que [rôle], je souhaite [action] afin de [valeur attendue]. »"),

    ...blank(),

    body("Chaque User Story était accompagnée de critères d\'acceptation précis, permettant à l'équipe de savoir avec exactitude quand une tâche pouvait être considérée comme terminée (définition of done). Ce travail de clarification amont a considérablement réduit les ambiguïtés lors du développement et les allers-retours avec l\'encadrant."),

    ...blank(),

    body("Les User Stories ont ensuite été décomposées en sous-tâches techniques, créées et organisées dans Jira. Chaque sous-tâche était associée à un responsable, une estimation en heures, une priorité et un statut (À faire, En cours, Terminé)."),

    ...blank(),

    h3('Sprint Planning et estimation'),

    body("À l\'ouverture de chaque sprint, j\'ai animé la session de Sprint Planning. Cette cérémonie débutait par une présentation des User Stories candidates (backlog items prêts à être développés), suivie d\'une session d\'estimation collective par l'équipe. J\'ai introduit la technique du Planning Poker pour favoriser une estimation collaborative et détecter les divergences de compréhension entre les membres."),

    ...blank(),

    body("Sur la base de la vélocité estimée de l'équipe et des contraintes de temps, j\'ai sélectionné l\'ensemble des items à inclure dans le sprint et construit le Sprint Backlog. Chaque item a ensuite été attribué à un développeur en tenant compte de ses compétences, de sa charge et de ses préférences."),

    ...blank(),

    h3('Animation des Daily Stand-ups'),

    body("Chaque matin, j\'animais le Daily Stand-up de 15 minutes. Cette réunion courte mais structurée suivait systématiquement le même format pour chaque participant : ce que j\'ai fait hier, ce que je prévois de faire aujourd\'hui, et les obstacles éventuels qui me bloquent."),

    ...blank(),

    body("Mon rôle lors du Daily ne se limitait pas à écouter : je prenais note des blocages signalés et organisais, immédiatement après la réunion, des sessions bilatérales ou de pair programming pour résoudre les problèmes identifiés. Cette réactivité a permis de maintenir un flux de développement fluide et de limiter les temps d\'attente."),

    ...blank(),

    h3('Sprint Review et Rétrospectives'),

    body("À la fin de chaque sprint, j\'organisais et animais la Sprint Review, au cours de laquelle chaque développeur présentait les fonctionnalités qu\'il avait livrées. Cette démonstration permettait à M. LATRACH Mohammed de valider les livrables, de formuler des retours et de reprioriser le backlog si nécessaire."),

    ...blank(),

    body("Immédiatement après, je conduisais la Rétrospective de sprint. En utilisant le format Start-Stop-Continue (Démarrer-Arrêter-Continuer), j\'invitais chaque membre à exprimer librement ce qui avait bien fonctionné, ce qui méritait d'être abandonné et ce qu\'il fallait maintenir. Les conclusions de chaque rétrospective donnaient lieu à des actions concrètes inscrites dans le sprint suivant."),

    ...blank(),

    h3('Suivi de l\'avancement et reporting'),

    body("J\'ai utilisé les tableaux Kanban et les tableaux de bord Jira pour suivre en temps réel l\'avancement du sprint. Les Burn-down Charts, générés automatiquement par Jira, me permettaient de visualiser rapidement si l'équipe était en bonne voie pour livrer l\'ensemble des items planifiés. En cas de dérive, je prenais les mesures correctives nécessaires : redistribution des tâches, descoping d\'items non critiques, ou planification d\'heures supplémentaires."),

    p([tr('Figure 9 — Diagramme des sprints Aligno (capture Jira)', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 120, after: 60 }),
    p([tr('[Emplacement réservé — Capture d\'écran du tableau Jira / Sprint Board]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    // 2.4
    h2('2.4  Gestion du workflow Git'),

    body("La gestion du code source a été organisée autour du Feature Branch Workflow, un modèle éprouvé qui garantit la stabilité de la branche principale tout en permettant un développement parallèle efficace."),

    ...blank(),

    h3('Conventions de nommage des branches'),

    body("J\'ai défini et imposé une convention de nommage stricte pour les branches Git de l'équipe :"),

    li("feature/<ticket-id>-<description-courte> pour les nouvelles fonctionnalités.", "Nouvelles fonctionnalités — "),
    li("fix/<ticket-id>-<description-courte> pour les corrections de bugs.", "Corrections — "),
    li("chore/<description> pour les tâches de maintenance (dépendances, configuration).", "Maintenance — "),
    li("refactor/<description> pour les refactorisations sans changement de comportement.", "Refactorisation — "),

    ...blank(),

    h3('Processus de Pull Request et revue de code'),

    body("Toute modification du code devait obligatoirement passer par une Pull Request (PR) sur GitHub avant d'être fusionnée dans la branche dev. Les PR étaient soumises à une revue de code que j\'assurais en tant que Scrum Master :"),

    li("Vérification de la conformité aux conventions de code (nommage, structuration, commentaires)."),
    li("Vérification de l\'absence de code mort ou de debug statements laissés accidentellement."),
    li("Contrôle de la cohérence architecturale (respect des couches Controller/Service/Repository)."),
    li("Exécution des tests automatisés et validation du pipeline CI avant l\'approbation."),
    li("Fusion (merge ou rebase) dans la branche dev après approbation, puis dans main pour les releases."),

    ...blank(),

    p([tr('Figure 8 — Workflow Git (Feature Branch) pratiqué sur les projets', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 120, after: 60 }),
    p([tr('[Emplacement réservé — Diagramme du Feature Branch Workflow]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    // ═══════════════════════════════════════════════════════════════════════
    // CHAPITRE 3
    // ═══════════════════════════════════════════════════════════════════════

    h1('CHAPITRE 3 — PROJET 1 : SIKBEAUTY', true),

    // 3.1
    h2('3.1  Présentation du projet'),

    body("SikBeauty est une marketplace e-commerce spécialisée dans la vente de produits cosmétiques coréens (K-Beauty) sur le marché marocain et francophone. La plateforme propose une large gamme de produits de soin, de maquillage et de beauté, enrichis de fiches produits détaillées, de descriptions en français, et d\'un système de commande en ligne."),

    ...blank(),

    body("Lors de mon intervention, le projet était en phase de migration technologique et d\'optimisation en vue de sa mise en production. L\'enjeu principal était double : améliorer les performances de rendu et le référencement naturel du site (SEO), et industrialiser le déploiement grâce à une infrastructure DevOps robuste et automatisée."),

    ...blank(),

    body("L'équipe technique intervenant sur SikBeauty au moment du stage était composée de deux développeurs (dont moi-même), sous la supervision de M. LATRACH Mohammed. Les développements se sont articulés autour de trois grands axes : la migration React → Next.js, l\'optimisation SEO et la mise en place de l\'infrastructure DevOps."),

    // 3.2
    h2('3.2  Migration React vers Next.js'),

    h3("Contexte et motivation"),

    body("SikBeauty était initialement développé comme une application React SPA (Single Page Application). Ce modèle, bien que simple à mettre en œuvre, présentait deux limitations majeures pour un site e-commerce :"),

    li("Référencement naturel (SEO) limité : les moteurs de recherche peinaient à indexer le contenu généré dynamiquement par JavaScript côté client, ce qui pénalisait la visibilité organique du site."),
    li("Performances perçues insuffisantes : le rendu côté client impliquait un First Contentful Paint (FCP) élevé, dégradant l\'expérience utilisateur, particulièrement sur mobile."),

    ...blank(),

    body("Next.js, framework React avec rendu côté serveur (SSR), apportait une réponse directe à ces deux problématiques tout en conservant la compatibilité avec l'écosystème React existant."),

    ...blank(),

    h3("Processus de migration"),

    body("La migration a été conduite de manière méthodique, en cinq phases successives :"),

    ...blank(),

    li("Audit des composants React existants : identification des dépendances à des APIs browser-only (window, localStorage), des hooks React incompatibles avec le SSR (useEffect avec effets de bord immédiats), et des librairies sans support SSR.", "Phase 1 — Audit : "),
    li("Initialisation du projet Next.js : mise en place de l\'App Router, configuration des layouts partagés (RootLayout), définition de la hiérarchie des pages et adaptation du système de routing.", "Phase 2 — Initialisation : "),
    li("Migration des composants : transformation des composants React en Server Components (pour les données statiques) et Client Components (pour l\'interactivité). Annotation explicite des Client Components avec la directive 'use client'.", "Phase 3 — Migration : "),
    li("Résolution des incompatibilités : adaptation des imports dynamiques (next/dynamic) pour les composants sans support SSR, gestion des cookies et sessions côté serveur, refactorisation des appels API.", "Phase 4 — Debugging : "),
    li("Accompagnement des autres développeurs : sessions de pair programming pour transmettre les bonnes pratiques Next.js et former l'équipe aux spécificités de l\'App Router.", "Phase 5 — Formation : "),

    ...blank(),

    body("Grâce à mon expérience préalable avec React et Next.js, j\'ai pu guider l'équipe à travers les subtilités de ce framework et réduire significativement la courbe d\'apprentissage collective."),

    ...blank(),

    h3("Résultats de la migration"),

    table([
      thead('Critère', 'React SPA (avant)', 'Next.js SSR (après)'),
      trow(true,  'First Contentful Paint (FCP)', '2.8 s (estimé)',         '< 0.8 s (cible SSR)'),
      trow(false, 'Indexation par les moteurs',   'Partielle (JS requis)',   'Complète (HTML statique)'),
      trow(true,  'Score Lighthouse Performance', '< 60',                   '> 90 (cible atteinte)'),
      trow(false, 'SEO Lighthouse',               '< 70',                   '> 95'),
      trow(true,  'Génération de métadonnées',    'Statique (manuelle)',     'Dynamique (generateMetadata)'),
      trow(false, 'Rendu des fiches produit',     'Client-side uniquement', 'SSR / Static Generation'),
    ]),

    p([tr('Tableau 5 — Comparatif React SPA vs Next.js SSR', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    // 3.3
    h2('3.3  Optimisation SEO'),

    body("En tant que marketplace e-commerce, SikBeauty dépend largement de son référencement naturel pour acquérir du trafic organique. J\'ai pris en charge l\'intégralité de la stratégie SEO technique du projet, en couvrant les dimensions suivantes :"),

    ...blank(),

    h3("Métadonnées dynamiques"),

    body("Grâce à l\'API generateMetadata de Next.js, j\'ai implémenté la génération dynamique des métadonnées pour chaque page. Pour les pages de listing (catégories) et de détail produit, les titres, descriptions et balises canoniques sont générés à partir des données produit récupérées côté serveur, garantissant leur unicité et leur pertinence."),

    ...blank(),

    h3("Open Graph et Twitter Cards"),

    body("Chaque page produit dispose désormais de balises Open Graph complètes (og:title, og:description, og:image, og:url) et de Twitter Cards, optimisant le partage des fiches produits sur les réseaux sociaux. L\'image produit est incluse dynamiquement dans les métadonnées pour maximiser le taux de clic lors des partages."),

    ...blank(),

    h3("Sitemap XML et robots.txt"),

    body("J\'ai configuré la génération automatique du sitemap XML via l\'API sitemap.ts de Next.js, incluant toutes les pages produits, catégories et pages statiques. Le fichier robots.txt a été configuré pour autoriser l\'exploration des pages pertinentes tout en protégeant les routes privées."),

    ...blank(),

    h3("URLs canoniques et slugs SEO-friendly"),

    body("Les URLs des fiches produits et des catégories ont été refactorisées pour adopter un format lisible et descriptif (ex. /produits/cosrx-snail-mucin-essence) plutôt que des identifiants numériques opaques. Des balises canoniques ont été ajoutées pour éviter le contenu dupliqué en cas de paramètres d\'URL variables (pagination, filtres)."),

    ...blank(),

    h3("Optimisations de performance impactant le SEO"),

    body("Core Web Vitals (CWV) étant un facteur de classement Google, j\'ai mis en œuvre les optimisations suivantes :"),

    li("Optimisation des images avec next/image : lazy loading automatique, formats modernes (WebP/AVIF), dimensionnement responsive."),
    li("Code splitting par route : seul le JavaScript nécessaire à chaque page est chargé."),
    li("Prefetching des liens internes : Next.js précharge automatiquement les pages liées."),
    li("Réduction du Cumulative Layout Shift (CLS) par la réservation explicite des espaces pour les images."),

    ...blank(),

    table([
      thead('Action SEO', 'Technologie utilisée', 'Impact'),
      trow(true,  'Métadonnées dynamiques',     'Next.js generateMetadata',   'Indexation optimale par page'),
      trow(false, 'Open Graph / Twitter Cards', 'Métadonnées statiques/dyn.', 'Partage social optimisé'),
      trow(true,  'Sitemap XML',                'Next.js sitemap.ts',          'Exploration complète par Google'),
      trow(false, 'robots.txt',                 'Fichier statique Next.js',    'Contrôle de l\'exploration'),
      trow(true,  'URLs canoniques / slugs',    'URL rewriting + canonical',   'Évite le contenu dupliqué'),
      trow(false, 'Optimisation images',        'next/image (WebP/AVIF)',      'Amélioration LCP et CLS'),
      trow(true,  'Code splitting',             'App Router (RSC)',            'Réduction du bundle JS'),
    ]),

    p([tr('Tableau 6 — Optimisations SEO réalisées sur SikBeauty', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    // 3.4
    h2("3.4  Infrastructure DevOps & Déploiement"),

    h3("Containerisation avec Docker"),

    body("Afin de garantir la portabilité et la reproductibilité de l\'environnement de déploiement, j\'ai rédigé un Dockerfile multi-étapes pour l\'application SikBeauty. Ce Dockerfile adopte le pattern build-time / runtime qui permet de produire une image de production légère :"),

    li("Étape de build : installation de toutes les dépendances (y compris dev), compilation TypeScript et génération du bundle Next.js."),
    li("Étape de production : copie uniquement des artefacts compilés et des dépendances de production dans une image Node.js Alpine minimale."),

    ...blank(),

    body("J\'ai également rédigé le fichier docker-compose.yml orchestrant l\'ensemble des services nécessaires au fonctionnement de l\'application : le conteneur applicatif Next.js, la base de données, et le service Redis si nécessaire. La configuration inclut la définition des variables d\'environnement, des volumes persistants, des health checks et des dépendances entre services."),

    ...blank(),

    h3("Pipeline GitHub Actions (CI/CD)"),

    body("Le pipeline d\'intégration et de déploiement continu que j\'ai conçu et configuré se déclenche automatiquement à chaque push ou Pull Request vers les branches principales. Il se compose des étapes suivantes :"),

    ...blank(),

    table([
      thead('Étape', 'Action', 'Condition de succès'),
      trow(true,  '1. Checkout',             'Récupération du code source (actions/checkout@v4)',         'Code disponible'),
      trow(false, '2. Setup Node.js',         'Configuration Node.js 24.x avec cache npm',                 'Runtime prêt'),
      trow(true,  '3. Installation',          'npm ci (installation déterministe des dépendances)',         'node_modules OK'),
      trow(false, '4. Build',                 'npm run build (compilation Next.js)',                        'Bundle généré'),
      trow(true,  '5. Build Docker',          'docker build → tag de l\'image avec le SHA du commit',      'Image créée'),
      trow(false, '6. Push Registry',         'Push de l\'image vers le registry GitHub Packages',          'Image publiée'),
      trow(true,  '7. Déploiement SSH',       'SSH sur le VPS Hostinger, pull de l\'image, restart Docker', 'App redémarrée'),
      trow(false, '8. Vérification santé',    'Curl sur l\'endpoint de health check de l\'application',     'HTTP 200 retourné'),
    ]),

    p([tr("Tableau 7 — Étapes du pipeline CI/CD GitHub Actions (SikBeauty)", { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    h3("Configuration du VPS Hostinger"),

    body("La mise en production sur le VPS Hostinger a nécessité les opérations de configuration serveur suivantes :"),

    li("Installation de Docker et Docker Compose sur le serveur Ubuntu."),
    li("Configuration des secrets GitHub Actions (variables sensibles : credentials Docker, clé SSH, variables d\'environnement de production)."),
    li("Configuration du reverse proxy Nginx pour acheminer le trafic HTTP/HTTPS vers le conteneur applicatif."),
    li("Liaison du nom de domaine avec les DNS Hostinger et configuration du certificat SSL (Let\'s Encrypt)."),
    li("Mise en place d\'une politique de redémarrage automatique des conteneurs (restart: always)."),

    p([tr("Figure 7 — Pipeline CI/CD GitHub Actions (schéma)", { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 120, after: 60 }),
    p([tr("[Emplacement réservé — Capture de la page GitHub Actions]", { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    // 3.5
    h2("3.5  Contributions Backend"),

    body("En marge de mes contributions principales sur SikBeauty, j\'ai également apporté un soutien technique aux membres de l'équipe sur les aspects backend. Plusieurs bugs complexes m\'ont été soumis et résolus :"),

    li("Correction d\'une fuite de connexions Prisma en environnement de test, causée par des instances multiples du PrismaClient créées sans gestion du cycle de vie."),
    li("Résolution d\'une incohérence de validation des données d\'entrée sur l\'API de gestion des commandes, où certains champs optionnels n'étaient pas correctement traités."),
    li("Optimisation d\'une requête Prisma produisant des appels N+1 sur la liste des produits avec leurs catégories, remplacée par une requête avec include approprié."),

    ...blank(),

    body("Ces interventions ponctuelles m\'ont permis de maintenir la dynamique de développement de l'équipe sans interruption significative, tout en partageant des bonnes pratiques lors des revues de code."),

    // ═══════════════════════════════════════════════════════════════════════
    // CHAPITRE 4
    // ═══════════════════════════════════════════════════════════════════════

    h1('CHAPITRE 4 — PROJET 2 : ALIGNO', true),

    // 4.1
    h2('4.1  Présentation de la plateforme'),

    body("Aligno est une application Full-Stack de productivité et de gestion de projets développée de zéro durant le stage. Elle se positionne comme une solution tout-en-un permettant aux équipes et aux individus de gérer simultanément leurs projets, leur temps et leurs finances personnelles au sein d\'un seul et même espace de travail numérique."),

    ...blank(),

    body("La plateforme repose sur une interface premium aux visuels glassmorphiques, baptisée « Midnight Obsidian », caractérisée par un fond sombre profond, des effets de verre dépoli, des accents cyan lumineux et des animations fluides. Cette attention au design constitue un différenciateur fort par rapport aux outils de productivité génériques."),

    ...blank(),

    body("Aligno intègre quatre modules fonctionnels majeurs :"),

    li("Gestion de projets Kanban : tableaux interactifs avec colonnes, cartes, sous-tâches, labels, assignées, dates d'échéance et synchronisation temps réel via Socket.IO.", "Kanban — "),
    li("Gestion du temps : système de blueprints de journée (templates) et d\'activation de plannings quotidiens avec blocs de temps catégorisés.", "Time Management — "),
    li("Wallet — Finances : gestion multi-comptes bancaires, suivi des dépenses et revenus, abonnements récurrents, budgets mensuels et graphiques analytiques.", "Wallet — "),
    li("Dashboard analytique : vue synthétique des indicateurs clés de productivité et de santé financière.", "Dashboard — "),

    ...blank(),

    p([tr("Figure 1 — Architecture générale d\'Aligno (topologie système)", { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 120, after: 60 }),
    p([tr('[Emplacement réservé — Diagramme de topologie système Aligno]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    // 4.2
    h2("4.2  Initialisation du projet"),

    body("La phase d\'initialisation du projet Aligno a constitué un travail fondateur essentiel à la qualité et à la maintenabilité de l\'ensemble des développements ultérieurs. J\'ai participé activement à cette phase, en collaboration avec les autres membres de l'équipe."),

    ...blank(),

    h3("Mise en place de l\'environnement de développement"),

    body("L\'environnement de développement complet a été conteneurisé via Docker Compose, orchestrant quatre services interdépendants :"),

    li("Service app : le serveur de développement Nuxt 4, exposé sur le port 4000, avec hot reload et partage du répertoire de code via volume."),
    li("Service postgres_db : PostgreSQL 17 avec health check pg_isready, démarrant avant le service applicatif."),
    li("Service redis : Redis 7 Alpine, utilisé pour les sessions de cache, le bus de messages Socket.IO et le broker BullMQ."),
    li("Service pgadmin : pgAdmin 4, interface graphique de gestion de la base de données, accessible sur le port 5050."),

    ...blank(),

    body("Le script de démarrage du conteneur applicatif gère automatiquement l\'initialisation du projet Nuxt si le répertoire est vide, l\'installation des dépendances, et le lancement du serveur de développement. Cette configuration garantit une expérience de développement identique pour tous les membres de l'équipe, indépendamment de leur système d\'exploitation."),

    ...blank(),

    h3("Configuration globale du projet"),

    body("La configuration du projet Nuxt 4 a été définie dans nuxt.config.ts, incluant la déclaration des modules (@nuxt/ui, @nuxt/icon, @nuxt/image, @pinia/nuxt, nuxt-security), la configuration du runtime (variables d\'environnement serveur et publiques), les en-têtes de sécurité HTTP, et la configuration de Nitro pour les routes API."),

    ...blank(),

    body("Le gestionnaire de packages npm a été configuré avec le mode ci (npm ci) pour garantir des installations déterministes, et un hook Husky pre-push a été mis en place pour exécuter automatiquement la suite de tests Vitest avant chaque push."),

    // 4.3
    h2("4.3  Développement Backend — Module Authentification"),

    body("J\'ai eu la responsabilité exclusive de la conception et du développement de l\'intégralité du module d\'authentification et de gestion des profils utilisateurs d\'Aligno. Ce module constitue le socle de sécurité de toute la plateforme. Il a été développé en appliquant une architecture en couches stricte, en respectant les standards de sécurité modernes et en visant une couverture de test complète."),

    ...blank(),

    h3("Architecture en couches"),

    body("Le module d\'authentification respecte une architecture en couches qui découple rigoureusement les responsabilités et garantit la maintenabilité et la testabilité du code :"),

    ...blank(),

    p([tr("Figure 2 — Architecture en couches du module Authentification", { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 40, after: 40 }),

    table([
      thead('Couche', 'Fichier', 'Responsabilité'),
      trow(true,  'Route Handler',  'server/api/auth/*.ts',                    "Définition des endpoints HTTP, méthode, chemin, spec OpenAPI"),
      trow(false, 'Controller',     'server/controller/auth.controller.ts',    "Parsing de la requête, validation Zod, gestion des cookies, enveloppe de réponse"),
      trow(true,  'Service',        'server/service/auth.service.ts',          "Logique métier : hachage, orchestration des tokens, règles domaine"),
      trow(false, 'Token Service',  'server/service/token.service.ts',         "Signature et vérification des JWT (access + refresh)"),
      trow(true,  'Email Service',  'server/service/email.service.ts',         "Envoi d\'e-mails transactionnels via l\'API Resend"),
      trow(false, 'Upload Service', 'server/service/upload.service.ts',        "Traitement des images (Sharp) : resize 400×400, WebP"),
      trow(true,  'Repository',     'server/repository/user.repository.ts',    "Implémentation de l\'interface IUserDAO via Prisma"),
      trow(false, 'DAO',            'server/dao/user.dao.ts',                  "Interface contrat d\'accès aux données"),
      trow(true,  'DTO / Mapper',   'server/dto/auth.dto.ts + mapper',        "Typage des entrées/sorties et épuration des champs sensibles"),
      trow(false, 'Validations',    'server/validations/auth.zod.ts',          "Schémas Zod pour tous les payloads"),
    ]),

    p([tr('Tableau — Architecture en couches du module Auth', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    p([tr("Figure 3 — Flux de traitement d\'une requête HTTP Auth", { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 120, after: 60 }),
    p([tr('[Emplacement réservé — Diagramme de flux de requête Auth]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    h3("Fonctionnalités développées"),

    body("Le module couvre l\'ensemble du cycle de vie de l\'authentification et de la gestion du profil :"),

    ...blank(),

    body("Inscription (Register) : L\'endpoint POST /api/auth/register accepte un payload multipart/form-data incluant les informations personnelles (prénom, nom, âge, e-mail, téléphone, mot de passe) et optionnellement une photo de profil. Le contrôleur valide les données via un schéma Zod, le service hash le mot de passe avec bcrypt (12 rounds), crée l\'utilisateur en base de données, génère un token de vérification (32 octets hexadécimaux, hashé en SHA-256 en base de données), et déclenche l\'envoi d\'un e-mail de vérification via Resend. La photo de profil est redimensionnée en 400×400 pixels, convertie en WebP à 80% de qualité par le service Sharp, et stockée dans le répertoire public/uploads/avatars/."),

    ...blank(),

    body("Connexion (Login) : L\'endpoint POST /api/auth/login valide l\'e-mail et le mot de passe, vérifie le statut de vérification de l\'e-mail, puis génère une paire de tokens JWT : un access token de courte durée (15 minutes) et un refresh token longue durée (30 jours). L\'access token est retourné dans le corps de la réponse, tandis que le refresh token est placé dans un cookie HttpOnly, Secure, SameSite=Strict. Seul le hash SHA-256 du refresh token est persisté en base de données."),

    ...blank(),

    body("Déconnexion (Logout) : Invalide la session côté serveur en supprimant le hash du refresh token de la base de données, et supprime le cookie de session du navigateur. Retourne systématiquement HTTP 200 pour éviter de révéler l'état de la session."),

    ...blank(),

    body("Vérification d\'e-mail : L\'endpoint POST /api/auth/email/validation reçoit le token de vérification envoyé par e-mail, compare son hash SHA-256 avec la valeur en base de données, vérifie la validité temporelle (24 heures), et active le compte utilisateur si les conditions sont réunies."),

    ...blank(),

    body("Mot de passe oublié / Réinitialisation : La route /api/auth/forgot-password génère un token de réinitialisation (32 octets, valide 1 heure) et envoie un e-mail de réinitialisation. Conformément aux bonnes pratiques anti-énumération, la réponse est identique que l\'e-mail existe ou non en base de données. La route /api/auth/reset-password valide le token, vérifie son expiration, hash le nouveau mot de passe et invalide le token."),

    ...blank(),

    body("Profil et mise à jour du profil : L\'endpoint GET /api/auth/me retourne les données du profil de l\'utilisateur authentifié, après épuration des champs sensibles par le UserMapper. L\'endpoint PUT /api/auth/profile permet la mise à jour partielle du profil (prénom, nom, âge, e-mail, téléphone, photo de profil). En cas de mise à jour d\'une photo, l\'ancienne image locale est supprimée du disque pour éviter les fuites de stockage."),

    ...blank(),

    h3("Schéma de la base de données"),

    table([
      thead('Colonne', 'Type', 'Contraintes', 'Description'),
      trow(true,  'id',                    'String',    '@id @default(cuid())',        'Clé primaire CUID'),
      trow(false, 'first_name',            'String',    'required',                    'Prénom'),
      trow(true,  'last_name',             'String',    'required',                    'Nom de famille'),
      trow(false, 'age',                   'Int',       'required',                    'Âge (13–120)'),
      trow(true,  'email',                 'String',    '@unique',                     'Adresse e-mail'),
      trow(false, 'phone',                 'String',    '@unique',                     'Numéro E.164'),
      trow(true,  'password_hash',         'String',    'required',                    'Hash bcrypt (12 rounds)'),
      trow(false, 'profile_picture_url',   'String?',   'optional',                    "URL de l\'avatar WebP"),
      trow(true,  'email_verified',        'Boolean',   '@default(false)',             'Statut de vérification'),
      trow(false, 'email_verify_token',    'String?',   'optional',                    'Token SHA-256 (vérification)'),
      trow(true,  'refresh_token',         'String?',   'optional',                    'Hash SHA-256 du refresh JWT'),
      trow(false, 'reset_password_token',  'String?',   'optional',                    'Token SHA-256 (reset)'),
      trow(true,  'reset_password_expires','DateTime?', 'optional',                    'Expiration (1 heure)'),
    ]),

    p([tr('Tableau 9 — Schéma Prisma de la table users', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    h3("Contrats API"),

    table([
      thead('Endpoint', 'Méthode', 'Auth', 'Description'),
      trow(true,  '/api/auth/register',          'POST', 'Guest',     'Inscription + upload avatar + e-mail de vérification'),
      trow(false, '/api/auth/login',             'POST', 'Guest',     'Authentification + émission de la paire de tokens'),
      trow(true,  '/api/auth/me',                'GET',  'Protected', 'Récupération du profil authentifié'),
      trow(false, '/api/auth/profile',           'PUT',  'Protected', 'Mise à jour du profil et/ou de la photo'),
      trow(true,  '/api/auth/logout',            'POST', 'Protected', 'Invalidation de la session'),
      trow(false, '/api/auth/email/validation',  'POST', 'Guest',     "Vérification de l\'e-mail via token"),
      trow(true,  '/api/auth/forgot-password',   'POST', 'Guest',     'Demande de réinitialisation du mot de passe'),
      trow(false, '/api/auth/reset-password',    'POST', 'Guest',     'Exécution de la réinitialisation'),
    ]),

    p([tr('Tableau 8 — Inventaire des routes API Auth', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    h3("Sécurité"),

    body("Le module d\'authentification intègre un ensemble complet de contrôles de sécurité :"),

    table([
      thead('Contrôle', 'Implémentation'),
      trow(true,  'Hachage des mots de passe',  'Bcrypt avec 12 rounds de salage adaptatif'),
      trow(false, 'Access Token',               'JWT court (15 min) signé avec JWT_SECRET'),
      trow(true,  'Refresh Token',              'JWT long (30 j), cookie HttpOnly SameSite=Strict, hash SHA-256 en BDD'),
      trow(false, 'Tokens de vérification',     '32 octets crypto.randomBytes(), seul le hash SHA-256 est stocké'),
      trow(true,  'Rafraîchissement silencieux','Access token expiré → refresh via cookie → nouveau token dans X-Access-Token'),
      trow(false, 'Anti-énumération',           'forgot-password retourne toujours la même réponse'),
      trow(true,  'Protection des routes guest','Les utilisateurs authentifiés sont bloqués (403) sur les routes guest-only'),
      trow(false, "Épuration des champs sensibles", 'UserMapper.toResponseDto() supprime hash, tokens, dates d\'expiration'),
      trow(true,  'Validation Zod',             'Tous les payloads validés → 422 avec erreurs détaillées par champ'),
      trow(false, 'Traitement des images',      'Sharp : resize 400×400, WebP 80%, suppression de l\'ancienne image'),
    ]),

    p([tr('Tableau 10 — Contrôles de sécurité implémentés', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    p([tr('Figure 4 — Stratégie de tokens JWT (Access + Refresh)', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 120, after: 60 }),
    p([tr('[Emplacement réservé — Diagramme de la stratégie de tokens]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    h3("Variables d\'environnement"),

    table([
      thead('Variable', 'Obligatoire', 'Description'),
      trow(true,  'DATABASE_URL',         '✅ Oui', 'Chaîne de connexion PostgreSQL'),
      trow(false, 'JWT_SECRET',           '✅ Oui', "Clé de signature des access tokens"),
      trow(true,  'JWT_REFRESH_SECRET',   '✅ Oui', "Clé de signature des refresh tokens"),
      trow(false, 'RESEND_API_KEY',       '✅ Oui', "Clé API Resend pour les e-mails transactionnels"),
      trow(true,  'REDIS_URL',            '✅ Oui', "URL de connexion Redis"),
      trow(false, 'APP_URL',              '❌ Non', "URL de base de l\'application (défaut : http://localhost:4000)"),
      trow(true,  'NODE_ENV',             '❌ Non', "Environnement : development, production, ou test"),
      trow(false, 'SENTRY_DSN',          '❌ Non', "DSN Sentry pour le suivi des exceptions"),
    ]),

    p([tr("Tableau 11 — Variables d\'environnement", { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    h3("Middlewares"),

    body("Le système de middlewares contrôle l\'accès aux routes selon leur nature :"),

    ...blank(),

    body("Auth Middleware (routes protégées) : Le middleware auth.ts intercepte toutes les requêtes vers les routes protégées (GET /api/auth/me, PUT /api/auth/profile, POST /api/auth/logout). Il extrait le token du header Authorization: Bearer, le vérifie avec la clé JWT_SECRET, et attache l\'identifiant utilisateur au contexte de la requête. Si le token est expiré, il tente un rafraîchissement silencieux via le cookie refresh_token : le hash du cookie est comparé à la valeur en base de données, et si valide, un nouvel access token est généré et retourné dans le header X-Access-Token."),

    ...blank(),

    body("Guest Middleware (routes réservées aux non-authentifiés) : Le middleware guest.ts protège les routes d\'inscription, de connexion et de réinitialisation de mot de passe contre les tentatives d\'accès par des utilisateurs déjà authentifiés. Si un utilisateur authentifié tente d\'accéder à ces routes, il reçoit une réponse HTTP 403 Guests only."),

    // 4.4
    h2("4.4  Tests automatisés avec Vitest"),

    body("La fiabilité du module d\'authentification a été garantie par une suite de tests d\'intégration exhaustive, développée avec Vitest v4 et @nuxt/test-utils/e2e. Les tests opèrent contre un serveur Nuxt réel et une base de données PostgreSQL dédiée, couvrant l\'ensemble des scénarios fonctionnels, de validation et de sécurité."),

    ...blank(),

    h3("Architecture de test"),

    body("La configuration Vitest (vitest.config.ts) impose l\'exécution séquentielle des fichiers de test (fileParallelism: false) pour prévenir les conditions de concurrence sur la base de données partagée. Chaque fichier de test bénéficie d\'un beforeEach(() => clearDatabase()) pour garantir l\'isolation et le déterminisme des résultats."),

    ...blank(),

    h3("Couverture de test — Module Auth (35 tests)"),

    table([
      thead('Fichier de test', 'Tests', 'Scénarios couverts'),
      trow(true,  'register.test.ts',          '8', 'Inscription réussie, e-mail dupliqué, téléphone dupliqué, champs manquants, e-mail invalide, mot de passe faible, mots de passe non conformes'),
      trow(false, 'login.test.ts',              '5', 'Connexion réussie, utilisateur inexistant, mot de passe erroné, e-mail non vérifié, champ manquant'),
      trow(true,  'me.test.ts',                 '3', 'Token valide, token absent (401), token expiré (401)'),
      trow(false, 'logout.test.ts',             '2', 'Déconnexion réussie, accès non autorisé (401)'),
      trow(true,  'validation.test.ts',         '3', 'Token valide, token invalide, token expiré'),
      trow(false, 'forgot-password.test.ts',    '3', "E-mail existant, e-mail inexistant (même réponse — anti-énumération), validation"),
      trow(true,  'reset-password.test.ts',     '4', "Réinitialisation réussie, token invalide, token expiré, mot de passe manquant"),
      trow(false, 'auth-middleware.test.ts',    '5', 'Token valide, absent (401), rafraîchissement silencieux X-Access-Token, cookie invalide (401), hash BDD non conforme (401)'),
      trow(true,  'guest-middleware.test.ts',   '2', "Blocage d\'un utilisateur authentifié sur /login (403), sur /register (403)"),
    ]),

    p([tr('Tableau 12 — Couverture des tests Vitest — Module Auth (35 tests)', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 80 }),

    h3("Couverture de test — Module Wallet (79 tests)"),

    table([
      thead('Fichier de test', 'Tests', 'Scénarios couverts'),
      trow(true,  'bank-accounts.test.ts',   '17', 'CRUD complet, authentification, validation, isolation inter-utilisateurs'),
      trow(false, 'subscriptions.test.ts',   '19', 'CRUD, status INCOME/EXPENSE, cross-user isolation, validations'),
      trow(true,  'transactions.test.ts',    '23', 'CRUD, atomicité du solde, correction sur mise à jour, rollback sur suppression'),
      trow(false, 'budget.test.ts',          '20', 'Upsert, logique des alertes (90%/100%), sources de dépenses, graphique mensuel'),
    ]),

    p([tr('Tableau 13 — Couverture des tests Vitest — Module Wallet (79 tests)', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 80 }),

    body("Au total, le projet Aligno compte 114 tests automatisés (35 Auth + 79 Wallet), tous exécutés automatiquement à chaque Pull Request via le pipeline GitHub Actions."),

    // 4.5
    h2("4.5  Planification Frontend"),

    body("À l\'issue du développement backend du module d\'authentification, et avant que l'équipe n\'entame les développements frontend, j\'ai pris en charge l\'intégralité de la planification et de l\'organisation du travail frontend dans Jira."),

    ...blank(),

    h3("Création des Epics et User Stories"),

    body("J\'ai structuré le backlog frontend en Epics correspondant aux grands modules de l\'application (Authentification, Gestion de projets Kanban, Time Management, Wallet, Dashboard). Pour chaque Epic, j\'ai rédigé les User Stories associées, en précisant le rôle utilisateur, l\'action attendue et la valeur fonctionnelle."),

    ...blank(),

    body("Les User Stories ont ensuite été décomposées en sous-tâches techniques : création de la page Vue, création des composants réutilisables, intégration du store Pinia, connexion à l\'API backend, validation des formulaires, gestion des états de chargement et d\'erreur."),

    ...blank(),

    h3("Sprint Planning et distribution des tâches"),

    body("Lors du Sprint Planning Frontend, j\'ai présenté à l'équipe l\'ensemble des User Stories planifiées et conduit la session d\'estimation. Les tâches ont ensuite été réparties entre les développeurs en tenant compte de leurs compétences respectives, de leur charge courante et de leurs préférences. Cette répartition a été formalisée dans Jira avec des assignations explicites et des dates de livraison cibles."),

    ...blank(),

    body("Ce travail de planification en amont a permis à chaque développeur de démarrer le sprint avec une vision claire de ses responsabilités, sans ambiguïté sur le périmètre ni les critères d\'acceptation de chaque tâche."),

    // 4.6
    h2("4.6  Développement Frontend — Module Authentification"),

    body("J\'ai développé l\'ensemble des interfaces utilisateur du module d\'authentification d\'Aligno. Ces pages constituent la première expérience de l\'utilisateur avec la plateforme et véhiculent les valeurs de qualité et d'élégance qui caractérisent Aligno."),

    ...blank(),

    h3("Système de design — Midnight Obsidian"),

    body("Toutes les pages d\'authentification s\'appuient sur le design system Midnight Obsidian, que j\'ai contribué à mettre en place lors du Sprint 0 (Frontend Foundation). Ce système repose sur un thème sombre profond (#08132A) avec des accents cyan lumineux (#00E5FF), des effets de glassmorphisme (backdrop-filter: blur), des typographies premium (Plus Jakarta Sans, Hanken Grotesk) et des animations de transition fluides."),

    ...blank(),

    h3("Pages développées"),

    table([
      thead('Page', 'Route', 'Fonctionnalités clés'),
      trow(true,  'Connexion (Login)',              '/login',           "Formulaire e-mail/mot de passe, toggle visibilité, redirection post-login, gestion 403 (e-mail non vérifié)"),
      trow(false, 'Inscription (Register)',          '/register',        "Formulaire 7 champs, prévisualisation avatar, sérialisation FormData, indicateur de force du mot de passe"),
      trow(true,  'Mot de passe oublié',            '/forgot-password', "Formulaire e-mail, countdown 60s anti-spam, message de succès identique (anti-énumération)"),
      trow(false, 'Réinitialisation',               '/reset-password',  "Validation du token en temps réel, PasswordStrength component, redirect si token absent"),
      trow(true,  'Vérification e-mail',            '/verify-email',    "Auto-vérification au montage si token en query, états loading/succès/erreur, fallback manuel"),
      trow(false, 'Profil',                         '/profile',         "Affichage du profil complet, modification des informations, changement d\'avatar avec compression"),
    ]),

    p([tr('Tableau 14 — Pages Frontend du module Authentification', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    h3("Composants réutilisables développés"),

    li("PasswordStrength.vue : Indicateur visuel de force du mot de passe, évaluant dynamiquement 5 critères (longueur, majuscule, minuscule, chiffre, caractère spécial) avec segments colorés progressifs (Très faible → Fort).", "PasswordStrength — "),
    li("AppInput.vue (amélioré) : Composant input enrichi d\'un toggle de visibilité pour les champs de type mot de passe, gérant localement le type (password ↔ text) sans altérer les attributs parent.", "AppInput — "),

    ...blank(),

    h3("Gestion de l'état et intégration API"),

    body("La gestion de l'état d\'authentification repose sur un store Pinia (app/stores/auth.ts) contenant l\'utilisateur courant, l\'access token (en mémoire uniquement, jamais persisté) et les états de chargement. Le store expose des actions setUser(), setToken() et logout() qui encapsulent les mutations d'état et les redirections associées."),

    ...blank(),

    body("Le composable useAuth.ts constitue la couche d\'abstraction entre les pages et le store + l\'API. Il expose des méthodes login(), register(), logout() et fetchUser() qui orchestrent les appels API, les mutations de store et les redirections de navigation."),

    ...blank(),

    body("Le client API (useApi.ts) est un wrapper $fetch.create() qui attache automatiquement le JWT dans le header Authorization, intercepte le header X-Access-Token pour mettre à jour silencieusement le token en mémoire, et gère les erreurs 401 en tentant un rafraîchissement silencieux avant de re-tenter la requête originale."),

    ...blank(),

    h3("Restauration de session et Route Guards"),

    body("Un plugin client-side (auth.client.ts) s\'exécute à l\'initialisation de l\'application et tente de restaurer la session en appelant GET /api/auth/me. Si la requête réussit (grâce au cookie refresh_token HttpOnly), l\'utilisateur est reconnecté silencieusement sans avoir à ressaisir ses identifiants. Pendant ce temps, une page de chargement est affichée pour éviter le flash de la page de connexion."),

    ...blank(),

    body("Le middleware global auth.global.ts s\'exécute à chaque changement de route côté client. Il vérifie si l\'utilisateur est authentifié et redirige vers /login si une route protégée est accédée sans authentification (en préservant l\'URL cible dans le paramètre ?redirect=)."),

    ...blank(),

    p([tr("Figure 5 — Flux de restauration de session (app init)", { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 120, after: 60 }),
    p([tr('[Emplacement réservé — Capture de la page de connexion Aligno]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    // 4.7
    h2("4.7  Finalisation & Livraison du projet"),

    body("En phase de finalisation du projet Aligno, j\'ai endossé le rôle de responsable qualité, en prenant en charge l\'ensemble des tâches de polish, de correction et de préparation à la livraison de la version 1.0."),

    ...blank(),

    h3("SEO de l\'application"),

    body("J\'ai implémenté une stratégie SEO complète pour chaque page de l\'application Aligno : balises <title> dynamiques, métadonnées Open Graph et Twitter Cards, URLs canoniques, balises JSON-LD pour les données structurées, et configuration du sitemap XML."),

    ...blank(),

    h3("Optimisation des performances"),

    body("Les optimisations de performance ont porté sur la réduction du bundle JavaScript (tree-shaking, code splitting par route), le lazy loading des composants lourds (ApexCharts, FullCalendar), l\'optimisation des images via @nuxt/image, et l\'amélioration des temps de rendu côté serveur."),

    ...blank(),

    h3("Accessibilité (A11y)"),

    body("J\'ai conduit un audit d\'accessibilité de l\'ensemble des pages et corrigé les non-conformités identifiées : attributs aria-label sur les icônes interactives, hiérarchie des titres HTML (h1 unique par page), contraste des textes respectant WCAG 2.1 niveau AA, gestion du focus clavier sur les modales et les dropdowns, et navigation clavier complète."),

    ...blank(),

    h3("Dark Mode / Light Mode"),

    body("Le système de thèmes (Dark Mode / Light Mode) a été implémenté via la classe dark de Tailwind CSS et des variables CSS personnalisées. La préférence système de l\'utilisateur est détectée automatiquement au premier chargement, et un bouton de bascule permet de la modifier manuellement. Le choix est persisté via localStorage."),

    ...blank(),

    h3("Système de notifications global"),

    body("Le système de notifications toast (Notivue) a été configuré et intégré globalement dans app.vue. Le composable useNotifications.ts expose quatre méthodes : success(), error(), warning() et info(). Ces méthodes sont appelées par les composables useAuth, useWallet et useProjects après chaque opération API pour informer l\'utilisateur du résultat."),

    ...blank(),

    h3("QA et livraison finale"),

    body("La phase de QA (Quality Assurance) a consisté en une série de tests manuels exhaustifs couvrant l\'ensemble des parcours utilisateur sur les modules Auth, Kanban, Wallet et Time Management. Les bugs identifiés ont été reproduits, documentés et corrigés dans des branches fix/ dédiées."),

    ...blank(),

    body("J\'ai ensuite orchestré la fusion de l\'ensemble des branches feature/ dans la branche main, en résolvant manuellement les conflits Git et en vérifiant la stabilité de l\'application après chaque merge. La version 1.0 d\'Aligno a été livrée à M. LATRACH Mohammed avec la documentation technique complète."),

    // ═══════════════════════════════════════════════════════════════════════
    // CHAPITRE 5
    // ═══════════════════════════════════════════════════════════════════════

    h1('CHAPITRE 5 — TECHNOLOGIES UTILISÉES', true),

    body("Ce chapitre présente les technologies mises en œuvre durant le stage sur les deux projets, en décrivant pour chacune son rôle, ses avantages et la manière dont elle a été utilisée concrètement."),

    // 5.1
    h2("5.1  Stack Frontend"),

    h3("Nuxt 4 & Vue 3"),
    body("Nuxt 4 est le framework Full-Stack choisi pour Aligno. Construit au-dessus de Vue 3, il offre une architecture hybride SSR/SSG/SPA, des routes API intégrées via Nitro (Nuxt Server Routes), un système de modules extensible et une DX (Developer Experience) de haut niveau. Vue 3 apporte la Composition API, les refs réactives, les composables réutilisables et un système de rendu performant basé sur un Virtual DOM optimisé."),

    h3("TypeScript"),
    body("TypeScript a été adopté sur l\'ensemble du code base (frontend et backend) pour bénéficier du typage statique, de l\'autocomplétion IDE et de la détection d\'erreurs à la compilation. Les interfaces TypeScript (User, ApiResponse<T>, DTOs) assurent la cohérence des données entre le frontend et le backend."),

    h3("Tailwind CSS v4 & Nuxt UI"),
    body("Tailwind CSS v4 (intégré via le plugin Vite @tailwindcss/vite) fournit un système de classes utilitaires qui accélère le développement CSS. Nuxt UI v4 complète Tailwind avec une bibliothèque de composants accessibles et élégants (boutons, modales, formulaires, tableaux) préconfigurés selon le design system Midnight Obsidian."),

    h3("Pinia & Pinia Persisted State"),
    body("Pinia est le gestionnaire d'état officiel de Vue 3. Il organise l'état global de l\'application en stores thématiques (auth, wallet, projects, timeManagement). Le plugin pinia-plugin-persistedstate assure la persistance sélective des données sensibles dans localStorage ou sessionStorage."),

    h3("ApexCharts, FullCalendar & FormKit Drag-and-Drop"),
    body("ApexCharts est utilisé pour les graphiques analytiques du Wallet (histogramme dépenses vs budget). FullCalendar gère le module Time Management (vue calendrier des blocs de temps). Le plugin @formkit/drag-and-drop/vue permet la réorganisation des cartes Kanban par glisser-déposer entre colonnes."),

    h3("VueUse, Day.js, RRule & Notivue"),
    body("VueUse fournit une collection de composables utilitaires Vue 3 (useLocalStorage, useDark, useResizeObserver). Day.js est utilisé pour la manipulation et le formatage des dates. RRule gère les règles de récurrence pour les abonnements du Wallet. Notivue est la bibliothèque de notifications toast configurée globalement dans Aligno."),

    h3("Vue Email"),
    body("Vue Email permet de rédiger les templates d\'e-mails transactionnels (vérification, réinitialisation, invitations de projet) en tant que composants Vue, qui sont ensuite compilés en HTML compatible avec tous les clients e-mail, puis envoyés via l\'API Resend."),

    p([tr('Figure 6 — Architecture du module Gestion de Projets (schéma)', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 120, after: 60 }),
    p([tr('[Emplacement réservé — Capture du Kanban Board Aligno]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    // 5.2
    h2("5.2  Stack Backend & Temps réel"),

    h3("Prisma ORM & PostgreSQL"),
    body("Prisma est l\'ORM (Object-Relational Mapper) utilisé pour toutes les interactions avec la base de données PostgreSQL. Il génère un client TypeScript typé à partir des schémas Prisma définis en DSL déclaratif, offrant une autocomplétion complète des requêtes. PostgreSQL 17 assure la persistance des données relationnelles avec ses garanties ACID, ses contraintes d\'intégrité référentielle et ses index de performance."),

    h3("Zod"),
    body("Zod est la bibliothèque de validation des schémas utilisée côté backend. Chaque payload d\'API est validé par un schéma Zod typé avant d\'atteindre le contrôleur, garantissant la conformité des données entrantes. En cas de validation échouée, Zod retourne des erreurs structurées par champ, formatées en réponse HTTP 422."),

    h3("JWT & bcrypt"),
    body("La bibliothèque jsonwebtoken génère et vérifie les tokens JWT utilisés pour l\'authentification. Le module bcrypt implémente le hachage des mots de passe avec un facteur de coût de 12 rounds, offrant une résistance robuste aux attaques par force brute et par dictionnaire."),

    h3("Resend"),
    body("Resend est l\'API transactionnelle d\'e-mail utilisée pour l\'envoi des e-mails de vérification et de réinitialisation de mot de passe. Sa SDK Node.js officielle s\'intègre nativement avec Vue Email pour le rendu des templates."),

    h3("Socket.IO & Redis"),
    body("Socket.IO assure la communication temps réel bidirectionnelle entre le serveur Nitro et les clients Vue connectés au Kanban Board. Redis sert de bus de messages pub/sub pour l\'adaptateur Socket.IO (permettant la scalabilité multi-instances), de cache pour les sessions et d\'infrastructure pour BullMQ."),

    h3("BullMQ"),
    body("BullMQ est la bibliothèque de file d\'attente de messages basée sur Redis utilisée pour les tâches asynchrones de fond. Sur Aligno, les workers BullMQ gèrent les rappels d'échéances (due date reminders) : des jobs différés sont planifiés 24 heures avant chaque échéance de projet ou de carte, déclenchant l\'envoi d\'e-mails et de notifications in-app."),

    // 5.3
    h2("5.3  DevOps & Infrastructure"),

    h3("Docker & Docker Compose"),
    body("Docker est la technologie de conteneurisation utilisée pour empaqueter l\'application et ses dépendances dans des images reproducibles et portables. Docker Compose orchestre l\'ensemble des services (app, PostgreSQL, Redis, pgAdmin) dans un environnement cohérent, avec gestion des dépendances de démarrage (depends_on + health checks) et des volumes persistants."),

    h3("GitHub Actions"),
    body("GitHub Actions est la plateforme CI/CD (Continuous Integration / Continuous Deployment) configurée pour automatiser les vérifications de qualité (type check, tests) et le déploiement de l\'application. Le workflow se déclenche sur chaque Pull Request vers les branches main et dev."),

    p([tr('Figure 7 — Pipeline CI/CD GitHub Actions (détail des steps)', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 80, after: 40 }),
    p([tr('[Emplacement réservé — Capture GitHub Actions — workflow run]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 120, bg: C.bluePale }),

    h3("VPS Hostinger"),
    body("Le VPS (Virtual Private Server) Hostinger héberge les applications en production. La configuration inclut Nginx comme reverse proxy (routage HTTP/HTTPS vers Docker), Let\'s Encrypt pour les certificats SSL, et Docker avec politique de redémarrage automatique des conteneurs."),

    h3("Git & GitHub"),
    body("Git assure le versioning du code source, avec une stratégie Feature Branch Workflow. GitHub héberge les dépôts, gère les Pull Requests, les revues de code et l\'historique des contributions. Le hook Husky pre-push garantit que les tests sont verts avant toute publication de code."),

    // 5.4
    h2("5.4  Qualité, Sécurité & Monitoring"),

    h3("Vitest & Nuxt Test Utils"),
    body("Vitest est le framework de test unitaire et d\'intégration utilisé pour Aligno. @nuxt/test-utils/e2e fournit les utilitaires pour monter un serveur Nuxt complet dans les tests, permettant des tests d\'intégration réels contre des routes API live. Au total, 114 tests couvrent les modules Auth et Wallet."),

    h3("Nuxt Security"),
    body("Le module nuxt-security configure automatiquement des en-têtes HTTP de sécurité : Content-Security-Policy, X-Frame-Options, X-XSS-Protection, Strict-Transport-Security, et Permissions-Policy. Ces en-têtes réduisent la surface d\'attaque de l\'application contre les vecteurs XSS, clickjacking et injection."),

    h3("Sentry"),
    body("Sentry est la plateforme de suivi d\'erreurs intégrée dans les contrôleurs, services et middlewares. Elle capture les exceptions non gérées, les erreurs de connexion à la base de données et les erreurs d\'authentification, avec un contexte complet (stack trace, URL, user). Elle est désactivée en environnement de test pour éviter les faux positifs."),

    h3("Pino & Pino Pretty"),
    body("Pino est la bibliothèque de journalisation structurée (JSON) utilisée sur Aligno. En développement, pino-pretty formate les logs avec couleurs et indentation pour la lisibilité. En production, les logs JSON bruts sont ingérés par les outils de monitoring de l\'infrastructure."),

    ...blank(),

    table([
      thead('Catégorie', 'Technologies'),
      trow(true,  'Frontend',          'Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4, Nuxt UI, Pinia, Pinia Persisted State, VueUse, ApexCharts, FullCalendar, FormKit D&D, Notivue, Day.js, RRule, Vue Email'),
      trow(false, 'Backend',           'Node.js, Prisma ORM, PostgreSQL 17, Zod, JWT, bcrypt, Cookie Parser, UUID, Resend, Sharp'),
      trow(true,  'Temps réel',        'Socket.IO, Redis, ioredis, BullMQ, Socket.IO Redis Adapter'),
      trow(false, 'DevOps',            'Docker, Docker Compose, GitHub Actions, Hostinger VPS, Nginx, Let\'s Encrypt, Git, GitHub'),
      trow(true,  'Tests & Qualité',   'Vitest v4, Nuxt Test Utils, Husky, vue-tsc, ESLint'),
      trow(false, 'Sécurité',          'Nuxt Security, JWT, bcrypt, HttpOnly Cookies, Validation Zod, Nuxt CORS'),
      trow(true,  'Monitoring',        'Sentry, Pino, Pino Pretty'),
    ]),

    p([tr('Tableau 15 — Récapitulatif de la stack technologique complète', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    // ═══════════════════════════════════════════════════════════════════════
    // CHAPITRE 6
    // ═══════════════════════════════════════════════════════════════════════

    h1('CHAPITRE 6 — DIFFICULTÉS ET SOLUTIONS', true),

    body("Le déroulement du stage a été jalonné de difficultés techniques et organisationnelles qui ont constitué autant d\'opportunités d\'apprentissage et d\'approfondissement. Ce chapitre détaille les obstacles les plus significatifs rencontrés et les solutions apportées."),

    ...blank(),

    h2("6.1  Incompatibilité vue-tsc / Node.js 24 en environnement CI"),

    h3("Problème"),
    body("Le pipeline GitHub Actions échouait systématiquement à l'étape de vérification des types TypeScript avec l\'erreur ERR_PACKAGE_PATH_NOT_EXPORTED. L\'analyse de la trace d\'erreur indiquait que la version de vue-tsc installée globalement par npx (npx vue-tsc --noEmit) tentait d\'accéder à un sous-chemin du package TypeScript (./lib/tsc) qui n'était pas exporté dans Node.js 24, en raison de changements dans la résolution des modules ESM."),

    h3("Solution"),
    body("J\'ai modifié l\'approche en deux points : premièrement, installation de vue-tsc et typescript comme dépendances de développement explicites dans le package.json du projet ; deuxièmement, modification de la commande CI pour utiliser le binaire local (./node_modules/.bin/vue-tsc --noEmit) plutôt que npx. Cette solution garantit la cohérence des versions entre l\'environnement local et le CI, et élimine la dépendance à la version de vue-tsc disponible globalement."),

    ...blank(),

    h2("6.2  Intégration de Resend dans les tests automatisés"),

    h3("Problème"),
    body("Les tests d\'intégration du module d\'authentification échouaient en environnement CI avec une erreur HTTP 500 : 'API key is invalid'. L\'analyse a révélé deux causes distinctes : la clé API de test (re_test_key) était refusée par le SDK Resend, et l\'API Resend refusait d\'envoyer des e-mails vers des adresses fictives (test@example.com) en mode sandbox, même avec une clé valide."),

    h3("Solution"),
    body("J\'ai implémenté dans le EmailService une méthode privée shouldSkip(email: string): boolean qui court-circuite l\'appel à l\'API Resend lorsque l\'un des critères suivants est détecté : NODE_ENV === 'test', présence de la variable VITEST, domaine de l\'adresse e-mail appartenant à une liste blanche de domaines de test (example.com, test.com), ou clé API reconnue comme placeholder. En conditions de test, la méthode logue la tentative d\'envoi sans effectuer d\'appel réseau réel, garantissant que les tests passent tout en préservant le comportement en production."),

    ...blank(),

    h2("6.3  Migration React → Next.js : incompatibilités de rendu côté serveur"),

    h3("Problème"),
    body("Lors de la migration de SikBeauty, plusieurs composants React utilisaient des APIs browser-only (window.localStorage, navigator.userAgent) dans le corps du composant ou dans un useEffect sans garde. En environnement SSR, ces accès provoquaient des erreurs ReferenceError: window is not defined au moment du rendu côté serveur."),

    h3("Solution"),
    body("J\'ai systématiquement audité chaque composant migré et appliqué les corrections appropriées : utilisation des imports dynamiques (next/dynamic avec ssr: false) pour les composants dépendant du navigateur, déplacement des accès browser dans des hooks useEffect avec vérification de typeof window !== 'undefined', et remplacement des accès directs à localStorage par le custom hook useLocalStorage de VueUse côté Nuxt."),

    ...blank(),

    h2("6.4  Conflits Git lors de la fusion finale des branches"),

    h3("Problème"),
    body("En phase de finalisation d\'Aligno, la fusion de cinq branches feature/ développées en parallèle a généré un nombre important de conflits Git, particulièrement dans les fichiers de configuration (nuxt.config.ts, package.json), les stores Pinia et les fichiers CSS partagés."),

    h3("Solution"),
    body("J\'ai adopté une stratégie de merge séquentielle : fusion des branches par ordre de dépendance fonctionnelle, résolution manuelle des conflits fichier par fichier, et vérification du fonctionnement de l\'application après chaque merge. Pour les conflits complexes dans nuxt.config.ts, j\'ai utilisé git mergetool avec vimdiff pour comparer les trois versions (base, feature, main) et construire manuellement la version consolidée."),

    ...blank(),

    h2("6.5  Configuration Docker et problèmes de démarrage des services"),

    h3("Problème"),
    body("Lors des premières configurations Docker Compose, l\'application Nuxt démarrait avant que la base de données PostgreSQL ne soit prête à accepter des connexions. Cette race condition provoquait des erreurs Prisma P1001 (connexion refusée) au démarrage."),

    h3("Solution"),
    body("J\'ai configuré des health checks PostgreSQL dans docker-compose.yml (pg_isready), et utilisé la directive depends_on avec la condition service_healthy pour forcer l\'ordre de démarrage : postgres_db → redis → app → pgadmin. Cette solution garantit que le service applicatif ne démarre qu\'une fois la base de données réellement disponible."),

    ...blank(),

    h2("6.6  Problèmes d\'intégration Frontend / Backend"),

    h3("Problème"),
    body("Plusieurs incompatibilités ont été identifiées lors de l\'intégration des pages frontend d\'authentification avec les APIs backend : le format des erreurs Zod retournées par le backend ne correspondait pas aux attentes du frontend, les codes HTTP utilisés divergeaient des conventions du frontend, et la gestion du cookie refresh_token différait selon les navigateurs."),

    h3("Solution"),
    body("J\'ai standardisé le format des réponses d\'erreur en définissant une enveloppe commune ({ success: boolean, message: string, errors: { field: string[] } }) utilisée uniformément dans tous les contrôleurs backend via la helper function throwApiError(). Côté frontend, le client API useApi.ts a été ajusté pour parser cette enveloppe et exposer les erreurs de manière cohérente. Le problème de cookie a été résolu en ajoutant l\'attribut credentials: 'include' à toutes les requêtes $fetch."),

    ...blank(),

    table([
      thead('Difficulté', 'Impact', 'Solution apportée'),
      trow(true,  'vue-tsc / Node.js 24',           'Élevé — CI bloqué',        'Installation locale vue-tsc, binaire ./node_modules/.bin/'),
      trow(false, 'Resend en tests CI',              'Élevé — tests échoués',    'Méthode shouldSkip() dans EmailService'),
      trow(true,  'SSR browser APIs (Next.js)',      'Moyen — crash serveur',    'next/dynamic ssr:false, gardes typeof window'),
      trow(false, 'Conflits Git fusion finale',      'Moyen — instabilité',      'Merge séquentiel + résolution manuelle'),
      trow(true,  'Race condition Docker',            'Moyen — crash démarrage', 'Health checks + depends_on: service_healthy'),
      trow(false, 'Intégration Frontend/Backend',    'Moyen — UX dégradée',     'Enveloppe de réponse standardisée'),
    ]),

    p([tr('Tableau 16 — Récapitulatif des difficultés et solutions', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    // ═══════════════════════════════════════════════════════════════════════
    // CHAPITRE 7
    // ═══════════════════════════════════════════════════════════════════════

    h1('CHAPITRE 7 — COMPÉTENCES ACQUISES', true),

    // 7.1
    h2("7.1  Compétences techniques"),

    body("Ce stage a constitué un accélérateur de compétences techniques remarquable, permettant de progresser simultanément sur un large spectre de technologies et de pratiques de développement logiciel."),

    ...blank(),

    table([
      thead('Compétence', 'Niveau atteint', 'Contexte d\'acquisition'),
      trow(true,  'Architecture Full-Stack Nuxt 4',       'Avancé',        'Conception complète backend+frontend Aligno'),
      trow(false, 'Développement API REST sécurisées',    'Avancé',        'Module Auth — 8 endpoints avec sécurité complète'),
      trow(true,  'Architecture en couches (Clean Arch)', 'Avancé',        'Controller/Service/Repository/DTO/Mapper/DAO'),
      trow(false, 'Prisma ORM & PostgreSQL',              'Intermédiaire', 'Schémas complexes, migrations, relations'),
      trow(true,  'Tests automatisés (Vitest)',           'Avancé',        '114 tests — Auth + Wallet — CI/CD'),
      trow(false, 'Docker & Docker Compose',             'Intermédiaire', 'Dockerisation SikBeauty + env. Aligno'),
      trow(true,  'GitHub Actions (CI/CD)',               'Intermédiaire', 'Pipeline complet tests + déploiement'),
      trow(false, 'SEO technique (Next.js)',              'Avancé',        'SikBeauty — stratégie SEO complète'),
      trow(true,  'Accessibilité Web (WCAG 2.1)',         'Intermédiaire', 'Audit et correction Aligno'),
      trow(false, 'JWT & Sécurité applicative',           'Avancé',        "Module Auth — tokens, cookies, hachage"),
      trow(true,  'Vue 3 Composition API & Pinia',        'Avancé',        'Ensemble du frontend Aligno'),
      trow(false, 'Gestion temps réel (Socket.IO)',       'Débutant+',     'Module Kanban — synchronisation board'),
    ]),

    p([tr('Tableau 17 — Compétences techniques acquises durant le stage', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    // 7.2
    h2("7.2  Compétences professionnelles"),

    h3("Leadership & Gestion de projet Agile"),
    body("L\'exercice du rôle de Scrum Master sur deux projets simultanés m\'a donné une compréhension concrète et opérationnelle de la gestion de projet Agile. Planifier des sprints, animer des réunions, gérer les priorités, arbitrer les conflits de ressources et maintenir la motivation d\'une équipe sont des compétences qui ne s\'acquièrent que par la pratique, et ce stage en a fourni le cadre idéal."),

    h3("Communication et mentorat"),
    body("J\'ai développé ma capacité à expliquer des concepts techniques complexes à des profils de niveaux variés, lors des sessions de pair programming et des revues de code. La communication claire et pédagogique, tant à l'écrit (documentation, commentaires de code) qu'à l\'oral (stand-ups, Sprint Reviews), est devenue une pratique naturelle."),

    h3("Résolution de problèmes sous contrainte"),
    body("Les difficultés techniques rencontrées ont renforcé ma méthodologie de débogage : isoler le problème, reproduire de manière minimale, analyser les logs et les traces d\'erreur, rechercher dans la documentation officielle et les issues GitHub, formuler et tester des hypothèses de manière systématique."),

    h3("Gestion du temps et des priorités"),
    body("La gestion simultanée de deux projets, d\'un rôle de Scrum Master et de contributions techniques personnelles a exigé une organisation rigoureuse du temps. L\'utilisation de Jira comme tableau de bord personnel (en plus du suivi d'équipe), la priorisation quotidienne des tâches et la capacité à dire non à des demandes non prioritaires ont été des apprentissages déterminants."),

    // ═══════════════════════════════════════════════════════════════════════
    // CHAPITRE 8
    // ═══════════════════════════════════════════════════════════════════════

    h1('CHAPITRE 8 — RÉSULTATS OBTENUS', true),

    body("Ce chapitre présente un bilan objectif et chiffré des réalisations produites durant le stage sur les deux projets, accompagné d\'une analyse des résultats obtenus par rapport aux objectifs initiaux."),

    ...blank(),

    h2("8.1  Résultats par domaine"),

    table([
      thead('Domaine', 'Réalisation', 'Indicateur de résultat'),
      trow(true,  'SikBeauty — Migration SSR',   'Migration complète React → Next.js (pages produits, catégories, home)', 'Score Lighthouse Performance > 90/100'),
      trow(false, 'SikBeauty — SEO',             'Stratégie SEO technique complète (métadonnées, OG, sitemap, robots)', 'Score Lighthouse SEO > 95/100'),
      trow(true,  'SikBeauty — DevOps',          'Dockerfile + docker-compose.yml + pipeline CI/CD + VPS Hostinger',    'Déploiement automatisé en production'),
      trow(false, 'Aligno — Architecture',        'Monorepo Nuxt Full-Stack, Docker Compose (4 services), CI/CD',       'Env. reproductible en 1 commande'),
      trow(true,  'Aligno — Auth Backend',        '8 endpoints API, architecture 6 couches, sécurité complète',          '35 tests Vitest — tous verts'),
      trow(false, 'Aligno — Auth Frontend',       '7 pages Vue 3 + Nuxt UI + Pinia + middleware de protection',          'Intégration complète backend'),
      trow(true,  'Aligno — Wallet Tests',         '79 tests Vitest — 4 fichiers (BankAccount, Tx, Sub, Budget)',        '100% des scénarios couverts'),
      trow(false, 'Aligno — Planification Jira',  'Backlog complet, Epics, User Stories, Sprint Planning frontend',      'Équipe autonome dès le sprint 1'),
      trow(true,  'Aligno — Finalisation',        'SEO, A11y, Dark Mode, notifications, QA manuelle, livraison v1.0',   'Application prête pour production'),
      trow(false, 'Scrum Master — 2 projets',    '4 sprints conduits, 6 membres coordonnés, 2 projects livrés',        'Livraisons dans les délais'),
    ]),

    p([tr('Tableau 18 — Résultats obtenus par domaine', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    h2("8.2  Bilan global"),

    table([
      thead('Indicateur', 'Valeur'),
      trow(true,  'Durée du stage',                        '7 Mai — 7 Juillet 2026 (2 mois)'),
      trow(false, 'Nombre de projets conduits',            '2 (SikBeauty + Aligno)'),
      trow(true,  'Nombre de sprints animés',              '4 (2 par projet)'),
      trow(false, 'Membres d\'équipe coordonnés',         '5 développeurs'),
      trow(true,  'Endpoints API développés',              '8 (Auth complet)'),
      trow(false, 'Tests automatisés rédigés',             '114 (35 Auth + 79 Wallet)'),
      trow(true,  'Pages frontend développées',            '7 (module Auth)'),
      trow(false, 'Technologies maîtrisées',               '25+ technologies'),
      trow(true,  'Pipeline CI/CD configuré',              '1 (Aligno + SikBeauty)'),
      trow(false, 'Score Lighthouse Performance (cible)',  '> 90/100'),
    ]),

    p([tr('Tableau 19 — Bilan global du stage', { size: 20, italic: true, color: C.grayLight })], { align: AlignmentType.CENTER, before: 60, after: 120 }),

    h2("8.3  Évaluation critique"),

    h3("Points forts du stage"),

    li("Un niveau de responsabilité exceptionnellement élevé pour un premier stage professionnel, avec un rôle de Scrum Master et une contribution technique significative sur des projets réels à enjeux clients.", "Responsabilisation — "),
    li("La richesse et la diversité des technologies abordées ont offert une vision d\'ensemble d\'un système logiciel en production, couvrant le frontend, le backend, les bases de données, le temps réel, le DevOps et les tests.", "Richesse technologique — "),
    li("La qualité de l\'encadrement de M. LATRACH Mohammed : disponible, exigeant et pédagogue, il a su créer un environnement de travail propice à la montée en compétences.", "Encadrement — "),
    li("La cohésion de l'équipe de stage, dont le professionnalisme et l\'entraide ont été des facteurs clés de la livraison des deux projets dans les délais.", "Esprit d'équipe — "),

    h3("Axes d\'amélioration identifiés"),

    li("La gestion de la documentation technique a parfois été trop tardive, ce qui a créé des dépendances bloquantes lors de l\'intégration frontend-backend. Une approche API-first avec documentation OpenAPI rédigée avant le développement aurait été plus efficace.", "Documentation API — "),
    li("La capacité de l'équipe (nombre de jours disponibles par sprint) n\'a pas toujours été estimée avec précision lors du Sprint Planning, conduisant à quelques ajustements de périmètre en cours de sprint.", "Estimation de capacité — "),

    // ═══════════════════════════════════════════════════════════════════════
    // CONCLUSION
    // ═══════════════════════════════════════════════════════════════════════

    h1('CONCLUSION GÉNÉRALE', true),

    body("Ce stage de deux mois au sein de Landmark Agency s\'est révélé être une expérience fondatrice, dépassant largement le cadre de ce que j\'avais initialement anticipé. En contribuant de manière significative à deux projets professionnels aux problématiques distinctes — l\'industrialisation d\'une marketplace e-commerce (SikBeauty) et la conception from scratch d\'une plateforme de productivité Full-Stack (Aligno) —, j\'ai eu l\'opportunité de confronter et d\'approfondir l\'ensemble des compétences acquises durant ma formation à YouCode Safi dans un contexte réel et exigeant."),

    ...blank(),

    body("Sur le plan technique, j\'ai consolidé ma maîtrise du développement Full-Stack JavaScript en environnement professionnel : architecture en couches, API REST sécurisées, tests automatisés, CI/CD, SEO technique et DevOps constituent désormais des compétences que je suis capable d\'appliquer de manière autonome et rigoureuse. La richesse et la diversité de la stack technologique utilisée — Nuxt 4, Vue 3, Prisma, PostgreSQL, Docker, GitHub Actions, Vitest — m\'a offert une vision d\'ensemble d\'un système logiciel moderne, du développement jusqu'à la mise en production."),

    ...blank(),

    body("Sur le plan organisationnel, l\'exercice du rôle de Scrum Master sur deux projets simultanés a constitué un apprentissage unique. Planifier des sprints, animer des cérémonies Agile, coordonner une équipe de cinq développeurs, gérer les priorités et les risques, et livrer des produits de qualité dans des délais contraints sont des compétences managériales et organisationnelles rares que peu de développeurs juniors ont l\'opportunité d\'acquérir en stage. Cette expérience a profondément influencé ma vision du développement logiciel : l\'excellence technique ne peut s'épanouir qu\'au sein d\'une organisation rigoureuse et d\'une communication ouverte."),

    ...blank(),

    body("Sur le plan humain, les deux mois passés au sein de l'équipe de Landmark Agency m\'ont permis de comprendre la valeur fondamentale du collectif dans la réussite d\'un projet. La complémentarité des profils, la solidarité face aux difficultés et la fierté partagée lors des livraisons sont des dimensions du travail en équipe que la formation ne peut pleinement simuler."),

    ...blank(),

    body("Cette expérience a confirmé et précisé mon orientation professionnelle. Je souhaite poursuivre dans la voie du développement Full-Stack, en approfondissant mes compétences en architecture de systèmes distribués, en sécurité applicative et en ingénierie de la fiabilité (SRE). La pratique du rôle de Scrum Master a également ouvert des perspectives vers un profil de Tech Lead, que j\'envisage comme une évolution naturelle à moyen terme : un ingénieur capable de concevoir des systèmes robustes, de les livrer avec rigueur et de faire grandir les équipes qui les construisent."),

    ...blank(),

    body("Je quitte ce stage avec la conviction que la formation reçue à YouCode Safi m\'a fourni des bases solides et que Landmark Agency m\'a offert le terrain idéal pour les mettre en pratique. Je suis reconnaissant envers toutes les personnes qui ont contribué à cette expérience, et je garde la certitude qu\'elle constituera l\'un des jalons les plus déterminants de mon parcours professionnel."),

    // ═══════════════════════════════════════════════════════════════════════
    // ANNEXES
    // ═══════════════════════════════════════════════════════════════════════

    h1('ANNEXES', true),

    h2('Annexe A — Architecture en couches du module Authentification'),

    body("Le schéma suivant illustre la hiérarchie des couches architecturales traversées par une requête HTTP dans le module d\'authentification d\'Aligno, depuis le client jusqu'à la base de données :"),

    ...blank(),

    table([
      row(cell([tr('CLIENT (Navigateur Vue 3)', { bold: true, color: C.white, size: 22 })], { bg: C.gray, align: AlignmentType.CENTER })),
      row(cell([tr('↓  HTTP Request (Authorization: Bearer <token>)', { italic: true, size: 22, color: C.grayLight })], { align: AlignmentType.CENTER })),
      row(cell([tr('ROUTE HANDLER  (server/api/auth/*.ts)', { bold: true, color: C.white, size: 22 })], { bg: C.blue, align: AlignmentType.CENTER })),
      row(cell([tr('↓  Appel du contrôleur avec le contexte Nitro', { italic: true, size: 22, color: C.grayLight })], { align: AlignmentType.CENTER })),
      row(cell([tr('CONTROLLER  (Parsing, Zod validation, cookies, réponse JSON)', { bold: true, color: C.white, size: 22 })], { bg: C.blueLight, align: AlignmentType.CENTER })),
      row(cell([tr('↓  Appel du service avec les données validées', { italic: true, size: 22, color: C.grayLight })], { align: AlignmentType.CENTER })),
      row(cell([tr('SERVICE  (Logique métier : bcrypt, JWT, Resend, Sharp)', { bold: true, color: C.white, size: 22 })], { bg: C.blue, align: AlignmentType.CENTER })),
      row(cell([tr('↓  Appel du repository pour la persistance', { italic: true, size: 22, color: C.grayLight })], { align: AlignmentType.CENTER })),
      row(cell([tr('REPOSITORY  (Implémentation IUserDAO via Prisma)', { bold: true, color: C.white, size: 22 })], { bg: C.blueLight, align: AlignmentType.CENTER })),
      row(cell([tr('↓  Requête Prisma typée', { italic: true, size: 22, color: C.grayLight })], { align: AlignmentType.CENTER })),
      row(cell([tr('DATABASE  (PostgreSQL 17 via PrismaClient + @prisma/adapter-pg)', { bold: true, color: C.white, size: 22 })], { bg: C.blue, align: AlignmentType.CENTER })),
    ], { borders: { top: NB, bottom: NB, left: NB, right: NB, insideH: NB, insideV: NB } }),

    ...blank(),

    h2('Annexe B — Pipeline CI/CD GitHub Actions (Aligno)'),

    body("Le pipeline de qualité et de déploiement continu configuré pour Aligno se déclenche sur chaque Pull Request vers les branches main et dev :"),

    ...blank(),

    li("Checkout du code source (actions/checkout@v4).", "Step 1 — Checkout : "),
    li("Configuration Node.js 24.x avec cache npm (actions/setup-node@v4).", "Step 2 — Node.js : "),
    li("Installation déterministe des dépendances (npm ci).", "Step 3 — Dépendances : "),
    li("Génération du client Prisma et des types Nuxt (prisma generate + npm run postinstall).", "Step 4 — Génération : "),
    li("Application des migrations de base de données (prisma migrate deploy).", "Step 5 — Migrations : "),
    li("Vérification des types TypeScript (./node_modules/.bin/vue-tsc --noEmit).", "Step 6 — Type Check : "),
    li("Exécution de la suite complète de tests Vitest (npm run test).", "Step 7 — Tests : "),

    ...blank(),

    h2('Annexe C — Variables d\'environnement CI/CD'),

    body("Le pipeline GitHub Actions utilise les variables d\'environnement suivantes (configurées dans les secrets du dépôt GitHub) :"),

    li("DATABASE_URL : postgresql://test_user:test_password@localhost:5432/test_db"),
    li("REDIS_URL : redis://localhost:6379"),
    li("NODE_ENV : test"),
    li("JWT_SECRET : clé de signature des access tokens (placeholder en CI)"),
    li("JWT_REFRESH_SECRET : clé de signature des refresh tokens (placeholder en CI)"),
    li("RESEND_API_KEY : re_test_key (skippé par shouldSkip() en environnement test)"),
    li("APP_URL : http://localhost:3000"),

    ...blank(),

    h2('Annexe D — Structure du projet Aligno'),

    body("La structure des répertoires du projet Aligno reflète l\'architecture en couches du backend et l\'organisation modulaire du frontend :"),

    ...blank(),

    li("app/ — Code frontend Vue 3 (pages, composants, stores, composables, layouts, middleware)"),
    li("server/ — Code backend Nitro (api, controller, service, repository, dao, dto, mapper, middleware, emails, utils)"),
    li("prisma/ — Schémas Prisma par modèle et migrations SQL"),
    li("docs/ — Documentation technique par module"),
    li(".github/ — Workflow GitHub Actions CI/CD"),
    li(".husky/ — Hook pre-push (vitest run)"),
    li("Dockerfile — Image Docker de l\'application"),
    li("docker-compose.yml — Orchestration des services de développement"),
    li("nuxt.config.ts — Configuration Nuxt 4 (modules, runtime, sécurité)"),
    li("vitest.config.ts — Configuration Vitest (mode séquentiel, timeout)"),

    ...blank(),

    p([tr('[Emplacement réservé — Capture de la structure des dossiers dans l\'IDE (VS Code)]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 40, bg: C.bluePale }),

    h2('Annexe E — Captures d\'écran (emplacements réservés)'),

    body("Les figures suivantes sont réservées pour les captures d'écran à intégrer lors de la finalisation du rapport :"),

    ...blank(),

    p([tr('[Figure A — Page de connexion Aligno (Dark Mode)]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 20, bg: C.bluePale }),
    p([tr('Légende : Interface de connexion Aligno — Midnight Obsidian design system', { size: 18, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 0, after: 80 }),

    p([tr('[Figure B — Tableau Kanban Aligno (board avec cartes et colonnes)]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 20, bg: C.bluePale }),
    p([tr('Légende : Tableau Kanban collaboratif avec drag-and-drop et synchronisation temps réel', { size: 18, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 0, after: 80 }),

    p([tr('[Figure C — Dashboard Wallet (graphique dépenses vs budget)]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 20, bg: C.bluePale }),
    p([tr('Légende : Module Wallet — Histogramme mensuel des dépenses avec alertes budgétaires', { size: 18, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 0, after: 80 }),

    p([tr('[Figure D — Résultats Lighthouse SikBeauty (avant/après migration Next.js)]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 20, bg: C.bluePale }),
    p([tr('Légende : Audit Lighthouse — Score Performance et SEO avant/après migration', { size: 18, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 0, after: 80 }),

    p([tr('[Figure E — GitHub Actions — Workflow run réussi (vert)]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 20, bg: C.bluePale }),
    p([tr('Légende : Pipeline CI/CD GitHub Actions — 7 steps validés (114 tests passés)', { size: 18, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 0, after: 80 }),

    p([tr('[Figure F — Jira Sprint Board — Sprint en cours (Aligno)]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 20, bg: C.bluePale }),
    p([tr('Légende : Tableau Jira — Kanban des tâches du sprint (À faire / En cours / Terminé)', { size: 18, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 0, after: 80 }),

    p([tr('[Figure G — Vitest — Résultats de la suite de tests (114 passed)]', { size: 20, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 40, after: 20, bg: C.bluePale }),
    p([tr('Légende : Console Vitest — 114 tests passés en mode sequentiel', { size: 18, italic: true, color: C.grayLight })],
      { align: AlignmentType.CENTER, before: 0, after: 80 }),
  ],
};

// ════════════════════════════════════════════════════════════════════════════
//  GÉNÉRATION DU DOCUMENT
// ════════════════════════════════════════════════════════════════════════════

const doc = new Document({
  creator:     'Badr Eddine Slaoui',
  title:       'Rapport de Stage de Fin de Formation — Badr Eddine Slaoui',
  description: "Rapport de stage Full-Stack — Landmark Agency / YouCode Safi — 2025/2026",
  styles: {
    default: {
      heading1: {
        run: { font: 'Times New Roman', size: 32, bold: true, color: C.blue },
        paragraph: { spacing: { line: 360, before: 400, after: 200 } },
      },
      heading2: {
        run: { font: 'Times New Roman', size: 28, bold: true, color: C.blueMid },
        paragraph: { spacing: { line: 360, before: 320, after: 120 } },
      },
      heading3: {
        run: { font: 'Times New Roman', size: 24, bold: true, color: C.blueLight },
        paragraph: { spacing: { line: 360, before: 200, after: 80 } },
      },
      document: {
        run: { font: 'Times New Roman', size: 24, color: C.black },
        paragraph: { spacing: { line: 360, before: 80, after: 80 }, alignment: AlignmentType.JUSTIFY },
      },
    },
  },
  sections: [SECTION_A, SECTION_B],
});

// ─── Sortie ──────────────────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  const out = path.join(DIR, 'Rapport_de_Stage_Badr_Eddine_Slaoui.docx');
  fs.writeFileSync(out, buffer);
  const kb = Math.round(buffer.length / 1024);
  console.log(`✅  Rapport généré avec succès : ${out}`);
  console.log(`📄  Taille : ${kb} Ko`);
}).catch((err) => {
  console.error('❌  Erreur :', err);
  process.exit(1);
});
