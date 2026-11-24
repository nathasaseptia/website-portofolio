const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.getElementById('siteHeader');
const progress = document.getElementById('scrollProgress');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const backToTop = document.getElementById('backToTop');
const yearEl = document.getElementById('year');
const toast = document.getElementById('toast');
const toastText = toast.querySelector('span');
const projectDialog = document.getElementById('projectDialog');
const dialogBody = document.getElementById('dialogBody');
const dialogClose = document.getElementById('dialogClose');

const setMenu = (open) => {
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuBtn.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
  document.body.classList.toggle('menu-open', open);

  if (open) {
    window.setTimeout(() => {
      const firstLink = mobileMenu.querySelector('.mobile-nav a');
      if (firstLink) firstLink.focus();
    }, 220);
  }
};

menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
mobileClose.addEventListener('click', () => {
  setMenu(false);
  menuBtn.focus();
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
    setMenu(false);
    menuBtn.focus();
  }

  if (event.key === 'Tab' && mobileMenu.classList.contains('is-open')) {
    const focusable = [...mobileMenu.querySelectorAll('a, button')].filter((element) => !element.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 980) setMenu(false);
});

const onScroll = () => {
  const top = window.scrollY;
  header.classList.toggle('is-scrolled', top > 16);
  backToTop.classList.toggle('is-visible', top > 600);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(top / max, 1) : 0})`;
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

const photoStack = document.getElementById('photoStack');
const photoSlides = [...document.querySelectorAll('.photo-slide')];
const slideDots = [...document.querySelectorAll('.slide-dot')];
const photoCurrent = document.getElementById('photoCurrent');
const SLIDE_DURATION = 6000;
let activeSlide = 0;
let slideTimer = null;

const showSlide = (index) => {
  if (!photoSlides.length) return;

  activeSlide = (index + photoSlides.length) % photoSlides.length;

  photoSlides.forEach((slide, i) => {
    const isActive = i === activeSlide;
    slide.classList.toggle('is-active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
  });

  slideDots.forEach((dot, i) => {
    const isActive = i === activeSlide;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });

  if (photoCurrent) {
    photoCurrent.textContent = String(activeSlide + 1).padStart(2, '0');
  }
};

const startSlides = () => {
  if (slideTimer || photoSlides.length < 2 || document.hidden) return;
  slideTimer = window.setInterval(() => showSlide(activeSlide + 1), SLIDE_DURATION);
};

const stopSlides = () => {
  if (!slideTimer) return;
  window.clearInterval(slideTimer);
  slideTimer = null;
};

const resumeSlides = () => {
  if (!photoStack || photoStack.matches(':hover') || photoStack.contains(document.activeElement)) return;
  startSlides();
};

slideDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
    resumeSlides();
  });
});

if (photoStack) {
  photoStack.addEventListener('mouseenter', stopSlides);
  photoStack.addEventListener('mouseleave', startSlides);
  photoStack.addEventListener('focusin', stopSlides);
  photoStack.addEventListener('focusout', resumeSlides);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopSlides();
  else resumeSlides();
});

showSlide(0);
startSlides();

const revealEls = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach((element) => revealObserver.observe(element));
}

const navLinks = [...document.querySelectorAll('.desktop-nav .nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
}

const filterButtons = [...document.querySelectorAll('.filter-btn')];
const projectCards = [...document.querySelectorAll('.project-card')];
const projectCount = document.getElementById('projectCount');

const applyFilter = (filter) => {
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const matches = filter === 'all' || card.dataset.category === filter;
    card.hidden = !matches;
    if (matches) {
      visibleCount += 1;
      if (!card.classList.contains('is-visible')) card.classList.add('is-visible');
    }
  });

  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  projectCount.textContent = `${visibleCount} proyek ditampilkan`;
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => applyFilter(button.dataset.filter));
});

const projectData = {
  karsa: {
    type: 'Web App · Gamification',
    year: '2025 — 2026',
    title: 'Karsa (Karakter Bangsa)',
    lead: 'Platform gamifikasi yang membantu menumbuhkan karakter anak melalui misi harian, etika, integritas, dan kebiasaan baik sejak dini.',
    role: 'Tim Pengembang',
    context: 'Garuda Spark · Kelompok Iwak Peyek',
    points: [
      'Merancang alur pengalaman pengguna untuk misi harian dan sistem pencapaian.',
      'Membangun antarmuka web yang ramah anak dan mudah dipahami.',
      'Berkolaborasi dalam tim lintas peran untuk menyelaraskan produk dan teknologi.'
    ],
    stack: ['React', 'Next.js', 'PostgreSQL'],
    link: 'https://nextpreneur.web.id/'
  },
  kos: {
    type: 'Web Application',
    year: '2025',
    title: 'Smart Kos',
    lead: 'Platform pencarian dan pengelolaan kos yang membantu pengguna menemukan hunian yang sesuai dengan kebutuhan dan lokasi.',
    role: 'UI/UX & Front-End',
    context: 'Proyek akademik',
    points: [
      'Menyusun struktur informasi dan alur pencarian kos yang sederhana.',
      'Merancang antarmuka responsif untuk daftar dan detail hunian.',
      'Mengimplementasikan interaksi pencarian dan filter dengan JavaScript.'
    ],
    stack: ['Web App', 'JavaScript', 'UI/UX'],
    link: ''
  },
  elayanan: {
    type: 'E-Government · AI',
    year: '2025',
    title: 'Elayanan',
    lead: 'Website layanan desa dengan pendekatan SaaS dan kecerdasan buatan untuk mendukung administrasi yang lebih modern dan efisien.',
    role: 'Web Developer',
    context: 'Proyek akademik',
    points: [
      'Membangun tampilan dashboard layanan yang terstruktur dan mudah dipindai.',
      'Menyusun komponen antarmuka untuk kebutuhan administrasi desa.',
      'Mengeksplorasi pemanfaatan AI untuk membantu alur layanan.'
    ],
    stack: ['AI', 'SaaS', 'E-Government'],
    link: ''
  },
  gis: {
    type: 'GIS Application',
    year: '2025',
    title: 'Peta Laporan Fasilitas',
    lead: 'Aplikasi sistem informasi geografis untuk memudahkan masyarakat melaporkan fasilitas umum yang rusak secara terpetakan.',
    role: 'Front-End Developer',
    context: 'Proyek akademik',
    points: [
      'Menampilkan laporan fasilitas dalam tampilan peta yang mudah dibaca.',
      'Merancang kartu informasi dan penanda lokasi yang jelas.',
      'Menyusun antarmuka pelaporan yang ringkas untuk pengguna umum.'
    ],
    stack: ['GIS', 'Mapping', 'Web App'],
    link: ''
  },
  bakso: {
    type: 'UMKM Landing Page',
    year: '2024',
    title: 'Bakso Mantap',
    lead: 'Landing page UMKM yang menampilkan menu, cerita brand, dan informasi pemesanan dengan tampilan yang menarik dan mudah dijelajahi.',
    role: 'Web Designer',
    context: 'Proyek mandiri',
    points: [
      'Merancang identitas visual dan hierarki konten landing page.',
      'Menyusun bagian menu, cerita brand, dan ajakan pemesanan.',
      'Memastikan tampilan tetap nyaman digunakan di layar kecil.'
    ],
    stack: ['Landing Page', 'Web Design'],
    link: ''
  },
  portfolio: {
    type: 'Personal Website',
    year: '2026',
    title: 'Portofolio Nathasa',
    lead: 'Website portofolio pribadi yang dirancang untuk menampilkan karya, perjalanan, dan cara aku bekerja secara lebih personal.',
    role: 'Design & Development',
    context: 'Proyek pribadi',
    points: [
      'Merancang sistem visual neo-brutalist yang hangat, berani, dan konsisten.',
      'Membangun filter proyek, dialog studi kasus, dan toast salin email.',
      'Mengoptimalkan tampilan serta interaksi untuk desktop dan perangkat mobile.'
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    link: ''
  }
};

let lastProjectTrigger = null;

document.querySelectorAll('[data-project]').forEach((button) => {
  button.addEventListener('click', () => {
    const data = projectData[button.dataset.project];
    if (!data) return;

    lastProjectTrigger = button;
    const points = data.points.map((point) => `<li>${point}</li>`).join('');
    const stack = data.stack.map((item) => `<span>${item}</span>`).join('');
    const link = data.link
      ? `<a class="btn btn-primary dialog-link" href="${data.link}" target="_blank" rel="noopener">Kunjungi proyek <svg class="icon"><use href="#i-arrow-up-right"></use></svg></a>`
      : '';

    dialogBody.innerHTML = `
      <span class="dialog-eyebrow">${data.type} · ${data.year}</span>
      <h3 id="dialogTitle">${data.title}</h3>
      <p class="dialog-lead">${data.lead}</p>
      <div class="dialog-meta">
        <div><span>Peran</span><strong>${data.role}</strong></div>
        <div><span>Konteks</span><strong>${data.context}</strong></div>
      </div>
      <h4>Apa yang aku kerjakan</h4>
      <ul class="dialog-list">${points}</ul>
      <div class="tag-row">${stack}</div>
      ${link}
    `;

    document.body.classList.add('modal-open');
    projectDialog.showModal();
  });
});

dialogClose.addEventListener('click', () => projectDialog.close());

projectDialog.addEventListener('click', (event) => {
  if (event.target === projectDialog) projectDialog.close();
});

projectDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (lastProjectTrigger) lastProjectTrigger.focus();
});

let toastTimer = null;

const showToast = (message) => {
  toastText.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
};

const fallbackCopy = (text) => {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (error) {
    copied = false;
  }
  field.remove();
  return copied;
};

document.querySelectorAll('[data-copy-email]').forEach((button) => {
  button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail;
    let copied = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch (error) {
        copied = false;
      }
    }

    if (!copied) copied = fallbackCopy(email);
    showToast(copied ? 'Email berhasil disalin!' : `Email: ${email}`);
  });
});

yearEl.textContent = new Date().getFullYear();
