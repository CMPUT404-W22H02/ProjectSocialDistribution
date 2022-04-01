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
    //https://psdt11.herokuapp.com/publicposts
    //http://127.0.0.1:8000/publicposts
      const response = await axios.get(`http://localhost:8000/publicposts/`, {
        headers: {
          Authorization: "Bearer " + Identity.GetIdentity().token
        }});
      const postList = response.data.items;
      console.log(postList)
      posts.push(...postList);
  }
  catch (error) {
    console.log(error);
    return null;
  }
  
  posts.sort((a, b) => b.published - a.published);
  return posts;
}

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

async function fetchAllAuthors(){
  try {
    const response = await axios.get(`http://localhost:8000/authors/`, {
      headers: {
        Authorization: "Bearer " + Identity.GetIdentity().token
    }});
    
    const authorList = response.data.items;

    return authorList;
  }
  catch (error) {
    console.log(error);
    return null;
  }
}

export { fetchAllPosts, fetchComments, fetchAuthorObj, fetchAllAuthors};