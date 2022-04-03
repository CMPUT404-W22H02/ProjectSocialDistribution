import { Box, Button, Flex, Heading, Stack, Badge, Toast, useToast, SimpleGrid, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

import axios from "axios";
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Identity from '../../model/Identity';
import Navbar from "../../components/navbar";
import { Refresh } from '../../auth/Refresh';
import Post from "../../components/post";
const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com';
let identity =Identity.GetIdentity();
function Inbox () {
    const [id, setId] = useState(identity.id);
    const [followList, setFollowList] =useState([]);
    const [likeList, setLikeList] =useState([]);
    const [commentList, setCommentList] =useState([]);
    const [postList, setPostList] =useState([]);
    const [folowerPostList, setFollowerPostList] =useState([]);
    const [likeListLength, setLikeListLength] =useState(0);
    const [followListLength, setFollowListLength] =useState(0);
    const [follow, setFollow] =useState({});
    const toast = useToast();
    const toastIdRef = useRef();
    const [status , setStatus]= useState();
    function addToast(toast_data) {
      toastIdRef.current = toast(toast_data)
  }

    useEffect(()=>{
        axios.get(`${id}/inboxfollows`,
        {
            headers: {
            'Content-Type': 'application/json',
            "Authorization" : `Bearer ${localStorage.getItem("token")}`
            
            }})
            .then((data) => {
            //URL: ://service/authors/{AUTHOR_ID}/followers/{FOREIGN_AUTHOR_ID}
            for (let each of data.data.items){
                let author_id_= id.slice(-36, id.length)
                axios.get(`${base_url}authors/${author_id_}/followers/${each.actor.id}`, {
                        headers: {
                        'Content-Type': 'application/json',
                        "Authorization" : `Bearer ${localStorage.getItem("token")}`
                        
                        }})
                    .then((data) => {
                      if (data.data.items.length==0){
                          setFollowList(prevArray => [...prevArray, each]);
                      }
                      
                    }).catch((e)=>{
                        console.log(e.response.status)
                        if (e.response.status===401){
                          /* window.location.assign("/")
                          window.localStorage.clear();
                          window.sessionStorage.clear(); */
                          
                        }
                        addToast({description: "create post not successfull",
                        status: 'error', isClosable: true, duration: 1000,})
                        
                    })
            }
            

            
            
            
            
            }
            ).catch((e)=>{
            console.log(e.response.status)
            
            
        })
        axios.get(`${id}/inboxlikes`,
        {
            headers: {
            'Content-Type': 'application/json',
            "Authorization" : `Bearer ${localStorage.getItem("token")}`
            
            }})
            .then((data) => {
            
            setLikeList(data.data.items)
            
                
            
            }
            ).catch((e)=>{
            console.log(e.response.status)
            
            
        })
        axios.get(`${id}/inboxcomments`,
        {
            headers: {
            'Content-Type': 'application/json',
            "Authorization" : `Bearer ${localStorage.getItem("token")}`
            
            }})
            .then((data) => {
            
            setCommentList(data.data.items)
            
                
            
            }
            ).catch((e)=>{
            console.log(e.response.status)
            
            
        })
        axios.get(`${id}/inbox`,
        {
            headers: {
            'Content-Type': 'application/json',
            "Authorization" : `Bearer ${localStorage.getItem("token")}`
            
            }})
            .then((data) => {
            
            setPostList(data.data.items)
            
                
            
            }
            ).catch((e)=>{
            console.log(e.response.status)
            
            
        })

        //#####TODO
        
        //NEED FIRST get a list of follower for current user, then load them to inbox
        //for now, just get all public post
        //i just find a get method to check , but is not good 
        //URL: ://service/authors/{AUTHOR_ID}/followers/{FOREIGN_AUTHOR_ID}
        //GET [local, remote] check if FOREIGN_AUTHOR_ID is a follower of AUTHOR_ID
        //so we need first get all authors? then get all followers for each authors, then check if each followers is equal current user id
        //then load the post

        axios.get(`${id}/inbox`,
        {
            headers: {
            'Content-Type': 'application/json',
            "Authorization" : `Bearer ${localStorage.getItem("token")}`
            
            }})
            .then((data) => {
            
            for (let each of data.data.items){
                if (each.visibility=="FRIENDS"){
                    setFollowerPostList(prevArray => [...prevArray, each])
                }

            }
            
                
            
            }
            ).catch((e)=>{
            console.log(e.response.status)
            
            
        })

    }, [])

    const agreefunction=(follow)=>{
    
            //let foreign_id =follow.actor.id.slice(-36, follow.actor.id.length)
//console.log(foreign_id)
            axios.put(`${identity.id}/followers/${follow.actor.id}`, follow, {headers:{
                'Content-Type': 'application/json',
                "Authorization" : `Bearer ${localStorage.getItem("token")}`
              }})
              .then((data)=>{
                addToast({description: "add user successfull",
                status: 'success', isClosable: true, duration: 1000,});
                const events_ = [...followList];
                const idx = events_.indexOf(follow);
                events_.splice(idx, 1);
                setFollowList(() => [...events_]);



              })
              .catch((error)=>{
                console.log(error.response.staus)
                
              })




    }
    const rejectfunction=()=>{
        console.log("you click agree")





}

  
  return (
    <><Navbar /><Flex
          height="100vh"
          alignItems="center"
          flexDirection="column"
      >
          <Box width="100%">
          <Tabs isFitted variant='enclosed'>  
          
          <TabList mb='1em'>
            <Tab _selected={{ color: 'white', bg: 'purple.500' }}>FOLLOWSw</Tab>
            <Tab _selected={{ color: 'white', bg: 'red.500' }}>COMMENTS</Tab>
            <Tab _selected={{ color: 'white', bg: 'teal.500' }}>LIKE</Tab>
            <Tab _selected={{ color: 'white', bg: 'blue.500' }}>PUBLIC POST</Tab>
            <Tab _selected={{ color: 'white', bg: 'green.500' }}>FRIEND POST</Tab>
            </TabList>
            <TabPanels>
            <TabPanel>
            <Box rounded="md" bg="purple.300" color="white" px="15px" py="15px">
              <Badge variant='subtle' colorScheme='green'>
                    Follow
                </Badge>
                  <Stack spacing={3}>
                      {typeof followList !="undefined" & followList.length!=0?  
                      followList.map((follow, i) => <Box rounded="md" bg="purple.400" color="white" px="15px" py="15px" key={i}>
                          <div key={i} > {follow.actor.display_name} want to follow you </div>

                      <Stack spacing={4} direction='row' align='center'>

                       <Button paddingX="3rem" size='xs' colorScheme='red'onClick={rejectfunction}>Reject</Button>
                      <Button paddingX="3rem" size='xs' colorScheme='teal' onClick={()=>agreefunction(follow)} >Accept</Button>   
                      </Stack>
                      
                      </Box>
                      )

                      
                      :<p>   This is no follower list  yet     </p>}

                  </Stack>
              </Box>
            </TabPanel>
            <TabPanel>
            <Box rounded="md" bg="teal.300" color="white" px="15px" py="15px">
              <Badge  variant='subtle' colorScheme='green'>
                    Like
                </Badge>
                  <Stack spacing={2}>
                      {typeof commentList !="undefined" & commentList.length!=0? 
                      commentList.map((follow, i) => <Box rounded="md" bg="teal.400" color="white" px="15px" py="15px" key={i}>
                          <div  key={i} > {follow.author.display_name} commented on your post</div>

                      <Stack spacing={2} direction='row' align='center'>
  
                      </Stack>
                      </Box>
                      )

                      
                      :<p>   This is no post list  yet     </p>}

                  </Stack>
              </Box>
            </TabPanel>
            <TabPanel>
            <Box rounded="md" bg="teal.300" color="white" px="15px" py="15px">
              <Badge  variant='subtle' colorScheme='green'>
                    Like
                </Badge>
                  <Stack spacing={2}>
                      {typeof likeList !="undefined" & likeList.length!=0? 
                      likeList.map((follow, i) => <Box rounded="md" bg="teal.400" color="white" px="15px" py="15px" key={i}>
                          <div  key={i} > {follow.author.display_name} like your post</div>

                      <Stack spacing={2} direction='row' align='center'>
  
                      </Stack>
                      </Box>
                      )

                      
                      :<p>   This is no post list  yet     </p>}

                  </Stack>
              </Box>
            </TabPanel>
            <TabPanel>
            <Box rounded="md" bg="blue.300" color="white" px="15px" py="15px">
              <Badge  variant='subtle' colorScheme='green'>
                    Public Post
                </Badge>
                  <Stack spacing={2}>
                      {typeof postList !="undefined" & postList.length!=0? 
                      postList.map((post, i) => <Box rounded="md" bg="blue.400" color="white" px="15px" py="15px"  key={i} >
                          <div  key={i} > {post.author.display_name} public a post {post.title}</div>
                        <Post postData={post} key ={post.id}/>

                      <Stack spacing={2} direction='row' align='center'>
  
                      </Stack>
                      </Box>
                      )

                      
                      :<p>   This is no public post list  yet     </p>}

                  </Stack>
              </Box>
            </TabPanel>
            <TabPanel>
            <Box rounded="md" bg="green.300" color="balck" px="15px" py="15px">
              <Badge  variant='subtle' >
                  Friend Post
                </Badge>
                  <Stack spacing={2}>
                      {typeof folowerPostList !="undefined" & folowerPostList.length!=0? 
                      folowerPostList .map((post, i) => <Box rounded="md" bg="white" color="balck" px="15px" py="15px"   key={i}>
                          <div  key={i} > {post.author.display_name} public a post {post.title}</div>
                        <Post postData={post} key ={post.id}/>
                      <Stack spacing={2} direction='row' align='center'>
  
                      </Stack>
                      </Box>
                      )

                      
                      :<p>   This is no follower post list  yet     </p>}

                  </Stack>
              </Box>
            </TabPanel>
            </TabPanels>
          </Tabs>
              
          
          
          </Box>
      </Flex>
     </>
  );
};

export default Inbox;
