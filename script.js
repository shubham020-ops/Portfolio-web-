/* =========================
   MENU TOGGLE
========================= */
function toggleMenu() {
  const menu = document.getElementById("menu");

  if (!menu) return;

  menu.classList.toggle("active");
}


/* =========================
   LUCIDE ICONS
========================= */
document.addEventListener("DOMContentLoaded", () => {

  if (window.lucide) {
    lucide.createIcons();
  }

});


/* =========================
   BUTTON CLICK ANIMATION
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const buttons = document.querySelectorAll(".explore-btn, .more-btn");

  buttons.forEach((button) => {

    button.addEventListener("click", () => {

      button.classList.remove("clicked");

      // Force browser reflow
      void button.offsetWidth;

      button.classList.add("clicked");

      setTimeout(() => {
        button.classList.remove("clicked");
      }, 550);

    });

  });

});

/*===========status==============*/

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  const cards =
    gsap.utils.toArray(".status-card");

  if (!cards.length) {
    return;
  }

  gsap.to(cards, {

    opacity: 1,

    y: 0,

    duration: 1.2,

    ease: "power4.out",

    stagger: 0.18,

    scrollTrigger: {

      trigger: ".status-grid",

      start: "top 80%",

      toggleActions:
        "play none none reverse"

    }

  });

});




/*======tech stack section======*/

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector(".tech-stack-section");
  const label = document.querySelector(".tech-label");
  const heading = document.querySelector(".tech-heading");
  const cards = gsap.utils.toArray(".tech-card");
  const button = document.querySelector(".skills-btn");

  if (
    !section ||
    !label ||
    !heading ||
    !cards.length ||
    !button
  ) {
    return;
  }


  /* =========================
     INITIAL STATE
  ========================= */

  gsap.set(label, {
    opacity: 0,
    y: 45
  });

  gsap.set(heading, {
    opacity: 0,
    y: 55
  });

  gsap.set(cards, {
    opacity: 0,
    y: 70,
    scale: 0.92,
    filter: "blur(5px)"
  });

  gsap.set(button, {
    opacity: 0,
    y: 50
  });


  /* =========================
     SCROLL SCRUB TIMELINE
  ========================= */

  const techTimeline = gsap.timeline({

    scrollTrigger: {

      trigger: section,

      /*
        Animation start
        jab section viewport me enter karega
      */
      start: "top 80%",

      /*
        Animation end
        jab section ka bottom viewport
        ke paas aayega
      */
      end: "bottom 65%",

      /*
        Scroll ke saath animation chalegi
      */
      scrub: 0.8,

      /*
        PIN NAHI HAI
      */

      invalidateOnRefresh: true,

      // markers: true
    }

  });


  /* =========================
     LABEL
  ========================= */

  techTimeline.to(label, {

    opacity: 1,
    y: 0,

    duration: 0.7,

    ease: "power2.out"

  });


  /* =========================
     HEADING
  ========================= */

  techTimeline.to(heading, {

    opacity: 1,
    y: 0,

    duration: 0.8,

    ease: "power2.out"

  }, "-=0.35");


  /* =========================
     TECH CARDS
  ========================= */

  techTimeline.to(cards, {

    opacity: 1,

    y: 0,

    scale: 1,

    filter: "blur(0px)",

    duration: 1,

    stagger: 0.08,

    ease: "power3.out"

  }, "-=0.25");


  /* =========================
     BUTTON
  ========================= */

  techTimeline.to(button, {

    opacity: 1,

    y: 0,

    duration: 0.7,

    ease: "power2.out"

  }, "-=0.2");


  /* =========================
     REFRESH
  ========================= */

  ScrollTrigger.refresh();

});
























/* =====================================================
   BACKEND-DRIVEN PROJECTS
===================================================== */

