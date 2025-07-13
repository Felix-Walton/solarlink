import { BrowserRouter, useLocation } from 'react-router-dom';
import SolarLink from './SolarLink';
import ToolModal from './components/Tool';


export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
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
