import { useEffect, useState } from "react";
import axios from "axios";
import {
  Flex,
  Box,
  VStack
} from "@chakra-ui/react";
import Navbar from "../../components/navbar";
import Post from "../../components/post";
import { fetchAllPosts as fetchAll } from "../../model/util";

function HomePage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchAll((data)=>setPosts(data), (fail)=>{console.log("_-----------fail")});
      
    }, []);

//console.log("---", posts)
  return (
    <Box 
    margin="-20px"
    height="100vh">
      <Navbar/>
      <Flex flexDirection="column" align="center">
        <VStack spacing="4">
          {posts.map((post, i) => <Post postData={post} key ={i}/>)}
        </VStack>
      </Flex>
    </Box>
  );
}

export default HomePage;