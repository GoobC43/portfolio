import React, { useEffect, useRef, useState } from 'react';

declare const gsap: any;
declare const THREE: any;

// --- DATA ---
const galleryImages = (() => {
  const categories = ["canada", "china", "italy", "korea"];
  return categories.flatMap(category =>
    Array.from({ length: 10 }, (_, i) => ({
      id: `${category}-${i + 1}`,
      src: `PFP/${category.toUpperCase()}/${i + 1}.jpg`,
      thumb: `PFP/Thumbnails/${category.toUpperCase()}/${i + 1}.jpg`,
      category: category,
      sortOrder: i + 1,
      caption: `${category.charAt(0).toUpperCase() + category.slice(1)} - Photo ${i + 1}`
    }))
  );
})();

const projects = [
  { id: 1, title: "TEDx", desc: "Founded and led the school’s TEDx chapter at Shanghai American School Pudong, managing a 6-member team. Directed event logistics, speaker curation, and marketing to secure funding and approvals. Currently working as a finance intern at TedX University of Toronto.", tech: ["Leadership", "Event Planning", "Marketing", "Logistics"], thumb: "Projects/TedX.JPG" },
  { id: 2, title: "Stress Zero (wIN)", desc: "Managed finances and initiated collaborations with non-profits. Expanded mental health advocacy to schools in Korea, China, US, and Japan, raising over 80,000 CNY.", tech: ["Finance", "Global Outreach", "Charity", "Mental Health"], thumb: "Projects/StressZero.jpg" },
  { id: 3, title: "START STEM & Art Gallery", desc: "Co-led an annual gallery promoting the interplay between STEM and Art. Directed visual design, managed logistics, and created promotional materials.", tech: ["STEM", "Art", "Visual Design", "Management"], thumb: "Projects/START.jpg" },
  { id: 4, title: "Rolling Shutter Analysis", desc: "Built a mathematical framework using algebra and parametric equations to model rolling shutter distortions in photography. Verified accuracy through data collection and analysis.", tech: ["Mathematics", "Data Analysis", "GeoGebra", "Modeling"], thumb: "Projects/RollingShutter.jpg", pdf: "Projects/Files/Camera.pdf" },
  { id: 5, title: "Polar Filters Analysis", desc: "Designed a custom polarimetry experiment to measure chiral optical rotation. Analyzed data sets with regression models to compare with literature values.", tech: ["Quantum Optics", "Physics", "Data Analysis", "Regression Models"], thumb: "Projects/Polar.jpg", pdf: "Projects/Files/Polar.pdf" },
  { id: 6, title: "Linear Algebra Textbook", desc: "Currently writing a comprehensive guide exploring vector spaces, linear transformations, and ultimatly Jordan Canonical Forms. Written for MAT224 at The University of Toronto.", tech: ["Mathematics", "Linear Algebra", "LaTeX", "Education"], thumb: "Projects/LinearAlg.jpg", pdf: "Projects/Files/MAT224_LEC_NOTES.pdf" },
];



const sections = [
  { id: "photography", title: "Photography", subtitle: "Visual stories captured through the lens. Shot on Fujifilm and Canon.", cta: "View Gallery", media: "MP/Photography.jpg" },
  { id: "projects", title: "Projects", subtitle: "Code, design, and creative experiments", cta: "See Work", media: "MP/Projects.jpg" },
  { id: "about", title: "About Me", subtitle: "Photographer, developer, jack of all trades", cta: "Read More", media: "MP/About.jpg" },
];

