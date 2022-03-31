import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';
import axios from "axios";
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Identity from '../../model/Identity';
import Navbar from "../../components/navbar";
const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com';
let identity = Identity.GetIdentity();
const Inbox = () => {
let identity = Identity.GetIdentity();
  const [followList, setFollowList] =useState();
  const [likeList, setLikeList] =useState();
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

  }, [])

  const agreefunction=()=>{
        console.log("you click agree")





  }
  const rejectfunction=()=>{
    console.log("you click agree")





}


  console.log("followlist", followList)
  console.log("likeList", likeList)
  
  return (
    <><Navbar /><Flex
          height="100vh"
          alignItems="center"
          flexDirection="column"
      >
          <Box width="100%">
              <Box
                  d="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  marginBottom="20px"
              >
                  <Heading color="white">Book List</Heading>
              </Box>
              <Stack spacing={4} direction='row' >
              <Box rounded="md" bg="purple.500" color="white" px="15px" py="15px">
                  <Stack spacing={8}>
                      {followList?  
                      followList.map((follow, i) => <><div key={i} > {follow.actor.display_name} want to follow you </div>

                      <Stack spacing={4} direction='row' align='center'>

                       <Button paddingX="3rem" size='xs' colorScheme='red'onClick={rejectfunction}>Reject</Button>
                      <Button paddingX="3rem" size='xs' colorScheme='teal' onClick={agreefunction} >Accept</Button>   
                      </Stack>
                      </>
                      )

                      
                      :<p>   This is no follower list  yet     </p>}

                  </Stack>
              </Box>
              <Box rounded="md" bg="teal.500" color="white" px="15px" py="15px">
                  <Stack spacing={8}>
                      {likeList?  
                      likeList.map((follow, i) => <><div  key={i} > {follow.author.display_name} like your post</div>

                      <Stack spacing={4} direction='row' align='center'>
  
                      </Stack>
                      </>
                      )

                      
                      :<p>   This is no follower list  yet     </p>}

                  </Stack>
              </Box>
              </Stack>
          </Box>
      </Flex></>
  );
};

export default Inbox;
