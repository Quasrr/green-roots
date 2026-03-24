import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import Cart from './components/Cart.tsx';
import Checkout from './components/Checkout.tsx';
import Profile from './components/Profile.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { CartProvider } from './hooks/useCart.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import './App.css';

// Sélecteurs des éléments à animer au scroll
const REVEAL_SELECTORS = [
  'section',
  '.article_tree',
  '.article_reasons_choose',
  '.about_value_card',
  '.about_team_card',
  '.impact_tree',
  '.login_card',
  '.register_card',
  '.contact_layout',
].join(', ');

function App() {
  const location = useLocation();

  // Active l'animation .reveal → .visible quand l'élément entre dans le viewport
  // useLocation permet de relancer l'observer à chaque changement de page (SPA)
  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // anime une seule fois
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    // Petit délai pour laisser React rendre la nouvelle page
    const timer = setTimeout(() => {
      document.querySelectorAll(REVEAL_SELECTORS).forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <AuthProvider>
      <CartProvider>
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
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )

}

export default App