export function Component() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedView, setExpandedView] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>("all");
  const [showPdf, setShowPdf] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Animation refs
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle hash routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const idx = sections.findIndex(s => s.id === hash);
      if (idx !== -1 && idx !== currentSection) {
        // Will be handled by the slider logic
        const navItem = document.querySelector(`[data-section-index="${idx}"]`) as HTMLElement;
        navItem?.click();
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Check initial hash
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      const idx = sections.findIndex(s => s.id === initialHash);
      if (idx !== -1) setCurrentSection(idx);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentSection]);

  useEffect(() => {
    // Animate expanded view
    if (expandedView && overlayRef.current && scriptsLoaded) {
      gsap.fromTo(overlayRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
      );
      // Animate children with stagger
      const items = overlayRef.current.querySelectorAll('.animate-item');
      gsap.fromTo(items,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out", delay: 0.2 }
      );
    }
  }, [expandedView, scriptsLoaded]);

  useEffect(() => {
    const loadScripts = async () => {
      const loadScript = (src: string, globalName: string) => new Promise<void>((res, rej) => {
        if ((window as any)[globalName]) { res(); return; }
        if (document.querySelector(`script[src="${src}"]`)) {
          const check = setInterval(() => {
            if ((window as any)[globalName]) { clearInterval(check); res(); }
          }, 50);
          setTimeout(() => { clearInterval(check); rej(new Error(`Timeout waiting for ${globalName}`)); }, 10000);
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => { setTimeout(() => res(), 100); };
        s.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });

      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', 'gsap');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE');
        setScriptsLoaded(true);
      } catch (e) {
        console.error('Failed to load base scripts:', e);
      }

      initApplication();
    };

    const initApplication = async () => {
      const SLIDER_CONFIG: any = {
        settings: {
          transitionDuration: 2.5, autoSlideSpeed: 6000, currentEffect: "glass",
          globalIntensity: 1.0, speedMultiplier: 1.0, distortionStrength: 1.0, colorEnhancement: 1.0,
          glassRefractionStrength: 1.0, glassChromaticAberration: 1.0, glassBubbleClarity: 1.0, glassEdgeGlow: 1.0, glassLiquidFlow: 1.0,
        }
      };

      let currentSectionIndex = 0;
      // Initialize from hash
      const initialHash = window.location.hash.slice(1);
      const hashIdx = sections.findIndex(s => s.id === initialHash);
      if (hashIdx !== -1) currentSectionIndex = hashIdx;
      let isTransitioning = false;
      let shaderMaterial: any, renderer: any, scene: any, camera: any;
      let sectionTextures: any[] = [];
      let texturesLoaded = false;
      let autoSlideTimer: any = null;
      let progressAnimation: any = null;
      let sliderEnabled = false;

      const SLIDE_DURATION = () => SLIDER_CONFIG.settings.autoSlideSpeed;
      const PROGRESS_UPDATE_INTERVAL = 50;
      const TRANSITION_DURATION = () => SLIDER_CONFIG.settings.transitionDuration;

      const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
      const fragmentShader = `
            uniform sampler2D uTexture1, uTexture2;
            uniform float uProgress;
            uniform vec2 uResolution, uTexture1Size, uTexture2Size;
            uniform float uGlobalIntensity, uSpeedMultiplier, uDistortionStrength;
            uniform float uGlassRefractionStrength, uGlassChromaticAberration, uGlassBubbleClarity, uGlassEdgeGlow, uGlassLiquidFlow;
            varying vec2 vUv;

            vec2 getCoverUV(vec2 uv, vec2 textureSize) {
                vec2 s = uResolution / textureSize;
                float scale = max(s.x, s.y);
                vec2 scaledSize = textureSize * scale;
                vec2 offset = (uResolution - scaledSize) * 0.5;
                return (uv * uResolution - offset) / scaledSize;
            }
            
            vec4 glassEffect(vec2 uv, float progress) {
                float time = progress * 5.0 * uSpeedMultiplier;
                vec2 uv1 = getCoverUV(uv, uTexture1Size); vec2 uv2 = getCoverUV(uv, uTexture2Size);
                float maxR = length(uResolution) * 0.85; float br = progress * maxR;
                vec2 p = uv * uResolution; vec2 c = uResolution * 0.5;
                float d = length(p - c); float nd = d / max(br, 0.001);
                float param = smoothstep(br + 3.0, br - 3.0, d);
                vec4 img;
                if (param > 0.0) {
                     float ro = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity * pow(smoothstep(0.3 * uGlassBubbleClarity, 1.0, nd), 1.5);
                     vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
                     vec2 distUV = uv2 - dir * ro;
                     distUV += vec2(sin(time + nd * 10.0), cos(time * 0.8 + nd * 8.0)) * 0.015 * uGlassLiquidFlow * uSpeedMultiplier * nd * param;
                     float ca = 0.02 * uGlassChromaticAberration * uGlobalIntensity * pow(smoothstep(0.3, 1.0, nd), 1.2);
                     img = vec4(texture2D(uTexture2, distUV + dir * ca * 1.2).r, texture2D(uTexture2, distUV + dir * ca * 0.2).g, texture2D(uTexture2, distUV - dir * ca * 0.8).b, 1.0);
                     if (uGlassEdgeGlow > 0.0) {
                        float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
                        img.rgb += rim * 0.08 * uGlassEdgeGlow * uGlobalIntensity;
                     }
                } else { img = texture2D(uTexture2, uv2); }
                vec4 oldImg = texture2D(uTexture1, uv1);
                if (progress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
                return mix(oldImg, img, param);
            }

            void main() { gl_FragColor = glassEffect(vUv, uProgress); }
        `;

      const updateShaderUniforms = () => {
        if (!shaderMaterial) return;
        const s = SLIDER_CONFIG.settings, u = shaderMaterial.uniforms;
        for (const key in s) {
          const uName = 'u' + key.charAt(0).toUpperCase() + key.slice(1);
          if (u[uName]) u[uName].value = s[key];
        }
      };

      const splitText = (text: string) => {
        return text.split('').map(char => `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
      };

      const updateContent = (idx: number) => {
        const titleEl = document.getElementById('mainTitle');
        const subtitleEl = document.getElementById('mainSubtitle');
        const ctaEl = document.getElementById('mainCta');

        if (titleEl && subtitleEl) {
          gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.5, stagger: 0.02, ease: "power2.in" });
          gsap.to(subtitleEl, { y: -10, opacity: 0, duration: 0.4, ease: "power2.in" });
          gsap.to(ctaEl, { y: -10, opacity: 0, duration: 0.3, ease: "power2.in" });

          setTimeout(() => {
            titleEl.innerHTML = splitText(sections[idx].title);
            subtitleEl.textContent = sections[idx].subtitle;
            if (ctaEl) ctaEl.textContent = sections[idx].cta;

            gsap.set(titleEl.children, { opacity: 0 });
            gsap.set(subtitleEl, { y: 20, opacity: 0 });
            gsap.set(ctaEl, { y: 20, opacity: 0 });

            const children = titleEl.children;
            switch (idx) {
              case 0:
                gsap.set(children, { y: 20 });
                gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" });
                break;
              case 1:
                gsap.set(children, { filter: "blur(10px)", scale: 1.5, y: 0 });
                gsap.to(children, { filter: "blur(0px)", scale: 1, opacity: 1, duration: 1, stagger: { amount: 0.5, from: "random" }, ease: "power2.out" });
                break;
              case 2:
                gsap.set(children, { scale: 0, y: 0 });
                gsap.to(children, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.5)" });
                break;
            }
            gsap.to(subtitleEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: "power3.out" });
            gsap.to(ctaEl, { y: 0, opacity: 1, duration: 0.6, delay: 0.5, ease: "power3.out" });
          }, 500);
        }
      };

      const navigateToSection = (targetIndex: number) => {
        if (isTransitioning || targetIndex === currentSectionIndex) return;
        stopAutoSlideTimer();
        quickResetProgress(currentSectionIndex);

        // Update URL hash
        window.history.pushState(null, '', `#${sections[targetIndex].id}`);

        const currentTexture = sectionTextures[currentSectionIndex];
        const targetTexture = sectionTextures[targetIndex];
        if (!currentTexture || !targetTexture) return;

        isTransitioning = true;
        shaderMaterial.uniforms.uTexture1.value = currentTexture;
        shaderMaterial.uniforms.uTexture2.value = targetTexture;
        shaderMaterial.uniforms.uTexture1Size.value = currentTexture.userData.size;
        shaderMaterial.uniforms.uTexture2Size.value = targetTexture.userData.size;

        updateContent(targetIndex);

        currentSectionIndex = targetIndex;
        updateNavigationState(currentSectionIndex);

        gsap.fromTo(shaderMaterial.uniforms.uProgress,
          { value: 0 },
          {
            value: 1,
            duration: TRANSITION_DURATION(),
            ease: "power2.inOut",
            onComplete: () => {
              shaderMaterial.uniforms.uProgress.value = 0;
              shaderMaterial.uniforms.uTexture1.value = targetTexture;
              shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
              isTransitioning = false;
              safeStartTimer(100);
            }
          }
        );
      };

      const handleSectionChange = () => {
        if (isTransitioning || !texturesLoaded || !sliderEnabled) return;
        navigateToSection((currentSectionIndex + 1) % sections.length);
      };

      const createSectionsNavigation = () => {
        const nav = document.getElementById("sectionsNav"); if (!nav) return;
        nav.innerHTML = "";
        sections.forEach((section, i) => {
          const item = document.createElement("div");
          item.className = `section-nav-item${i === currentSectionIndex ? " active" : ""}`;
          item.dataset.sectionIndex = String(i);
          item.innerHTML = `<div class="section-progress-line"><div class="section-progress-fill"></div></div><div class="section-nav-title">${section.title}</div>`;
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isTransitioning && i !== currentSectionIndex) {
              stopAutoSlideTimer();
              quickResetProgress(currentSectionIndex);
              navigateToSection(i);
            }
          });
          nav.appendChild(item);
        });
      };

      const updateNavigationState = (idx: number) => document.querySelectorAll(".section-nav-item").forEach((el, i) => el.classList.toggle("active", i === idx));
      const updateSectionProgress = (idx: number, prog: number) => { const el = document.querySelectorAll(".section-nav-item")[idx]?.querySelector(".section-progress-fill") as HTMLElement; if (el) { el.style.width = `${prog}%`; el.style.opacity = '1'; } };
      const fadeSectionProgress = (idx: number) => { const el = document.querySelectorAll(".section-nav-item")[idx]?.querySelector(".section-progress-fill") as HTMLElement; if (el) { el.style.opacity = '0'; setTimeout(() => el.style.width = "0%", 300); } };
      const quickResetProgress = (idx: number) => { const el = document.querySelectorAll(".section-nav-item")[idx]?.querySelector(".section-progress-fill") as HTMLElement; if (el) { el.style.transition = "width 0.2s ease-out"; el.style.width = "0%"; setTimeout(() => el.style.transition = "width 0.1s ease, opacity 0.3s ease", 200); } };

      const startAutoSlideTimer = () => {
        if (!texturesLoaded || !sliderEnabled) return;
        stopAutoSlideTimer();
        let progress = 0;
        const increment = (100 / SLIDE_DURATION()) * PROGRESS_UPDATE_INTERVAL;
        progressAnimation = setInterval(() => {
          if (!sliderEnabled) { stopAutoSlideTimer(); return; }
          progress += increment;
          updateSectionProgress(currentSectionIndex, progress);
          if (progress >= 100) {
            clearInterval(progressAnimation); progressAnimation = null;
            fadeSectionProgress(currentSectionIndex);
            if (!isTransitioning) handleSectionChange();
          }
        }, PROGRESS_UPDATE_INTERVAL);
      };
      const stopAutoSlideTimer = () => { if (progressAnimation) clearInterval(progressAnimation); if (autoSlideTimer) clearTimeout(autoSlideTimer); progressAnimation = null; autoSlideTimer = null; };
      const safeStartTimer = (delay = 0) => { stopAutoSlideTimer(); if (sliderEnabled && texturesLoaded) { if (delay > 0) autoSlideTimer = setTimeout(startAutoSlideTimer, delay); else startAutoSlideTimer(); } };

      const loadImageTexture = (src: string) => new Promise<any>((resolve, reject) => {
        const l = new THREE.TextureLoader();
        l.load(src, (t: any) => { t.minFilter = t.magFilter = THREE.LinearFilter; t.userData = { size: new THREE.Vector2(t.image.width, t.image.height) }; resolve(t); }, undefined, reject);
      });

      const initRenderer = async () => {
        const canvas = document.querySelector(".webgl-canvas") as HTMLCanvasElement; if (!canvas) return;
        scene = new THREE.Scene(); camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));

        shaderMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTexture1: { value: null }, uTexture2: { value: null }, uProgress: { value: 0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uTexture1Size: { value: new THREE.Vector2(1, 1) }, uTexture2Size: { value: new THREE.Vector2(1, 1) },
            uGlobalIntensity: { value: 1.0 }, uSpeedMultiplier: { value: 1.0 }, uDistortionStrength: { value: 1.0 },
            uGlassRefractionStrength: { value: 1.0 }, uGlassChromaticAberration: { value: 1.0 }, uGlassBubbleClarity: { value: 1.0 }, uGlassEdgeGlow: { value: 1.0 }, uGlassLiquidFlow: { value: 1.0 },
          },
          vertexShader, fragmentShader
        });
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

        for (const s of sections) { try { sectionTextures.push(await loadImageTexture(s.media)); } catch { console.warn("Failed texture"); } }
        if (sectionTextures.length >= 2) {
          const nextIdx = (currentSectionIndex + 1) % sections.length;
          shaderMaterial.uniforms.uTexture1.value = sectionTextures[currentSectionIndex];
          shaderMaterial.uniforms.uTexture2.value = sectionTextures[nextIdx];
          shaderMaterial.uniforms.uTexture1Size.value = sectionTextures[currentSectionIndex].userData.size;
          shaderMaterial.uniforms.uTexture2Size.value = sectionTextures[nextIdx].userData.size;
          texturesLoaded = true; sliderEnabled = true;
          updateShaderUniforms();
          document.querySelector(".slider-wrapper")?.classList.add("loaded");
          safeStartTimer(500);
        }

        const render = () => { requestAnimationFrame(render); renderer.render(scene, camera); };
        render();
      };

      createSectionsNavigation();

      const tEl = document.getElementById('mainTitle');
      const sEl = document.getElementById('mainSubtitle');
      const cEl = document.getElementById('mainCta');
      if (tEl && sEl) {
        tEl.innerHTML = splitText(sections[currentSectionIndex].title);
        sEl.textContent = sections[currentSectionIndex].subtitle;
        if (cEl) cEl.textContent = sections[currentSectionIndex].cta;
        gsap.fromTo(tEl.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: "power3.out", delay: 0.5 });
        gsap.fromTo(sEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 });
        gsap.fromTo(cEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 1 });
      }

      initRenderer();

      document.addEventListener("visibilitychange", () => document.hidden ? stopAutoSlideTimer() : (!isTransitioning && safeStartTimer()));
      window.addEventListener("resize", () => { if (renderer) { renderer.setSize(window.innerWidth, window.innerHeight); shaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight); } });
    };

    loadScripts();
    return () => { };
  }, []);

  const handleCtaClick = () => {
    const hash = window.location.hash.slice(1) || sections[0].id;
    setExpandedView(hash);
  };

  const closeExpandedView = () => {
    if (scriptsLoaded && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0, scale: 0.95, duration: 0.4, ease: "power2.in",
        onComplete: () => {
          setExpandedView(null);
          setShowPdf(false);
        }
      });
    } else {
      setExpandedView(null);
      setShowPdf(false);
    }
  };

  const filteredImages = galleryFilter === "all"
    ? galleryImages
    : galleryImages.filter(img => img.category === galleryFilter);

  // Render expanded views
  const renderExpandedContent = () => {
    if (!expandedView) return null;

    if (expandedView === "photography") {
      return (
        <div className="overlay-content" ref={overlayRef}>
          <button className="close-btn" onClick={closeExpandedView}>✕ Close Gallery</button>
          <div className="gallery-filters animate-item">
            {["all", "canada", "china", "italy", "korea"].map(cat => (
              <button
                key={cat}
                className={`filter-btn ${galleryFilter === cat ? 'active' : ''}`}
                onClick={() => setGalleryFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div className="gallery-grid">
            {filteredImages.map((img, i) => (
              <div
                key={img.id}
                className="gallery-item animate-item"
                onClick={() => setLightboxImage(img.src)}
              >
                <img src={img.thumb} alt={img.caption} loading="lazy" />
                <div className="gallery-caption">{img.caption}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (expandedView === "projects") {
      return (
        <div className="overlay-content" ref={overlayRef}>
          <button className="close-btn" onClick={closeExpandedView}>✕ Back to Overview</button>
          <div className="projects-grid">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="project-card animate-item"
                onClick={() => setSelectedProject(project.id)}
              >
                <div className="project-thumb">
                  <img src={project.thumb} alt={project.title} loading="lazy" />
                </div>
                <div className="project-info">
                  <h3>{project.title}</h3>
                  <p>{project.desc}</p>
                  <div className="tech-tags">
                    {project.tech.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (expandedView === "about") {
      return (
        <div className="overlay-content" ref={overlayRef}>
          <button className="close-btn" onClick={closeExpandedView}>✕ Close</button>
          <div className="about-layout">
            <div className="about-portrait animate-item">
              <img src="about_pic.jpg" alt="Seohyun Cho" />
            </div>
            <div className="about-content">
              <section className="bio-section animate-item">
                <h2>Background</h2>
                <p>My name is Seohyun Cho, a multidisciplinary creative passionate about maths, programming, and photography. I currently am an undergraduate student at the Univeristy of Toronto studying Mathematics and Statistics. Besides this, I have also worked roles in event logistics, financial management, and market research.</p>
                <p>I am currently focused on indivdual projects and internship work in the field of machine learning. I am always looking for new opportunities to learn and grow as a creative professional. Reach out for inquiries or to connect.</p>
              </section>



              <section className="contact-section animate-item">
                <h2>Let's Connect</h2>
                <div className="social-links">
                  <a href="https://www.instagram.com/seohyunc43/" target="_blank" rel="noopener noreferrer" className="social-link">
                    <span className="social-icon">IG</span> Instagram
                  </a>
                  <a href="https://www.instagram.com/hymnsc43/" target="_blank" rel="noopener noreferrer" className="social-link">
                    <span className="social-icon">IG</span> Instagram (Art)
                  </a>
                  <a href="https://www.linkedin.com/in/seohyun-cho-453a68240/" target="_blank" rel="noopener noreferrer" className="social-link">
                    <span className="social-icon">in</span> LinkedIn
                  </a>
                  <a href="mailto:seohyuncho2025@gmail.com" className="social-link">
                    <span className="social-icon">@</span> Email
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .slider-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh; /* Fallback */
          height: 100dvh; /* Mobile browser fix */
          overflow: hidden;
          background: #0a0a0a;
          opacity: 0;
          transition: opacity 0.5s ease;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        
        .slider-wrapper.loaded { opacity: 1; }
        
        .webgl-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .hero-content {
          position: absolute;
          bottom: 120px;
          left: 60px;
          z-index: 10;
          color: #fff;
          max-width: 650px;
        }
        
        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          text-shadow: 0 4px 30px rgba(0,0,0,0.5);
          line-height: 1.1;
        }
        
        .hero-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 300;
          line-height: 1.6;
          opacity: 0.85;
          text-shadow: 0 2px 15px rgba(0,0,0,0.5);
          margin-bottom: 32px;
        }
        
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .cta-button:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(255,255,255,0.2);
        }
        
        .cta-button::after {
          content: '→';
          transition: transform 0.3s ease;
        }
        
        .cta-button:hover::after {
          transform: translateX(4px);
        }
        
        .sections-navigation {
          position: absolute;
          bottom: 50px;
          right: 60px;
          display: flex;
          gap: 28px;
          z-index: 10;
        }
        
        .section-nav-item {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }
        
        .section-nav-item:hover,
        .section-nav-item.active { opacity: 1; }
        
        .section-progress-line {
          width: 70px;
          height: 2px;
          background: rgba(255,255,255,0.2);
          border-radius: 1px;
          overflow: hidden;
        }
        
        .section-progress-fill {
          width: 0%;
          height: 100%;
          background: #fff;
          transition: width 0.1s ease, opacity 0.3s ease;
        }
        
        .section-nav-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 500;
        }

        /* Overlay Styles */
        .section-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(10,10,10,0.95);
          backdrop-filter: blur(20px);
          overflow-y: auto;
          display: flex;
          justify-content: center;
        }

        .overlay-content {
          width: 100%;
          max-width: 95vw;
          padding: 80px 40px;
        }

        .close-btn {
          position: fixed;
          top: 30px;
          right: 40px;
          padding: 12px 24px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 30px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 101;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        /* Gallery Styles */
        .gallery-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 25px;
          color: rgba(255,255,255,0.6);
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.4);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .gallery-item {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 4/3;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-item:hover img {
          transform: scale(1.05);
        }

        .gallery-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          color: #fff;
          font-size: 0.9rem;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .gallery-item:hover .gallery-caption {
          opacity: 1;
          transform: translateY(0);
        }

        /* Lightbox */
        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
          padding: 40px;
        }

        .lightbox img {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
        }

        /* Projects Styles */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .project-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s ease;
        }

        .project-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255,255,255,0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .project-thumb {
          aspect-ratio: 3/2;
          overflow: hidden;
        }

        .project-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .project-card:hover .project-thumb img {
          transform: scale(1.08);
        }

        .project-info {
          padding: 24px;
        }

        .project-info h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 500;
          color: #fff;
          margin-bottom: 10px;
        }

        .project-info p {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tech-tag {
          padding: 6px 12px;
          background: rgba(255,255,255,0.08);
          border-radius: 20px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.7);
        }

        /* Project Modal */
        .project-modal {
          position: fixed;
          inset: 0;
          z-index: 150;
          background: rgba(10,10,10,0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .modal-content {
          max-width: 800px;
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .modal-content.pdf-mode {
          max-width: 95vw;
          height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .modal-image {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
        }

        .modal-body {
          padding: 40px;
        }

        .modal-body h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #fff;
          margin-bottom: 16px;
        }

        .modal-body p {
          color: rgba(255,255,255,0.7);
          line-height: 1.8;
          margin-bottom: 24px;
        }

        .modal-close {
          position: absolute;
          top: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 50%;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(255,255,255,0.2);
        }

        /* About Styles */
        .about-layout {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 60px;
          margin-top: 40px;
        }

        .about-portrait img {
          width: 100%;
          border-radius: 16px;
          object-fit: cover;
        }

        .about-content {
          color: #fff;
        }

        .bio-section,
        .skills-section,
        .contact-section {
          margin-bottom: 48px;
        }

        .about-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 400;
          margin-bottom: 20px;
          color: #fff;
        }

        .about-content p {
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(255,255,255,0.7);
          margin-bottom: 16px;
        }

        .skills-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .skill-item {
          width: 100%;
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .skill-name {
          font-size: 0.9rem;
          color: #fff;
        }

        .skill-level {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
        }

        .skill-bar {
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .skill-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: width 1s ease;
        }

        .social-links {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .social-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 30px;
          color: #fff;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          margin-bottom: 12px; /* Fallback for gap */
        }

        .social-link:last-child { margin-bottom: 0; }

        .social-link:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .social-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .about-layout {
            grid-template-columns: 1fr;
          }
          
          .about-portrait {
            max-width: 300px;
          }
        }

        @media (max-width: 768px) {
          .hero-content { 
            left: 24px; 
            right: 24px;
            bottom: calc(100px + env(safe-area-inset-bottom)); 
          }
          
          .sections-navigation { 
            bottom: calc(40px + env(safe-area-inset-bottom)); 
            right: 24px; 
            left: 24px;
            justify-content: center;
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .overlay-content {
            padding: 80px 20px 40px;
          }
          
          .close-btn {
            top: 20px;
            right: 20px;
            padding: 10px 18px;
            font-size: 0.8rem;
          }
          
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 12px;
          }
          
          .projects-grid {
            grid-template-columns: 1fr;
          }

          .social-links { flex-direction: column; gap: 12px; }
          .social-link { 
            justify-content: center;
            width: 100%;
            margin-bottom: 12px;
          }
          .social-link:last-child { margin-bottom: 0; }
        }
      `}</style>

      <main className="slider-wrapper" ref={containerRef}>
        <canvas className="webgl-canvas"></canvas>

        <div className="hero-content">
          <h1 className="hero-title" id="mainTitle"></h1>
          <p className="hero-subtitle" id="mainSubtitle"></p>
          <button className="cta-button" id="mainCta" onClick={handleCtaClick}></button>
        </div>

        <nav className="sections-navigation" id="sectionsNav"></nav>
      </main>

      {/* Expanded Section Overlay */}
      {expandedView && (
        <div className="section-overlay">
          {renderExpandedContent()}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Lightbox" />
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="project-modal" onClick={() => { setSelectedProject(null); setShowPdf(false); }}>
          <button className="modal-close" onClick={() => { setSelectedProject(null); setShowPdf(false); }}>✕</button>
          <div className={`modal-content ${showPdf ? 'pdf-mode' : ''}`} onClick={e => e.stopPropagation()}>
            {(() => {
              const project: any = projects.find(p => p.id === selectedProject);
              if (!project) return null;
              return (
                <>
                  {(!showPdf || !project.pdf) ? (
                    <>
                      <img className="modal-image" src={project.thumb} alt={project.title} />
                      <div className="modal-body">
                        <h2>{project.title}</h2>
                        <p>{project.desc}</p>
                        <div className="tech-tags">
                          {project.tech.map((t: string) => <span key={t} className="tech-tag">{t}</span>)}
                        </div>
                        {project.pdf && (
                          <button
                            className="cta-button"
                            style={{ marginTop: '20px', padding: '12px 24px', fontSize: '0.9rem' }}
                            onClick={() => setShowPdf(true)}
                          >
                            Read Paper
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="pdf-viewer-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <button
                          className="cta-button"
                          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                          onClick={() => setShowPdf(false)}
                        >
                          ← Back
                        </button>
                        <a
                          href={project.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cta-button"
                          style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none' }}
                        >
                          Open in New Tab ↗
                        </a>
                      </div>
                      <div style={{ flex: 1, position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '8px', background: '#333' }}>
                        <iframe
                          src={project.pdf}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                          title={`${project.title} PDF`}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
