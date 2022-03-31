import {
  HStack,
  Box,
  Avatar,
  VStack,
  Heading,
  Button
} from "@chakra-ui/react";
import {FaThumbsUp} from "react-icons/fa";

function Comment({ commentData }) {
  return (
    <HStack>
      <Avatar/>
      <VStack spacing="-0.25" align="left">
        <Heading size="sm">
          {commentData.author.display_name}
        </Heading>
        <Box>
          {commentData.comment}
        </Box>
      </VStack>
      <Button rightIcon={<FaThumbsUp/>} variant="ghost" />
    </HStack>
  );
}

export default Comment;