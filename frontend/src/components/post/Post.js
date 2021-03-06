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
  InputRightAddon,
  Tag,
  SimpleGrid,
  Grid
} from "@chakra-ui/react";
import { FaComment, FaThumbsUp, FaShare } from "react-icons/fa";
import Identity from "../../model/Identity";
import EditDialog from "../editDialog";
import Comment from "../comment";
import {AddIcon} from '@chakra-ui/icons';
import {Refresh} from "../../../src/auth/Refresh"
import jwt_decode from "jwt-decode";
import {useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { fetchComments, fetchAuthorObj } from "../../model/util";
const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com/';
let identity = Identity.GetIdentity();


function Post({ postData }) {
  var showPicture=null
  if (postData.author.profile_image!=null){
    showPicture=postData.author.profile_image
    if (showPicture.slice(0, 6)=="/media"){
      showPicture="https://psdt11.herokuapp.com"+postData.author.profile_image
    }
  }else{
    showPicture=null
  }
  var cateList=[]

  if (typeof postData.categories =="object"){
    cateList=postData.categories
  }else{
    cateList=JSON.parse(postData.categories)
  }

  var current_user_id=identity.id
  current_user_id=current_user_id.slice(-36, current_user_id.length)
  var author_id_url = postData.author.id
  var author_id = author_id_url.slice(-36, author_id_url.length)
  var follower = postData.author.display_name
  const { isOpen: isEditOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommentOpen, onToggle } = useDisclosure();
  const [ comments, setComments ] = useState([]);
  /* const [showPicture, setShowPicture] = useState(postData.author.profile_image); */
  console.log(postData.author.profile_image)

  // TODO: postData.count is count for # of comments, atm it is tracking # of likes
  const [count, setCount]=useState(0);
  const [countRepeat, setCountRepeat]=useState(0);
  const {picture, setPic} = useState();
  const[show, setShow]=useState(false)
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
  //URL: ://service/authors/{AUTHOR_ID}/posts/{POST_ID}/likes
  useEffect(() => {
    
   
    updateFllowe();
    updateLike();
  }, [count])
  const updateFllowe=()=>{
    //console.log(`${base_url}authors/${author_id}/followers/${identity.id}`)
    Refresh.refreshToken().then(axios.get(`${base_url}authors/${author_id}/followers/${identity.id}`, {
      headers: {
      'Content-Type': 'application/json',
      "Authorization" : `Bearer ${localStorage.getItem("token")}`
      
      }})
  .then((data) => {
    //console.log("----", data.data)
    //console.log(data.data.items.length)
    if (data.data.items.length==0){
        setShow(true)
    }else{
      setShow(false)
    }
    
    //console.log("++++++++++++followers++++111111111111++++++++",data.data.items)
  }).catch((e)=>{
     // console.log(e.response.status)
      if (e.response.status===401){
        /* window.location.assign("/")
        window.localStorage.clear();
        window.sessionStorage.clear(); */
        
      }
      
  }))
  }
  const updateLike=()=>{
    //base_url+`authors/${current_user_id}/posts/${post_id}
    axios.get(`${postData.id}/likes`,
    {
       headers: {
       'Content-Type': 'application/json',
       "Authorization" : `Bearer ${localStorage.getItem("token")}`
       
       }})
   .then((data) => {

     //console.log(data.data.items)
     setCount(data.data.items.length)

   }
   
   ).catch((e)=>{
       //console.log(e.response.status)
       setStatus(e.response.status)
       
   })



  }

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
          .then((data) => {
            addToast({description: "comment added.",
              status: 'success', isClosable: true, duration: 1000,});
          //console.log(data)
          values['id'] = data.data.id;
          axios.post(`${author_id_url}/inbox`,
          values, {
            headers: {
              'Content-Type': 'application/json',
              "Authorization" : `Bearer ${localStorage.getItem("token")}`
              
              }})
              .then((data)=>console.log(data))
              const getComments = async () => {
                const data = await fetchComments(postData.comments);
                setComments(data);
              }
              getComments();
      
            }).catch((e)=>{
          //console.log(e.response.status)
          setStatus(e.response.status)
          /* addToast({description: "send follow not successfull",
          status: 'error', isClosable: true, duration: 1000,}) */
          
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
    
   Refresh.refreshToken().then(axios.get(base_url+`authors/${current_user_id}`,
    {
        headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${localStorage.getItem("token")}`

        },
    })
    .then(res => { 
    const info = res.data;
    //console.log("=============", info);
     var follower = info.display_name
     onsubmitValueLike(info, follower);
    
        
    }).catch(e => {
        //console.log("error---like--")
        /* addToast({description: "Do not send again!",
              status: 'info', isClosable: true, duration: 1000,}) */

        //console.log(e)
    })) 
}
const sendLike=((values, token)=>{
  post_author_id=post_author_id.slice(-36, post_author_id.length)

  axios.post(`${author_id_url}/inbox`,
        values, {
            headers: {
            'Content-Type': 'application/json',
            "Authorization" : `Bearer ${token}`
            
            }})
            .then((data) => {
              //console.log(data)
              updateLike();
              /* addToast({description: "send like successfull",
                status: 'success', isClosable: true, duration: 1000,}) */
            },
            ).catch((e)=>{
            //console.log(e.response.status)
            setStatus(e.response.status)
            addToast({description: "not successfull",
            status: 'error', isClosable: true, duration: 1000,})
            
        })



})

const onsubmitValueLike = (current_user, follower) => {
  
  const values ={"type": "like", 
  "summary":`${follower} Likes your post.`, 
  "author": current_user,
  "object": postData.id}
  //console.log(values)

  let token = localStorage.getItem("token")
  Refresh.refreshToken().then(()=>{token = localStorage.getItem("token");
        sendLike(values, token)});
 
  }
  const onSubmit = () =>{ 
    //console.log(postData)
    
    Refresh.refreshToken().then(axios.get(base_url+`authors/${current_user_id}`,
    {
        headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${localStorage.getItem("token")}`

        },
    })
    .then(res => { 
    const info = res.data;
     var follower = info.display_name
      onsubmitValue(info, follower);
    
        
    }).catch(e => {
        /* addToast({description: "Do not send again!",
              status: 'info', isClosable: true, duration: 1000,}) */

        //console.log(e)
    }))
}
  const sendFollow=((values, token)=>{
    post_author_id=post_author_id.slice(-36, post_author_id.length)

   
    //axios.post(base_url+`authors/${post_author_id}/inbox`,
    //const tt = 'http://localhost:8000/authors/487019af-a194-4169-abca-8c8d606c4271'
          axios.post(`${author_id_url}/inbox`,
          values, {
              headers: {
              'Content-Type': 'application/json',
              "Authorization" : `Bearer ${token}`
              
              }})
          .then((data) => {
            //console.log(data)
            setShow(false)
            addToast({description: "send follow successfull",
              status: 'success', isClosable: true, duration: 1000,})},
          
          ).catch((e)=>{
              //console.log(e.response.status)
              setStatus(e.response.status)
              addToast({description: "send follow not successfull",
              status: 'error', isClosable: true, duration: 1000,})
              
          })



  })
  
  const onsubmitValue = (current_user, follower) => {
    console.log(current_user)
    /* const local_user = {'type': 'author', 'id': 'http://localhost:8000/authors/487019af-a194-4169-abca-8c8d606c4271', 
    'url': 'http://localhost:8000/authors/487019af-a194-4169-abca-8c8d606c4271', 
    'host': 'http://localhost:8000/', 'display_name': 't11', 'github': '', 'profile_image': null} */
    const values ={"type": "follow", 
    "summary":`${follower} want to follow ${author}`, 
    "actor": current_user,
    "object":  postData.author}
    let token = localStorage.getItem("token");
    Refresh.refreshToken().then(()=>{
      token = localStorage.getItem("token");
          sendFollow(values, token)});

    }
  return (
    <Flex width="50rem" minH="10rem" boxShadow="lg" py="2" alignContent="center" flexDirection="column">
      <Stack direction="column" spacing="2.5" px="4" justify="space-between">
        <HStack pt="4" ml="2" spacing="3">
        <Avatar size="md" src={showPicture}>
          {show? 
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
            :
            null
            }
          
        </Avatar>
          <Heading size="md">{postData.author.display_name}</Heading>
        </HStack>

        {postData.author.host == 'https://psdt11.herokuapp.com/' ?
        <Container fontWeight="medium" pt="4" color={'blue'}>
          Host - {postData.author.host}
        </Container> : <Container fontWeight="medium" pt="4" color={'green'}>
          Host - {postData.author.host}
        </Container>}
        <Divider></Divider>
        <Container fontWeight="bold" fontSize="xl">
          <Flex>  
           <Text>{postData.title} </Text>  
          </Flex>
       
        </Container>
        <Divider></Divider>
        <Container minW="48rem">
          <Flex>
            <Text>    {postData.description}   </Text>
          </Flex>
         
        </Container>
        <Divider></Divider>
        <Container minW="48rem">
          {/* <Text fontSize="lg">{postData.content}</Text> */}
          <ReactMarkdown components={ChakraUIRenderer()} children={postData.content}/>
          <Divider></Divider>
          <HStack mt="1">
            <Text fontWeight="medium">Categories: </Text>
            {cateList.map((cate, i)=><Tag key={i}> {cate}    </Tag>)}
          </HStack>
          
        </Container>
        <HStack justify="space-between">
          <ButtonGroup isAttached>
            <Button onClick={onSubmitLike} leftIcon={<FaThumbsUp/>} variant="ghost">
            {count} Likes
            </Button>
            <Button leftIcon={<FaComment/>} variant="ghost" onClick={onToggle}>
              Comments
            </Button>
            <Button onClick={onShare} leftIcon={<FaShare />} colorScheme='teal' variant='ghost'>
              Share
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
          {postData.visibility=="PUBLIC"?
          comments.map((comment, i) => <Comment commentData={comment} key ={i}/>):null}
        </VStack>
      </Collapse>
    </Flex>
  );
}

export default Post;