const demoProjects = [
  { title: "Nexcent", category: "SaaS Landing Page", technologies: ["Next.js", "Tailwind CSS"], featured: true, link: "#" },
  { title: "ShopKart", category: "E-commerce Website", technologies: ["React", "Node.js"], featured: false, link: "#" },
  { title: "Doob.", category: "Creative Agency", technologies: ["React", "Framer Motion"], featured: false, link: "#" },
  { title: "Velora", category: "Portfolio Template", technologies: ["Next.js", "GSAP"], featured: false, link: "#" }
];

function renderProjects(list) {
  const projectsContainer = document.getElementById("projectsContainer");
  if (!projectsContainer) return;
  projectsContainer.replaceChildren();

  list.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    const techs = Array.isArray(project.technologies) ? project.technologies : [];
    const safeLink = /^(https?:\/\/)/i.test(project.link || "") || project.link === "#" ? project.link : "#";
    card.innerHTML = `
      <div class="project-image">
        <div class="demo-screen">
          <div class="demo-top"></div>
          <div class="demo-content">
            <div class="demo-title"></div>
            <div class="demo-row"><span></span><span></span><span></span></div>
            <div class="demo-row"><span></span><span></span><span></span></div>
          </div>
        </div>
        ${project.featured ? `<div class="featured-project"><span></span>Featured</div>` : ""}
      </div>
      <div class="project-info">
        <h2 class="project-title"></h2>
        <p class="project-category"></p>
        <div class="project-bottom">
          <div class="tech-stack"></div>
          <a class="project-arrow" aria-label="Open project">→</a>
        </div>
      </div>`;
    card.querySelector(".project-title").textContent = project.title || "Untitled Project";
    card.querySelector(".project-category").textContent = project.category || "Web Project";
    const techStack = card.querySelector(".tech-stack");
    techs.forEach((tech) => {
      const span = document.createElement("span");
      span.className = "tech";
      span.textContent = tech;
      techStack.appendChild(span);
    });
    const link = card.querySelector(".project-arrow");
    link.href = safeLink;
    if (safeLink !== "#") { link.target = "_blank"; link.rel = "noopener noreferrer"; }
    projectsContainer.appendChild(card);
  });
}

