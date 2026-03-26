import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './components/home.jsx';
import Footer from './components/Footer.jsx';
import AtsChecker from './components/Atschecker.jsx';
import JdMatchValidator from './components/JdMatchValidator.jsx';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
     
      <Navbar />
      
     
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ats-checker" element={<AtsChecker />} />
          <Route path="/jd-match" element={<JdMatchValidator />} />
        </Routes>
      </div>
      
     
      <Footer />
    </div>
  );
}

export default App;