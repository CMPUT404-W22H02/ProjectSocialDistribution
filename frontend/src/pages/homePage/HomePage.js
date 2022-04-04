import { useEffect, useState } from "react";
import axios from "axios";
import {
  Flex,
  Box,
  VStack,
  HStack
} from "@chakra-ui/react";
import Navbar from "../../components/navbar";
import Post from "../../components/post";
import GithubEvents from "../../components/git";
import { fetchAllPosts as fetchAll, fetchGithub } from "../../model/util";
const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com/';
function HomePage() {
  const [posts, setPosts] = useState([])
  const [post, setPost] = useState({})
  const [git_info, setGit] = useState([])
  const [git, setGitEvents]= useState([])

  /* useEffect(() => {
    fetchAll(
      (data)=>setPosts(data), 
      (fail)=>{console.log("_-----------fail")});
      
    }, []); */
    useEffect(() => {
      let posts=[]
      axios.get(`${base_url}publicposts/`, 
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


  })},[] );

  useEffect(()=>{
    let gitInfo=fetchGithub();

    try{
      setGit(gitInfo);
    }
    catch(error){
      console.log(error);
    }
  }, []);

console.log(posts)


//console.log("---", posts)
  return (
    <Box 
      margin="-20px"
      height="100vh"
    >
      <Navbar/>
      <Flex flexDirection="column" align="center">
        <HStack>
          <VStack spacing="4" my="5">
            {posts.map((post, i) => <Post onChange={(post)=> setPost(post)} postData={post} key ={i}/>)}
          </VStack>

          <VStack spacing="4" my="5">
            {git_info.map((git, i) => <GithubEvents onChange={(git)=> setGitEvents(git)} gitInfo={git} key ={i}/>)}
          </VStack>

        </HStack>
      </Flex>
    </Box>
  );
}

export default HomePage;