async function loadProjects() {
  try {
    const response = await fetch("/api/projects", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error("Projects API failed");
    const data = await response.json();
    renderProjects(Array.isArray(data) ? data : demoProjects);
  } catch (error) {
    console.warn("Projects API unavailable. Showing demo data.");
    renderProjects(demoProjects);
  }
}

loadProjects();

/* =====================================================
   BACKEND-DRIVEN SERVICES
===================================================== */
const demoServices = [
  { title: 'Frontend Development', description: 'Fast, responsive and polished interfaces built for real users.', icon: 'ti ti-layout-dashboard', features: ['React', 'Next.js', 'Responsive UI'] },
  { title: 'Backend Development', description: 'Secure APIs and server-side systems ready for production workloads.', icon: 'ti ti-server-2', features: ['Node.js', 'Express', 'PostgreSQL'] },
  { title: 'UI / UX Implementation', description: 'Modern visual systems translated into smooth, accessible web experiences.', icon: 'ti ti-palette', features: ['Design Systems', 'Animations', 'Accessibility'] },
  { title: 'Performance & Optimization', description: 'Practical improvements for speed, stability, SEO and maintainability.', icon: 'ti ti-gauge', features: ['Core Web Vitals', 'SEO', 'Clean Code'] }
];
function renderServices(list) {
  const container=document.getElementById('servicesContainer'); if(!container) return;
  container.replaceChildren();
  list.forEach((service,index)=>{
    const card=document.createElement('article'); card.className='service-card';
    const top=document.createElement('div'); top.className='service-top';
    const icon=document.createElement('span'); icon.className='service-icon'; icon.innerHTML=`<i class="${service.icon || 'ti ti-code'}"></i>`;
    const num=document.createElement('span'); num.className='service-number'; num.textContent=String(index+1).padStart(2,'0');
    top.append(icon,num);
    const content=document.createElement('div'); content.className='service-content';
    const title=document.createElement('h3'); title.textContent=service.title || 'Service';
    const desc=document.createElement('p'); desc.textContent=service.description || '';
    const features=document.createElement('ul'); features.className='service-features';
    (Array.isArray(service.features)?service.features:[]).forEach(f=>{const li=document.createElement('li'); li.textContent=f; features.appendChild(li);});
    content.append(title,desc,features); card.append(top,content); container.appendChild(card);
  });
  if(window.lucide) lucide.createIcons();
  gsap.utils.toArray('.service-card').forEach((card,i)=>{ gsap.fromTo(card,{opacity:0,y:50},{opacity:1,y:0,duration:.8,delay:i*.05,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 88%',toggleActions:'play none none reverse'}}); });
  ScrollTrigger.refresh();
}
async function loadServices(){
  try{ const r=await fetch('/api/services',{headers:{Accept:'application/json'},cache:'no-store'}); if(!r.ok) throw new Error(); const data=await r.json(); renderServices(Array.isArray(data)&&data.length?data:demoServices); }
  catch(e){ console.warn('Services API unavailable. Showing demo data.'); renderServices(demoServices); }
}
loadServices();

/* =====================================================
   BACKEND-DRIVEN STATUS STATS
===================================================== */
const demoStatus=[
 {stat_key:'skills',value:8,suffix:'+',label:'Skills'},
 {stat_key:'projects',value:10,suffix:'+',label:'Projects'},
 {stat_key:'clients',value:5,suffix:'+',label:'Clients'},
 {stat_key:'experience',value:2,suffix:'+',label:'Experience'}
];
function renderStatusStats(list){
  const map=new Map(list.map(x=>[x.stat_key,x]));
  document.querySelectorAll('[data-status-value]').forEach(el=>{
    const item=map.get(el.dataset.statusValue); if(!item) return;
    el.replaceChildren(); const value=document.createTextNode(String(item.value)); const suffix=document.createElement('span'); suffix.textContent=item.suffix || ''; el.append(value,suffix);
    const card=el.closest('.status-card'); const label=card?.querySelector('.card-content p'); if(label) label.textContent=item.label || '';
    const icon=card?.querySelector('.status-icon i'); if(icon && item.icon) icon.className=item.icon;
  });
  if(window.lucide) lucide.createIcons();
}
async function loadStatusStats(){
  try{ const r=await fetch('/api/status',{headers:{Accept:'application/json'},cache:'no-store'}); if(!r.ok) throw new Error(); const data=await r.json(); renderStatusStats(Array.isArray(data)&&data.length?data:demoStatus); }
  catch(e){ console.warn('Status API unavailable. Showing demo stats.'); renderStatusStats(demoStatus); }
}
loadStatusStats();



/* =====================================================
   GSAP
===================================================== */

gsap.registerPlugin(ScrollTrigger);


/* =====================================================
   HERO VISUAL SCRUB
===================================================== */

gsap.timeline({

  scrollTrigger: {

    trigger: ".project-visual",

    start: "top bottom",

    end: "bottom top",

    scrub: 1.5

  }

})

.to(".project-visual .laptop", {

  y: -45,

  rotateZ: -7,

  scale: 1.04,

  ease: "none"

}, 0)

.to(".project-visual .tablet", {

  y: -30,

  rotateZ: -15,

  ease: "none"

}, 0)

.to(".project-visual .speaker", {

  y: -60,

  rotateZ: 5,

  ease: "none"

}, 0)

.to(".project-visual .keyboard", {

  y: -25,

  ease: "none"

}, 0)

.to(".project-visual .shape-1", {

  y: -80,

  rotate: 80,

  ease: "none"

}, 0)

.to(".project-visual .shape-2", {

  y: -50,

  ease: "none"

}, 0);


/* =====================================================
   HEADER SCRUB
===================================================== */

gsap.timeline({

  scrollTrigger: {

    trigger: ".projects-header",

    start: "top 90%",

    end: "top 40%",

    scrub: 1

  }

})

.fromTo(

  ".projects-header",

  {
    opacity: 0,
    y: 70
  },

  {
    opacity: 1,
    y: 0,
    ease: "none"
  }

);


/* =====================================================
   PROJECT CARDS SCRUB
===================================================== */

const cards =
  document.querySelectorAll(".project-card");


cards.forEach((card, index) => {

  gsap.fromTo(

    card,

    {
      opacity: 0,
      y: 100,
      scale: 0.92
    },

    {
      opacity: 1,
      y: 0,
      scale: 1,

      ease: "none",

      scrollTrigger: {

        trigger: card,

        start: "top 92%",

        end: "top 55%",

        scrub: 1.2

      }

    }

  );

});


/* =====================================================
   CARD IMAGE PARALLAX
===================================================== */

cards.forEach(card => {

  const image =
    card.querySelector(".demo-screen");

  gsap.fromTo(

    image,

    {
      y: 30,
      scale: 1.08
    },

    {
      y: -15,
      scale: 1,

      ease: "none",

      scrollTrigger: {

        trigger: card,

        start: "top bottom",

        end: "bottom top",

        scrub: 1.5

      }

    }

  );

});


/* =====================================================
   VIEW ALL SCRUB
===================================================== */

gsap.fromTo(

  ".view-all",

  {
    opacity: 0,
    y: 50
  },

  {
    opacity: 1,
    y: 0,

    ease: "none",

    scrollTrigger: {

      trigger: ".view-all",

      start: "top 90%",

      end: "top 65%",

      scrub: 1

    }

  }

);


/* =====================================================
   REFRESH
===================================================== */

window.addEventListener("load", () => {

  ScrollTrigger.refresh();

});

























/*
|--------------------------------------------------------------------------
| BACKEND API
|--------------------------------------------------------------------------
|
| Backend se data lane ke liye:
|
| GET /api/experience
|
| Expected response:
|
| [
|   {
|       "year": "2022",
|       "title": "Started Web Development",
|       "highlight": "",
|       "description": "Began my journey with HTML, CSS & JavaScript"
|   }
| ]
|
*/

const API_URL = "/api/experience";


/*
|--------------------------------------------------------------------------
| DEMO DATA
|--------------------------------------------------------------------------
*/

const demoExperience = [

    {
        year: "2022",
        title: "Started Web Development",
        highlight: "",
        description: "Began my journey with HTML, CSS & JavaScript"
    },

    {
        year: "2023",
        title: "Frontend Developer",
        highlight: "at TechFlow",
        description: "Worked on multiple client projects"
    },

    {
        year: "2024",
        title: "Full Stack Developer",
        highlight: "Freelancer",
        description: "Building complete web solutions"
    },

    {
        year: "2025",
        title: "Building My Own Products",
        highlight: "",
        description: "Working on SaaS & AI based products"
    }

];


/*
|--------------------------------------------------------------------------
| CREATE TIMELINE
|--------------------------------------------------------------------------
*/

function createTimeline(data) {

    const timeline = document.getElementById("timeline");

    timeline.innerHTML = "";

    data.forEach((item, index) => {

        const timelineItem = document.createElement("div");

        timelineItem.className = "timeline-item";

        timelineItem.innerHTML = `

            <div class="timeline-year">
                ${escapeHTML(item.year)}
            </div>

            <div class="timeline-dot-wrapper">
                <div class="timeline-dot"></div>
            </div>

            <div class="timeline-content">

                <h3>
                    ${escapeHTML(item.title)}

                    ${
                        item.highlight
                        ? `<span>${escapeHTML(item.highlight)}</span>`
                        : ""
                    }
                </h3>

                <p>
                    ${escapeHTML(item.description)}
                </p>

            </div>

        `;

        timeline.appendChild(timelineItem);

    });

    activateScrollAnimation();

}


/*
|--------------------------------------------------------------------------
| SCROLL ANIMATION
|--------------------------------------------------------------------------
*/

function activateScrollAnimation() {

    const items =
        document.querySelectorAll(".timeline-item");

    const observer =
        new IntersectionObserver(

            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                    }

                });

            },

            {
                threshold: 0.2
            }

        );


    items.forEach((item) => {

        observer.observe(item);

    });

}


/*
|--------------------------------------------------------------------------
| BACKEND FETCH
|--------------------------------------------------------------------------
*/

async function loadExperience() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "API request failed"
            );

        }

        const data =
            await response.json();

        createTimeline(data);

        console.log(
            "Experience loaded from backend"
        );

    } catch (error) {

        console.warn(
            "Backend unavailable. Showing demo data."
        );

        createTimeline(
            demoExperience
        );

    }

}


