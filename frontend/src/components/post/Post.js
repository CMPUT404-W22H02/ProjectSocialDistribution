import { useState, useEffect, useRef, createRef } from "react";
import axios from "axios";
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
  InputRightAddon
} from "@chakra-ui/react";
import { FaComment, FaThumbsUp, FaShare } from "react-icons/fa";
import Identity from "../../model/Identity";
import EditDialog from "../editDialog";
import Comment from "../comment";
import {AddIcon} from '@chakra-ui/icons';
import {Refresh} from "../../../src/auth/Refresh"
import jwt_decode from "jwt-decode";
import {useParams } from "react-router-dom";
import { fetchComments, fetchAuthorObj } from "../../model/util";
const base_url = process.env.REACT_APP_API_URL || 'http://localhost:8000/';
let identity = Identity.GetIdentity();


function Post({ postData }) {
  var current_user_id=identity.id
  current_user_id=current_user_id.slice(-36, current_user_id.length)
  const { isOpen: isEditOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommentOpen, onToggle } = useDisclosure();
  const [ comments, setComments ] = useState([]);
  //const [id, setId] = useState();
  const {picture, setPic} = useState();
  const toast = useToast();
  const toastIdRef = useRef();
  const [status , setStatus]= useState();
  function addToast(toast_data) {
      toastIdRef.current = toast(toast_data)
  }
  
  useEffect(() => {
    const getComments = async () => {
      const data = await fetchComments(postData.comments);
      setComments(data);
    }
    getComments();
  }, [postData.comments])

  // TODO: check with userID to hide/show edit dialog button
  var [post_author_id, setPostAuthId] = useState(postData.author.id)
  const author = postData.author.display_name
  let inputComment = createRef();
  const addComment = () =>{
    axios.get(base_url+`authors/${current_user_id}`,
    {
        headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${localStorage.getItem("token")}`

        },
    })
    .then(res => { 
      const info = res.data;
      let values = {}
      values['type'] = "comment";
      values['author'] = info;
      values['comment'] = inputComment.current.value;
      axios.post(`${postData.id}/comments`,
      values, {
          headers: {
          'Content-Type': 'application/json',
          "Authorization" : `Bearer ${localStorage.getItem("token")}`
          
          }})
      .then((data) => addToast({description: "Comment added.",
          status: 'success', isClosable: true, duration: 1000,}),
      
      ).catch((e)=>{
          console.log(e.response.status)
          setStatus(e.response.status)
          addToast({description: "send follow not successfull",
          status: 'error', isClosable: true, duration: 1000,})
          
      })
  })
}

  const onShare = () =>{ 


    axios.get(base_url+`authors/${current_user_id}`,
    {
        headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${localStorage.getItem("token")}`

        },
    })
    .then(res => { 
    let values = {}
    values['title'] = postData.title;
    values['source'] = postData.id;
    values['description'] = postData.description;
    values['categories'] = postData.categories;
    values['visibility'] = postData.visibility;
    values['unlisted'] = postData.unlisted;
    axios.post(base_url+`authors/${current_user_id}/posts/`,
    values, {
        headers: {
        'Content-Type': 'application/json',
        "Authorization" : `Bearer ${localStorage.getItem("token")}`
        
        }})
    .then((data) => addToast({description: "Shared!",
        status: 'success', isClosable: true, duration: 1000,}),
    
    ).catch((e)=>{
        console.log(e.response.status)
        setStatus(e.response.status)
        addToast({description: "not successfull",
        status: 'error', isClosable: true, duration: 1000,})
        
    })



})
  }
  
  const onSubmitLike = () =>{ 


    axios.get(base_url+`authors/${current_user_id}`,
    {
        headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${localStorage.getItem("token")}`

        },
    })
    .then(res => { 
    const info = res.data;
    if(info.id){
      var follower = info.display_name
      onsubmitValueLike(info, follower);
    } 
    else{
      
      var follower = info.data[0].display_name
      onsubmitValueLike(info.data[0], follower);
    }
        
    }).catch(e => {
        console.log("error-----")
        addToast({description: "Do not send again!",
              status: 'info', isClosable: true, duration: 1000,})

        console.log(e)
    })
}
const sendLike=((values, token)=>{
  post_author_id=post_author_id.slice(-36, post_author_id.length)

  axios.post(base_url+`authors/${post_author_id}/inbox`,
        values, {
            headers: {
            'Content-Type': 'application/json',
            "Authorization" : `Bearer ${token}`
            
            }})
        .then((data) => addToast({description: "Liked!",
            status: 'success', isClosable: true, duration: 1000,}),
        
        ).catch((e)=>{
            console.log(e.response.status)
            setStatus(e.response.status)
            addToast({description: "not successfull",
            status: 'error', isClosable: true, duration: 1000,})
            
        })



})

const onsubmitValueLike = (current_user, follower) => {
  
  const values ={"type": "like", 
  "summary":`${follower} Likes your post.`, 
  "author": postData.author,
  "object": postData.id}
  // console.log("author", postData.author)
  // console.log("user", current_user)
  // console.log("CURR", current_user_id)
  console.log(values)

  let token = localStorage.getItem("token")
  let decodedToken = jwt_decode(token);
  let currentDate = new Date();

  // JWT exp is in seconds
  if (decodedToken.exp * 1000 < currentDate.getTime()) {
      console.log("Token expired.");
      Refresh.refreshToken().then(()=>{token = localStorage.getItem("token");
        sendLike(values, token)});
      
  } else {
      console.log("Valid token");  
      sendLike(values, token) 
  }
  }
  const onSubmit = () =>{ 


    axios.get(base_url+`authors/${current_user_id}`,
    {
        headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${localStorage.getItem("token")}`

        },
    })
    .then(res => { 
    const info = res.data;
    if(info.id){
      var follower = info.display_name
      onsubmitValue(info, follower);
    } 
    else{
      
      var follower = info.data[0].display_name
      onsubmitValue(info.data[0], follower);
    }
        
    }).catch(e => {
        console.log("error-----")
        addToast({description: "Do not send again!",
              status: 'info', isClosable: true, duration: 1000,})

        console.log(e)
    })
}
  const sendFollow=((values, token)=>{
    post_author_id=post_author_id.slice(-36, post_author_id.length)

    axios.put(base_url+`authors/${post_author_id}/followers/${current_user_id}`,
          values, {
              headers: {
              'Content-Type': 'application/json',
              "Authorization" : `Bearer ${token}`
              
              }})
          .then((data) => addToast({description: "send follow successfull",
              status: 'success', isClosable: true, duration: 1000,}),
          
          ).catch((e)=>{
              console.log(e.response.status)
              setStatus(e.response.status)
              addToast({description: "send follow not successfull",
              status: 'error', isClosable: true, duration: 1000,})
              
          })
    axios.post(base_url+`authors/${post_author_id}/inbox`,
          values, {
              headers: {
              'Content-Type': 'application/json',
              "Authorization" : `Bearer ${token}`
              
              }})
          .then((data) => addToast({description: "send follow successfull",
              status: 'success', isClosable: true, duration: 1000,}),
          
          ).catch((e)=>{
              console.log(e.response.status)
              setStatus(e.response.status)
              addToast({description: "send follow not successfull",
              status: 'error', isClosable: true, duration: 1000,})
              
          })



  })
  
  const onsubmitValue = (current_user, follower) => {
    
    const values ={"type": "follow", 
    "summary":`${follower} want to follow ${author}`, 
    "actor": current_user,
    "object": postData.author}
    // console.log("author", postData.author)
    // console.log("user", current_user)
    // console.log("CURR", current_user_id)
    console.log(values)

    let token = localStorage.getItem("token")
    let decodedToken = jwt_decode(token);
    let currentDate = new Date();

    // JWT exp is in seconds
    if (decodedToken.exp * 1000 < currentDate.getTime()) {
        console.log("Token expired.");
        Refresh.refreshToken().then(()=>{token = localStorage.getItem("token");
          sendFollow(values, token)});
        
    } else {
        console.log("Valid token");  
        sendFollow(values, token) 
    }
    }
  return (
    <Flex width="50rem" minH="10rem" boxShadow="lg" py="2" alignContent="center" flexDirection="column">
      <Stack direction="column" spacing="3" px="4" justify="space-between">
        <HStack pt="4" ml="2" spacing="3">
        <Avatar size="md" src={picture}>
          <AvatarBadge
            as={IconButton}
            size="xs"
            rounded="full"
            bottom="-1px"
            colorScheme="teal"
            aria-label="remove Image"
            icon={<AddIcon />}
            onClick={()=>onSubmit()}
          />
        </Avatar>
          <Heading size="md">{postData.author.display_name}</Heading>
        </HStack>
        <Container fontWeight="medium" pt="4">
          {postData.title}
        </Container>
        <Container minH="10" minW="48rem">
          {postData.description}
        </Container>
        <HStack justify="space-between">
          <ButtonGroup isAttached>
            <Button onClick={onSubmitLike} leftIcon={<FaThumbsUp/>} variant="ghost">
              Likes
            </Button>
            <Button onClick={onShare} leftIcon={<FaShare />} colorScheme='teal' variant='outline'>
            Share
            </Button>
            <Button leftIcon={<FaComment/>} variant="ghost" onClick={onToggle}>
              {postData.count} Comments
            </Button>
          </ButtonGroup>
          {current_user_id==post_author_id.slice(-36, post_author_id.length)?<Button variant="solid" onClick={onOpen} right="0">Edit</Button>:null}
          <EditDialog post={postData} isOpen={isEditOpen} onClose={onClose}/>
        </HStack>
      </Stack>
      <Collapse in={isCommentOpen} animateOpacity>
        <Box my="2" mx="4">
          <InputGroup>
            <Input ref={inputComment} placeholder="Write a comment"/>
            <InputRightAddon>
              <Button onClick={addComment}>
                Submit
              </Button>
            </InputRightAddon>
          </InputGroup>
          
        </Box>
        <Divider borderColor="gray.300" width="90%0" mx="4" mb="2"/>
        <VStack 
          divider={<StackDivider width="95%" justify="center"/>}
          align="left"
          ml="6"
          my="2"
        >
          {comments.map((comment, i) => <Comment commentData={comment} key ={i}/>)}
        </VStack>
      </Collapse>
    </Flex>
  );
}

export default Post;