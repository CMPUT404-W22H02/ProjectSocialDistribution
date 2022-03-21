import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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
} from "@chakra-ui/react";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleUsernameOnChange(event) {
    setUsername(event.target.value);
  }

  function handlePasswordOnChange(event) {
    setPassword(event.target.value);
  }

  function handleShowClick() {
    setShowPassword(!showPassword);
  }


  function handleLoginClick() {
    axios.post(`${process.env.REACT_APP_API_URL}/login/`,
    {
      username: username,
      password: password
    })
    .then((response) => {
      console.log(response.data);
      // save refresh token in local storage and save access token in cookie
      localStorage.setItem('refreshToken', response.data['refresh']);
      Cookies.set('accessToken', response.data['access']);
    })
    .catch((error) => {
      console.log(error);
    });
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
                  onChange={handleUsernameOnChange}
                />
              </FormControl>
              <FormControl>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    onChange={handlePasswordOnChange}
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