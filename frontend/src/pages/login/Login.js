

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
import { useContext, useState , useRef} from "react";
import PropTypes from 'prop-types';
import Identity from "../../model/Identity";




function Login() {
  //function Login({ setToken }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  
  const [showPassword, setShowPassword] = useState(false);
  let UserIdentity = Identity.GetIdentity();

  const toast = useToast()
  const toastIdRef = useRef()
  const statuses = ['success', 'error', 'warning', 'info']
  function addToast(toast_data) {
    toastIdRef.current = toast(toast_data)
  }

  function handleShowClick() {
    setShowPassword(!showPassword);
  }
  async function loginUser(credentials) {
    return axios.post(`${process.env.REACT_APP_API_URL}login/`,
    credentials, {
      headers: {
        'Content-Type': 'application/json'
       
      }})
    .then((data) => data,
    
    ).catch((e)=>{
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
    console.log("---",data);
    
    //console.log("---",data.data.access)
    const user = data.data.user
    const token = data.data.access
    ///console.log({'token':token})
    //console.log(data.data.access, data.data.refresh, data.data.user.username, data.data.user.id)
    //setToken({'token':token});
    UserIdentity = new Identity(data.data.access, data.data.refresh, data.data.user.username, data.data.user.id, )
    UserIdentity.StoreIdentity()
    addToast({description: "success login",
                  status: 'success', isClosable: true, duration: 1000,})
    window.location.assign("/home")
  }

  function onSubmit(values) {
    console.log(values);
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
                  onChange={e => setUserName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
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
