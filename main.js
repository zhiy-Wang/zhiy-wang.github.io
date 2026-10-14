(() => {
  const p = window.PROFILE;
  const el = id => document.getElementById(id);
  const make = (tag, cls, text) => {const node = document.createElement(tag); if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const dialog = el('resource-dialog');
  function showDialog(title, description){el('dialog-title').textContent=title;el('dialog-description').textContent=description;dialog.showModal();}
  for(const key of ['name','role','department','location','updated'])el(key).textContent=p[key];
  el('location').parentElement.hidden=!p.location;
  if(!p.interests.length){el('interests').hidden=true;document.querySelector('.profile > .eyebrow').hidden=true;document.querySelector('.side-rule').hidden=true;}
  for(const section of ['news','service']){if(!p[section].length){el(section).hidden=true;document.querySelectorAll('a[href="#'+section+'"]').forEach(a=>a.hidden=true);}}
  el('footer-name').textContent=p.name;
  document.title=p.name+' · Academic Homepage';
  const brand=document.querySelector('.brand');brand.firstChild.textContent=p.initials;
  el('avatar').src=p.avatar;el('avatar').alt=p.avatar==='avatar.svg'?p.name+' · initials avatar':p.name;
  p.contacts.forEach(c=>{const row=make('p');row.append(make('span',null,c.icon));const link=c.url?make('a',null,c.label):make('button',null,c.label);if(c.url){link.href=c.url;link.title=c.url.startsWith('mailto:')?c.url.slice(7):c.url;if(!c.url.startsWith('mailto:')){link.target='_blank';link.rel='noopener noreferrer';}}else{link.type='button';link.onclick=()=>showDialog(c.label+' · 待填写','提供你的 '+c.label+' 地址后，这里会打开对应的联系方式。');}row.append(link);el('contact-links').append(row);});
  p.interests.forEach(x=>el('interests').append(make('span',null,x)));
  p.bio.forEach(x=>el('bio').append(make('p',null,x)));
  p.news.forEach((n,i)=>{const item=make('li');item.hidden=i>=6;item.append(make('span','news-date',n.date));const body=make('span',null,n.text);if(n.tag)body.append(make('span','news-tag',n.tag));item.append(body);el('news-list').append(item);});
  const toggle=el('news-toggle');toggle.hidden=p.news.length<=6;toggle.onclick=()=>{const expanded=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(expanded));[...el('news-list').children].forEach((n,i)=>n.hidden=i>=6&&!expanded);toggle.textContent=expanded?'Show fewer updates ↑':'Show earlier updates ↓';};
  function resource(item,key,label){const node=item[key]?make('a',null,label+' ↗'):make('button',null,label+' ↗');if(item[key]){node.href=item[key];node.target='_blank';node.rel='noopener noreferrer';}else{node.type='button';node.onclick=()=>showDialog(label+' · 待填写','这是示例条目。提供真实论文或项目链接后，'+label+' 将打开相应资源。');}return node;}
  function publications(year){el('publication-list').replaceChildren();p.publications.filter(x=>year==='All'||x.year===year).forEach(item=>{const row=make('article','publication');row.append(make('span','venue',item.venue+' · '+item.year));const content=make('div');content.append(make('h3','pub-title',item.title));const authors=make('p','authors');const parts=item.authors.split(p.authorName||p.name);parts.forEach((part,i)=>{if(i)authors.append(make('strong',null,p.authorName||p.name));authors.append(document.createTextNode(part));});content.append(authors,make('p','pub-summary',item.summary));const links=make('div','pub-links');if(item.paper)links.append(resource(item,'paper','Paper'));if(item.code)links.append(resource(item,'code','Code'));if(item.abstract){const abstract=make('button','abstract-button','Abstract');abstract.type='button';abstract.onclick=()=>showDialog(item.title,item.abstract);links.append(abstract);}if(links.children.length)content.append(links);row.append(content);el('publication-list').append(row);});}
  ['All',...new Set(p.publications.map(x=>x.year).sort().reverse())].forEach((year,i)=>{const button=make('button',null,year);button.type='button';button.setAttribute('aria-pressed',String(i===0));button.onclick=()=>{document.querySelectorAll('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));publications(year);};document.querySelector('.filters').append(button);});publications('All');
  document.querySelector('.filters').hidden=new Set(p.publications.map(x=>x.year)).size<2;
  p.education.forEach(x=>{const row=make('div','education');row.append(make('time',null,x.dates));const content=make('div');content.append(make('h3',null,x.degree),make('p',null,x.institution),make('p','detail',x.detail));row.append(content);el('education-list').append(row);});
  p.awards.forEach(x=>{const row=make('li');if(x.year)row.append(make('span','award-year',x.year));else row.classList.add('undated-award');row.append(make('strong',null,x.title),make('span','award-description',x.description));el('awards-list').append(row);});
  p.service.forEach(x=>el('service-list').append(make('dt',null,x.role),make('dd',null,x.text)));
  dialog.querySelectorAll('button').forEach(b=>b.onclick=()=>dialog.close());dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};
  el('back-top').onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.querySelectorAll('main section:not([hidden]) .section-number').forEach((n,i)=>n.textContent=String(i+1).padStart(2,'0'));
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('.section-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));});},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('main section').forEach(s=>observer.observe(s));
})();
