import './App.css'
import { Banner } from './components/Banner'
import heroImage from './assets/612715894_2370640950022369_3383395397786783488_n.jpg'

function App() {
  return (
    <div className="app-container">
      <Banner />
      <div className="hero-section">
        <img src={heroImage} alt="Movik Festival" className="hero-image" />
      </div>
    </div>
  )
}

export default App
