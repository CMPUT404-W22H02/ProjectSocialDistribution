import {
  HStack,
  Box,
  Avatar,
  VStack,
  Heading,
} from "@chakra-ui/react";

function Comment({ commentData }) {
  return (
    <HStack>
      <Avatar/>
      <VStack spacing="-0.25" align="left">
        <Heading size="sm">
          Name
        </Heading>
        <Box>
          sample comment
        </Box>
      </VStack>
      
    </HStack>
  );
}

export default Comment;