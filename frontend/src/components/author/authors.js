import { useState, useEffect, useRef, createRef } from "react";
import axios from "axios";
import {
  Flex,
  Heading,
  Button,
  IconButton,
  Stack,
  Box,
  HStack,
  useDisclosure,
  Collapse,
  Input,
  ButtonGroup,
  Divider,
  VStack,
  StackDivider,
  InputGroup,
  InputRightAddon,
  useToast
} from "@chakra-ui/react";

const base_url = process.env.REACT_APP_API_URL || 'http://localhost:8000/';

function Author(author){
    const toast = useToast();
    const toastIdRef = useRef();

    const [DisplayName, setDisplayName] = useState(author.displayName);
    const [ID, setID] = useState(author.id);
    
    let authorID=author.id.slice(-36,author.id.length);

    function addToast(toast_data) {
        toastIdRef.current = toast(toast_data)
    }

    useEffect(()=>{ 
        axios.get(`${authorID}`,
        {
            headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${token}`
            },
        })
        .then(res => { 
            //console.log(res)
            setDisplayName(info.display_name)
            setID(info.id)
        })
        .catch(e => {
            console.log("error-----")
            //console.log(token)
            console.log(e)
        })
    },[])

    const onRemove=()=>{
        axios.delete(base_url+`authors/${authorID}`,{
            headers:{
                "Content-Type": "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("token")}`
            },
        })
        .then((data) => addToast({description: "Author Removed",
        status: 'success', isClosable: true, duration: 1000,},))
        .catch((e)=>{
            console.log(e.response.status)
            setStatus(e.response.status)
            addToast({description: "Author Not Removed",
            status: 'error', isClosable: true, duration: 1000,})
        })
    }

    const onModify=()=>{
        author.displayName=DisplayName;
        author.id=ID;

        axios.patch(base_url+`authors/${authorID}`,author, {
            headers: {
                "Content-Type": "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("token")}`
            },
        })
        .then((data) => addToast({description: "Author Modified.",
        status: 'success', isClosable: true, duration: 1000,})
        .catch((e)=>{
            console.log(e.response.status)
            setStatus(e.response.status)
            addToast({description: "author not modified",
            status: 'error', isClosable: true, duration: 1000,})
        })
    )})

    return(
        <Flex width="50rem" minH="10rem" boxShadow="lg" py="2" alignContent="center" flexDirection="column">
            <Stack direction="column" spacing="3" px="4" justify="space-between">
                <Input
                    placeholder="displayName"
                    _placeholder={{ color: 'gray.500' }}
                    type="text"
                    value={author.displayName}
                    onChange={(e)=>setDisplayName(e.target.value)}
                />
                <Input
                    placeholder="author ID"
                    _placeholder={{ color: 'gray.500' }}
                    type="text"
                    value={author.id}
                    onChange={(e)=>setID(e.target.value)}
                />
                <Heading size="md">{author.displayName}</Heading>
                <HStack justify="space-between">
                <ButtonGroup isAttached>
                    <Button onClick={onRemove} colorScheme='blue' variant="ghost">
                    Remove
                    </Button>
                    <Button onClick={onModify} colorScheme='blue' variant='outline'>
                    Modify
                    </Button>
                </ButtonGroup>
                </HStack>
            </Stack>
        </Flex>
    );
}