/*
|--------------------------------------------------------------------------
| SECURITY HELPER
|--------------------------------------------------------------------------
*/

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/*
|--------------------------------------------------------------------------
| INITIALIZE
|--------------------------------------------------------------------------
*/

loadExperience();















const skillsCard = document.querySelector(".skills-card");

if (skillsCard && "IntersectionObserver" in window) {
  const skillsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          skillsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  skillsObserver.observe(skillsCard);
} else if (skillsCard) {
  skillsCard.classList.add("active");
}
























/* =========================================
   LUCIDE ICONS
========================================= */



/* =========================================
   PARTICLES
========================================= */
const particlesContainer =
  document.getElementById("particles");

if (particlesContainer) {
for (let i = 0; i < 28; i++) {

  const particle =
    document.createElement("span");

  particle.className =
    "particle";


  const size =
    Math.random() * 5 + 2;


  particle.style.width =
    `${size}px`;


  particle.style.height =
    `${size}px`;


  particle.style.left =
    `${Math.random() * 100}%`;


  particle.style.top =
    `${Math.random() * 100}%`;


  particle.style.animationDuration =
    `${Math.random() * 6 + 5}s`;


  particle.style.animationDelay =
    `${Math.random() * 5}s`;


  particlesContainer.appendChild(
    particle
  );
}
}


