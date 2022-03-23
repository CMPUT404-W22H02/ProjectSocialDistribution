

import axios from "axios";
import { useForm } from "react-hook-form";
import {
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  Stack,
  Box,
  Link,
  FormControl,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { useContext, useState ,useEffect, useRef} from "react";
import PropTypes from 'prop-types';
import Identity from "../../model/Identity";
import {Refresh} from "./Refresh"


let UserIdentity = Identity.GetIdentity();
//console.log(UserIdentity)

function Login() {
  //function Login({ setToken }) {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  

  const toast = useToast()
  const toastIdRef = useRef()
  const statuses = ['success', 'error', 'warning', 'info']
  function addToast(toast_data) {
    toastIdRef.current = toast(toast_data)
  }

  function handleShowClick() {
    setShowPassword(!showPassword);
  }
  useEffect(() => {
    //console.log("1111")
    const interval = setInterval(() => {
      Refresh.refreshToken();
    }, 50000);
    return () => clearInterval(interval);
  }, []);
  async function loginUser(credentials) {
    return axios.post('http://localhost:8000/login/',
    credentials, {
      headers: {
        'Content-Type': 'application/json'
       
      }})
    .then(
      (data) => data
    
    ).catch((e)=>{
      setUserName("")
      setPassword("")
      addToast({description: "username/password is not correct",
      status: 'error', isClosable: true, duration: 1000,})
      
    })
  }

  const handleLoginClick= async e=> {
    e.preventDefault();
    const data = await loginUser({
      username,
      password
    });
    setUserName("")
    setPassword("")
    //console.log("---",data);
    const user = data.data.user
    const token = data.data.access
    //console.log("access---\n",data.data.access, "refresh---\n", data.data.refresh, "username---\n", data.data.user.username, data.data.user.id)
    
    UserIdentity = new Identity(data.data.access, data.data.refresh, data.data.user.username, data.data.user.id, )
    UserIdentity.StoreIdentity()
    addToast({description: "success login",status: 'success', isClosable: true, duration: 1000,})
    //refreshToken()
    //setInterval(Refresh.refreshToken(), 2000)
    window.location.assign("/home")
  }


  return (
    <Flex
      flexDirection="column"
      width="100vw"
      height="100vh"
      backgroundColor="gray.200"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        flexDirection="column"
        mb="2"
        justifyContent="center"
        alignItems="center"
      >
        <Heading color="teal.400" fontSize="4xl" fontFamily="fantasy" fontWeight="light">Social Distribution</Heading>
        <Box minW="28rem">
          <form>
            <Stack spacing="4" p="1rem" backgroundColor="white" boxShadow="lg">
              <FormControl>
                <Input 
                  type="text"
                  placeholder="Username"
                  value = {username}
                  onChange={e => setUserName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value = {password}
                    onChange={e => setPassword(e.target.value)} 
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button variant="solid" colorScheme="teal" width="full" onClick={handleLoginClick}>
                Login
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
      <Box>
        <Link color="teal.500" href="/register">
          Register Here
        </Link>
      </Box>
    </Flex>
  );
};

export default Login;
