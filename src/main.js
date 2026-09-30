import './style.css';
import Lenis from 'lenis';

/* ============================================================ */
/* 01 PRELOADER DISMISS (<1s)                                   */
/* ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.remove();
      }, 400);
    }, 850);
  }
});

/* ============================================================ */
/* 02 SMOOTH SCROLLING WITH LENIS                               */
/* ============================================================ */
let lenis = null;
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!isReducedMotion) {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Bind internal anchors with Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, { offset: -60, duration: 1.2 });
        }
      }
    });
  });
}

/* ============================================================ */
/* 03 SCROLL PROGRESS & HEADER SCROLLSPY                        */
/* ============================================================ */
const scrollProgressBar = document.getElementById('scroll-progress');
const header = document.getElementById('main-header');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateScrollState() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  
  // Progress bar
  if (scrollProgressBar && docHeight > 0) {
    const progress = (scrollTop / docHeight) * 100;
    scrollProgressBar.style.width = `${progress}%`;
  }

  // Header background on scroll
  if (header) {
    if (scrollTop > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Scrollspy
  let currentSectionId = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    const linkSection = link.getAttribute('data-section');
    if (linkSection === currentSectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

/* ============================================================ */
/* 04 MOBILE MENU DRAWER                                        */
/* ============================================================ */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      mobileMenu.classList.add('open');
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ============================================================ */
/* 05 INTERACTIVE CANVAS BACKGROUND                             */
/* ============================================================ */
const canvas = document.getElementById('bg-canvas');
if (canvas && !isReducedMotion) {
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }, { passive: true });

  const particleCount = Math.min(Math.floor((width * height) / 28000), 55);
  const particles = [];

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.25 + 0.1,
      });
    }
  }
  initParticles();

  function renderCanvas() {
    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // Fine grid drawing with subtle shift
    const gridSize = 70;
    const shiftX = (mouseX - width / 2) * 0.015;
    const shiftY = (mouseY - height / 2) * 0.015;

    ctx.beginPath();
    ctx.strokeStyle = isLight ? 'rgba(5, 5, 5, 0.035)' : 'rgba(255, 255, 255, 0.018)';
    ctx.lineWidth = 1;

    for (let x = (shiftX % gridSize); x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = (shiftY % gridSize); y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Render particles & soft connections
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? `rgba(21, 21, 21, ${p.alpha * 0.45})` : `rgba(148, 163, 184, ${p.alpha})`;
      ctx.fill();

      // Connect near neighbors
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = isLight 
            ? `rgba(240, 68, 22, ${0.16 * (1 - dist / 110)})`
            : `rgba(99, 102, 241, ${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(renderCanvas);
  }
  requestAnimationFrame(renderCanvas);
}

/* ============================================================ */
/* 06 CUSTOM CURSOR (DESKTOP)                                   */
/* ============================================================ */
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches && !isReducedMotion) {
  document.documentElement.classList.add('has-custom-cursor');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;
  let isClicking = false;

  const showCursor = () => {
    if (!isVisible) {
      isVisible = true;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    }
  };

  const hideCursor = () => {
    isVisible = false;
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
    cursorRing.classList.remove('hovering');
  };

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      ringX = mouseX;
      ringY = mouseY;
      showCursor();
    }
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  document.addEventListener('mouseenter', () => {
    showCursor();
  });

  document.addEventListener('mouseleave', () => {
    hideCursor();
  });

  window.addEventListener('mousedown', () => {
    isClicking = true;
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    isClicking = false;
  }, { passive: true });

  function updateCursorRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    const scale = isClicking ? ' scale(0.85)' : '';
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)${scale}`;
    requestAnimationFrame(updateCursorRing);
  }
  requestAnimationFrame(updateCursorRing);

  // Dynamic hover state detection for interactive elements (including dynamically rendered elements)
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (target && target.closest('a, button, [role="button"], input, textarea, select, .project-card, .tech-chip, .experiment-card, .hackathon-card, .magnetic-btn, .clickable, .tab-btn, .filter-chip, .modal-close-btn, .nav-icon-link')) {
      cursorRing.classList.add('hovering');
    } else {
      cursorRing.classList.remove('hovering');
    }
  }, { passive: true });
}