/* =========================================
   SCROLL REVEAL
========================================= */
const revealElements =
  document.querySelectorAll(".reveal");


const revealObserver =
  new IntersectionObserver(

    (entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "active"
          );

          revealObserver.unobserve(
            entry.target
          );

        }

      });

    },

    {
      threshold: 0.15
    }

  );


revealElements.forEach(element => {

  revealObserver.observe(element);

});



/* =========================================
   TESTIMONIAL SLIDER
========================================= */

const demoTestimonials = [
  { name: "Rohit Sharma", role: "Founder, Nexcent", quote: "“Devansh is an exceptional developer. He delivered our project on time with amazing quality.”", initials: "RS" },
  { name: "Aarav Mehta", role: "CEO, TechNova", quote: "“Working with Devansh was smooth, creative and professional. The final experience was beyond our expectations.”", initials: "AM" },
  { name: "Priya Verma", role: "Product Manager", quote: "“He understands design as well as development. The attention to detail made a huge difference.”", initials: "PV" }
];

const clientName = document.getElementById("clientName");
const clientRole = document.getElementById("clientRole");
const quote = document.getElementById("quote");
const dots = document.querySelectorAll(".dot");
const testimonialCard = document.getElementById("testimonialCard");
let testimonials = demoTestimonials;
let currentTestimonial = 0;

function showTestimonial(index) {
  if (!testimonialCard || !clientName || !clientRole || !quote || !dots.length || !testimonials.length) return;
  const data = testimonials[index];
  testimonialCard.style.opacity = "0";
  testimonialCard.style.transform = "translateY(15px) scale(.98)";
  setTimeout(() => {
    clientName.textContent = data.name || "Client";
    clientRole.textContent = data.role || "Client";
    quote.textContent = data.quote || "";
    dots.forEach(dot => dot.classList.remove("active"));
    if (dots[index]) dots[index].classList.add("active");
    testimonialCard.style.opacity = "1";
    testimonialCard.style.transform = "translateY(0) scale(1)";
  }, 280);
}

