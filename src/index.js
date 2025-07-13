// src/App.js
import { useLocation } from 'react-router-dom'; // Keep useLocation if App needs it
import SolarLink from './SolarLink';
import ToolModal from './components/Tool';

// IMPORTANT: Renamed from AppWrapper to App (or whatever you call the component that IS your app)
// The default export should be the component that represents your main application content.
export default function App() { // <--- Changed from AppWrapper and removed BrowserRouter
  const location = useLocation();
  const toolOpen  = location.pathname === '/tool';

  return (
    <>
      {/* background page is **always** mounted */}
      <SolarLink />

      {/* overlay appears only on /tool */}
      {toolOpen && <ToolModal />}
    </>
  );
}

