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
  InputRightAddon
} from "@chakra-ui/react";

const base_url = process.env.REACT_APP_API_URL || 'http://localhost:8000/';

function Author(author){
    const onRemove=()=>{
        
    }

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
