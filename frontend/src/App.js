import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./pages/login";
import HomePage from "./pages/homePage";
import Profile from "./pages/profile"
import Registration from './pages/registration';
import Dashboard from './components/Dashboard';
import NotFound404 from "./pages/NotFound";
import useToken from "./components/App/useToken"
import PleaseSignIn from "./pages/NotFound/PleaseSinIn"
function App() {

  return (
  <div className="wrapper">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/dashboard" element={<Dashboard />} />


          <Route exact path='/home' element={<PrivateRoute/>}>
              <Route exact path='/home' element={<HomePage/>}/>
          </Route>
          <Route exact path='/profile' element={<PrivateRoute/>}>
          <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </BrowserRouter>
    </div>

  )














  //const token = getToken();
  /* const { token, setToken } = useToken();
  console.log(token)
  if(!token) {
    console.log("---1")
    return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login"/>}/> 
        <Route path="/login" element={<Login setToken={setToken}/>}/>
        <Route path="/register" element={<Registration />}/>
        <Route path="/home" element={<PleaseSignIn />} />
        <Route path="/profile" element={<PleaseSignIn />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </BrowserRouter>
    )
  }

  // Specify paths here
  console.log("---2")
  return (
    <><p>{console.log("---3")} </p><div className="wrapper">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/dashboard" element={<Dashboard />} />


          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </BrowserRouter>
    </div></>
  );
   */
}

export default App;
