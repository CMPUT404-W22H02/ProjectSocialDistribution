import axios from "axios";
import Identity from "./Identity";
import {Refresh} from "../../src/auth/Refresh"
import jwt_decode from "jwt-decode";


async function fetchAllPosts(success=()=>{}, fail = ()=>{}) {
  const posts = [];
    await  Refresh.refreshToken().then(axios.get(`http://localhost:8000/publicposts/`, 
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }}).then((response) => 
  {
    const postList = response.data.items;
    //console.log(postList)
    posts.push(...postList);
    posts.sort((a, b) => b.published - a.published);
    
    if (typeof response !=="undefiend"){
      success(posts)
    }
    

  }).catch((error)=>{
    fail(error);
    console.log("=",error);


  }))

}
/* async function fetchAllPosts() {
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
    //https://psdt11.herokuapp.com/publicposts
    //http://127.0.0.1:8000/publicposts
      await Refresh.refreshToken().then(axios.get(`http://localhost:8000/publicposts/`, {
        headers: {
          Authorization: "Bearer " + Identity.GetIdentity().token
        }}).then((response)=>{
          const postList = response.data.items;
          console.log(postList)
          posts.push(...postList);
          posts.sort((a, b) => b.published - a.published);
          return posts;

        }).catch(()=>{
          console.log("error in homepage fetch all post")

        })
        );
      
  }
  catch (error) {
    console.log(error);
    return null;
  }
  
  
} */

async function fetchComments(commentsUrl) {
  const comments = [];
  
  try {
    const response = await axios.get(`${commentsUrl}`, {
      headers: {
        Authorization: "Bearer " + Identity.GetIdentity().token
      }});
    
    const commentList = response.data.items;
    comments.push(...commentList);
  }
  catch (error) {
    console.log(error);
    return [];
  }

  comments.sort((a, b) => b.published - a.published);
  return comments;
}

async function fetchAuthorObj() {
  try {
    const response = await axios.get(`${Identity.GetIdentity().id}`, {
      headers: {
        Authorization: "Bearer " + Identity.GetIdentity().token
      }});
    
    return response.data;
  }
  catch (error) {
    console.log(error);
    return null;
  }
}

export { fetchAllPosts, fetchComments, fetchAuthorObj };