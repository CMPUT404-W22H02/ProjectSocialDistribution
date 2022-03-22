import { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  Input,
  FormControl,
  Button,
} from '@chakra-ui/react';

function EditDialog({ post, isOpen, onClose }) {
  // const [title, setTitle] = useState(post.title);
  // const [desc, setDesc] = useState(post.description);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit your post</ModalHeader>
        <ModalCloseButton/>

        <ModalBody>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input/>
          </FormControl>
          
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input/>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr="2" bg="teal.200">
            Save
          </Button>
          <Button onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditDialog;