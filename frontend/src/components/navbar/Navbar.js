import {
  Box,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Stack,
  Center,
  Heading,
  Text, 
  IconButton,
  Grid,
  Link,
  Button


} from '@chakra-ui/react';
import { AddIcon, EmailIcon } from '@chakra-ui/icons';
import { useState, } from "react";
import Identity from "../../model/Identity";
import React from 'react';
let identity = Identity.GetIdentity();
function Navbar() {
  const [userName, setUserName] = useState(identity.username);

  const signOut= () => {
    // clear identity
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.location.assign("/")

    // clear refresh timer
    clearTimeout();

  }

  return (
    <Flex 
      bg="teal.400"
      px="10" 
      minH="5vh" 
      width="100%"
      alignItems="center" 
      justifyContent="space-between" 
      position="sticky"
      top="0"
      zIndex="200"
    >
      <Box >
        <Heading ><a href="/home" >Social Distribution</a></Heading>
      </Box>
      <Stack direction="row" spacing="7">
      <Grid justify="flex-end" align="flex-end">
       <a href="/inbox"> <IconButton style={{ bottom: -7, right: 3 }} size='sm' icon={<EmailIcon />} > </IconButton>               </a>
        
      </Grid>
      <Grid justify="flex-end" align="flex-end">
       <a href="/create"> <IconButton style={{ bottom: -7, right: 3 }} size='sm' icon={<AddIcon />} > </IconButton>               </a>
        
      </Grid>
          
        <Menu>
          <MenuButton>
            <Avatar size="md"/>
          </MenuButton>
          <MenuList alignItems="center">
            <Center>
              <Avatar size="2xl"/>
            </Center>
            <Center py="2">
              <Text>{userName}</Text>
            </Center>
            <MenuDivider />
            <MenuItem>Your Servers</MenuItem>
            <MenuItem><a href="/profile">Profile Settings</a></MenuItem>
            <MenuItem onClick={signOut}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Stack>
    </Flex>
  );
}

export default Navbar;