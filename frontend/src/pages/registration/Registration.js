import {
  Box,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  Avatar,
  FormControl,
  AvatarBadge,
  IconButton,
  Center,
  CloseButton,
  useBreakpointValue,
  Icon,
  Link,
  useToast ,
  ToastContainer

} from '@chakra-ui/react';
import { useContext, useState , useRef} from "react";
import axios from "axios";


export default function JoinOurTeam() {
  const base_url = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  const [token, setToken]=useState("");
  const [refrensh, setRefrensh]=useState("");
  const [picture, setPicture] = useState('');
  const [userName, setUserName] = useState("");
  const [display_name, setDisplay_name] = useState("");
  const [github, setGithub] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [validated, setValidated] = useState(false);
  const toast = useToast()
  const toastIdRef = useRef()
  const statuses = ['success', 'error', 'warning', 'info']
  function addToast(toast_data) {
    toastIdRef.current = toast(toast_data)
  }
  const onChangePicture = e => {
    setPicture(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = (event) => {
    signUp();
    
    setValidated(true);
};
function signUp() {
  if (password1 !== password2) {
      addToast({description: "The 2 passwords your provided does not match",
                status: 'error', isClosable: true, duration: 1000,})
  }else{
    //uploadImage()
    submit()

  }

  let data = {
      "email": emailAddress,
      "usernName": userName,
      "github":github,
      "password": password1,
      "images": picture,
      "display_name":display_name
  }
  console.log(data)
  


}
  const submit = ()=>{
    const target = new FormData()
    target.append("username",userName)
    target.append("password",password1)
    target.append("display_name",display_name)
    axios
      .post(`${base_url}register/`, target,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response)=>{
        //toast
        setUserName("");
        setPassword2("");
        setPassword1("");
        setEmailAddress("");
        setDisplay_name("");
        setValidated(false);
        addToast({description: "Success send information to admin",
        status: 'success', isClosable: true,duration: 1000,})
        console.log(response)
        setToken(response.data.token)
        setRefrensh(response.data.refresh)
        console.log(response.data.refresh)
        console.log(response.data.token)


      })
      .catch(e =>{
        console.log(e)
        //toast
        addToast({description: "Not success send information to admin",
        status: 'error',isClosable: true,duration: 1000,})
      })


  }





  const uploadImage = async file => {
    const target = new FormData()
    target.append("username",userName)
    target.append("password",password1)
    target.append("github",github)
    target.append("display_name",display_name)
    target.append("profileImage",file)
    axios
      .post(`${base_url}/author/`, target,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response)=>{
        //toast
        setUserName("");
        setPassword2("");
        setPassword1("");
        setEmailAddress("");
        setDisplay_name("");
        setValidated(false);
        addToast({description: "Success send information to admin",
        status: 'success', isClosable: true,duration: 1000,})


      })
      .catch(e =>{
        console.log(e)
        //toast
        addToast({description: "Not success send information to admin",
        status: 'error',isClosable: true,duration: 1000,})
      })
    }



  return (
    <Box position={'relative'}>
      <Container
        as={SimpleGrid}
        maxW={'7xl'}
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 10, sm: 20, lg: 32 }}>
        
        <Stack spacing={{ base: 10, md: 20 }}>
          <Heading
            lineHeight={1.1}
            fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}>
            Distributed Social Networking{' '}
          </Heading>
        </Stack>
        <Stack
          bg={'gray.50'}
          rounded={'xl'}
          p={{ base: 4, sm: 6, md: 8 }}
          spacing={{ base: 8 }}
          maxW={{ lg: 'lg' }}>
          <Stack spacing={4}>
            <Heading
              color={'gray.800'}
              lineHeight={1.1}
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}>
              Join our social network
              <Text
                as={'span'}
                bgGradient="linear(to-r, teal.400,teal.300)"
                bgClip="text">
                !
              </Text>
            </Heading>
            <Text color={'gray.500'} fontSize={{ base: 'sm', sm: 'md' }}>
              We’re looking for amazing engineers just like you! 
              The web is fundamentally interconnected and peer to peer. 
            </Text>
          </Stack>
          <Box as={'form'} mt={10}>
            <Stack spacing={4}>
            <FormControl id="userName">
                <Center>
                  
                  <Avatar size="xl" src={picture}>
                    <AvatarBadge
                      as={IconButton}
                      size="sm"
                      rounded="full"
                      top="-10px"
                      colorScheme="red"
                      aria-label="remove Image"
                      icon={<CloseButton />}
                      onClick={()=>(setPicture(""))}
                    />
                  </Avatar>
                  
                </Center>
            </FormControl>
            <input
              type="file"
              name="myImage"
              onChange={onChangePicture}
            />
              <Input
                isRequired
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Username"
                bg={'gray.100'}
                border={0}
                color={'gray.500'}
                _placeholder={{
                  color: 'gray.500',
                }}
              />
              <Input
                isRequired
                value={display_name}
                onChange={(e) => setDisplay_name(e.target.value)}
                placeholder="Display name"
                bg={'gray.100'}
                border={0}
                color={'gray.500'}
                _placeholder={{
                  color: 'gray.500',
                }}
              />
              <Input
                isRequired
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                placeholder="password"
                bg={'gray.100'}
                border={0}
                color={'gray.500'}
                _placeholder={{
                  color: 'gray.500',
                }}
              />
              <Input
                isRequired
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="confirm password"
                bg={'gray.100'}
                border={0}
                color={'gray.500'}
                _placeholder={{
                  color: 'gray.500',
                }}
              />
              <Input
                isRequired
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                type='email'
                placeholder="email@gmail.com"
                bg={'gray.100'}
                border={0}
                color={'gray.500'}
                _placeholder={{
                  color: 'gray.500',
                }}
              />
              <Input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="github"
                bg={'gray.100'}
                border={0}
                color={'gray.500'}
                _placeholder={{
                  color: 'gray.500',
                }}
              />
              
            </Stack>
            <Button
              onClick={()=>{handleSubmit()}}
              fontFamily={'heading'}
              mt={8}
              w={'full'}
              bgGradient="linear(to-r, teal.400,teal.600)"
              color={'white'}
              _hover={{
                bgGradient: 'linear(to-r, teal.400,teal.400)',
                boxShadow: 'xl',
              }}>
              Submit
            </Button>
          </Box>
          <Box>
        <Link color="teal.500" href="/login">
            Already have an account? Sign in
        </Link>
      </Box>
          form
        </Stack>
        
      </Container>
      <Blur
        position={'absolute'}
        top={-10}
        left={-10}
        style={{ filter: 'blur(70px)' }}
      />
    </Box>
  );
}
export const Blur = (props) => {
  return (
    <Icon
      width={useBreakpointValue({ base: '100%', md: '40vw', lg: '30vw' })}
      zIndex={useBreakpointValue({ base: -1, md: -1, lg: 0 })}
      height="560px"
      viewBox="0 0 528 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <circle cx="71" cy="61" r="111" fill="#F56565" />
      <circle cx="244" cy="106" r="139" fill="#ED64A6" />
      <circle cy="291" r="139" fill="#ED64A6" />
      <circle cx="80.5" cy="189.5" r="101.5" fill="#ED8936" />
      <circle cx="196.5" cy="317.5" r="101.5" fill="#ECC94B" />
      <circle cx="70.5" cy="458.5" r="101.5" fill="#48BB78" />
      <circle cx="426.5" cy="-0.5" r="101.5" fill="#4299E1" />
    </Icon>
  );
};

