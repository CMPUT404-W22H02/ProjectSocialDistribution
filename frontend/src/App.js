import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import HomePage from "./pages/homePage";
import Profile from "./pages/profile"
import Registration from './pages/registration';
function App() {
  // Specify paths here
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login"/>}/> 
        <Route path="/login" element={<Login />}/>
        <Route path="/home" element={<HomePage />}/>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/register" element={<Registration />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
