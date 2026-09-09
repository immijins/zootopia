import { Routes, Route } from 'react-router-dom';

import IntroPage from './components/IntroPage';
import MapPage from './components/MapPage';
import './App.css'

function App() {

  return (
    <Routes>
      <Route path="/" element={<IntroPage/>} />
      <Route path="/map" element={<MapPage />}/>
    </Routes>
  )
}

export default App
