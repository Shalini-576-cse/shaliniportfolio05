const FALLBACK_PROJECTS = [
  {
    title: "Portfolio Website",
    description: "A responsive personal portfolio with a Node.js backend and contact form.",
    tech: "HTML, CSS, JavaScript, Node.js, Express, MongoDB",
    link: ""
  }
];
let portfolioInitialized = false;

function initPortfolio() {
  if (portfolioInitialized) {
    return;
  }

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
  const text = "Full Stack Developer | Building Modern Web Apps";
  let index = 0;

  if (!heroSubtitle) {
    return;
  }

  heroSubtitle.textContent = "";

  function typeNextCharacter() {
    if (index >= text.length) {
      return;
    }

    heroSubtitle.textContent += text.charAt(index);
    index += 1;
    window.setTimeout(typeNextCharacter, 60);
  }

  typeNextCharacter();
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
  }, {
    threshold: 0.15
  });

  cards.forEach(card => observer.observe(card));
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  const submitButton = form?.querySelector("button");

  if (!form || !submitButton) {
    return;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim()
    };

    const validationMessage = validateContactData(data);

    if (validationMessage) {
      setStatus(validationMessage, "error");
      return;
    }

    setStatus("Sending...", "info");
    submitButton.disabled = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await parseJsonResponse(response);

      if (response.ok && result.success) {
        setStatus("Message sent successfully!", "success");
        form.reset();
      } else {
        setStatus(result.message || "Failed to send message.", "error");
      }
    } catch (error) {
      setStatus("Unable to send message right now.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function validateContactData(data) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.name || !data.email || !data.message) {
    return "Please fill in all fields.";
  }

  if (data.name.length > 80 || data.email.length > 120 || data.message.length > 1000) {
    return "Please shorten your contact details.";
  }

  if (!emailPattern.test(data.email)) {
    return "Please enter a valid email address.";
  }

  return "";
}

async function loadProjects() {
  const container = document.getElementById("projectsContainer");

  if (!container) {
    return;
  }

  renderProjectsMessage(container, "Loading projects...");

  try {
    const response = await fetch("/api/projects");
    const projects = await parseJsonResponse(response);

    if (!response.ok || !Array.isArray(projects)) {
      throw new Error("Failed to load projects");
    }

    renderProjects(container, projects.length ? projects : FALLBACK_PROJECTS);
  } catch (error) {
    renderProjectsMessage(container, "Showing featured projects while live projects load.");
    renderProjects(container, FALLBACK_PROJECTS);
  }
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return {};
  }

  return response.json();
}

function renderProjects(container, projects) {
  const projectCards = projects
    .filter(project => project && typeof project === "object")
    .map(createProjectCard);

  if (!projectCards.length) {
    renderProjects(container, FALLBACK_PROJECTS);
    return;
  }

  container.replaceChildren(...projectCards);
}

function renderProjectsMessage(container, message) {
  const status = document.createElement("p");
  status.className = "projects-status";
  status.textContent = message;
  container.replaceChildren(status);
}

function setStatus(message, type) {
  const status = document.getElementById("status");

  if (!status) {
    return;
  }

  status.textContent = message;
  status.className = `status ${type}`;
}

function createProjectCard(project) {
  const projectBox = document.createElement("div");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const tech = document.createElement("p");
  const techLabel = document.createElement("strong");
  const titleText = getCleanText(project.title, "Untitled Project");
  const descriptionText = getCleanText(project.description, "Project details coming soon.");
  const techText = getCleanText(project.tech, "Not specified");

  projectBox.className = "project-box";
  title.textContent = titleText;
  description.textContent = descriptionText;
  techLabel.textContent = "Tech:";
  tech.append(techLabel, ` ${techText}`);

  projectBox.append(title, description, tech);

  if (isSafeProjectLink(project.link)) {
    const link = document.createElement("a");
    link.href = project.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View Project";
    projectBox.appendChild(link);
  }

  return projectBox;
}

function getCleanText(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function isSafeProjectLink(link) {
  const trimmedLink = typeof link === "string" ? link.trim() : "";

  if (!trimmedLink || trimmedLink === "#") {
    return false;
  }

  try {
    const url = new URL(trimmedLink);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}
