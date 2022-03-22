import { useEffect, useState } from "react";
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
  ButtonGroup
} from "@chakra-ui/react";
import { FaComment, FaThumbsUp } from "react-icons/fa";
import EditDialog from "../editDialog";

function Post() {
  const { isOpen: isEditOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommentOpen, onToggle } = useDisclosure();
  // const [showComment, setShowComment] = useState(false);

  // function handleCommentClick() {
  //   setShowComment(!showComment);
  // }

  return (
    <Flex width="50rem" minH="10rem" boxShadow="lg" py="2" alignContent="center" flexDirection="column">
      <Stack direction="column" spacing="3" px="4" justify="space-between">
        <HStack pt="4" ml="2" spacing="3">
          <Avatar/>
          <Heading size="md">John Doe</Heading>
        </HStack>
        <Container fontWeight="medium" pt="4">
          Title
        </Container>
        <Container minH="10" minW="48rem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In faucibus tempor purus sit amet viverra. 
          Aenean non fringilla sem. Sed rhoncus eros lorem, vitae maximus dui laoreet sed. Ut mollis eleifend eros vitae faucibus. 
          Praesent id viverra velit. Praesent tempor tempor erat, nec placerat orci consectetur quis. 
          Mauris lorem lacus, sagittis nec sollicitudin nec, congue et diam. Vivamus nec nisi consequat, feugiat tortor a, porta odio. 
          Aliquam erat volutpat. Suspendisse potenti. Donec ac luctus nunc, at elementum justo. 
          Ut nisi mauris, pharetra pellentesque elementum nec, feugiat eu ante. Duis erat tellus, viverra in odio at, viverra dictum odio. 
          Nunc lobortis sapien non arcu consequat, sit amet vestibulum purus dignissim. 
          Vivamus eros arcu, eleifend vel ornare id, blandit sit amet tortor.
        </Container>
        <HStack justify="space-between">
          <ButtonGroup isAttached>
            <Button leftIcon={<FaThumbsUp/>} variant="ghost">
              9 Likes
            </Button>
            <Button leftIcon={<FaComment/>} variant="ghost" onClick={onToggle}>
              4 Comments
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
      </Collapse>
    </Flex>
  );
}

export default Post;