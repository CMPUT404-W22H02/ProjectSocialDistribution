import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useColorModeValue,
    HStack,
    Avatar,
    AvatarBadge,
    IconButton,
    Center,
    CloseButton,
    useToast,
    GridItem,
    Grid,
    ButtonGroup,
    Box,
  } from '@chakra-ui/react';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../../components/navbar";
import useToken from "../../components/App/useToken";
import Identity from '../../model/Identity';
const base_url = process.env.REACT_APP_API_URL || 'http://localhost:8000';
//import Cookies from "universal-cookie";

let identity = Identity.GetIdentity();
  
export default function Profile(props) {
//const cookies = new Cookies();
const { token, setToken } = useToken(identity.token);
const [ value, setValue] = useState({});
const [picture, setPicture] = useState('');
const [userName, setUserName] = useState(identity.username);
const [display_name, setDisplay_name] = useState("");
const [github, setGithub] = useState("");
const [emailAddress, setEmailAddress] = useState("");
const [password1, setPassword1] = useState("");
const toast = useToast()
const toastIdRef = useRef()
//const  author_id = props?.location?.state?.author_id
function addToast(toast_data) {
    toastIdRef.current = toast(toast_data)
  }
  const onChangePicture = e => {
    setPicture(URL.createObjectURL(e.target.files[0]));
  };
console.log(token,"---")
const author_id =  identity.id
console.log(author_id)
useEffect(()=>{ 
    axios.get(`${author_id}`,
    {
        headers: {
        "Content-Type": "application/json",
        //"Authorization" : `Bearer ${token}`

        },
    })
    .then(res => { 
    const info = res.data;
    if(info.id){
        setValue( info );

    } 
    else{
        setValue(info.data[0])
    }
    console.log(res)
    setUserName(info.username)
    setDisplay_name(info.display_name)
        
    }).catch(e => {
        console.log(e)
    })
},[])



return (
    <Box height="100vh">
      <Navbar/>
    <Flex
    minH={'100vh'}
    align={'center'}
    justify={'center'}
    bg={useColorModeValue('gray.50', 'gray.800')}>
    <Stack
        spacing={4}
        w={'full'}
        maxW={'md'}
        bg={useColorModeValue('white', 'gray.700')}
        rounded={'xl'}
        boxShadow={'lg'}
        p={6}
        my={12}>
        <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
        User Profile Edit
        </Heading>
        <FormControl id="userName">
            <Center>
                <Avatar size="xl" src={picture}>
                </Avatar>
            </Center>
             
        </FormControl>
        <ButtonGroup size='sm' isAttached variant='outline'>
            <input
              type="file"
              name="myImage"
              onChange={onChangePicture}
            />
            <Button variant='outline' onClick={()=>(setPicture(""))}>Remove</Button>
        </ButtonGroup>
        

            
            
        <FormControl id="userName" isRequired>
        <FormLabel>username</FormLabel>
        <Input
            placeholder="UserName"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            value={userName}
            onChange={(e)=>setUserName(e.target.value)}
        />
        </FormControl>
        <FormControl id="Display_name" isRequired>
        <FormLabel>Display name</FormLabel>

        <Input
            placeholder="Display name"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            value={display_name}
            onChange={(e)=>setDisplay_name(e.target.value)}
        />
        </FormControl>
        <FormControl id="email" isRequired>
        <FormLabel>Email address</FormLabel>
        <Input
            placeholder="your-email@example.com"
            _placeholder={{ color: 'gray.500' }}
            type="email"
        />
        </FormControl>
        <FormControl id="github" isRequired>
        <FormLabel>Github</FormLabel>
        <Input
            placeholder="github"
            _placeholder={{ color: 'gray.500' }}
            type="password"
        />
        </FormControl>
        <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <Input
            placeholder="password"
            _placeholder={{ color: 'gray.500' }}
            type="password"
        />
        </FormControl>
        <Stack spacing={6} direction={['column', 'row']}>
        <Button
            bg={'red.400'}
            color={'white'}
            w="full"
            _hover={{
            bg: 'red.500',
            }}>
            Cancel
        </Button>
        <Button
            bg={'teal.400'}
            color={'white'}
            w="full"
            _hover={{
            bg: 'teal.500',
            }}>
            Submit
        </Button>
        </Stack>
    </Stack>
    </Flex>
    </Box>
);
}