import axios from "axios";
import Identity from "./Identity";
import {Refresh} from "../../src/auth/Refresh"
import jwt_decode from "jwt-decode";


const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com/';
async function fetchAllPosts(success=()=>{}, fail = ()=>{}) {
  const posts = [];
    await  Refresh.refreshToken().then(axios.get(`${base_url}publicposts/`, 
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
    //("=",error);


  }))

}

async function fetchGithubPosts(success=()=>{}, fail = ()=>{}) {
const githubPosts = [];
  const response = await axios.get(`${base_url}authors/`, {
    headers: {
      Authorization: "Bearer " + Identity.GetIdentity().token
    }});
  
  const authorList = response.data.items;

  for (let author of authorList) {
    if(author.github.length>1){
      var github = author.github.split(".com/")[1]
      const response = await axios.get(`https://api.github.com/users/${github}/events`)
        .then((response)=>{
      for (let data of response.data.slice(0, 3)){
        githubPosts.push(data)
      }
      githubPosts.sort((a, b) => a['created_at'] - b['created_at']);
      console.log(githubPosts)
      success(githubPosts)
    })
    .catch((error)=>{
      //console.log(error);
      fail(error);
    })
    }
  }
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
    //console.log(error);
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
    //console.log(error);
    return null;
  }
}

export { fetchAllPosts, fetchComments, fetchAuthorObj, fetchGithubPosts };