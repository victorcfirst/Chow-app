import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PinGate from './components/PinGate'
import Layout from './components/Layout'
import Home from './pages/Home'
import Notes from './pages/Notes'
import Restaurants from './pages/Restaurants'
import RestaurantDetail from './pages/RestaurantDetail'
import Calendar from './pages/Calendar'
import Insurance from './pages/Insurance'
import Vehicles from './pages/Vehicles'

export default function App() {
  return (
    <BrowserRouter>
      <PinGate>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/vehicles" element={<Vehicles />} />
          </Route>
        </Routes>
      </PinGate>
    </BrowserRouter>
  )
}
