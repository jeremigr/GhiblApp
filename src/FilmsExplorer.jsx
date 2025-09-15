

import { useEffect, useMemo, useState } from 'react';
import mononoke from './assets/princesse-mononoke.webp'
import heartCursor from './assets/heart_cursor.png';



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
      setFilms(adapted);
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
      setFilms(adapted);
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

    useEffect(() => {
      if (selectedId) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }, [selectedId]);



  const selectedFilm = selectedId ? films.find((film) => film.id === selectedId) : null;



  return <div className="films-root" style={{color:'#9898fbff', paddingTop:'4em', paddingBottom:'6em'}} >

    {status === 'loading' && <div></div>}
    {status === 'error' && <div style={{color:'#c00'}}>Error: {error}</div>}



      <div>

        {/*<div style={{
            textAlign: 'center',
            backgroundColor:'#9898fbff',
            color:'#FFF',
            border:'none',
            padding:'30px',
            borderRadius:'50px',
            fontSize:'24px'
          }}>

        GhiblApp

        </div> */} 
    <div>
        {/* <div style={{
            textAlign: 'center',
            backgroundColor:'#9898fbff',
            color:'#FFF',
            border:'none',
            padding:'10px',
            marginBottom:'1em',
            // marginRight: '2em',
            borderRadius:'100px',
            fontSize:'24px'
          }}
          >GhiblApp</div> */}
        

        <input
          id="ghibli-search" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Esc') setQuery(''); }}
          placeholder="Search by title or director…"
          style={{
            textAlign: 'center',
            backgroundColor:'#9898fbff',
            color:'#FFF',
            border:'none',
            padding:'10px',
            marginBottom:'2em',
            borderRadius:'12px',
            fontSize:'18px'
          }}
        />

        <br></br>
          <img
    id="hero-image"
    src={selectedFilm ? (selectedFilm.banner || selectedFilm.image || mononoke) : mononoke}
    alt="Princess Mononoke"
    style={{
      display: 'block',
      margin: '0 auto',
      borderRadius: '150px',
      height: 'auto'
        }}
      />
        </div>
<br></br>

        {selectedFilm && !query.trim() && (
          <>
          <div id="film-details" className="film-title">            
          <strong>{selectedFilm.title}</strong>
            <br></br></div>
            <div className="film-desc" style={{textAlign:'center',margin:'1.5em auto'}}>
              {selectedFilm.description}
              <br></br><br></br> </div>
          </>
    )}
        
      </div>


    {visibleFilms.map(film => (
    <div 
      key={film.id} 
      onClick={() => {
        setSelectedId(film.id);
        setQuery('');
        // défère le scroll à l'image près : évite les ratés quand la mise en page bouge
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
}}
 
      style={{ cursor: `url(${heartCursor}) 16 16, pointer`}}
      > 
      <span className="film-title-line"><strong>{film.title}</strong>
      <span className='film-dash'> - </span> </span>{' '}
      <span className="film-meta-line">{film.director} — {film.year}</span>

    </div>
    
))}

{/* <div style={{fontSize:'12px'}}><br></br><br></br>By <a href='http://grandsenne.com' target='_blank'></a>Jérémie Grandsenne</a></div>   */}

    <div style={{fontSize:'12px'}}>
       <br></br><br></br>
       By <a href="http://grandsenne.com" target="_blank">Jérémie Grandsenne</a>
    </div>

</div>;
}




