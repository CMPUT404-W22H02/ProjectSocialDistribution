import Identity from "../../model/Identity";
import axios from "axios";




const Refresh={

Identity : Identity.GetIdentity(),

async refreshToken(){

    if (Refresh.Identity.refreshToken === "" || Refresh.Identity.refreshToken == null) {
        throw Error("Attempt to refresh access token without a refresh token")
    }
    await axios.post('http://localhost:8000/refresh/',
    {refresh: Refresh. Identity.refreshToken}, {
      headers: {
        'Content-Type': 'application/json'
       
      }})
    .then((data) => 
    {
      //console.log(data.data)
      localStorage.setItem("token", data.data.access);
      localStorage.setItem("refreshToken",  data.data.refresh,)},
    
    ).catch((e)=>{
      window.alert("Please login again!")
      window.localStorage.clear();
      window.sessionStorage.clear();

      
    })

}
};
export {Refresh};