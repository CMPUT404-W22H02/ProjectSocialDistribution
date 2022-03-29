import {
    Heading,
    Avatar,
    Box,
    Center,
    Text,
    Stack,
    Button,
    Link,
    Badge,
    useColorModeValue,
  } from '@chakra-ui/react';
  import {useParams } from "react-router-dom";
  import Identity from '../../model/Identity';
  import axios from "axios";
import { useState } from 'react';
  let identity = Identity.GetIdentity();
  const token = identity.token;
  export default function User(props) {
    const { id } = useParams();
    const [dname, setDname] = useState("");
    const [host, setHost] = useState("");
    const [github, setGH] = useState("");
    console.log(id);
    console.log(token);
    axios.get('http://localhost:8000/authors/'+`${id}`,
    {
        headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${token}`

        },
    })
    .then(res=>{
        console.log(res.data);
        setDname(res.data.display_name);
        setHost(res.data.host);
        setGH(res.data.github);
    })
    console.log(dname)
    return (
      <Center py={6}>
        <Box
          maxW={'320px'}
          w={'full'}
          bg={useColorModeValue('white', 'gray.900')}
          boxShadow={'2xl'}
          rounded={'lg'}
          p={6}
          textAlign={'center'}>
          <Avatar
            size={'xl'}
            src={
              'https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ'
            }
            alt={'Avatar Alt'}
            mb={4}
            pos={'relative'}
          />
          <Heading fontSize={'2xl'} fontFamily={'body'}>
            {dname}
          </Heading>
          <Text fontWeight={600} color={'gray.500'} mb={4}>
            id: {id}
          </Text>
          <Text
            textAlign={'center'}
            color={useColorModeValue('gray.700', 'gray.400')}
            px={3}>
            Host: {host} 
          </Text>
          <Text
            textAlign={'center'}
            color={useColorModeValue('gray.700', 'gray.400')}
            px={3}>
            Github: {github} 
          </Text>

  
          <Stack mt={8} direction={'row'} spacing={4}>
            <Button
              flex={1}
              fontSize={'sm'}
              rounded={'full'}
              bg={'blue.400'}
              color={'white'}
              boxShadow={
                '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
              }
              _hover={{
                bg: 'blue.500',
              }}
              _focus={{
                bg: 'blue.500',
              }}>
              Follow
            </Button>
          </Stack>
        </Box>
      </Center>
    );
  }