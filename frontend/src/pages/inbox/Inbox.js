import { Box, Button, Flex, Heading, Stack, Badge } from '@chakra-ui/react';
import axios from "axios";
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Identity from '../../model/Identity';
import Navbar from "../../components/navbar";
const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com';
let identity = Identity.GetIdentity();
const Inbox = () => {
  const [followList, setFollowList] =useState([]);
  const [likeList, setLikeList] =useState([]);
  const [postList, setPostList] =useState([]);
  const [folowerPostList, setFollowerPostList] =useState([]);
  const [likeListLength, setLikeListLength] =useState(0);
  const [followListLength, setFollowListLength] =useState(0);
  console.log(identity.id)

  useEffect(()=>{
    axios.get(`${identity.id}/inboxfollows`,
    {
        headers: {
        'Content-Type': 'application/json',
        "Authorization" : `Bearer ${localStorage.getItem("token")}`
        
        }})
        .then((data) => {
          console.log(data)
          console.log(data.data.items)
          

          setFollowList(data.data.items)
          
           
          
        }
        ).catch((e)=>{
        console.log(e.response.status)
        
        
    })
    axios.get(`${identity.id}/inboxlikes`,
    {
        headers: {
        'Content-Type': 'application/json',
        "Authorization" : `Bearer ${localStorage.getItem("token")}`
        
        }})
        .then((data) => {
          console.log(data)
          
          setLikeList(data.data.items)
          
            
          
        }
        ).catch((e)=>{
        console.log(e.response.status)
        
        
    })
    axios.get(`${identity.id}/inbox`,
    {
        headers: {
        'Content-Type': 'application/json',
        "Authorization" : `Bearer ${localStorage.getItem("token")}`
        
        }})
        .then((data) => {
          console.log(data)
          
          setPostList(data.data.items)
          
            
          
        }
        ).catch((e)=>{
        console.log(e.response.status)
        
        
    })

  }, [])

  const agreefunction=((actor)=>{
    console.log("you click agree")

    axios.post(`${identity.id}/followers`, actor, {headers:{
      'Content-Type': 'application/json',
      "Authorization" : `Bearer ${localStorage.getItem("token")}`
    }})
    .then(
      addToast({description: "Added "+ actor.displayName+ " as your follower",
        status: 'success', isClosable: true, duration: 1000,})
    )
    .catch((error)=>{
      console.log(error.response.staus)
      addToast({description: "Unsuccessful",
        status: 'error', isClosable: true, duration: 1000,})
    })
  })

  const rejectfunction=(actor)=>{
    console.log("you click reject")

    axios.delete(`${identity.id}/inboxfollows/${actor.id}`, {headers:{
      'Content-Type': 'application/json',
      "Authorization" : `Bearer ${localStorage.getItem("token")}`
    }}
    )
    .then(
      addToast({description: "successfully rejected",
          status: 'success', isClosable: true, duration: 1000,})
    )
    .catch(((error)=>{
      console.log(error.response.status)
      addToast({description: "Unsuccessful",
      status: 'error', isClosable: true, duration: 1000,})
    }))
    }

/* 
if (typeof likeList !="undefined" ){
    setLikeListLength(likeList.length)
}
if (typeof followList !="undefined" ){
    setFollowListLength(followList.length)
} */
   
  console.log("followlist", followList)
  console.log("likeList", likeList)
  console.log(followListLength)
  console.log(likeListLength)
  console.log(likeListLength)
  console.log(followListLength)
  
  return (
    <><Navbar /><Flex
          height="100vh"
          alignItems="center"
          flexDirection="column"
      >
          <Box width="100%">
              
              <Stack spacing={8} direction='row' >
              <Box rounded="md" bg="purple.300" color="white" px="15px" py="15px">
              <Badge variant='subtle' colorScheme='green'>
                    Follow
                </Badge>
                  <Stack spacing={3}>
                      {typeof followList !="undefined" & followList.length!=0?  
                      followList.map((follow, i) => <Box rounded="md" bg="purple.400" color="white" px="15px" py="15px">
                          <div key={i} > {follow.actor.display_name} want to follow you </div>

                      <Stack spacing={4} direction='row' align='center'>

                       <Button paddingX="3rem" size='xs' colorScheme='red'onClick={rejectfunction(follow.actor)}>Reject</Button>
                      <Button paddingX="3rem" size='xs' colorScheme='teal' onClick={agreefunction(follow.actor)} >Accept</Button>   
                      </Stack>
                      
                      </Box>
                      )

                      
                      :<p>   This is no follower list  yet     </p>}

                  </Stack>
              </Box>
              <Box rounded="md" bg="teal.300" color="white" px="15px" py="15px">
              <Badge  variant='subtle' colorScheme='green'>
                    Like
                </Badge>
                  <Stack spacing={2}>
                      {typeof likeList !="undefined" & likeList.length!=0? 
                      likeList.map((follow, i) => <Box rounded="md" bg="teal.400" color="white" px="15px" py="15px">
                          <div  key={i} > {follow.author.display_name} like your post</div>

                      <Stack spacing={2} direction='row' align='center'>
  
                      </Stack>
                      </Box>
                      )

                      
                      :<p>   This is no post list  yet     </p>}

                  </Stack>
              </Box>
              <Box rounded="md" bg="blue.300" color="white" px="15px" py="15px">
              <Badge  variant='subtle' colorScheme='green'>
                    Public Post
                </Badge>
                  <Stack spacing={2}>
                      {typeof postList !="undefined" & postList.length!=0? 
                      postList.map((post, i) => <Box rounded="md" bg="blue.400" color="white" px="15px" py="15px">
                          <div  key={i} > {post.author.display_name} public a post</div>

                      <Stack spacing={2} direction='row' align='center'>
  
                      </Stack>
                      </Box>
                      )

                      
                      :<p>   This is no public post list  yet     </p>}

                  </Stack>
              </Box>
              <Box rounded="md" bg="green.300" color="white" px="15px" py="15px">
              <Badge  variant='subtle' colorScheme='green'>
                  Friend Post
                </Badge>
                  <Stack spacing={2}>
                      {typeof folowerPostList !="undefined" & folowerPostList.length!=0? 
                      folowerPostList .map((post, i) => <Box rounded="md" bg="green.400" color="white" px="15px" py="15px">
                          <div  key={i} > {post.author.display_name} public a post</div>

                      <Stack spacing={2} direction='row' align='center'>
  
                      </Stack>
                      </Box>
                      )

                      
                      :<p>   This is no follower post list  yet     </p>}

                  </Stack>
              </Box>
              </Stack>
          </Box>
      </Flex></>
  );
};

export default Inbox;
