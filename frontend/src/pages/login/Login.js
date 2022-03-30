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
import {Refresh} from "../../auth/Refresh"

let UserIdentity = Identity.GetIdentity();
//console.log(UserIdentity)

function Login() {
//   if (Identity.GetIdentity().IsAuthenticated()) {
//     window.location.assign("/home")
//     console.log(Identity.GetIdentity().refreshToken)
// }
  //function Login({ setToken }) {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]=useState(false)
  
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
  const handleLoginClick= async e=> {
    e.preventDefault();
    setLoading(true)
    const vaild = Refresh.loginUser({
      username,
      password
    },
    (data)=>{  console.log("-2-", data);  addToast({description: "success login",status: 'success', isClosable: true, duration: 1000,})},
    (fail)=>{   console.log("-1-", fail);  addToast({description: "username/password is not correct",status: 'error', isClosable: true, duration: 1000,}); setLoading(false)}

    
    
    )
    setUserName("")
    setPassword("")
    console.log(vaild)
    //console.log("access---\n",data.data.access, "refresh---\n", data.data.refresh, "username---\n", data.data.user.username, data.data.user.id)
   
    //refreshToken()
    //setInterval(Refresh.refreshToken(), 2000)
    //window.location.assign("/home")
  }


  return (
    <Flex
      flexDirection="column"
      width="100vw"
      height="100vh"
      backgroundColor="gray.200"
      justifyContent="center"
      alignItems="center"
      margin="-20px"
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
              <Button variant="solid" isLoading ={loading} colorScheme="teal" width="full" onClick={handleLoginClick}>
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
