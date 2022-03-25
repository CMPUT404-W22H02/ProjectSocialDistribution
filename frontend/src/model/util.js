import axios from "axios";
import Identity from "./Identity";
import {Refresh} from "../../src/auth/Refresh"
import jwt_decode from "jwt-decode";
async function fetchAllPosts() {
  const posts = [];
  let decodedToken = jwt_decode( localStorage.getItem("token"));
  let currentDate = new Date();

  // JWT exp is in seconds
  if (decodedToken.exp * 1000 < currentDate.getTime()) {
      console.log("Token expired.");
      Refresh.refreshToken().then(()=>{localStorage.getItem("token")});
      
  } else {
      console.log("Valid token");  
  }
  
  try {
    const response = await axios.get(`http://localhost:8000/authors/`, {
      headers: {
        Authorization: "Bearer " + Identity.GetIdentity().token
      }});
    
    const authorList = response.data.items;

    for (let author of authorList) {
      const response = await axios.get(`${author.id}/posts/`, {
        headers: {
          Authorization: "Bearer " + Identity.GetIdentity().token
        }});
      const postList = response.data.items;
      posts.push(...postList);
    }
  }
  catch (error) {
    console.log(error)
    return null;
  }
  
  posts.sort((a, b) => b.published - a.published)
  return posts;
}

export { fetchAllPosts };