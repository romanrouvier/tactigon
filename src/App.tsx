import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './screens/Splash';
import MainMenu from './screens/MainMenu';
import Factions from './screens/Factions';
import ModeSelect from './screens/ModeSelect';
import RankedSelect from './screens/RankedSelect';
import ClanSelect from './screens/ClanSelect';
import Game from './screens/Game';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/factions" element={<Factions />} />
        <Route path="/mode" element={<ModeSelect />} />
        <Route path="/ranked" element={<RankedSelect />} />
        <Route path="/clan" element={<ClanSelect />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
