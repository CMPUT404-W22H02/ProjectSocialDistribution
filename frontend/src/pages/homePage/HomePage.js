import { useEffect, useState } from "react";
import axios from "axios";
import {
  Flex,
  Container,
  Box,
  VStack,
  HStack, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner
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
  
   useEffect(() => {
    let githubPosts = [];

    Refresh.refreshToken().then(axios.get(`${base_url}authors/`, {
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
                  setGithub(prevArray => [...prevArray, data]);
                }
              })
            }
          }
          }))  
    }, []); 

    useEffect(() => {
      
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
          for (let each of posts){
            if (each.unlisted==false){
              setPosts(prevArray => [...prevArray, each]);
            }
          }
          //setPosts(posts)
        }
        

      }).catch((error)=>{


  }))},[] );
 


//console.log("---", posts)
  return (
    <Box 
      margin="-20px"
      height="100vh"
    >
      <Navbar/>
      <Flex 
      flexDirection="column" align="center" >
      <Tabs isFitted variant='enclosed'>  
          
      <TabList mb='1em'>
            <Tab _selected={{ color: 'white', bg: 'teal.300' }}>Public Post</Tab>
            <Tab _selected={{ color: 'white', bg: 'cyan.300' }}>Github Post</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                 <VStack spacing="4" my="5">
                 {typeof posts !="undefined" & posts.length!=0? 
                  posts.map((post, i) => <Post onChange={(post)=> setPost(post)} postData={post} key ={i}/>)
                :<Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
                label='Loading ...'
              />}
                </VStack>
              </TabPanel>
              <TabPanel>

                <VStack spacing="2" my="3">
                {typeof github !="undefined" & github.length!=0? 
                github.map((post, i) => <GithubPost onChange={(post)=> setGithub(post)} postData={post} key ={i}/>)

                : <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
                label='Loading ...'
              />} 
                </VStack>
              </TabPanel>


              </TabPanels>
        
       </Tabs>
      
      </Flex>
    </Box>
  );
}

export default HomePage;