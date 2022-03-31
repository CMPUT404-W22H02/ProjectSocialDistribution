import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';

import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';

const Inbox = () => {
  const [followList, setFollowList] =useState();
  
  return (
    <Flex
      height="100vh"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <Box width="50%">
        <Box
          d="flex"
          flexDirection="row"
          justifyContent="space-between"
          marginBottom="20px"
        >
          <Heading color="white">Book List</Heading>
        <Button paddingX="3rem">Reject</Button>
        </Box>
        <Box rounded="md" bg="purple.500" color="white" px="15px" py="15px">
          <Stack spacing={8}>
              <p>   This is follower list       </p>
            
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
};

export default Inbox;
