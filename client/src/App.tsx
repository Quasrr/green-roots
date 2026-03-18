import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import LandingPage from './components/LandingPage.tsx';
import Footer from './components/Footer.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import CGV from './components/Cgv.tsx';
import Legals from './components/Legals.tsx';
import Product from './components/Product.tsx';
import Catalog from './components/Catalog.tsx';
import './App.css'

function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cgv" element={<CGV />} />
        <Route path="/legals" element={<Legals />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<Product />} />
      </Routes>
      <Footer />
    </>
  )

}

export default App
