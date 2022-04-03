import Identity from "../model/Identity";
import axios from "axios";
import jwt_decode from "jwt-decode";
const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com/' ;




const Refresh={
Identity : Identity.GetIdentity(),
 async loginUser(credentials, success=()=>{}, fail = ()=>{}) {
    try {
    await axios.post(`${base_url}login/`,
      credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((data) => 
    {
      //console.log(typeof data !=="undefiend")
      Refresh.Identity = new Identity(data.data.access, data.data.refresh, data.data.user.username, data.data.user.id);
      Refresh.Identity.StoreIdentity();
      //console.log("--", Refresh.Identity)

      window.location.assign("/home");
      
      if (typeof data !=="undefiend"){
        success(data)
      }
      

    }).catch((error)=>{
      fail(error)
      //console.log("=",error)


    })
    
  } catch (e) {
    //console.log(e);
  }
  },
  accessToken() {
    try {
      let decodedToken = jwt_decode(localStorage.getItem("token"));
      let currentDate = new Date();
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        //console.log("Token expired.");
        Refresh.refreshToken();
    } else {
        //console.log("Valid token");  
        }
      
    }catch (e) {
      //console.log(e);
    }
    },

async refreshToken(){

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
      //console.log(data.data)
      //console.log("-resfesgh-", Refresh.Identity.id)
      Identity.UpdateIdentity(data.data.access, Refresh.Identity.refreshToken,Refresh.Identity.username,Refresh.Identity.id)
      localStorage.setItem("id", Refresh.Identity.id);
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