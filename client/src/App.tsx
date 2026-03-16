import { Routes, Route } from 'react-router-dom';
import Header from './components/header';
import LandingPage from './components/landingPage.tsx';
import Footer from './components/footer.tsx';
import PrivacyPolicy from './components/privacyPolicy.tsx';
import CGV from './components/cgv.tsx';
import './App.css'

function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cgv" element={<CGV />} />
      </Routes>
      <Footer />
    </>
  )

}

export default App
