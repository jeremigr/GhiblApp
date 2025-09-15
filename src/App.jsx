



import { useState } from 'react'
import './App.css'
import mononoke from './assets/princesse-mononoke.webp'
import FilmsExplorer from './FilmsExplorer.jsx'


function App() {

    const [entered, setEntered] = useState(false);
    const handleEnter = () => setEntered(true);
    

    return (
  
 // <div style={{ minHeight: '100svh', display: 'grid', placeContent: 'center' }}>
 <div className={entered ? 'app-root' : 'home-root'} style={{ minHeight: '100svh', display: 'grid', alignContent: entered ? 'start' : 'center', justifyContent: 'center' }}>



      <br>
      </br>

    <div
      style={{
        width: '80vw',
        boxSizing: 'border-box',
        margin: '0 auto',
        //overflow: 'hidden',
        position: 'relative', 
        padding: 0,
        borderRadius: '100px'
      }}
    >
      <img
        src={mononoke}
        alt="Princess Mononoke"
        onClick={handleEnter}
        style=
        {{
          cursor: 'pointer',
          display: entered ? 'none' : 'block',
          width: '100%', 
          borderRadius: '100px',
          //opacity: entered ? 0.1 : 1, 
          height: 'auto'
        }}
      />
    

      <h1
        className="home-title"         
        onClick={handleEnter}
        style={{
        position: 'absolute',
        inset: 0,
        display: entered ? 'none' : 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        margin: 0,
        color: 'rgba(223, 223, 255, 1)' }}
        >        
        {entered ? '' : 'Welcome to GhiblApp!'}          
      </h1>

  
      {entered && <FilmsExplorer />}




    </div>
  </div>
);

  
}

export default App



// Jérémie Grandsenne 13-15/9/2025
