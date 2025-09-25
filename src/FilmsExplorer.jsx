

import { useEffect, useMemo, useState } from 'react';
import mononoke from './assets/princesse-mononoke.webp'
import logoghibli from './assets/ghibli_logo_big.png'
import heartCursor from './assets/heart_cursor.png';
import heronPoster from './assets/heron1.jpg';     // ← ton poster (peut être le même que banner)
import heronBanner from './assets/heron1.jpg';     // ← ta bannière large
import nausicaaPoster from './assets/nausicaa1.jpg'; // ← ton poster Nausicaä
import nausicaaBanner from './assets/nausicaa1.jpg'; // ← ta bannière Nausicaä




export default function FilmsExplorer() {
  const [sortBy, setSortBy] = useState('title');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  
  const [films, setFilms] = useState([]);
  const [status, setStatus] = useState('idle');   // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  const visibleFilms = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return films;
  return films.filter((film) => {
    const title    = (film.title    || '').toLowerCase();
    const director = (film.director || '').toLowerCase();
    return title.includes(q) || director.includes(q);
  });
}, [films, query]);


  const sortedFilms = useMemo(() => {
  const arr = [...visibleFilms]; // ne pas muter visibleFilms
  if (sortBy === 'title') {
    arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
} else if (sortBy === 'director') {
  arr.sort((a, b) => {
    const byDirector = (a.director || '').localeCompare(b.director || '');
    if (byDirector !== 0) return byDirector;
    return (a.year ?? 0) - (b.year ?? 0); // à l’intérieur d’un réalisateur : ancien → récent
  });
} else if (sortBy === 'year-asc') {
  arr.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));   // ancien → récent
} else if (sortBy === 'year-desc') {
  arr.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));   // récent → ancien
}
  return arr;
}, [visibleFilms, sortBy]);


  useEffect(() => {
  const ctrl = new AbortController();
  setStatus('loading');

  fetch('https://ghibliapi.vercel.app/films', { signal: ctrl.signal, mode: 'cors', cache: 'no-store' })

    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((json) => {
      // Adapter : keeping the minimum for the UI
      const adapted = json.map((film) => ({
        id: film.id,
        title: film.title,
        director: film.director,
        year: Number(film.release_date),
        description: film.description,
        image: film.image,
        banner: film.movie_banner,

      }));
      // --- AJOUT HORS API : Miyazaki 2023 + Nausicaä ---
      if (!adapted.some(f => (f.title || '').toLowerCase() === 'the boy and the heron')) {
        adapted.push({
          id: 'miyazaki-2023-custom',
          title: 'The Boy and the Heron',      
          director: 'Hayao Miyazaki',
          year: 2023,
          description: "During the Pacific War, Mahito Maki loses his hospitalized mother, Hisako, in the firebombing of Tokyo. Mahito's father Shoichi, an air munitions factory owner, marries his late wife's sister, Natsuko, and they evacuate to her rural estate. Mahito, distant to the pregnant Natsuko, encounters a peculiar grey heron leading him to a sealed tower, the last known location of Natsuko's architect granduncle.",
          image: heronPoster,                  
          banner: heronBanner
        });
      }

      if (!adapted.some(f => (f.title || '').toLowerCase().includes('nausicaa'))) {
        adapted.push({
          id: 'nausicaa-1984-custom',
          title: 'Nausicaä of the Valley of the Wind',  
          director: 'Hayao Miyazaki',
          year: 1984,
          description: "One thousand years have passed since the Seven Days of Fire, an apocalyptic war that destroyed civilization and caused an ecocide, creating the vast Toxic Jungle, a poisonous forest swarming with giant mutant insects. In the kingdom of the Valley of the Wind, a prophecy predicts a savior 'clothed in a blue robe, descending onto a golden field'. The Valley's princess Nausicaä explores the jungle and communicates with its creatures, including the gigantic, trilobite-like armored Ohm. She hopes to understand the jungle and find a way for it and humans to coexist",
          image: nausicaaPoster,
          banner: nausicaaBanner
        });
      }
    

      // Ajouts hors API (injectés au moment du set)
    const extras = [];

    if (!adapted.some(f => (f.title || '').toLowerCase() === 'the boy and the heron')) {
      extras.push({
        id: 'miyazaki-2023-custom',
        title: 'The Boy and the Heron',
        director: 'Hayao Miyazaki',
        year: 2023,
        description: '',
        image: heronPoster,
        banner: heronBanner
      });
    }

    // NB: on normalise pour gérer le ä
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!adapted.some(f => norm(f.title || '').toLowerCase().includes('nausicaa'))) {
      extras.push({
        id: 'nausicaa-1984-custom',
        title: 'Nausicaä of the Valley of the Wind',
        director: 'Hayao Miyazaki',
        year: 1984,
        description: '',
        image: nausicaaPoster,
        banner: nausicaaBanner
      });
    }

    setFilms([...adapted, ...extras]);

      setStatus('success');
    })
 
    



.catch((err) => {
  if (err.name === 'AbortError') return;

  // Log détaillé dans la console
  console.error('Fetch Ghibli API failed:', err);

  // --- Fallback local : on tente un JSON packagé dans /public ---
  fetch('./ghibli_fallback.json')
    .then((r) => r.ok ? r.json() : Promise.reject(new Error('fallback not found')))
    .then((json) => {
      const adapted = json.map((film) => ({
        id: film.id,
        title: film.title,
        director: film.director,
        year: Number(film.release_date),
        description: film.description,
        image: film.image,
        banner: film.movie_banner,
      }));

      // --- AJOUT HORS API : Miyazaki 2023 + Nausicaä ---
      if (!adapted.some(f => (f.title || '').toLowerCase() === 'the boy and the heron')) {
        adapted.push({
          id: 'miyazaki-2023-custom',
          title: 'The Boy and the Heron',     
          director: 'Hayao Miyazaki',
          year: 2023,
          description: '',
          image: heronPoster,                  
          banner: heronBanner
        });
      }

      if (!adapted.some(f => (f.title || '').toLowerCase().includes('nausicaa'))) {
        adapted.push({
          id: 'nausicaa-1984-custom',
          title: 'Nausicaä of the Valley of the Wind',  
          director: 'Hayao Miyazaki',
          year: 1984,
          description: '',
          image: nausicaaPoster,
          banner: nausicaaBanner
        });
      }
      // --- FIN AJOUT ---


      // Ajouts hors API (injectés au moment du set)
const extras = [];

      if (!adapted.some(f => (f.title || '').toLowerCase() === 'the boy and the heron')) {
        extras.push({
          id: 'miyazaki-2023-custom',
          title: 'The Boy and the Heron',
          director: 'Hayao Miyazaki',
          year: 2023,
          description: '',
          image: heronPoster,
          banner: heronBanner
        });
      }

      // NB: on normalise pour gérer le ä
      const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!adapted.some(f => norm(f.title || '').toLowerCase().includes('nausicaa'))) {
        extras.push({
          id: 'nausicaa-1984-custom',
          title: 'Nausicaä of the Valley of the Wind',
          director: 'Hayao Miyazaki',
          year: 1984,
          description: '',
          image: nausicaaPoster,
          banner: nausicaaBanner
        });
      }

      setFilms([...adapted, ...extras]);


      setStatus('success');
      setError(null);
    })
    .catch(() => {
      setError(`${err.name || 'Error'}: ${err.message || 'fetch failed'}`);
      setStatus('error');
    });
});






  return () => ctrl.abort();
}, []);

  useEffect(() => {
  const onEsc = (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      setSelectedId(null); // ferme la fiche
      setQuery('');        // réaffiche toute la liste
    }
  };
  window.addEventListener('keydown', onEsc);
  return () => window.removeEventListener('keydown', onEsc);
}, []);


  const selectedFilm = selectedId ? films.find((film) => film.id === selectedId) : null;
  // Clic sur la hero = sélectionne un film aléatoire parmi la liste visible (triée)

  const pickRandom = () => {
  const list = sortedFilms;                     // utilise l’ensemble actuellement visible + trié
  if (!list.length) return;
  const rnd = list[Math.floor(Math.random() * list.length)];
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setSelectedId(rnd.id);
  // setQuery('');                                  si tu préfères conserver la recherche active, supprime cette ligne
};


  


  return <div className="films-root" style={{color:'#9898fbff', paddingTop:'4em', paddingBottom:'6em'}} >

    {status === 'loading' && <div></div>}
    {status === 'error' && <div style={{color:'#c00'}}>Error: {error}</div>}





  <div>
    
    <div>
      
      <div className="controls"><div className="controls-inner">

          
        <input
          id="ghibli-search" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Esc') setQuery(''); }}
          placeholder="Search by Title or Director"
          style={{
            cursor: `url(${heartCursor}) 12 12, pointer`,
            textAlign: 'center',
            backgroundColor:'#9898fbff',
            color:'#FFF',
            border:'none',
            marginRight:'0.22em',
            padding:'10px',
            // marginBottom:'1em',
            borderRadius:'12px',
            // fontSize:'18px'
          }}
        />

          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
               style={{                 
                  backgroundColor: '#9898fbff',
                  color: '#fff',
                  textAlign:'center',
                  // marginBottom:'1em',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  borderRadius: 12,
                  // fontSize: '18px',
                  padding:'10px',
                  backgroundClip: 'padding-box', // évite l’inner border sur Safari/iOS
                  cursor: `url(${heartCursor}) 12 12, pointer`
                }}
                          >
            <option value="year-asc">Sort by: Year ▼</option>   {/* ancien → récent */}
            <option value="year-desc">Sort by: Year ▲</option>  {/* récent → ancien */}
            <option value="director">Sort by: Director</option>
            <option value="title">Sort by: Title</option>
          
          </select>

          {/* <button 
          id="bouton_random"
          onClick={pickRandom}>Random
        
          </button> */}

        </div>

        {/* <br></br><br></br> */}
  </div>

  <div>        <img
    id="hero-image"
    src={selectedFilm ? (selectedFilm.banner || selectedFilm.image || mononoke) : mononoke}
    alt="Princess Mononoke"
    onClick={pickRandom}
    style={{
      display: 'block',
      margin: '0 auto',
      borderRadius: '150px',
      height: 'auto',
      cursor: `url(${heartCursor}) 12 12, pointer`
        }}
      />
        </div>
        </div>
