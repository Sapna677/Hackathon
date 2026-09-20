/**
 * Resume Upload & Parsing Module
 */
const ResumeManager = {
  currentResume: null,

  init() {
    this.bindEvents();
    this.loadSamples();
    const saved = localStorage.getItem('career_current_resume');
    if (saved) {
      try {
        this.currentResume = JSON.parse(saved);
        this.renderResumePreview(this.currentResume);
      } catch (e) {}
    }
  },

  bindEvents() {
    const dropzone = document.getElementById('resumeDropzone');
    const fileInput = document.getElementById('resumeFileInput');
    const uploadBtn = document.getElementById('uploadResumeBtn');
    const pasteSubmitBtn = document.getElementById('submitPastedResumeBtn');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    if (pasteSubmitBtn) {
      pasteSubmitBtn.addEventListener('click', () => this.handlePasteResume());
    }

    const quickGapBtn = document.getElementById('quickGapFromResumeBtn');
    if (quickGapBtn) {
      quickGapBtn.addEventListener('click', async () => {
        if (!this.currentResume) {
          showToast('Please upload a resume first!', 'error');
          return;
        }
        // Auto-select Full Stack Developer if no JD selected yet
        if (!window.JdManager.currentJd) {
          const role = window.JdManager.DEFAULT_ROLES[0];
          await window.JdManager.handleAnalyzeJd({ roleId: role.id });
        }
        window.App.navigateTo('analysis');
        window.GapManager.runAnalysis();
      });
    }

    // Toggle between PDF Upload and Paste text
    const tabPdf = document.getElementById('tabResumePdf');
    const tabText = document.getElementById('tabResumeText');
    const panelPdf = document.getElementById('panelResumePdf');
    const panelText = document.getElementById('panelResumeText');

    if (tabPdf && tabText) {
      tabPdf.addEventListener('click', () => {
        tabPdf.classList.add('active');
        tabText.classList.remove('active');
        panelPdf.style.display = 'block';
        panelText.style.display = 'none';
      });

      tabText.addEventListener('click', () => {
        tabText.classList.add('active');
        tabPdf.classList.remove('active');
        panelPdf.style.display = 'none';
        panelText.style.display = 'block';
      });
    }
  },

  async handleFileUpload(file) {
    const statusText = document.getElementById('dropzoneStatus');
    if (statusText) statusText.textContent = `Parsing ${file.name}...`;

    try {
      showToast(`Uploading and extracting skills from ${file.name}...`, 'info');
      const res = await window.api.uploadResumeFile(file);
      this.currentResume = res.resume;
      localStorage.setItem('career_current_resume', JSON.stringify(res.resume));
      this.renderResumePreview(res.resume);
      showToast('Resume parsed successfully!', 'success');
      if (statusText) statusText.textContent = `Uploaded: ${file.name}`;
    } catch (err) {
      console.warn('Backend upload failed, attempting client-side extraction:', err.message);
      try {
        const parsed = await this.clientSideParseResume(file);
        this.currentResume = parsed;
        localStorage.setItem('career_current_resume', JSON.stringify(parsed));
        this.renderResumePreview(parsed);
        showToast('Resume extracted directly in browser!', 'success');
        if (statusText) statusText.textContent = `Uploaded (In-Browser): ${file.name}`;
      } catch (clientErr) {
        console.error('Client parse error:', clientErr);
        showToast('Failed to parse file: ' + err.message, 'error');
        if (statusText) statusText.textContent = 'Drag & drop your Resume PDF here or click to browse';
      }
    }
  },

  async clientSideParseResume(file) {
    let rawText = '';
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf' && window.pdfjsLib) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extracted = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        extracted += content.items.map(item => item.str).join(' ') + '\n';
      }
      rawText = extracted;
    } else {
      rawText = await file.text();
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('No readable text found in file.');
    }

    // Heuristics for candidate info
    const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    const email = emailMatch ? emailMatch[1] : '';
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let name = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@')) {
      name = lines[0];
    }

    // Known skills dictionary
    const taxonomy = [
      { name: 'JavaScript', category: 'languages', aliases: ['javascript', 'js', 'es6'] },
      { name: 'TypeScript', category: 'languages', aliases: ['typescript', 'ts'] },
      { name: 'Python', category: 'languages', aliases: ['python', 'py'] },
      { name: 'Java', category: 'languages', aliases: ['java', 'jdk', 'core java'] },
      { name: 'C++', category: 'languages', aliases: ['c++', 'cpp'] },
      { name: 'SQL', category: 'languages', aliases: ['sql', 'mysql', 'postgresql'] },
      { name: 'HTML5', category: 'frontend', aliases: ['html', 'html5'] },
      { name: 'CSS3', category: 'frontend', aliases: ['css', 'css3'] },
      { name: 'React', category: 'frontend', aliases: ['react', 'react.js', 'reactjs'] },
      { name: 'Tailwind CSS', category: 'frontend', aliases: ['tailwind', 'tailwindcss'] },
      { name: 'Bootstrap', category: 'frontend', aliases: ['bootstrap'] },
      { name: 'Redux', category: 'frontend', aliases: ['redux'] },
      { name: 'Node.js', category: 'backend', aliases: ['node', 'node.js', 'nodejs'] },
      { name: 'Express.js', category: 'backend', aliases: ['express', 'express.js', 'expressjs'] },
      { name: 'Spring Boot', category: 'backend', aliases: ['spring boot', 'spring'] },
      { name: 'RESTful APIs', category: 'backend', aliases: ['rest api', 'restful api', 'rest'] },
      { name: 'MongoDB', category: 'databases', aliases: ['mongodb', 'mongo', 'mongoose'] },
      { name: 'Docker', category: 'cloudDevOps', aliases: ['docker', 'container'] },
      { name: 'Git', category: 'cloudDevOps', aliases: ['git', 'github', 'gitlab'] },
      { name: 'Linux', category: 'cloudDevOps', aliases: ['linux', 'ubuntu', 'bash'] },
      { name: 'AWS', category: 'cloudDevOps', aliases: ['aws', 'amazon web services'] },
      { name: 'Machine Learning', category: 'dataAndAI', aliases: ['machine learning', 'ml'] },
      { name: 'Pandas', category: 'dataAndAI', aliases: ['pandas'] },
      { name: 'Problem Solving', category: 'softSkills', aliases: ['problem solving', 'analytical'] }
    ];

    const detectedSkills = [];
    const lowerText = ' ' + rawText.toLowerCase() + ' ';

    for (const item of taxonomy) {
      let count = 0;
      for (const alias of item.aliases) {
        const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(`(^|[^a-zA-Z0-9#+])${esc}([^a-zA-Z0-9#+]|$)`, 'gi');
        const m = lowerText.match(reg);
        if (m) count += m.length;
      }
      if (count > 0) {
        detectedSkills.push({
          name: item.name,
          category: item.category,
          frequency: count
        });
      }
    }

    return {
      id: 'local_' + Date.now(),
      originalName: file.name,
      parsedDetails: {
        name,
        email,
        education: ['University Coursework / Degree']
      },
      skills: detectedSkills,
      skillsCount: detectedSkills.length,
      rawTextPreview: rawText.substring(0, 400) + '...'
    };
  },

  async handlePasteResume() {
    const text = document.getElementById('pasteResumeArea').value.trim();
    if (!text) {
      showToast('Please paste your resume text first.', 'error');
      return;
    }

    try {
      showToast('Extracting skills from pasted text...', 'info');
      const res = await window.api.uploadResumeText(text, 'Manual Resume Input');
      this.currentResume = res.resume;
      localStorage.setItem('career_current_resume', JSON.stringify(res.resume));
      this.renderResumePreview(res.resume);
      showToast('Resume extracted successfully!', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  },

  async loadSamples() {
    try {
      const res = await window.api.getResumeSamples();
      const container = document.getElementById('sampleResumesContainer');
      if (!container || !res.samples) return;

      container.innerHTML = '';
      res.samples.forEach(sample => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-sm';
        btn.textContent = `⚡ Load ${sample.title}`;
        btn.addEventListener('click', () => {
          document.getElementById('pasteResumeArea').value = sample.text;
          const tabText = document.getElementById('tabResumeText');
          if (tabText) tabText.click();
          this.handlePasteResume();
        });
        container.appendChild(btn);
      });
    } catch (e) {
      // offline fallback sample
    }
  },

  renderResumePreview(resume) {
    const previewContainer = document.getElementById('resumeParsedPreview');
    if (!previewContainer) return;

    previewContainer.style.display = 'block';
    
    document.getElementById('candidateNamePreview').textContent = resume.parsedDetails ? resume.parsedDetails.name : 'Candidate';
    document.getElementById('candidateEmailPreview').textContent = resume.parsedDetails ? resume.parsedDetails.email : '';
    
    const skillsContainer = document.getElementById('extractedSkillsPreview');
    if (skillsContainer) {
      skillsContainer.innerHTML = '';
      if (resume.skills && resume.skills.length > 0) {
        resume.skills.forEach(skill => {
          const badge = document.createElement('span');
          badge.className = 'badge badge-tech';
          badge.innerHTML = `✓ ${skill.name} <small style="opacity:0.7">(${skill.category})</small>`;
          skillsContainer.appendChild(badge);
        });
      } else {
        skillsContainer.innerHTML = '<span class="text-muted">No specific tech skills detected. Try pasting detailed projects.</span>';
      }
    }

    // Scroll smoothly to preview
    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.ResumeManager = ResumeManager;
