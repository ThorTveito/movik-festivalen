import './App.css'
import { Banner } from './components/Banner'
import heroImage from './assets/612715894_2370640950022369_3383395397786783488_n.jpg'
import mobileImage from './assets/20250803_020006 (1).jpg'

function App() {
  return (
    <div className="app-container">
      <Banner />
      <div className="hero-section">
        <picture>
          <source media="(max-width: 768px)" srcSet={mobileImage} />
          <img src={heroImage} alt="Movik Festival" className="hero-image" />
        </picture>
      </div>
    </div>
  )
}

export default App
