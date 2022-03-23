import {
  Flex,
  Box,
  VStack
} from "@chakra-ui/react";
import Navbar from "../../components/navbar";
import Post from "../../components/post";
function HomePage() {





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