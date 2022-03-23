import Identity from "../model/Identity";
import axios from "axios";
const Refresh={
Identity : Identity.GetIdentity(),
loginUser(credentials) {
    return axios.post('http://localhost:8000/login/',
    credentials, {
      headers: {
        'Content-Type': 'application/json'
       
      }})
    .then(
      (data) => {
        
    Refresh.Identity = new Identity(data.data.access, data.data.refresh, data.data.user.username, data.data.user.id, )
    Refresh.Identity.StoreIdentity()
    window.location.assign("/home")

      }
    ).catch((e)=>{
        console.log(e)
      
    })
  },


async refreshToken(){

    if (Refresh.Identity.refreshToken === "" || Refresh.Identity.refreshToken == null) {
        throw Error("Attempt to refresh access token without a refresh token")
    }
    await axios.post('http://localhost:8000/refresh/',
    {refresh: Refresh.Identity.refreshToken}, {
      headers: {
        'Content-Type': 'application/json'
       
      }})
    .then((data) => 
    {
      //console.log(data.data)
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