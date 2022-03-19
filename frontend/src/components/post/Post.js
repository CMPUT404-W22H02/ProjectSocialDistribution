import {
    Flex,
    Heading,
    Button,
    Stack,
    Avatar,
    HStack
} from "@chakra-ui/react";
import { FaCommentAlt, FaThumbsUp } from "react-icons/fa"

function Post() {
  return (
    <Flex width="50rem" height="25rem" boxShadow="lg" py="2" alignContent="center">
      <Stack direction="column" spacing="4" px="4" justify="space-between">
        <HStack paddingTop="4" spacing="3">
          <Avatar/>
          <Heading size="md">John Doe</Heading>
        </HStack>
        <Flex minH="10" minW="48rem">
          Post body here
        </Flex>
        <HStack justify="space-between">
          <Flex>
            <Button variant="link">
              <FaThumbsUp/>
            </Button>
            <Button variant="link">
              <FaCommentAlt/>
            </Button>
          </Flex>
          <Button variant="solid">Edit</Button>
        </HStack>
      </Stack>
    </Flex>
  );
}

export default Post;