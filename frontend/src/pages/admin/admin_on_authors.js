import { useEffect, useState } from "react";
import axios from "axios";
import {
  Flex,
  Box,
  VStack
} from "@chakra-ui/react";
import {fetchAllAuthors} from "../../model/util";
import Author from "../../components/author";

function Admin_on_authors(){
    const [authors,setAuthors] = useState([])

    useEffect(() => {
        const getData = async () => {
          const data = await fetchAllAuthors();
          setAuthors(data);
        }
        getData();
    }, []);
    

    return (
        <Box 
            margin="-20px"
            height="100vh">
            <Flex flexDirection="column" align="center">
                <VStack spacing="4">
                {authors.map((author, i) => <Author author={author} key ={i}/>)}
                </VStack>
            </Flex>
        </Box>
    );
}