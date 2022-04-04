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
    SimpleGrid,
  } from '@chakra-ui/react';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../../components/navbar";
import useToken from "../../components/App/useToken";
import Identity from '../../model/Identity';
const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com';
//import Cookies from "universal-cookie";

let identity = Identity.GetIdentity();
  
export default function Profile(props) {
    const author_id = identity.id
    const token = identity.token
    const { refreshToken, setRefreshToken } = useState(identity.refreshToken);
    const [ value, setValue] = useState({});
    const [picture, setPicture] = useState('');
    const [userName, setUserName] = useState(identity.username);
    const [display_name, setDisplay_name] = useState("");
    const [github, setGithub] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password1, setPassword1] = useState("");
    const [folowerList, setFollowerList] =useState([]);
    const toast = useToast()
    var values = {}
    const toastIdRef = useRef()
    //const  author_id = props?.location?.state?.author_id
    function addToast(toast_data) {
        toastIdRef.current = toast(toast_data)
    }
   
    const updateProfile = () => {
 
        values['type']='author';
        values['id']=author_id;
        values['url']=author_id;
        values['github'] = github;
        values['display_name'] = display_name;
        //values['host'] = 'https://psdt11.herokuapp.com/';
        axios.post(`${author_id}`,
        values,
        {
            headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${token}`

            },
        }).then((data)=>{
            console.log(data);
            addToast({description: "update profile successfull",
                status: 'success', isClosable: true, duration: 1000,})
        
        
        }
        ).catch((error)=>{console.log(error)})

    }
    const onChangePicture = e => {
    setPicture(URL.createObjectURL(e.target.files[0]));
    };
    console.log("----------", picture)
    //console.log(token,"---")
    //console.log(identity)

    //console.log(author_id)
    useEffect(()=>{ 
         
        axios.get(`${author_id}`,
        {
            headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${token}`

            },
        })
        .then(res => { 
        const info = res.data;
        if(info.id){
            setValue( info );
            //console.log(token)

        } 
        else{
            setValue(info.data[0])
        }
        //console.log(res)
        setUserName(info.username)
        setDisplay_name(info.display_name)
        setGithub(info.github)
            
        }).catch(e => {
            console.log("error-----")
            //console.log(token)
            console.log(e)
        })

        let author_id_= author_id.slice(-36, author_id.length)
        axios.get(`${base_url}authors/${author_id_}/followers`, {
                headers: {
                'Content-Type': 'application/json',
                "Authorization" : `Bearer ${token}`
                
                }})
            .then((data) => {
              setFollowerList(data.data.items)
            }).catch((e)=>{
                console.log(e.response.status)
                if (e.response.status===401){
                  /* window.location.assign("/")
                  window.localStorage.clear();
                  window.sessionStorage.clear(); */
                  
                }
                
                
            })










    },[])
    console.log(folowerList)
        
  
  
  
  
      


return (

    <Box 
    margin="-20px"
    height="100vh"
  >
    <Navbar/><SimpleGrid row={2} spacingX='40px' spacingY='20px'>

        <Flex
            minH={'auto'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack
                spacing={4}
                w={'full'}
                bg={useColorModeValue('white', 'gray.700')}
                rounded={'xl'}
                boxShadow={'lg'}
                p={6}>
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
                        onChange={onChangePicture} />
                    <Button variant='outline' onClick={() => (setPicture(""))}>Remove</Button>
                </ButtonGroup>




                <FormControl id="userName" isRequired>
                    <FormLabel>username</FormLabel>
                    <Input
                        readOnly
                        placeholder="UserName"
                        _placeholder={{ color: 'gray.500' }}
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)} />
                </FormControl>
                <FormControl id="Display_name" isRequired>
                    <FormLabel>Display name</FormLabel>

                    <Input
                        placeholder="Display name"
                        _placeholder={{ color: 'gray.500' }}
                        type="text"
                        value={display_name || ''}
                        onChange={(e) => setDisplay_name(e.target.value)} /> 
                </FormControl>


                <FormControl id="github">
                    <FormLabel>Github</FormLabel>
                    <Input
                        placeholder="github"
                        _placeholder={{ color: 'gray.500' }}
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)} />
                </FormControl>
                <Stack spacing={6} direction={['column', 'row']}>
                    <Button
                        bg={'red.400'}
                        color={'white'}
                        w="10%"
                        _hover={{
                            bg: 'red.500',
                        }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={updateProfile}
                        bg={'teal.400'}
                        color={'white'}
                        w="10%"
                        _hover={{
                            bg: 'teal.500',
                        }}>
                        Submit
                    </Button>
                </Stack>
            </Stack>
        </Flex>
        <Flex minH={'100vh'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack
                spacing={4}
                w={'full'}
                bg={useColorModeValue('white', 'gray.700')}
                rounded={'xl'}
                boxShadow={'lg'}
                p={6}>
                <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
                    Follower list
                </Heading>
                {typeof folowerList !="undefined" & folowerList.length!=0?  
                      folowerList.map((follow, i) => <Box rounded="md" bg="purple.400" color="white" px="15px" py="15px"  key={i}>
                         {follow.display_name}

                      <Stack spacing={4} direction='row' align='center'>

                      </Stack>
                      
                      </Box>
                      )

                      
                      :<p>   There is no follower list  yet     </p>}
                
               
            </Stack>

        </Flex>
    </SimpleGrid></Box>

);
}