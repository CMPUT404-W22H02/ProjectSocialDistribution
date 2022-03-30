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

function Author(author){


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
            <Collapse in={isCommentOpen} animateOpacity>
                <Box my="2" mx="4">
                <InputGroup>
                    <Input ref={inputComment} placeholder="Write a comment"/>
                    <InputRightAddon>
                    <Button onClick={addComment}>
                        Submit
                    </Button>
                    </InputRightAddon>
                </InputGroup>
                
                </Box>
                <Divider borderColor="gray.300" width="90%0" mx="4" mb="2"/>
                <VStack 
                divider={<StackDivider width="95%" justify="center"/>}
                align="left"
                ml="6"
                my="2"
                >
                {comments.map((comment, i) => <Comment commentData={comment} key ={i}/>)}
                </VStack>
            </Collapse>
        </Flex>
    );
}
