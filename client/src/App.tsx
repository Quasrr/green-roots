import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import LandingPage from './components/LandingPage.tsx';
import Footer from './components/Footer.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import CGV from './components/Cgv.tsx';
import Legals from './components/Legals.tsx';
import Product from './components/Product.tsx';
import Catalog from './components/Catalog.tsx';
import Contact from './components/Contact.tsx';
import About from './components/About.tsx';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import './App.css';

function App() {

  return (
    <>
      <div className="app_layout">
        <Header />
        <div className="app_content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/legals" element={<Legals />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:id" element={<Product />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  )

}

export default App
