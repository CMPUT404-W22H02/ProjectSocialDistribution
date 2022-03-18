import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import HomePage from "./pages/homePage";

function App() {
  // Specify paths here
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login"/>}/> 
        <Route path="/login" element={<Login />}/>
        <Route path="/home" element={<HomePage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