<br></br>

        {selectedFilm && !query.trim() && (
          <div className="film-title">            
          <strong>{selectedFilm.title}</strong>
            <br></br>
          <div className="film-desc" style={{textAlign:'center',maxWidth:'60vw',margin:'1em auto'}}>
            {selectedFilm.description}
            <br></br><br></br>
          </div>
      </div>
      
    )}
        
      </div>

    
    {sortedFilms.map((film, i) => (
    <div 
      key={film.id} 
      // onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setSelectedId(film.id); setQuery(''); }}
      style={{
      // cursor: `url(${heartCursor}) 12 12, pointer`,
      marginTop: (sortBy === 'director' && i > 0 && sortedFilms[i - 1].director !== film.director) ? '1em' : '0',
    }}

      > 
      {/* {sortBy === 'director' ? (
        <>
          <strong>{film.director}</strong> {film.title} - {film.year}
        </>
      ) : (
        <>
          <strong>{film.title}</strong> {film.director} - {film.year}
        </>
      )} */}

      {sortBy === 'director' ? (
  <>
    {(i === 0 || sortedFilms[i - 1].director !== film.director) && (
      <div style={{ marginBottom: '0em'}}>
        <strong>{film.director}</strong>
      </div>
    )}

    <div
      onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setSelectedId(film.id); setQuery(''); }}
      style={{ cursor: `url(${heartCursor}) 12 12, pointer` }}
    >
      {film.title} - {film.year}
    </div>
  </>
) : (
  <div
    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setSelectedId(film.id); setQuery(''); }}
    style={{ cursor: `url(${heartCursor}) 12 12, pointer` }}
  >
    <strong>{film.title}</strong> {film.director} - {film.year}
  </div>
)}
  


    </div>
    
    ))}

{/* <br></br>      */}
    <img
    src={logoghibli}
    alt="Ghibli Logo"
    id='logoghibli'
    style={{
      // marginTop:'1em',
      // display: 'block',
      // margin: '0 auto',
      // maxWidth:'14vw',
      // height: 'auto'
        }}
></img>
{/* 
<br></br>   */}

{/* <div style={{fontSize:'12px'}}><br></br><br></br>By <a href='http://grandsenne.com' target='_blank'></a>Jérémie Grandsenne</a></div>   */}

    <div style={{fontSize:'12px'}}>
       {/* <br></br><br></br> */}
       By <a href="http://grandsenne.com" target="_blank">Jérémie Grandsenne</a>
       <br></br>
       <a href='https://github.com/jeremigr/GhiblApp' target='_blank'>Github</a>

    </div>

  

</div>;
}



