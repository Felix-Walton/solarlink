// src/App.js
import { Routes, Route, useLocation } from 'react-router-dom';
import SolarLink from './SolarLink';
import ToolModal from './components/Tool';   // keep same file, we’ll edit next

export default function App() {
  const location = useLocation();               // current URL
  const toolOpen = location.pathname === '/tool';

  return (
    <>
      {/* background page is **always** mounted */}
      <SolarLink />

      {/* overlay appears only on /tool */}
      {toolOpen && <ToolModal />}
    </>
  );
}
