import { useState, useEffect, useRef, createRef } from "react";
import {
  Flex,
  Heading,
  Button,
  IconButton,
  Stack,
  Box,
  Avatar,
  HStack,
  useDisclosure,
  Collapse,
  Container,
  Input,
  Text,
  ButtonGroup,
  Divider,
  VStack,
  StackDivider,
  AvatarBadge,
  useToast,
  InputGroup,
  InputRightAddon,
  Tag,
  SimpleGrid,
  Grid
} from "@chakra-ui/react";
import { FaComment, FaThumbsUp, FaShare } from "react-icons/fa";

function GithubPost({ postData }) {
  var cateList=JSON.parse( postData.categories)
  var current_user_id=identity.id
  current_user_id=current_user_id.slice(-36, current_user_id.length)
  var author_id_url = postData.author.id
  var author_id = author_id_url.slice(-36, author_id_url.length)
  var follower = postData.author.display_name

  return (
    <Flex width="50rem" minH="10rem" boxShadow="lg" py="2" alignContent="center" flexDirection="column">
      <Stack direction="column" spacing="2.5" px="4" justify="space-between">

        <Container fontWeight="medium" pt="4" color={'blue'}>
          {postData['actor']['display_login']} - {postData['actor']['url']}
        </Container>
        <Divider></Divider>
        <Container fontWeight="bold" fontSize="xl">
          <Flex>  
           <Text>{postData['type']} </Text>  
          </Flex>
       
        </Container>
        <Divider></Divider>
        <Container minW="48rem">
          <Flex>
            <Text size='xs'></Text> 
            <Text>    {postData['repo']['name']}   </Text>
          </Flex>
         
        </Container>
        
       
      </Stack>
    </Flex>
  );
  }

export default GithubPost;