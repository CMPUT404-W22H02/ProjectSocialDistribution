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

    let inputDisplayName=createRef();
    let inputID=createRef();
    let authorID=author.id.slice(-36,author.id.length);

    function addToast(toast_data) {
        toastIdRef.current = toast(toast_data)
    }

    const [comments,setComments] = useState([]);
    

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

    const onModify=((modified_author)=>{
        axios.patch(base_url+`authors/${authorID}`,{
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
                <HStack pt="4" ml="2" spacing="3">
                <Heading size="md">{author.displayName}</Heading>
                </HStack>
                <HStack justify="space-between">
                <ButtonGroup isAttached>
                    <Button onClick={onRemove} leftIcon={<FaThumbsUp/>} variant="ghost">
                    Remove
                    </Button>
                    <Button onClick={onModify} leftIcon={<FaShare />} colorScheme='teal' variant='outline'>
                    Modify
                    </Button>
                </ButtonGroup>
                </HStack>
            </Stack>
        </Flex>
    );
}
