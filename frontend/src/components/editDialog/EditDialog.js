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
  Stack,
  Checkbox,
  Radio,
  RadioGroup
} from '@chakra-ui/react';
import Identity from '../../model/Identity';

function EditDialog({ post, isOpen, onClose }) {
  // once they pass post data then you just set post.title in each useState
  //example: const [title, setTitle] = useState(post.title);
  //post.title is get data after we click post, then it will justdisplay tehm in the input filed
  const [title, setTitle] = useState(`${post.title}`);
  const [desc, setDesc] = useState(post.description);
  const [content, setContent] = useState(post.content);
  const [categories, setCategories] = useState(post.categories);
  const [unlisted, setUnlisted] = useState();
  const [visibility, setVisibility] = useState();

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
          
          <FormControl>
            <FormLabel>Visibility</FormLabel>
              <RadioGroup onChange={setVisibility} value={visibility}>
                <Stack direction='row'>
                  <Radio visibility="PUBLIC">PUBLIC</Radio>
                  <Radio visibility="FRIENDS" >FRIENDS</Radio>
                </Stack>
              </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Unlisted</FormLabel>
            <Stack spacing={5} direction='row'>
              <Checkbox defaultChecked isChecked ={unlisted}  onChange={(e)=>setUnlisted(e.target.checked)}>
              Unlisted
              </Checkbox>
            </Stack>
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