async function loadTestimonials() {
  try {
    const response = await fetch("/api/testimonials", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error("Testimonials API failed");
    const data = await response.json();
    if (Array.isArray(data) && data.length) testimonials = data;
  } catch (error) {
    console.warn("Testimonials API unavailable. Showing demo data.");
  }
  showTestimonial(0);
  if (testimonialCard && testimonials.length > 1) {
    setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(currentTestimonial);
    }, 4500);
  }
}

loadTestimonials();


/* =========================================
   TALK BUTTON
========================================= */

const talkBtn = document.getElementById("talkBtn");
if (talkBtn) talkBtn.addEventListener("click", () => {
  const modal = document.getElementById("contactModal");
  if (!modal) return;
  modal.classList.add("active");
  document.body.classList.add("modal-open");
  setTimeout(() => document.getElementById("contactName")?.focus(), 120);
});



/* =========================================
   BUTTON RIPPLE
========================================= */

if (talkBtn) talkBtn.addEventListener(
  "click",
  function(event) {

    const ripple =
      document.createElement("span");


    ripple.style.position =
      "absolute";


    ripple.style.width =
      "10px";


    ripple.style.height =
      "10px";


    ripple.style.borderRadius =
      "50%";


    ripple.style.background =
      "rgba(255,255,255,.45)";


    ripple.style.left =
      `${event.offsetX}px`;


    ripple.style.top =
      `${event.offsetY}px`;


    ripple.style.transform =
      "translate(-50%, -50%)";


    ripple.style.pointerEvents =
      "none";


    ripple.animate(

      [

        {
          width: "10px",
          height: "10px",
          opacity: 1
        },

        {
          width: "300px",
          height: "300px",
          opacity: 0
        }

      ],

      {

        duration: 650,

        easing: "ease-out"

      }

    );


    this.appendChild(
      ripple
    );


    setTimeout(() => {

      ripple.remove();

    }, 700);

  }
);



/* =========================================
   BACK TO TOP
========================================= */

const topBtn =
  document.getElementById(
    "topBtn"
  );


if (topBtn) topBtn.addEventListener(
  "click",
  () => {

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  }
);



/* =========================================
   DESKTOP 3D MOUSE PARALLAX
========================================= */

const cube =
  document.querySelector(
    ".cube"
  );


document.addEventListener(
  "mousemove",
  (event) => {

    if (!cube || window.innerWidth < 700) {
      return;
    }


    const x =
      (
        event.clientX /
        window.innerWidth -
        0.5
      ) * 15;


    const y =
      (
        event.clientY /
        window.innerHeight -
        0.5
      ) * 15;


    cube.style.animationPlayState =
      "paused";


    cube.style.transform =

      `rotateX(${-18 + y}deg)
       rotateY(${35 + x}deg)`;

  }
);



document.addEventListener(
  "mouseleave",
  () => {

    if (!cube) return;

    cube.style.animationPlayState =
      "running";

  }
);
/* =====================================================
   PRODUCTION CONTACT FORM
===================================================== */
(() => {
  const modal = document.getElementById("contactModal");
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");
  if (!modal || !form) return;

  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  document.querySelectorAll("[data-close-contact]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && modal.classList.contains("active")) closeModal(); });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector("button[type=submit]");
    const payload = Object.fromEntries(new FormData(form).entries());
    status.textContent = "Sending...";
    status.className = "";
    button.disabled = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to send your message.");
      status.textContent = data.message || "Message sent successfully.";
      status.className = "success";
      form.reset();
      setTimeout(closeModal, 1400);
    } catch (error) {
      status.textContent = error.message || "Something went wrong. Please try again.";
      status.className = "error";
    } finally {
      button.disabled = false;
    }
  });
})();
