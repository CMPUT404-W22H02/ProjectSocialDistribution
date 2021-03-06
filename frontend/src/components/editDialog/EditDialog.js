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
  Textarea,
  FormControl,
  Button,
  Stack,
  Checkbox,
  Radio,
  RadioGroup,
  SimpleGrid,ButtonGroup, IconButton
} from '@chakra-ui/react';
import {  AddIcon, MinusIcon } from '@chakra-ui/icons'
import Identity from '../../model/Identity';

function EditDialog({ post, isOpen, onClose }) {
  var cateList=[]

  if (typeof post.categories =="object" & post.categories.length>0){
    cateList=post.categories

  }else if(typeof post.categories =="string" & post.categories.length>0) {

    cateList=JSON.parse(post.categories)
  }else{
    cateList="no cate"
  }
    // TODO: checking unlist removes edit button
  const [title, setTitle] = useState(post.title);
  const [desc, setDesc] = useState(post.description);
  const [content, setContent] = useState(post.content);
  const [categories, setCategories] = useState(post.categories);
  const [unlisted, setUnlisted] = useState(post.unlisted);
  const [visibility, setVisibility] = useState(post.visibility)
  const [cateSignle, setCateSignle]= useState('');
  const [cate, setCate]=useState(cateList);
  const addCategories=(cateSignle)=>{
    //console.log(cateSignle);
    setCate(prevArray => [...prevArray, cateSignle]);
    setCateSignle("");
  }
  const deleteCategories=(cateSignle)=>{
    const cate_ = [...cate];
    const idx = cate_.indexOf(cateSignle);
    cate_.splice(idx, 1);
    setCate(() => [...cate_]);
    setCateSignle("");

  }
  const deletePost=async()=>{
    try {
      const response = await axios.post(post.id, {
        title: title,
        description: desc,
        content: content,
        categories: JSON.stringify(cate),
        unlisted:true
      }, {
        headers: {
          Authorization: "Bearer " + Identity.GetIdentity().token
        }});
      console.log(response.status);
      onClose();
    }
    catch(error) {
      //console.log(error);
      

    }


  }
  const updatePost = async () => {
    try {
      const response = await axios.post(post.id, {
        title: title,
        description: desc,
        content: content,
        categories: JSON.stringify(cate),
      }, {
        headers: {
          Authorization: "Bearer " + Identity.GetIdentity().token
        }});
      console.log(response.status);
      onClose();
    }
    catch(error) {
      //console.log(error);
      

    }
  }









  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent minW="60em">
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
            <Textarea value={desc} onChange={(event) => {
              setDesc(event.target.value);
            }}/>
          </FormControl>

          <FormControl>
            <FormLabel>Content</FormLabel>
            <Textarea minH="20em" value={content} onChange={(event) => {
              setContent(event.target.value);
            }}/>
          </FormControl>

          <FormControl>
            <FormLabel>Category</FormLabel>
            <Input  value={cate} readOnly></Input> 
           
            
            <SimpleGrid columns={2} spacing={10}>
            <ButtonGroup size='sm' isAttached variant='outline'>
            <Input mr='-px'
              value={cateSignle}
              onChange={(e)=>setCateSignle(e.target.value)}
              placeholder="Categories" 
            />
            <IconButton h='auto' onClick={() => addCategories(cateSignle)} icon={<AddIcon />} />
            <IconButton h='auto' onClick={() => deleteCategories(cateSignle)} icon={<MinusIcon />} /> 
            </ButtonGroup>

            </SimpleGrid>
          </FormControl>
          
          <FormControl>
            <FormLabel>Visibility</FormLabel>
              <RadioGroup onChange={setVisibility} value={visibility}>
                <Stack direction='row'>
                  <Radio value='PUBLIC'>PUBLIC</Radio>
                  <Radio value='FRIENDS'>FRIENDS</Radio>
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
        <Button mr="2"  bg="red.400" onClick={ () => {deletePost();window.location.reload(); } }>
            Delete
          </Button>
          <Button mr="2" bg="teal.200" onClick={ () => {updatePost();window.location.reload(); } }>
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