// Typing Effect
const text = "Full Stack Developer | Building Modern Web Apps";
let i = 0;

function typeWriter() {
  if (i < text.length) {
    document.querySelector(".hero-content p").innerHTML += text.charAt(i);
    i++;
    setTimeout(typeWriter, 60);
  }
}

document.querySelector(".hero-content p").innerHTML = "";
typeWriter();


// Scroll Reveal Animation
const cards = document.querySelectorAll(".card");

window.addEventListener("scroll", () => {
  cards.forEach(card => {
    const top = card.getBoundingClientRect().top;
    const trigger = window.innerHeight - 100;

    if (top < trigger) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  });
});

cards.forEach(card => {
  card.style.opacity = "0";
  card.style.transform = "translateY(40px)";
  card.style.transition = "0.8s ease";
});
// Contact Form Submit
document.getElementById("contactForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  const res = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type":"application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if(result.success){
    document.getElementById("status").innerText = "✅ Message sent successfully!";
    document.getElementById("contactForm").reset();
  } else {
    document.getElementById("status").innerText = "❌ Failed to send message.";
  }
});
// Load Projects Dynamically
async function loadProjects() {
  const res = await fetch("/api/projects");
  const projects = await res.json();

  const container = document.getElementById("projectsContainer");
  container.innerHTML = "";

  projects.forEach(project => {
    container.innerHTML += `
      <div class="project-box">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p><strong>Tech:</strong> ${project.tech}</p>
        <a href="${project.link}" target="_blank">View Project</a>
      </div>
    `;
  });
}

loadProjects();