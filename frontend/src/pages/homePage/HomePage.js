import {
  Flex,
  Box,
  VStack
} from "@chakra-ui/react";
import Navbar from "../../components/navbar";
import Post from "../../components/post";
import {Refresh} from "../login/Refresh"
import { useContext, useState ,useEffect, useRef} from "react";
function HomePage() {



  useEffect(() => {
    //console.log("1111")
    const interval = setInterval(() => {
      Refresh.refreshToken();
    }, 50000);
    return () => clearInterval(interval);
  }, []);




  return (
    <Box height="100vh">
      <Navbar/>
      <Flex flexDirection="column" align="center">
        <VStack spacing="4">
          <Post/>
          <Post/>
          <Post/>
          <Post/>
          <Post/>
        </VStack>
      </Flex>
    </Box>
  );
}

export default HomePage;