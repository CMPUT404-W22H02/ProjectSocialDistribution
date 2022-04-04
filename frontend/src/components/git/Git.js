import { useState, useEffect, useRef, createRef } from "react";
import axios from "axios";
import{ Container, Flex, Stack } from "@chakra-ui/react";

function GithubEvents({gitInfo}){
    return(
        <Flex width="50rem" minH="10rem" boxShadow="lg" py="2" alignContent="center" flexDirection="column">
            <Stack direction="column" spacing="2.5" px="4" justify="space-between">
                <Container fontWeight="bold" pt="4" fontSize="xl">
                    {gitInfo.type}
                </Container>

                <Container>
                    {gitInfo.repo.name}
                </Container>
            </Stack>
        </Flex>
    )
}

export default GithubEvents;