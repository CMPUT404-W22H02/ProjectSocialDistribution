import { useState, useEffect, useRef, createRef } from "react";
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
  StackDivider,
  AvatarBadge,
  useToast,
  InputGroup,
  InputRightAddon
} from "@chakra-ui/react";

function adminPage(){
    return (
      <Flex width="50rem" minH="10rem" boxShadow="lg" py="2" alignContent="center" flexDirection="column">
        <button>

          authors
        </button>
      </Flex>
    );
}