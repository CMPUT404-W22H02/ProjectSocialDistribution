import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./pages/login";
import HomePage from "./pages/homePage";
import Profile from "./pages/profile"
import User from "./pages/user"
import Registration from './pages/registration';
import Dashboard from './components/Dashboard';
import NotFound404 from "./pages/NotFound";
import useToken from "./components/App/useToken"
import PleaseSignIn from "./pages/NotFound/PleaseSinIn"
import CreatePost from './components/createPost';
import Inbox from './pages/inbox'
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
          <Route path='/user/:id' element={<User/>} />
          <Route exact path='/create' element={<PrivateRoute/>}>
              <Route path="/create" element={<CreatePost />} />
          </Route>
          <Route exact path='/inbox' element={<PrivateRoute/>}>
              <Route path="/inbox" element={<Inbox />} />
          </Route>

          {/* <Route path="*" element={<NotFound404 />} /> */}
        </Routes>
      </BrowserRouter>
    </div>

  )



}

export default App;
