import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import HomePage from "./pages/homePage";
import Profile from "./pages/profile"
import Registration from './pages/registration';
import Dashboard from './components/Dashboard';
import NotFound404 from "./pages/NotFound";

function setToken(userToken) {
  sessionStorage.setItem('token', JSON.stringify(userToken));
}

function getToken() {
  const tokenString = sessionStorage.getItem('token');
  const userToken = JSON.parse(tokenString);
  return userToken?.token
}
function App() {
  const token = getToken();
  if(!token) {
    return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login"/>}/> 
        <Route path="/login" element={<Login setToken={setToken}/>}/>
        <Route path="/register" element={<Registration />}/>
      </Routes>
    </BrowserRouter>
    )
  }

  // Specify paths here

  return (
    <div className="wrapper">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login"/>}/> 
        <Route path="/login" element={<Login setToken={setToken}/>}/>
        <Route path="/home" element={<HomePage />}/>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/register" element={<Registration />}/>
        <Route path="/dashboard" element={<Dashboard />}/>


        <Route path="*" element={<NotFound404/>}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
  
}

export default App;
