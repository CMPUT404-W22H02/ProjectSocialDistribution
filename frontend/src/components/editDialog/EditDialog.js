import { useEffect, useState } from 'react';
import axios from 'axios';
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
import Identity from '../../model/Identity';

function EditDialog({ post, isOpen, onClose }) {
  const [title, setTitle] = useState(post.title);
  const [desc, setDesc] = useState(post.description);

  const updatePost = async () => {
    try {
      const response = await axios.post(post.id, {
        title: title,
        description: desc
      }, {
        headers: {
          Authorization: "Bearer " + Identity.GetIdentity().token
        }});
      console.log(response.status);
      onClose();
    }
    catch(error) {
      console.log(error)
    }
  }

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit your post</ModalHeader>
        <ModalCloseButton/>

        <ModalBody>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(event) => {
              setTitle(event.target.value);
            }}/>
          </FormControl>
          
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input value={desc} onChange={(event) => {
              setDesc(event.target.value);
            }}/>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr="2" bg="teal.200" onClick={ () => updatePost() }>
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