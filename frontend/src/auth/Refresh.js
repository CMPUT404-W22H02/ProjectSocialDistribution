import Identity from "../model/Identity";
import axios from "axios";
import jwt_decode from "jwt-decode";
const base_url = process.env.REACT_APP_API_URL ;
const Refresh={
Identity : Identity.GetIdentity(),
  async loginUser(credentials) {
    try {
    const data = await axios.post(`${base_url}login/`,
      credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    Refresh.Identity = new Identity(data.data.access, data.data.refresh, data.data.user.username, data.data.user.id);
    Refresh.Identity.StoreIdentity();
    window.location.assign("/home");
  } catch (e) {
    console.log(e);
  }
  },
  accessToken() {
    try {
      let decodedToken = jwt_decode(localStorage.getItem("token"));
      let currentDate = new Date();
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        console.log("Token expired.");
        return false;
    } else {
        console.log("Valid token");  
        return true;
        }
      
    }catch (e) {
      console.log(e);
      return false;
    }
    },

async refreshToken(){
  console.log("refresh")

    if (Refresh.Identity.refreshToken === "" || Refresh.Identity.refreshToken == null) {
        window.alert("Ops! Please login again!")
        window.location.assign("/")
        window.localStorage.clear();
        window.sessionStorage.clear();
        throw Error("Attempt to refresh access token without a refresh token")
        
    }
    await axios.post(`${base_url}refresh/`,
    {refresh: Refresh.Identity.refreshToken}, {
      headers: {
        'Content-Type': 'application/json'
       
      }})
    .then((data) => 
    {
      console.log(data.data)
      Identity.UpdateIdentity(data.data.access, Refresh.Identity.refreshToken, data.data.username, data.data.id)
      localStorage.setItem("token", data.data.access);
      localStorage.setItem("refreshToken",  Refresh.Identity.refreshToken)},
    
    ).catch((e)=>{
      window.alert("Please login again!")
      window.location.assign("/")
      window.localStorage.clear();
      window.sessionStorage.clear();

      
    })

},
};
export {Refresh};