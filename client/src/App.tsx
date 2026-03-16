// import { Routes, Route } from 'react-router-dom';
import Header from './components/header';
import LandingPage from './components/landingPage.tsx';
import Footer from './components/footer.tsx';
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <LandingPage />
      <Footer/>
    </>
  )

}

export default App
