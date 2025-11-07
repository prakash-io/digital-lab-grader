import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeToggle } from "./components/ThemeToggle";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import "./App.css";

function App() {
  return (
    <Router>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
