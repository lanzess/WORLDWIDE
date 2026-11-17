// Полный каталог встроен в проект: загрузка не зависит от REST API.
const grid=document.getElementById('countryGrid'),searchInput=document.getElementById('search'),sortSelect=document.getElementById('sort'),modal=document.getElementById('countryModal'),modalBody=document.getElementById('modalBody');
let countries=[],activeRegion='Все',favorites=new Set(JSON.parse(localStorage.getItem('worldinfo-favs')||'[]')),showFavorites=false,toastTimer;
const regionMap={'Europe':'Европа','Asia':'Азия','Africa':'Африка','North America':'Северная Америка','South America':'Южная Америка','Oceania':'Океания','Antarctica':'Антарктида'};
const facts=['Флаг Непала — единственный национальный флаг в мире, который не имеет формы четырёхугольника.','Канада омывается тремя океанами: Атлантическим, Тихим и Северным Ледовитым.','Солончак Уюни в Боливии после дождя превращается в огромное природное зеркало.','Япония состоит из тысяч островов; четыре крупнейших — Хонсю, Хоккайдо, Кюсю и Сикоку.','Пустыня Атакама в Чили — одно из самых засушливых мест на Земле.','Индонезия расположена сразу в двух частях света — Азии и Океании.','В Швейцарии четыре национальных языка: немецкий, французский, итальянский и ретороманский.','Большой Барьерный риф у берегов Австралии — крупнейшая в мире система коралловых рифов.','Монголия — одна из наименее густонаселённых стран мира.','В северной Норвегии зимой можно наблюдать северное сияние.'];
const featuredPool=[
 {code:'ISL',tag:'СЕВЕРНАЯ ЕВРОПА',title:'Исландия',desc:'Остров огня и льда, где ледники соседствуют с вулканами.',fact:'Леса занимают небольшую часть территории Исландии, а геотермальная энергия широко используется для отопления.',image:'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1100&q=85'},
 {code:'JPN',tag:'ВОСТОЧНАЯ АЗИЯ',title:'Япония',desc:'Древние традиции, мегаполисы и невероятная природа.',fact:'В Японии более 14 тысяч островов по современному подсчёту.',image:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1100&q=85'},
 {code:'BRA',tag:'ЮЖНАЯ АМЕРИКА',title:'Бразилия',desc:'Амазония, Атлантический океан и яркие города.',fact:'Бразилия — единственная страна Южной Америки, где официальный язык — португальский.',image:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1100&q=85'},
 {code:'ITA',tag:'ЮЖНАЯ ЕВРОПА',title:'Италия',desc:'Античные города, искусство, горы и побережья.',fact:'В Италии находятся два независимых государства-анклава: Сан-Марино и Ватикан.',image:'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1100&q=85'},
 {code:'NOR',tag:'СЕВЕРНАЯ ЕВРОПА',title:'Норвегия',desc:'Фьорды, горы и длинные полярные ночи.',fact:'Береговая линия Норвегии с учётом фьордов и островов очень длинная и изрезанная.',image:'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1100&q=85'},
 {code:'EGY',tag:'СЕВЕРНАЯ АФРИКА',title:'Египет',desc:'Древние памятники на берегах великого Нила.',fact:'Нил протекает через 11 стран Африки, прежде чем достичь Средиземного моря.',image:'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1100&q=85'},
 {code:'CHE',tag:'ЦЕНТРАЛЬНАЯ ЕВРОПА',title:'Швейцария',desc:'Альпийские вершины, озёра и уютные города.',fact:'В Швейцарии четыре национальных языка: немецкий, французский, итальянский и ретороманский.',image:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1100&q=85'},
 {code:'AUS',tag:'ОКЕАНИЯ',title:'Австралия',desc:'Уникальная природа и города между океанами.',fact:'Австралия — единственная страна, занимающая целый материк.',image:'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1100&q=85'},
 {code:'IND',tag:'ЮЖНАЯ АЗИЯ',title:'Индия',desc:'Тысячелетняя история, языки и разнообразные пейзажи.',fact:'Индия — родина шахмат и нескольких крупных мировых религий.',image:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1100&q=85'},
 {code:'NZL',tag:'ОКЕАНИЯ',title:'Новая Зеландия',desc:'Горы, зелёные долины и вулканические ландшафты.',fact:'Новая Зеландия стала первой самоуправляемой страной, предоставившей женщинам право голоса на национальных выборах в 1893 году.',image:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1100&q=85'},
 {code:'MAR',tag:'СЕВЕРНАЯ АФРИКА',title:'Марокко',desc:'Атлантическое побережье, горы Атлас и старинные медины.',fact:'Марокко имеет побережья и Атлантического океана, и Средиземного моря.',image:'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1100&q=85'},
 {code:'PER',tag:'ЮЖНАЯ АМЕРИКА',title:'Перу',desc:'Анды, Амазония и наследие цивилизации инков.',fact:'Мачу-Пикчу находится высоко в Андах и был построен цивилизацией инков.',image:'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1100&q=85'}
];
const fmt=n=>Number(n||0).toLocaleString('ru-RU');
const flagEmoji=code=>String(code||'').toUpperCase().replace(/[A-Z]/g,ch=>String.fromCodePoint(127397+ch.charCodeAt(0)));

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getNames=c=>[c.name?.common,c.name?.official,c.translations?.rus?.common,c.translations?.rus?.official].filter(Boolean);
const getRegion=c=>regionMap[c.region]||c.region||'Не указан';
const firstCapital=c=>c.capital?.[0]||'Нет официальной столицы';
const getCurrencies=c=>Object.values(c.currencies||{}).map(x=>`${x.name}${x.symbol?` (${x.symbol})`:''}`).join(', ')||'Нет данных';
const getLanguages=c=>Object.values(c.languages||{}).join(', ')||'Нет данных';
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
function updateFavCount(){document.getElementById('favCount').textContent=favorites.size;document.getElementById('favCount2').textContent=favorites.size;localStorage.setItem('worldinfo-favs',JSON.stringify([...favorites]))}
function toggleFavorite(code,event){event?.stopPropagation();favorites.has(code)?favorites.delete(code):favorites.add(code);updateFavCount();renderCountries();toast(favorites.has(code)?'Добавлено в избранное':'Удалено из избранного')}
function getFiltered(){let q=searchInput.value.trim().toLocaleLowerCase('ru');let list=countries.filter(c=>{const names=getNames(c).join(' ').toLocaleLowerCase('ru');const capital=(c.capital||[]).join(' ').toLocaleLowerCase('ru');const region=getRegion(c).toLocaleLowerCase('ru');return(!q||names.includes(q)||capital.includes(q)||region.includes(q)||c.cca2.toLowerCase().includes(q))&&(activeRegion==='Все'||getRegion(c)===activeRegion)&&(!showFavorites||favorites.has(c.cca3))});const sort=sortSelect.value;list.sort((a,b)=>sort==='za'?getNames(b)[0].localeCompare(getNames(a)[0]):sort==='population'?b.population-a.population:sort==='area'?(b.area||0)-(a.area||0):getNames(a)[0].localeCompare(getNames(b)[0],'ru'));return list}
function renderCountries(){if(!countries.length)return;const list=getFiltered();document.getElementById('resultCount').textContent=`Показано ${fmt(list.length)} ${list.length===1?'страна':list.length<5?'страны':'стран'}`;document.getElementById('allCount').textContent=fmt(countries.length);if(!list.length){grid.innerHTML='<div class="loading-state"><b>Ничего не найдено</b><span>Попробуй изменить запрос или фильтры.</span></div>';return}grid.innerHTML=list.map((c,i)=>{const name=c.translations?.rus?.common||c.name.common;const native=c.name?.nativeName?Object.values(c.name.nativeName)[0]?.common:'';return `<article class="country-card" data-code="${c.cca3}" style="animation-delay:${Math.min(i%16,10)*35}ms"><div class="card-top"><span class="flag-emoji" aria-label="Флаг ${esc(name)}">${flagEmoji(c.cca2)}</span><button class="card-fav ${favorites.has(c.cca3)?'saved':''}" data-fav="${c.cca3}" aria-label="В избранное">${favorites.has(c.cca3)?'♥':'♡'}</button></div><h3>${esc(name)}</h3><div class="native-name">${esc(native||c.name.common)}</div><div class="card-bottom"><span>${esc(firstCapital(c))}</span><span>${esc(getRegion(c))}</span></div></article>`}).join('')}
async function loadCountries(){
  document.getElementById('loadError').hidden=true;
  grid.innerHTML='<div class="loading-state"><div class="loader"></div><b>Открываем атлас планеты</b><span>Загружаем локальную базу стран и территорий…</span></div>';
  try{
    if(!Array.isArray(window.WORLD_COUNTRIES)||!window.WORLD_COUNTRIES.length)throw new Error('Не найдена локальная база countries.js. Проверь, что все файлы лежат в одной папке.');
    countries=window.WORLD_COUNTRIES.slice().sort((a,b)=>getNames(a)[0].localeCompare(getNames(b)[0],'ru'));
    document.getElementById('statCountries').textContent=countries.length;
    document.getElementById('heroCountryCount').textContent=countries.length+' стран и территорий';
    document.getElementById('resultCount').textContent=`Загружено ${countries.length} стран и территорий`;
    renderCountries();
    renderFeatured();
    document.getElementById('atlasStatus')?.classList.add('ready');
  }catch(e){
    console.error('WORLDINFO local atlas loading failed:',e);
    grid.innerHTML='';
    document.getElementById('loadError').hidden=false;
    document.getElementById('resultCount').textContent='Не удалось открыть локальный атлас';
    const message=document.getElementById('loadError').querySelector('[data-error-detail]');
    if(message)message.textContent=e.message||'Проверь, что countries.js находится рядом с index.html и script.js.';
  }
}
function renderFeatured(){
  const host=document.getElementById('featuredGrid');if(!host||!countries.length)return;
  const pool=featuredPool.filter(item=>countries.some(c=>c.cca3===item.code));
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const selected=pool.slice(0,3);
  host.innerHTML=selected.map((item,index)=>`<article class="feature-wrap" style="--feature-delay:${index*90}ms"><div class="feature-card" style="background-image:url('${item.image}')"><div class="feature-overlay"></div><div class="feature-content"><span class="feature-tag">${item.tag}</span><h3>${item.title}</h3><p>${item.desc}</p><button data-feature-open="${item.code}" class="feature-link">Открыть страну ↗</button></div></div><div class="feature-fact"><span>✦ ФАКТ О СТРАНЕ</span><p>${item.fact}</p></div></article>`).join('');
}
function val(v){return v===undefined||v===null||v===''?'Нет данных':v}
function detailRow(label,value){return `<div class="detail-row"><span>${label}</span><b>${esc(val(value))}</b></div>`}
async function getCountryPhotos(countryName){
  const special=countryName==='Japan'?['Kyoto Japan street','Mount Fuji Japan landscape','Tokyo Japan skyline']:countryName==='Iceland'?['Iceland waterfall landscape','Iceland glacier landscape']:countryName==='Brazil'?['Rio de Janeiro Brazil landscape','Amazon rainforest Brazil']:[];
  const queries=[...special,`${countryName} landscape`,`${countryName} landmark`];
  const found=[];
  for(const query of queries){
    try{
      const url=`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=1400&format=json&origin=*`;
      const response=await fetch(url,{signal:AbortSignal.timeout(6000)});
      if(!response.ok)continue;
      const data=await response.json();
      for(const page of Object.values(data.query?.pages||{})){
        const info=page.imageinfo?.[0];
        const title=(page.title||'').toLowerCase();
        if(!info?.thumburl||!/^image\//.test(info.mime||'')||/logo|icon|flag|map|coat of arms|symbol/.test(title))continue;
        if(!found.some(x=>x.url===info.thumburl))found.push({url:info.thumburl,title:page.title.replace(/^File:/,'')});
        if(found.length>=6)return found;
      }
    }catch(error){/* Try the next query; the page still works without gallery photos. */}
  }
  return found;
}
async function openCountry(code){
  const c=countries.find(x=>x.cca3===code||x.name.common===code);if(!c)return;
  modal.showModal();modalBody.innerHTML='<div class="modal-loading"><div class="loader" style="margin:0 auto 18px"></div>Загружаем информацию и фотографии страны…</div>';
  const ru=c.translations?.rus?.common||c.name.common;
  let wiki=null,photos=[];
  const englishName=c.name.official||c.name.common;
  const title=encodeURIComponent(englishName.replaceAll(' ','_'));
  const jobs=await Promise.allSettled([
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,{signal:AbortSignal.timeout(7000)}).then(r=>r.ok?r.json():null),
    getCountryPhotos(englishName)
  ]);
  if(jobs[0].status==='fulfilled')wiki=jobs[0].value;
  if(jobs[1].status==='fulfilled')photos=jobs[1].value||[];
  const flag=flagEmoji(c.cca2);
  const languages=getLanguages(c),currency=getCurrencies(c);
  const borders=(c.borders||[]).map(code=>countries.find(x=>x.cca3===code)?.translations?.rus?.common||countries.find(x=>x.cca3===code)?.name.common||code).join(', ')||'Нет сухопутных границ';
  const area=c.area?fmt(Math.round(c.area))+' км²':'Нет данных';
  const population=c.population?fmt(c.population):'Нет данных';
  const countryFallback={JPN:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=85',ISL:'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1400&q=85',BRA:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1400&q=85'};
  const leadPhoto=photos[0]?.url||wiki?.originalimage?.source||wiki?.thumbnail?.source||countryFallback[c.cca3]||'';
  if(!photos.length&&countryFallback[c.cca3])photos=[{url:countryFallback[c.cca3],title:`${ru} — фотография` }];
  const description=wiki?.extract||`${ru} — государство в регионе «${getRegion(c)}». Дополнительные сведения о стране представлены в справочных данных ниже.`;
  const gallery=photos.length?`<h3 class="modal-subhead">Фотографии страны</h3><div class="photo-gallery">${photos.map((photo,i)=>`<a class="gallery-photo" href="${esc(photo.url)}" target="_blank" rel="noopener"><img src="${esc(photo.url)}" alt="${esc(photo.title)}" loading="lazy"><span>${i+1}. ${esc(photo.title.replace(/\.[^.]+$/,''))}</span></a>`).join('')}</div><div class="photo-credit">Источники: Wikimedia Commons и резервные фотографии Unsplash. Нажми на фото, чтобы открыть оригинал.</div>`:`<div class="photo-unavailable">Фотографии сейчас не загрузились. Проверь подключение к интернету или открой галерею Wikipedia.</div>`;
  modalBody.innerHTML=`<div class="modal-hero" style="${leadPhoto?`background-image:url('${esc(leadPhoto)}')`:''}"><div class="modal-title"><span class="modal-flag" aria-label="Флаг ${esc(ru)}">${flag}</span><h2>${esc(ru)}</h2><p>${esc(c.name.official||c.name.common)} · ${esc(getRegion(c))}</p></div></div><div class="modal-content"><p class="modal-description">${esc(description)}</p><div class="modal-stats"><div class="modal-stat"><span>НАСЕЛЕНИЕ</span><b>${population}</b></div><div class="modal-stat"><span>ПЛОЩАДЬ</span><b>${area}</b></div><div class="modal-stat"><span>СТОЛИЦА</span><b>${esc(firstCapital(c))}</b></div></div>${gallery}<h3 class="modal-subhead">Основная информация</h3><div class="detail-grid">${detailRow('Регион',getRegion(c))}${detailRow('Субрегион',c.subregion)}${detailRow('Континент',c.continents?.join(', '))}${detailRow('Официальное название',c.name.official)}${detailRow('Тип записи','Страна или территория в стандарте ISO 3166-1')}${detailRow('Языки',languages)}${detailRow('Валюта',currency)}${detailRow('Часовые пояса',(c.timezones||[]).join(', '))}${detailRow('Телефонный код',(c.idd?.root||'')+(c.idd?.suffixes?.slice(0,4).join(', ')||''))}${detailRow('Соседние страны',borders)}${detailRow('Выход к морю','Уточняйте по карте')}${detailRow('Координаты',c.latlng?.map(x=>x+'°').join(', '))}${detailRow('Начало недели',c.startOfWeek)}</div><h3 class="modal-subhead">Изучи на карте</h3><div class="modal-links"><a class="modal-link" href="${esc(c.maps?.googleMaps||'#')}" target="_blank" rel="noopener">Открыть Google Maps ↗</a>${c.maps?.openStreetMaps?`<a class="modal-link" href="${esc(c.maps.openStreetMaps)}" target="_blank" rel="noopener">OpenStreetMap ↗</a>`:''}${c.coatOfArms?.svg?`<a class="modal-link" href="${esc(c.coatOfArms.svg)}" target="_blank" rel="noopener">Герб страны ↗</a>`:''}<a class="modal-link" href="https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encodeURIComponent(englishName+' landscape')}" target="_blank" rel="noopener">Все фотографии ↗</a><a class="modal-link" href="https://en.wikipedia.org/wiki/${title}" target="_blank" rel="noopener">Подробнее в Wikipedia ↗</a></div></div>`;
}
// Events
grid.addEventListener('click',e=>{const fav=e.target.closest('[data-fav]');if(fav){toggleFavorite(fav.dataset.fav,e);return}const card=e.target.closest('[data-code]');if(card)openCountry(card.dataset.code)});
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('[data-region]');if(!b)return;activeRegion=b.dataset.region;showFavorites=false;document.getElementById('favoritesToggle').classList.remove('active');document.querySelectorAll('.region-tab').forEach(x=>x.classList.toggle('active',x===b));renderCountries()});
searchInput.addEventListener('input',renderCountries);sortSelect.addEventListener('change',renderCountries);
document.getElementById('reset').addEventListener('click',()=>{searchInput.value='';activeRegion='Все';showFavorites=false;sortSelect.value='az';document.getElementById('favoritesToggle').classList.remove('active');document.querySelectorAll('.region-tab').forEach(x=>x.classList.toggle('active',x.dataset.region==='Все'));renderCountries()});
function toggleFavFilter(){showFavorites=!showFavorites;document.getElementById('favoritesToggle').classList.toggle('active',showFavorites);renderCountries();document.getElementById('countries').scrollIntoView({behavior:'smooth'})}
document.getElementById('favoritesToggle').addEventListener('click',toggleFavFilter);document.getElementById('favoritesTop').addEventListener('click',toggleFavFilter);
document.getElementById('randomCountry').addEventListener('click',()=>{if(!countries.length)return toast('Подожди, атлас ещё загружается');openCountry(countries[Math.floor(Math.random()*countries.length)].cca3)});
document.getElementById('closeModal').addEventListener('click',()=>modal.close());modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
document.getElementById('retryLoad').addEventListener('click',loadCountries);
document.getElementById('newFact').addEventListener('click',()=>{const el=document.getElementById('factText');let next=facts[Math.floor(Math.random()*facts.length)];if(next===el.textContent)next=facts[(facts.indexOf(next)+1)%facts.length];el.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350});el.textContent=next});
document.getElementById('featuredGrid').addEventListener('click',e=>{const b=e.target.closest('[data-feature-open]');if(b)openCountry(b.dataset.featureOpen)});
document.getElementById('refreshFeatured').addEventListener('click',()=>{renderFeatured();toast('Подборка обновлена — новые страны уже здесь!')});
document.getElementById('menu').addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nav').classList.remove('open')));
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchInput.focus()}if(e.key==='Escape'&&modal.open)modal.close()});
// Микро-анимации интерфейса: прогресс прокрутки, световой курсор и 3D-карточки.
const progressBar=document.getElementById('scrollProgress');
const cursorGlow=document.getElementById('cursorGlow');
let scrollTick=false;
window.addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;progressBar.style.transform=`scaleX(${max>0?scrollY/max:0})`;scrollTick=false})},{passive:true});
window.addEventListener('pointermove',e=>{if(!cursorGlow||e.pointerType!=='mouse')return;cursorGlow.style.setProperty('--mx',e.clientX+'px');cursorGlow.style.setProperty('--my',e.clientY+'px');cursorGlow.style.left=e.clientX+'px';cursorGlow.style.top=e.clientY+'px'},{passive:true});
if('IntersectionObserver' in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.stats-strip,.section-heading,.feature-card,.fact-banner,.about-copy,.about-orb').forEach(el=>{el.classList.add('reveal-on-scroll');revealObserver.observe(el)})}
grid.addEventListener('pointermove',e=>{const card=e.target.closest('.country-card');if(!card||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;card.style.setProperty('--px',`${x/r.width*100}%`);card.style.setProperty('--py',`${y/r.height*100}%`);card.style.transform=`perspective(800px) rotateX(${(y/r.height-.5)*-4}deg) rotateY(${(x/r.width-.5)*4}deg) translateY(-4px)`});
grid.addEventListener('pointerleave',e=>{const card=e.target.closest('.country-card');if(card)card.style.transform=''},true);
updateFavCount();loadCountries();


// WORLD QUIZ — викторина на 10 вопросов с подсчётом результата.
const ruQuizBank=[
 ['Какая страна имеет флаг в форме двух соединённых треугольников?',['Бутан','Непал','Шри-Ланка','Монголия'],1,'Флаг Непала состоит из двух наложенных треугольных вымпелов.'],
 ['Какой город является столицей Австралии?',['Сидней','Мельбурн','Канберра','Перт'],2,'Столица Австралии — Канберра, а не крупнейшие города Сидней или Мельбурн.'],
 ['На каком материке находится пустыня Сахара?',['Азия','Африка','Южная Америка','Австралия'],1,'Сахара расположена на севере Африки.'],
 ['Какой океан самый большой?',['Атлантический','Индийский','Северный Ледовитый','Тихий'],3,'Тихий океан — крупнейший океан Земли по площади.'],
 ['Какая страна известна городом Киото и горой Фудзи?',['Китай','Япония','Южная Корея','Таиланд'],1,'Киото и гора Фудзи находятся в Японии.'],
 ['Какой язык является официальным в Бразилии?',['Испанский','Португальский','Французский','Английский'],1,'Бразилия — крупнейшая португалоязычная страна мира.'],
 ['Как называется столица Исландии?',['Осло','Хельсинки','Рейкьявик','Таллин'],2,'Столица Исландии — Рейкьявик.'],
 ['Какая из этих стран не имеет выхода к морю?',['Португалия','Монголия','Вьетнам','Норвегия'],1,'Монголия расположена между Россией и Китаем и не имеет выхода к морю.'],
 ['На каком континенте расположена страна Кения?',['Африка','Европа','Азия','Южная Америка'],0,'Кения находится в Восточной Африке.'],
 ['Какое государство полностью окружено территорией Италии?',['Монако','Андорра','Сан-Марино','Люксембург'],2,'Сан-Марино — независимое государство-анклав внутри Италии.'],
 ['Какой пролив разделяет Европу и Африку у Испании и Марокко?',['Берингов','Гибралтарский','Ла-Манш','Босфор'],1,'Гибралтарский пролив соединяет Атлантический океан со Средиземным морем.'],
 ['Какая страна занимает большую часть острова Гаити?',['Куба','Доминиканская Республика','Гаити','Ямайка'],2,'Государство Гаити занимает западную часть острова, а Доминиканская Республика — восточную.'],
 ['Какая река протекает через Египет?',['Амазонка','Дунай','Нил','Миссисипи'],2,'Нил — главная река Египта и важнейший источник воды для страны.'],
 ['Какой материк является самым холодным?',['Европа','Антарктида','Азия','Северная Америка'],1,'Антарктида — самый холодный материк планеты.'],
 ['Столица Канады — это…',['Торонто','Ванкувер','Оттава','Монреаль'],2,'Оттава — столица Канады.'],
 ['Какая страна на карте напоминает сапог?',['Греция','Италия','Испания','Хорватия'],1,'Италия известна своей характерной формой, напоминающей сапог.'],
 ['Какое озеро является самым глубоким в мире?',['Байкал','Виктория','Ладожское','Титикака'],0,'Озеро Байкал в России — самое глубокое озеро планеты.'],
 ['Какой город часто называют «городом вечной весны»?',['Лима','Кито','Каир','Мадрид'],1,'Кито, столица Эквадора, известен мягким климатом и таким прозвищем.'],
 ['В какой стране находится мавзолей Тадж-Махал?',['Пакистан','Индия','Непал','Бангладеш'],1,'Тадж-Махал находится в Агре, Индия.'],
 ['Какая линия широты проходит через Эквадор?',['Северный полярный круг','Тропик Козерога','Экватор','Тропик Рака'],2,'Экватор проходит через территорию Эквадора, что отражено и в названии страны.'],
 ['Какую страну считают родиной пиццы?',['Италия','Франция','Греция','Турция'],0,'Современная пицца получила известность в Неаполе, Италия.'],
 ['Как называется высочайшая гора Африки?',['Кения','Килиманджаро','Эльбрус','Атлас'],1,'Килиманджаро в Танзании — высочайшая гора Африки.'],
 ['В какой стране находится столица Будапешт?',['Румыния','Австрия','Венгрия','Словакия'],2,'Будапешт — столица Венгрии.'],
 ['Какой океан расположен между Африкой и Австралией?',['Атлантический','Тихий','Индийский','Северный Ледовитый'],2,'Индийский океан находится между Африкой, Азией и Австралией.'],
 ['В какой стране находится город Марракеш?',['Алжир','Марокко','Тунис','Египет'],1,'Марракеш — один из крупнейших и самых известных городов Марокко.'],
 ['Какая страна является крупнейшей в мире по площади?',['Канада','Китай','США','Россия'],3,'Россия — крупнейшее государство мира по площади территории.'],
 ['Какой город является столицей Новой Зеландии?',['Окленд','Веллингтон','Крайстчерч','Данидин'],1,'Столица Новой Зеландии — Веллингтон.'],
 ['Какое государство занимает остров Мадагаскар?',['Маврикий','Сейшелы','Мадагаскар','Коморы'],2,'Государство Мадагаскар занимает одноимённый большой остров у восточного побережья Африки.'],
 ['Какая река протекает через Париж?',['Рейн','Сена','Темза','Дунай'],1,'Париж расположен на берегах реки Сены.'],
 ['Какую страну называют «страной восходящего солнца»?',['Китай','Япония','Таиланд','Южная Корея'],1,'«Страна восходящего солнца» — распространённое название Японии.']
];
(()=>{const panel=document.getElementById('quizPanel');if(!panel)return;let deck=[],index=0,score=0,locked=false;const $=id=>document.getElementById(id);function start(){deck=[...ruQuizBank].sort(()=>Math.random()-.5).slice(0,10);index=0;score=0;render()}function render(){locked=false;const q=deck[index];$('quizCounter').textContent=`ВОПРОС ${index+1} / ${deck.length}`;$('quizScore').textContent=`${score} баллов`;$('quizProgress').style.width=`${index/deck.length*100}%`;$('quizQuestion').textContent=q[0];$('quizFeedback').textContent='Выбери один вариант ответа.';$('quizNext').disabled=true;$('quizNext').textContent=index===deck.length-1?'Результат →':'Далее →';$('quizOptions').innerHTML=q[1].map((v,i)=>`<button class="quiz-option" data-answer="${i}"><span>${'ABCD'[i]}</span>${v}</button>`).join('');}function answer(n){if(locked)return;locked=true;const q=deck[index],correct=n===q[2];if(correct)score++;document.querySelectorAll('.quiz-option').forEach((b,i)=>{b.disabled=true;if(i===q[2])b.classList.add('correct');else if(i===n)b.classList.add('wrong')});$('quizFeedback').textContent=(correct?'Верно! ':'Не совсем. ')+q[3];$('quizScore').textContent=`${score} баллов`;$('quizNext').disabled=false;$('quizProgress').style.width=`${(index+1)/deck.length*100}%`;}function result(){const pct=score/deck.length;const title=pct>=.8?'Отличный результат!':pct>=.5?'Хорошая работа!':'Время открыть новые страны!';panel.innerHTML=`<div class="quiz-result"><div class="quiz-trophy">${pct>=.8?'🏆':pct>=.5?'🌍':'🧭'}</div><div class="kicker">ТВОЙ РЕЗУЛЬТАТ</div><h3>${title}</h3><div class="quiz-final-score">${score}<small> / ${deck.length}</small></div><p>${pct>=.8?'Ты отлично ориентируешься в географии.':pct>=.5?'У тебя уже есть хорошая база — продолжай исследовать мир.':'Каждая ошибка — повод узнать что-то новое. Попробуй ещё раз!'}</p><button class="button button-primary" id="quizRestart">↻ Пройти ещё раз</button></div>`;$('quizRestart').addEventListener('click',()=>{panel.innerHTML='<div class="quiz-topline"><span id="quizCounter"></span><span id="quizScore"></span></div><div class="quiz-progress"><span id="quizProgress"></span></div><div class="quiz-question" id="quizQuestion"></div><div class="quiz-options" id="quizOptions"></div><div class="quiz-bottom"><span id="quizFeedback"></span><button class="button button-primary" id="quizNext" disabled></button></div>';attach();start()})} function attach(){ $('quizOptions').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(b)answer(Number(b.dataset.answer))});$('quizNext').addEventListener('click',()=>{if(!locked)return;if(index<deck.length-1){index++;render()}else result()})}attach();start()})();