/* ============================================================ */
/* 07 MAGNETIC BUTTONS                                          */
/* ============================================================ */
const magneticButtons = document.querySelectorAll('.magnetic-btn');
if (window.matchMedia('(pointer: fine)').matches && !isReducedMotion) {
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

/* ============================================================ */
/* 08 3D TILT EFFECT ON FEATURED PROJECT CARDS                  */
/* ============================================================ */
const tiltCards = document.querySelectorAll('.tilt-card');
if (window.matchMedia('(pointer: fine)').matches && !isReducedMotion) {
  tiltCards.forEach((card) => {
    const inner = card.querySelector('.project-card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle rotation max 3.5 degrees
      const rotateX = ((y - centerY) / centerY) * -3.5;
      const rotateY = ((x - centerX) / centerX) * 3.5;

      inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

/* ============================================================ */
/* 09 INTERACTIVE PROJECT DETAILS MODAL                         */
/* ============================================================ */
const projectData = {
  finflow: {
    category: 'AI / FINTECH / FRAUD DETECTION',
    title: 'FinFlow',
    subtitle: 'Forensic Bank Statement Analysis System',
    problem:
      'Financial fraud investigations and forensic bank statement audits require sifting through thousands of multi-party transactions. Traditional spreadsheets fail to reveal multi-hop money routing, circular transactions, and subtle anomalies.',
    solution:
      'Engineered an AI-powered financial forensic platform combining machine learning anomaly detection with Neo4j graph relationship analysis. Automatically detects suspicious laundering patterns, scores transaction risk, and visualizes financial flow topologies.',
    archVisual: `
      <div class="modal-arch-box">
        <span class="mono-tag" style="display:block; margin-bottom:10px; color:#38bdf8;">ARCHITECTURE // FORENSIC ANALYTICS ENGINE</span>
        <div class="arch-flow">
          <span class="arch-node">Bank Statements / CSV / PDF</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Data Normalization & Cleaning</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node highlight">ML Anomaly Detection</span>
          <span class="arch-arrow">+</span>
          <span class="arch-node highlight">Neo4j Graph Relationship Map</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Dynamic Risk Scoring</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Forensic Investigator Dashboard</span>
        </div>
      </div>
    `,
    features: [
      'Transaction anomaly detection algorithms',
      'Suspicious circular transfer identification',
      'Interactive graph relationship topology visualization',
      'Automated fraud risk scoring index',
      'High-throughput asynchronous processing with Celery & Redis',
      'Relational auditing store via PostgreSQL',
      'Secure containerized deployment via Docker',
      'Role-based investigative dashboard'
    ],
    technologies: [
      'React', 'FastAPI', 'Spring Boot', 'PostgreSQL', 'Neo4j', 'Python', 'Docker', 'Celery', 'Redis', 'Machine Learning', 'Graph Analytics', 'LLMs'
    ],
    context: 'CideCode Karnataka Police Tech Hackathon 2026',
    team: 'Team Delta Force',
    status: 'Hackathon Finalist Prototype',
    github: 'https://github.com/Abhicodes001/finflow-new'
  },

  sitemind: {
    category: 'GENERATIVE AI / RAG / FULL STACK',
    title: 'SiteMind AI',
    subtitle: 'AI-Powered Website Chat Assistant',
    problem:
      'Navigating massive documentation portals, corporate websites, and enterprise manuals is time-consuming. Users need direct, factual answers synthesized from website content without hallucinations.',
    solution:
      'Engineered a production-ready Retrieval-Augmented Generation (RAG) platform. SiteMind ingests any URL, extracts text, performs semantic chunking, computes dense vector embeddings, and performs similarity searches with FAISS to provide grounded answers with exact source citations.',
    archVisual: `
      <div class="modal-arch-box">
        <span class="mono-tag" style="display:block; margin-bottom:10px; color:#38bdf8;">PIPELINE // RAG FROM URL INGESTION TO GROUNDED CITATION</span>
        <div class="arch-flow">
          <span class="arch-node">Target URL</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Web Crawler / Extractor</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Semantic Chunking</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Text Embeddings</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node highlight">FAISS Vector Store</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Similarity Retrieval</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node highlight">LLM Synthesis (Groq/OpenAI)</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Answer + Direct Citations</span>
        </div>
      </div>
    `,
    features: [
      'URL-based intelligent content extraction & parsing',
      'Context-aware semantic text chunking',
      'High-speed vector similarity indexing with FAISS',
      'Conversational memory across multi-turn queries',
      'Verifiable inline source citations and reference links',
      'Multi-model LLM routing (Groq, OpenAI, Gemini, OpenRouter)',
      'Modern SaaS-grade UI built with React & TypeScript',
      'FastAPI asynchronous retrieval endpoints'
    ],
    technologies: [
      'React', 'TypeScript', 'Vite', 'FastAPI', 'LangChain', 'FAISS', 'Docker', 'OpenAI', 'Gemini', 'Groq', 'OpenRouter'
    ],
    status: 'Functional System / Architecture Implemented',
    github: 'https://github.com/Abhicodes001/SITEMIND'
  },

  solar: {
    category: 'AI / MACHINE LEARNING / RENEWABLE ENERGY',
    title: 'Solar-Based Green Hydrogen Forecasting System',
    subtitle: 'Renewable Electrolysis Predictive Modeling',
    problem:
      'Green hydrogen produced via water electrolysis powered by solar PV suffers from severe intermittency due to weather fluctuations. Regional grids need accurate yield forecasts to schedule power and storage capacity.',
    solution:
      'Developing an AI-driven predictive modeling system tailored to Kerala’s regional meteorological conditions. Combines solar irradiance, temperature, humidity, and wind metrics through ensemble and sequential neural networks to estimate electrolysis throughput.',
    archVisual: `
      <div class="modal-arch-box">
        <span class="mono-tag" style="display:block; margin-bottom:10px; color:#38bdf8;">FORECASTING PIPELINE // METEOROLOGY TO HYDROGEN YIELD</span>
        <div class="arch-flow">
          <span class="arch-node">Solar Irradiance & Weather Data</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Preprocessing & Feature Engineering</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node highlight">Ensemble Models (Random Forest, XGBoost)</span>
          <span class="arch-arrow">+</span>
          <span class="arch-node highlight">Sequential Models (GRU, LSTM)</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Solar PV Power Forecast</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Electrolyzer Efficiency Model</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Green Hydrogen Yield Output</span>
        </div>
      </div>
    `,
    features: [
      'Regional weather parameter modeling (Kerala climate focus)',
      'Comparative benchmarking across RF, XGBoost, GRU, and LSTM',
      'Dynamic solar power output estimation',
      'Electrolysis conversion efficiency integration',
      'Time-series trend analysis and seasonality handling'
    ],
    technologies: [
      'Python', 'Random Forest', 'XGBoost', 'GRU', 'LSTM', 'Scikit-learn', 'Pandas', 'Time Series Analysis'
    ],
    context: 'Final Year Engineering Project — NCERC',
    status: 'Final Year Project — In Active Development',
    github: null
  },

  'audio-sign': {
    category: 'AI / ACCESSIBILITY / NLP / COMPUTER VISION',
    title: 'AI Audio-to-Sign Language Converter',
    subtitle: 'Real-Time Spoken English Accessibility System',
    problem:
      'Communication barriers between hearing-impaired individuals and hearing populations hinder everyday interaction, education, and workplace collaboration.',
    solution:
      'Built a real-time assistive translation pipeline that captures spoken English, runs NLP tokenization and lemmatization, and maps corresponding words to animated 3D/gesture sign representations with character-level finger-spelling fallback.',
    archVisual: `
      <div class="modal-arch-box">
        <span class="mono-tag" style="display:block; margin-bottom:10px; color:#38bdf8;">TRANSLATION PIPELINE // SPEECH TO SIGN SYNTHESIS</span>
        <div class="arch-flow">
          <span class="arch-node">Microphone / Audio Upload / Text</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Speech Recognition Engine</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node highlight">NLTK NLP Tokenizer & Lemmatizer</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Sign Dictionary Mapping</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node highlight">Character-Level Fallback for OOV</span>
          <span class="arch-arrow">→</span>
          <span class="arch-node">Animated Sign Representation</span>
        </div>
      </div>
    `,
    features: [
      'Real-time microphone speech capture',
      'Direct text input and recorded audio file upload',
      'Speech-to-text transcription engine',
      'NLP syntactic analysis and stopword management',
      'Dictionary-based sign gesture playback',
      'Character-level finger-spelling for out-of-vocabulary words',
      'Optimized inference latency for smooth communication'
    ],
    technologies: [
      'Python', 'Flask', 'SpeechRecognition', 'NLTK', 'Computer Vision', 'JavaScript'
    ],
    status: 'Live & Deployed',
    liveUrl: 'https://audio-to-sign-lang.onrender.com/',
    github: 'https://github.com/Abhicodes001/audio-to-sign-lang'
  }
};

const projectModal = document.getElementById('project-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalBodyContent = document.getElementById('modal-body-content');

function openProjectModal(projectId) {
  const data = projectData[projectId];
  if (!data || !modalBodyContent || !projectModal) return;

  let liveButtonHtml = '';
  if (data.liveUrl) {
    liveButtonHtml = `
      <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        <span>Live Demo ↗</span>
      </a>
    `;
  }

  const featuresHtml = data.features
    .map((f) => `<div class="modal-feature-item">${f}</div>`)
    .join('');

  const techHtml = data.technologies
    .map((t) => `<span>${t}</span>`)
    .join('');

  let githubButtonHtml = '';
  if (data.github) {
    githubButtonHtml = `
      <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span>View on GitHub</span>
      </a>
    `;
  }

  modalBodyContent.innerHTML = `
    <span class="mono-tag modal-category">${data.category}</span>
    <h2 class="modal-title">${data.title}</h2>
    <h3 class="modal-subtitle">${data.subtitle}</h3>

    <span class="modal-section-title">THE PROBLEM</span>
    <p class="modal-text">${data.problem}</p>

    <span class="modal-section-title">THE SOLUTION & ARCHITECTURE</span>
    <p class="modal-text">${data.solution}</p>
    ${data.archVisual || ''}

    <span class="modal-section-title">KEY SYSTEM FEATURES</span>
    <div class="modal-features-list">${featuresHtml}</div>

    <span class="modal-section-title">TECHNOLOGIES USED</span>
    <div class="tech-tags">${techHtml}</div>

    <div class="project-meta-info mt-4">
      ${data.context ? `<div class="meta-row"><span class="meta-label mono-tag">CONTEXT</span><span class="meta-val">${data.context}</span></div>` : ''}
      ${data.team ? `<div class="meta-row"><span class="meta-label mono-tag">TEAM</span><span class="meta-val">${data.team}</span></div>` : ''}
      <div class="meta-row"><span class="meta-label mono-tag">STATUS</span><span class="meta-val text-emerald">${data.status}</span></div>
    </div>

    <div class="modal-actions">
      ${liveButtonHtml}
      ${githubButtonHtml}
      <button type="button" class="btn btn-ghost btn-sm" id="modal-close-action">Close</button>
    </div>
  `;

  projectModal.classList.add('open');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const actionClose = document.getElementById('modal-close-action');
  if (actionClose) {
    actionClose.addEventListener('click', closeProjectModal);
  }
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.classList.remove('open');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Bind project view detail buttons
document.querySelectorAll('.view-details-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const projectId = btn.getAttribute('data-project');
    if (projectId) openProjectModal(projectId);
  });
});

if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && projectModal && projectModal.classList.contains('open')) {
    closeProjectModal();
  }
});

/* ============================================================ */
/* 10 INTERACTIVE STACK PIPELINE HOVER & VIEWPORT OBSERVER      */
/* ============================================================ */
const stackLayers = document.querySelectorAll('.stack-layer');
if (stackLayers.length > 0) {
  stackLayers.forEach((layer) => {
    layer.addEventListener('mouseenter', () => {
      stackLayers.forEach((l) => l.classList.remove('active'));
      layer.classList.add('active');
    });
  });

  // Cycle animation when entering viewport
  const stackContainer = document.getElementById('stack-pipeline');
  if (stackContainer) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stackLayers.forEach((layer, idx) => {
              setTimeout(() => {
                stackLayers.forEach((l) => l.classList.remove('active'));
                layer.classList.add('active');
              }, idx * 600);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(stackContainer);
  }
}

/* ============================================================ */
/* 11 FOOTER YEAR SYNC                                          */
/* ============================================================ */
const currentYearEl = document.getElementById('current-year');
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

/* ============================================================ */
/* 12 THEME SWITCHER (DAYLIGHT / DARK MODE)                     */
/* ============================================================ */
const themeToggleBtn = document.getElementById('theme-toggle');
const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');

function updateThemeUI(theme) {
  const isLight = theme === 'light';
  if (isLight) {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
      const label = themeToggleBtn.querySelector('.theme-toggle-text');
      if (label) label.textContent = 'DARK';
    }
    if (mobileThemeToggleBtn) {
      const mobileLabel = mobileThemeToggleBtn.querySelector('.mobile-theme-text');
      if (mobileLabel) mobileLabel.textContent = '🌙 Switch to Dark Mode';
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', 'Switch to Daylight Mode');
      themeToggleBtn.setAttribute('title', 'Switch to Daylight Mode');
      const label = themeToggleBtn.querySelector('.theme-toggle-text');
      if (label) label.textContent = 'DAYLIGHT';
    }
    if (mobileThemeToggleBtn) {
      const mobileLabel = mobileThemeToggleBtn.querySelector('.mobile-theme-text');
      if (mobileLabel) mobileLabel.textContent = '☀️ Switch to Daylight Mode';
    }
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const nextTheme = current === 'light' ? 'dark' : 'light';
  try {
    localStorage.setItem('theme-mode', nextTheme);
  } catch (e) {}
  updateThemeUI(nextTheme);
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);

// Initialize UI on load
try {
  const urlParams = new URLSearchParams(window.location.search);
  const paramTheme = urlParams.get('theme');
  const validParamTheme = (paramTheme === 'light' || paramTheme === 'daylight') ? 'light' : (paramTheme === 'dark' ? 'dark' : null);
  const initialTheme = validParamTheme || localStorage.getItem('theme-mode') || 'light';
  updateThemeUI(initialTheme);
} catch (e) {
  updateThemeUI('light');
}
