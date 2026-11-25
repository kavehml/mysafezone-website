const steps = Array.from(document.querySelectorAll(".process-step"));
const detail = document.querySelector(".process-detail");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const showStep = (step, index) => {
  steps.forEach((item) => {
    const isCurrent = item === step;
    item.classList.toggle("is-active", isCurrent);
    item.setAttribute("aria-selected", String(isCurrent));
    item.tabIndex = isCurrent ? 0 : -1;
  });

  detail.classList.add("is-changing");

  window.setTimeout(() => {
    detail.querySelector(".detail-kicker").textContent = `Step ${index + 1}`;
    detail.querySelector("h3").textContent = step.dataset.title;
    detail.querySelector(":scope > p").textContent = step.dataset.copy;

    const detailLink = detail.querySelector(":scope > a");
    detailLink.href = step.dataset.link;
    detailLink.innerHTML = `${step.dataset.linkLabel} <span aria-hidden="true">→</span>`;
    detail.classList.remove("is-changing");
  }, prefersReducedMotion.matches ? 0 : 130);
};

steps.forEach((step, index) => {
  step.tabIndex = index === 0 ? 0 : -1;
  step.addEventListener("click", () => showStep(step, index));

  step.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + direction + steps.length) % steps.length;
    steps[nextIndex].focus();
    showStep(steps[nextIndex], nextIndex);
  });
});

if (!prefersReducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll("[data-motion-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll("[data-dialog]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const dialog = document.getElementById(trigger.dataset.dialog);
    if (dialog && !dialog.open) dialog.showModal();
  });
});

document.querySelectorAll(".info-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (outside) dialog.close();
  });
});

