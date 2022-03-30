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
  Stack,
  Checkbox
} from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/react'
function EditDialog({ post, isOpen, onClose }) {
  console.log(post)
  // once they pass post data then you just set post.title in each useState
  //example: const [title, setTitle] = useState(post.title);
  //post.title is get data after we click post, then it will justdisplay tehm in the input filed
  const [title, setTitle] = useState();
  const [description, setDesc] = useState();
  const [content, setContent] = useState();
  const [categories, setCategories] = useState();
  const [unlisted, setUnlisted] = useState();
  const [visibility, setVisibility] = useState();

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit your post</ModalHeader>
        <ModalCloseButton/>

        <ModalBody>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input
            placeholder="Title"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
        />
          </FormControl>
          
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
            placeholder="Description"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            value={description}
            onChange={(e)=>setDesc(e.target.value)}
        />
          </FormControl>
          <FormControl>
            <FormLabel>Content</FormLabel>
            <Input
            placeholder="Content"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            value={content}
            onChange={(e)=>setContent(e.target.value)}
        />
          </FormControl>
          <FormControl>
            <FormLabel>Categories</FormLabel>
            <Input
            placeholder="Categories"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            value={categories}
            onChange={(e)=>setCategories(e.target.value)}
        />
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