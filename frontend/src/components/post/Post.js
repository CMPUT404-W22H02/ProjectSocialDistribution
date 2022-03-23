import { useEffect, useState } from "react";
import axios from "axios";
import {
  Flex,
  Heading,
  Button,
  IconButton,
  Stack,
  Box,
  Avatar,
  HStack,
  useDisclosure,
  Collapse,
  Container,
  Input,
  Text,
  ButtonGroup,
  Divider,
  VStack,
  StackDivider
} from "@chakra-ui/react";
import { FaComment, FaThumbsUp } from "react-icons/fa";
import Identity from "../../model/Identity";
import EditDialog from "../editDialog";
import Comment from "../comment";

function Post({ postData }) {
  const { isOpen: isEditOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommentOpen, onToggle } = useDisclosure();
  
  // TODO: check with userID to hide/show edit dialog button

  return (
    <Flex width="50rem" minH="10rem" boxShadow="lg" py="2" alignContent="center" flexDirection="column">
      <Stack direction="column" spacing="3" px="4" justify="space-between">
        <HStack pt="4" ml="2" spacing="3">
          <Avatar/>
          <Heading size="md">{postData.author.display_name}</Heading>
        </HStack>
        <Container fontWeight="medium" pt="4">
          {postData.title}
        </Container>
        <Container minH="10" minW="48rem">
          {postData.description}
        </Container>
        <HStack justify="space-between">
          <ButtonGroup isAttached>
            <Button leftIcon={<FaThumbsUp/>} variant="ghost">
              Likes
            </Button>
            <Button leftIcon={<FaComment/>} variant="ghost" onClick={onToggle}>
              {postData.count} Comments
            </Button>
          </ButtonGroup>
          <Button variant="solid" onClick={onOpen} right="0">Edit</Button>
          <EditDialog isOpen={isEditOpen} onClose={onClose}/>
        </HStack>
      </Stack>
      <Collapse in={isCommentOpen} animateOpacity>
        <Box my="2" mx="4">
          <Input placeholder="Write a comment"/>
        </Box>
        <Divider borderColor="gray.300" width="90%0" mx="4" mb="2"/>
        <VStack 
          divider={<StackDivider width="95%" justify="center"/>}
          align="left"
          ml="6"
          my="2"
        >
          <Comment/>
          <Comment/>
        </VStack>
      </Collapse>
    </Flex>
  );
}

export default Post;