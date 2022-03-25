import axios from "axios";
import Identity from "./Identity";

async function fetchAllPosts() {
  const posts = [];

  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}authors/`, {
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
    return null;
  }

  comments.sort((a, b) => b.published - a.published);
  return comments;
}

async function fetchAuthorObj(authorUrl) {
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