// Public Jane profiles verified 2026-11-16. Review when roster or bios change.
const matchTherapists = [{"id": 12, "name": "Pablo Allen", "bio": "Pablo Allen is a Registered Psychotherapist (Qualifying) in Ontario with over 15 years of clinical experience in Gestalt Psychotherapy, working with children, adolescents, adults, parents, couples, and families. His humanistic, relational, and trauma-informed approach integrates attachment theory, emotional awareness, mindfulness, and experiential interventions to support individuals navigating anxiety, trauma, relationship difficulties, life transitions, and personal growth. Originally trained in Mexico and further trained in the United States, Pablo brings extensive experience in clinical practice, psychotherapy education, and work with culturally diverse populations. As an immigrant himself, he understands the challenges of cultural adaptation, identity, and belonging, and is committed to providing compassionate, culturally sensitive care in both English and Spanish.", "photo": "https://assets-jane-caw1-63.janeapp.net/pub/W1siZiIsImRyYWdvbmZseS8xMDIwMTIvdXNlci9waG90by8yMDI2LTExLTExLzE0MTY0Mi9hOWVjN2MzZi04MmM1LTQ0NGUtOTJmMC01NzkwM2U3YzZlNTIvUGFibG8gQWxsZW4gLSBwcm9maWxlIHBob3RvLnBuZyJdLFsicCIsInRodW1iIiwiMjAweDI2MCMiXV0?sha=9f77f15fd3969ded&for=pneumahealth.janeapp.com", "ages": ["child", "teen", "adult"], "topics": ["anxiety", "trauma", "relationships", "transitions"], "styles": ["understand"], "languages": ["English", "Spanish"]}, {"id": 9, "name": "Ms. Keerat Aujla", "bio": "Keerat is a Registered Psychotherapist (Qualifying) with over seven years of experience in the social service sector. She works with adults (18+) experiencing anxiety, depression, trauma, grief, relationship challenges, and life transitions. Her practice places special emphasis on supporting newcomers and individuals navigating cultural transitions, using a warm, collaborative approach that meets clients where they are.", "photo": "https://assets-jane-caw1-63.janeapp.net/pub/W1siZiIsImRyYWdvbmZseS8xMDIwMTIvdXNlci9waG90by8yMDI2LTExLTEwLzIwMDIzMS8yZGE5YmJkYi01ODViLTQ3OTAtYjRlZi05MGU0NzhkODdjODEvS2VlcmF0IEF1amxhIC0gSmFuZSBQcm9maWxlLmpwZyJdLFsicCIsInRodW1iIiwiMjAweDI2MCMiXV0?sha=7fc8e0ab580d726e&for=pneumahealth.janeapp.com", "ages": ["adult"], "topics": ["anxiety", "depression", "trauma", "grief", "relationships", "transitions"], "styles": [], "languages": ["English", "Hindi", "Punjabi"]}, {"id": 18, "name": "Nicholas Bonk", "bio": "Nicholas Bonk is a Registered Psychotherapist who provides therapy in English. He works with children, adolescents, and adults and brings experience supporting a wide range of clients, including refugees and newcomers. Nicholas regularly incorporates cognitive behavioural therapy into a practical, client-focused approach tailored to each person’s needs and goals.", "photo": null, "ages": ["child", "teen", "adult"], "topics": ["newcomer"], "styles": ["tools"], "languages": ["English"]}, {"id": 16, "name": "Sana Choghri", "bio": "Sana Choghri is a Registered Psychotherapist (Qualifying) who offers therapy in English and Arabic. She supports children, adolescents, and adults, and brings experience working with refugees and newcomers. Sana regularly uses cognitive behavioural therapy and takes a collaborative, culturally responsive approach to helping clients strengthen coping skills and work toward meaningful change.", "photo": "https://assets-jane-caw1-63.janeapp.net/pub/W1siZiIsImRyYWdvbmZseS8xMDIwMTIvdXNlci9waG90by8yMDI2LTExLTE2LzA0NDY0Mi9iMGViZmUyMy05YWE5LTRlYTgtYTAwMi0yNGQyNDE2ZTc5YzAvc2hhcmU1ODE5MzUzMjIzNjkyMjQ1MDg1LmpwZWciXSxbInAiLCJ0aHVtYiIsIjIwMHgyNjAjIl1d?sha=38661f5c619b0ee2&for=pneumahealth.janeapp.com", "ages": ["child", "teen", "adult"], "topics": ["newcomer"], "styles": ["tools"], "languages": ["English", "Arabic"]}, {"id": 15, "name": "Oluwatosin JolaOluwa", "bio": "Oluwatosin Jolaoluwa is a Registered Psychotherapist (Qualifying) who supports children, teens, and adults through life’s challenges. She works with individuals experiencing anxiety, depression, trauma, stress, relationship difficulties, grief, low self-esteem, and life transitions, including newcomers adjusting to life in a new country. Oluwatosin takes a compassionate, culturally sensitive, and collaborative approach that respects each client’s unique needs and background. Her goal is to provide a warm, safe, and non-judgmental space where clients can explore their concerns and work toward what matters most to them.", "photo": "https://assets-jane-caw1-63.janeapp.net/pub/W1siZiIsImRyYWdvbmZseS8xMDIwMTIvdXNlci9waG90by8yMDI2LTExLTE1LzIzMTczMy8zZWQzNDc5MS0zYjI4LTQ3NjQtYmFiMC01ODc0ZDg0MGYwODMvVW50aXRsZWQgZGVzaWduICgyMCkucG5nIl0sWyJwIiwidGh1bWIiLCIyMDB4MjYwIyJdXQ?sha=a668be2cf49fabbd&for=pneumahealth.janeapp.com", "ages": ["child", "teen", "adult"], "topics": ["anxiety", "depression", "trauma", "stress", "relationships", "grief", "transitions", "newcomer"], "styles": [], "languages": ["English"]}, {"id": 14, "name": "Kavya Muraly", "bio": "Kavya Muraly is a Registered Social Worker (MSW, RSW) in good standing with the OCSWSSW, and a counsellor and psychotherapist with experience providing clinical counselling. She supports clients across the lifespan through mental health assessment, treatment planning, and personalized care. Her practice is grounded in a client-centred, compassionate, and culturally responsive approach, helping clients navigate life transitions and everyday mental health challenges. Kavya is committed to creating a safe, confidential, and empowering environment where clients feel heard, understood, and supported in building emotional resilience and meaningful change.", "photo": null, "ages": ["child", "teen", "adult"], "topics": ["transitions"], "styles": [], "languages": ["English", "Hindi", "Tamil", "Malayalam"]}, {"id": 19, "name": "Jibin Vadakkemuriyil John", "bio": "Jibin Vadakkemuriyil John is a Registered Social Worker with a Master of Social Work. He offers therapy in English, Tamil, and Malayalam and supports children, adolescents, and adults. Jibin regularly uses cognitive behavioural therapy and brings experience working with refugees and newcomers, providing a respectful and collaborative space for clients to address their concerns and build practical coping strategies.", "photo": null, "ages": ["child", "teen", "adult"], "topics": ["newcomer"], "styles": ["tools"], "languages": ["English", "Tamil", "Malayalam"]}];
const helpFormURL = "https://docs.google.com/forms/d/e/1FAIpQLScZybuNpO0uS9r0S9Tds227BgayAe8z0cIVu_FjhuOwMrChSQ/viewform";
function availableMatchLanguages(therapists = matchTherapists) {
  return [...new Set(therapists.flatMap(t => t.languages))].sort((a, b) => a.localeCompare(b));
}
function rankMatches(answers, random = Math.random) {
  return matchTherapists.filter(t => t.ages.includes(answers.age) && (!answers.language || t.languages.includes(answers.language)))
    .map(t => ({...t, matched: answers.topics.filter(topic => t.topics.includes(topic)), tie: random()}))
    .map(t => ({...t, score: t.matched.length * 10 + (t.styles.includes(answers.style) ? 1 : 0)}))
    .sort((a,b) => b.score - a.score || a.tie - b.tie).slice(0,2);
}
const matchForm = document.querySelector('#match-form');
const languageSelect = matchForm.elements.language;
languageSelect.replaceChildren(new Option('No preference', ''));
availableMatchLanguages().forEach(language => languageSelect.add(new Option(language, language)));
matchForm.addEventListener('submit', event => {
  event.preventDefault();
  const values = new FormData(matchForm);
  const answers = {age: values.get('age'), language: values.get('language'), style: values.get('style'), topics: values.getAll('topic')};
  const matches = rankMatches(answers);
  const results = document.querySelector('#match-results');
  results.replaceChildren(); results.hidden = false;
  const add = (tag, text, parent = results) => {const el = document.createElement(tag); el.textContent = text; parent.append(el); return el;};
  add('h3', matches.length ? 'Therapists you might connect with' : 'Let’s find the right support together');
  add('p', matches.length ? 'These are suggestions based on public profiles, not a clinical assessment. Confirm fit and current availability with the therapist in Jane.' : 'We couldn’t confidently suggest someone for these selections. Our team can help you explore your options.');
  const cards = add('div',''); cards.className = 'match-cards';
  matches.forEach(t => {
    const card = add('article','',cards);
    if (t.photo) {const img = document.createElement('img'); img.src = t.photo; img.alt = t.name; img.loading = 'lazy'; card.append(img);}
    add('h3',t.name,card);
    const labels = t.matched.map(topic => matchForm.querySelector(`input[value="${topic}"]`).parentElement.textContent.trim());
    add('p', labels.length ? `Their profile includes support with ${labels.join(', ').toLowerCase()}.` : (answers.topics.length ? 'This therapist works with your selected age group and language preference. Their public profile does not confirm your selected concerns; please confirm suitability with the therapist or ask our team for help.' : 'Their profile includes working with this age group.'),card);
    add('p',`Languages: ${t.languages.join(', ')}`,card);
    const details = add('details','',card); add('summary','Read their profile',details); add('p',t.bio,details);
    const link = add('a','View profile & book →',card); link.href = `https://pneumahealth.janeapp.com/locations/my-safe-zone/book#/staff_member/${t.id}`; link.target = '_blank'; link.rel = 'noopener'; link.className = 'button button-primary';
  });
  const fallback = add('div',''); fallback.className = 'match-fallback';
  add('h3','Haven’t found the right fit? Let us help.',fallback);
  add('p','Leave your first name and contact details in our short callback form. Our team can help you choose. No clinical details are needed, and your matching answers stay on this page.',fallback);
  const link = add('a','Ask our team to contact me →',fallback); link.href = helpFormURL; link.target = '_blank'; link.rel = 'noopener'; link.className = 'button button-primary';
  results.focus(); results.scrollIntoView({behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',block:'start'});
});
