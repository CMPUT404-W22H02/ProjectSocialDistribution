import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    const userToken = tokenString;
    return userToken?.token
  };

  const [token, setToken] = useState(getToken());
  //console.log(token)
  const saveToken = userToken => {
    localStorage.setItem('token', userToken);
    setToken(userToken.token);
  };

  return {
    setToken: saveToken,
    token
  }
}