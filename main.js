(() => {
  const p = window.PROFILE;
  const el = id => document.getElementById(id);
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const externalLink = (text, url, cls) => {
    const a = make('a', cls, text);
    a.href = url;
    if (!url.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  };
  const dialog = el('resource-dialog');
  function showDialog(title, description) {
    el('dialog-title').textContent = title;
    el('dialog-description').textContent = description;
    dialog.showModal();
  }
  for (const key of ['name', 'role', 'department', 'location', 'updated']) el(key).textContent = p[key];
  el('location').parentElement.hidden = !p.location;
  el('footer-name').textContent = p.name;
  document.title = p.name + ' · Academic Homepage';
  el('avatar').src = p.avatar;
  el('avatar').alt = p.name + "'s avatar";
  p.contacts.forEach(c => {
    const row = make('p');
    const icon = make('span', null, c.icon);
    icon.setAttribute('aria-hidden', 'true'); row.append(icon);
    if (c.url) {
      const a = externalLink(c.label, c.url);
      a.title = c.url.startsWith('mailto:') ? c.url.slice(7) : c.url;
      row.append(a);
    } else if (c.value) {
      const button = make('button', null, c.label);
      button.type = 'button'; button.onclick = () => showDialog(c.label, c.value);
      row.append(button);
    }
    el('contact-links').append(row);
  });
  p.interests.forEach(text => el('interests').append(make('span', null, text)));
  p.bio.forEach(text => el('bio').append(make('p', null, text)));
  el('opportunity').textContent = p.opportunity;
  p.experience.forEach(item => {
    const row = make('article', 'experience');
    const icon = make('span', 'experience-icon', item.icon);
    icon.setAttribute('aria-hidden', 'true'); row.append(icon);
    const body = make('div'); const heading = make('div', 'experience-heading');
    heading.append(make('h3', null, item.institution), make('span', item.status === 'Present' ? 'status present' : 'status', item.status));
    body.append(heading, make('p', 'experience-role', item.role + (item.advisor ? ' · ' + item.advisor : '')), make('p', 'experience-description', item.description));
    row.append(body); el('experience-list').append(row);
  });
  function renderPublications(year) {
    el('publication-list').replaceChildren();
    p.publications.filter(item => year === 'All' || item.year === year).forEach(item => {
      const row = make('article', 'publication');
      row.append(make('span', 'venue', item.venue + ' · ' + item.year));
      const content = make('div'); content.append(make('h3', 'pub-title', item.title));
      const authors = make('p', 'authors');
      item.authors.split(p.authorName).forEach((part, i) => {
        if (i) authors.append(make('strong', null, p.authorName));
        authors.append(document.createTextNode(part));
      });
      content.append(authors, make('p', 'pub-summary', item.summary));
      const links = make('div', 'pub-links');
      if (item.paper) links.append(externalLink('Paper ↗', item.paper));
      if (item.code) links.append(externalLink('Code ↗', item.code));
      if (item.abstract) {
        const button = make('button', 'abstract-button', 'Abstract');
        button.type = 'button'; button.onclick = () => showDialog(item.title, item.abstract);
        links.append(button);
      }
      if (links.children.length) content.append(links);
      row.append(content); el('publication-list').append(row);
    });
  }
  const years = [...new Set(p.publications.map(item => item.year))].sort().reverse();
  ['All', ...years].forEach((year, i) => {
    const button = make('button', null, year);
    button.type = 'button'; button.setAttribute('aria-pressed', String(i === 0));
    button.onclick = () => {
      document.querySelectorAll('.filters button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      renderPublications(year);
    };
    document.querySelector('.filters').append(button);
  });
  document.querySelector('.filters').hidden = years.length < 2;
  renderPublications('All');
  p.projects.forEach(item => {
    const row = make('article', 'project'); const title = make('h3');
    const icon = make('span', 'project-icon', item.icon); icon.setAttribute('aria-hidden', 'true');
    title.append(icon, externalLink(item.name + ' ↗', item.url));
    row.append(title, make('p', null, item.description));
    const badges = make('div', 'project-badges');
    item.tags.forEach(tag => badges.append(make('span', 'tag', tag)));
    const stars = externalLink('', item.url + '/stargazers', 'stars');
    const img = document.createElement('img');
    img.src = 'https://img.shields.io/github/stars/' + item.repo + '?style=social';
    img.alt = item.name + ' GitHub stars'; img.width = 80; img.height = 20; img.loading = 'lazy';
    img.onerror = () => { stars.textContent = '★ View on GitHub'; };
    stars.append(img); badges.append(stars); row.append(badges);
    el('project-list').append(row);
  });
  const skillSymbols = { Python: '🐍', PyTorch: '🔥', Linux: '🐧', Git: '⑂', 'Computer Vision': '◉', 'Generative Models': '✦' };
  p.skills.forEach(skill => {
    const badge = make('span', 'skill-badge'); const symbol = make('span', null, skillSymbols[skill] || '•');
    symbol.setAttribute('aria-hidden', 'true'); badge.append(symbol, document.createTextNode(skill));
    el('skill-list').append(badge);
  });
  p.education.forEach(item => {
    const row = make('div', 'education'); row.append(make('time', null, item.dates));
    const body = make('div'); body.append(make('h3', null, item.degree), make('p', null, item.institution), make('p', 'detail', item.detail));
    row.append(body); el('education-list').append(row);
  });
  p.awards.forEach(item => {
    const row = make('li'); row.append(make('span', 'award-year', item.year));
    const body = make('div'); body.append(make('strong', null, item.title), make('span', 'award-description', item.description));
    row.append(body); el('awards-list').append(row);
  });
  dialog.querySelectorAll('button').forEach(button => button.onclick = () => dialog.close());
  dialog.onclick = event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  };
  el('back-top').onclick = () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) document.querySelectorAll('.section-nav a').forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id));
    });
  }, { rootMargin: '-10% 0px -65% 0px' });
  document.querySelectorAll('main section').forEach(section => observer.observe(section));
})();
