import { useEffect, useState } from "react";
import axios from "axios";
import {
  Flex,
  Container,
  Box,
  VStack,
  HStack
} from "@chakra-ui/react";
import Navbar from "../../components/navbar";
import GithubPost from "../../components/Github";
import Post from "../../components/post";
import {Refresh} from "../../../src/auth/Refresh"
import { fetchAllPosts as fetchAll, fetchGithubPosts } from "../../model/util";
import { fetchGithubPosts as fetchGit } from "../../model/util";
const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com/';
function HomePage() {
  const [github, setGithub] = useState([])
  const [posts, setPosts] = useState([])
  const [post, setPost] = useState({})
  const githubPosts = [];

  /* useEffect(() => {
    fetchAll(
      (data)=>setPosts(data), 
      (fail)=>{console.log("_-----------fail")});
      
    }, []); */

    useEffect(() => {
      axios.get(`${base_url}authors/`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }})
          .then((response)=>{
            const authorList = response.data.items;
            for (let author of authorList) {
              if(author.github.length>1){
                var gh = author.github.split(".com/")[1]
                axios.get(`https://api.github.com/users/${gh}/events`)
                  .then((response)=>{
                for (let data of response.data.slice(0, 4)){
                  githubPosts.push(data)
                }
              })
            }
          }
              
            console.log("check this")
            console.log(githubPosts)
            setGithub(githubPosts)
            console.log(github)
          });
      let posts=[]
      Refresh.refreshToken().then(axios.get(`${base_url}publicposts/`, 
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
          setPosts(posts)
        }
        

      }).catch((error)=>{
        console.log("=",error);


  }))},[] );
 
console.log(posts)
console.log("------------")
console.log(github)


//console.log("---", posts)
  return (
    <Box 
      margin="-20px"
      height="100vh"
    >
      <Navbar/>
      <Flex flexDirection="column" align="center" >
        <HStack>
        <VStack spacing="2" my="3">
          <Container>Github Feed {github}</Container>
          {github.map((post, i) => <GithubPost onChange={(post)=> setPost(post)} postData={post} key ={i}/>)}
        </VStack>
        <VStack spacing="4" my="5">
          {posts.map((post, i) => <Post onChange={(post)=> setPost(post)} postData={post} key ={i}/>)}
        </VStack>
        </HStack>
      </Flex>
    </Box>
  );
}

export default HomePage;