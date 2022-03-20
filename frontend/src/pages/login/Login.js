import { useState } from "react";
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
  InputRightElement
} from "@chakra-ui/react";
import PropTypes from 'prop-types';
async function loginUser(credentials) {
  return axios.post(`${process.env.REACT_APP_API_URL}login/`,
  credentials, {
    headers: {
      'Content-Type': 'application/json'
     
    }})
  .then((data) => data,
  )
 }

function Login({ setToken }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  
  const [showPassword, setShowPassword] = useState(false);

  function handleShowClick() {
    setShowPassword(!showPassword);
  }

  const handleLoginClick= async e=> {
    e.preventDefault();
    const data = await loginUser({
      username,
      password
    });
    console.log("---",data);
    //console.log("---",data.data.access)
    const token = data.data
    console.log(token)
    setToken(token);
    //window.location.assign("/dashboard")
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

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}