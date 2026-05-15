import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash    from './screens/Splash';
import MainMenu  from './screens/MainMenu';
import Factions  from './screens/Factions';
import Game      from './screens/Game';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Splash />}   />
        <Route path="/menu"    element={<MainMenu />} />
        <Route path="/factions" element={<Factions />} />
        <Route path="/game"    element={<Game />}     />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
