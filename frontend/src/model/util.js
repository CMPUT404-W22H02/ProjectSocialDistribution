import axios from "axios";
import Identity from "./Identity";

async function fetchAllPosts() {
  const posts = [];

  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/authors/`, {
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
  

  return posts;
}

export { fetchAllPosts };