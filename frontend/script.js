const API_URL = "https://shalini-portfolio-a2i6.onrender.com";

const FALLBACK_PROJECTS = [
  {
    title: "FocusFlow - Task Management App",
    description:
      "A full-stack MERN application with JWT authentication, CRUD operations, responsive dashboard, and RESTful API integration.",
    tech: "React.js, Node.js, Express.js, MongoDB, JWT",
    link: "https://github.com/Shalini-576-cse"
  },
  {
    title: "Blog Platform",
    description:
      "A MERN Stack blogging platform with secure authentication, post management, comments, REST APIs, and responsive design.",
    tech: "React.js, Node.js, Express.js, MongoDB",
    link: "https://github.com/Shalini-576-cse"
  },
  {
    title: "Email Spam Detection",
    description:
      "Machine learning application that classifies emails as spam or non-spam using Scikit-Learn.",
    tech: "Python, Scikit-Learn",
    link: "https://github.com/Shalini-576-cse"
  }
];

let portfolioInitialized = false;

function initPortfolio() {
  if (portfolioInitialized) return;

  portfolioInitialized = true;

  startTypingEffect();
  setupScrollReveal();
  setupContactForm();
  loadProjects();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolio);
} else {
  initPortfolio();
}

function startTypingEffect() {
  const heroSubtitle = document.querySelector(".hero-content p");
  const text =
    "Full Stack Developer | Building Modern Web Applications";

  if (!heroSubtitle) return;

  heroSubtitle.textContent = "";

  let index = 0;

  function type() {
    if (index < text.length) {
      heroSubtitle.textContent += text.charAt(index);
      index++;
      setTimeout(type, 50);
    }
  }

  type();
}

function setupScrollReveal() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.classList.add("reveal-card");
  });

  if (!("IntersectionObserver" in window)) {
    cards.forEach(card => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  });

  cards.forEach(card => observer.observe(card));
}

function setupContactForm() {
  const form = document.getElementById("contactForm");

  if (!form) return;

  const submitButton = form.querySelector("button");

  form.addEventListener("submit", async e => {
    e.preventDefault();

    submitButton.disabled = true;

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("Message sent successfully!", "success");
        form.reset();
      } else {
        setStatus(result.message || "Failed to send message.", "error");
      }
    } catch (err) {
      setStatus("Unable to connect to server.", "error");
    }

    submitButton.disabled = false;
  });
}

function setStatus(message, type) {
  const status = document.getElementById("status");

  if (!status) return;

  status.textContent = message;
  status.className = `status ${type}`;
}

async function loadProjects() {
  const container = document.getElementById("projectsContainer");

  if (!container) return;

  container.innerHTML =
    "<p class='projects-status'>Loading Projects...</p>";

  try {
    const response = await fetch(`${API_URL}/api/projects`);

    const projects = await response.json();

    if (!response.ok) throw new Error();

    renderProjects(container, projects.length ? projects : FALLBACK_PROJECTS);

  } catch (error) {

    renderProjects(container, FALLBACK_PROJECTS);

  }
}

function renderProjects(container, projects) {

  container.innerHTML = "";

  projects.forEach(project => {

    const card = document.createElement("div");

    card.className = "project-card";

    card.innerHTML = `
      <h3>${project.title}</h3>

      <p>${project.description}</p>

      <h4>Tech Stack</h4>

      <p>${project.tech}</p>

      ${
        project.link
          ? `<a href="${project.link}" target="_blank" class="project-btn">View Project</a>`
          : ""
      }
    `;

    container.appendChild(card);

  });

}