import { Routes, Route } from 'react-router-dom';
import IntroPage from './pages/IntroPage/IntroPage';
import MapPage from './pages/MapPage/MapPage';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/map" element={<MapPage />}/>
    </Routes>
  )
}

export default App
