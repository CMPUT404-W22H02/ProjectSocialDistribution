/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { render } from "react-dom";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Checkbox,
  Progress,
  Radio,
  RadioGroup,
  Text,
  Image,
  Grid,
  GridItem,
  Textarea, useToast, SimpleGrid, IconButton, Stack
} from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import axios from "axios";
import { Form, Field, useField, useForm } from "react-final-form";
import validate from "./validate";
import NavbarAdd from "../../components/navbar/NavbarAdd";
import Identity from '../../model/Identity';
import {Refresh} from "../../../src/auth/Refresh"
import jwt_decode from "jwt-decode";
import {  AddIcon, MinusIcon } from '@chakra-ui/icons'

const base_url = process.env.REACT_APP_API_URL || 'https://psdt11.herokuapp.com/';
//import Cookies from "universal-cookie";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let identity =Identity.GetIdentity();

export default function CreatePost () {
    //const { token, setToken } = useState(localStorage.getItem("token"));
    //const { refreshToken, setRefreshToken } = useState(localStorage.getItem("refreshToken"));
    const [picture, setPicture] = useState('');
    const [show, setShow] = useState(false);
    const toast = useToast();
    const toastIdRef = useRef();
    const [status , setStatus]= useState();
    const [cateSignle, setCateSignle]= useState('');
    const [cate, setCate]=useState([]);
    const addCategories=(cateSignle)=>{
      //setCate(...name.value)
      console.log(cateSignle);
      setCate(prevArray => [...prevArray, cateSignle]);
      setCateSignle("");
    }
    const deleteCategories=(cateSignle)=>{
      //setCate(...name.value)
      //console.log("--",input.value)
      //console.log(cate)
      const cate_ = [...cate];
      const idx = cate_.indexOf(cateSignle);
      cate_.splice(idx, 1);
      setCate(() => [...cate_]);
      setCateSignle("");

    }
    function addToast(toast_data) {
        toastIdRef.current = toast(toast_data)
    }
    const onChangePicture = e => {
        setPicture(URL.createObjectURL(e.target.files[0]));
    };

    function getAllAuthors(values, token ){
      axios.get(`${base_url}authors/`, {
              headers: {
              'Content-Type': 'application/json',
              "Authorization" : `Bearer ${token}`
              
              }})
          .then((data) => {
            console.log(data.data.items)
            for (let author of data.data.items) {
              console.log(author)
              if (author.id != identity.id){
              axios.post(`${author.id}/inbox`, 
              values,
              {
                headers: {
                  'Content-Type': 'application/json',
                  "Authorization" : `Bearer ${token}`
                  
                  }}).then((data)=>{
                    console.log("success post in inbox");
                    console.log(data)
                }
                  )
                  .catch(e=>console.log(e))


              }
              
            }
          }).catch((e)=>{
              console.log(e.response)
              setStatus(e.response.status)
              if (e.response.status===401){
                /* window.location.assign("/")
                window.localStorage.clear();
                window.sessionStorage.clear(); */
                
              }
              addToast({description: "create post not successfull",
              status: 'error', isClosable: true, duration: 1000,})
              
          })




    }
    function getAllFollowers(id, values, token ){
      axios.get(`${base_url}authors/${id}/followers`, {
              headers: {
              'Content-Type': 'application/json',
              "Authorization" : `Bearer ${token}`
              
              }})
          .then((data) => {
            console.log(data.data.items)
            
            console.log("++++++++++++followers++++++++++++",data.data)
            for (let author of data.data.items) {
              console.log(author.id)
              console.log(identity.id)
              if (author.id != identity.id){
                console.log("------------------")
                axios.post(`${author.id}/inbox`, 
              values,
              {
                headers: {
                  'Content-Type': 'application/json',
                  "Authorization" : `Bearer ${token}`
                  
                  }}).then((data)=>{
                    console.log("success indox", data)
                  })


              }
              
            }
          }).catch((e)=>{
              console.log(e.response.status)
              setStatus(e.response.status)
              if (e.response.status===401){
                /* window.location.assign("/")
                window.localStorage.clear();
                window.sessionStorage.clear(); */
                
              }
              addToast({description: "create post not successfull",
              status: 'error', isClosable: true, duration: 1000,})
              
          })




    }







    function sendRequest(id, values, token){
      axios.post(`${id}/posts/`,
          values, {
              headers: {
              'Content-Type': 'application/json',
              "Authorization" : `Bearer ${token}`
              
              }})
          .then((data) => {
            addToast({description: "create post successfull",
              status: 'success', isClosable: true, duration: 1000,});
              console.log("post - ", data)
              values = data.data;
              values['id'] = values['id']
              axios.get(`${id}`,
                          {
                              headers: {
                              "Content-Type": "application/json",
                              "Authorization" : `Bearer ${token}`
                      
                              },
                          })
                          .then(res => { 
                          values['author'] = res.data;
                          console.log("values = ", values)
                            if (values.visibility==="FRIENDS"){
                              console.log(id)
                              let id_uuid = id.slice(-36, id.length)
                              getAllFollowers(id_uuid, values, token)
                            }else{
                              getAllAuthors(values, token)
                            }
                          }
          
          )}).catch((e)=>{
            console.log(e.response)
              console.log(e.response.status)
              setStatus(e.response.status)
              addToast({description: "create post not successfull",
              status: 'error', isClosable: true, duration: 1000,})
              
          })
          

    }
    const onSubmit = async values => {
    //window.alert(JSON.stringify(values, 0, 2));
    const id = identity.id
    let token = localStorage.getItem("token")
    let refreshToken = localStorage.getItem("refreshToken")
    console.log("--", token)
    console.log("-1-", refreshToken)
    let decodedToken = jwt_decode(token);
    let currentDate = new Date();

    var info;
    axios.get(`${id}`,
      {
          headers: {
          "Content-Type": "application/json",
          "Authorization" : `Bearer ${token}`
  
          },
      })
      .then(res => { 
      info = res.data;
      //values['author']=info
      values['content_type']='text/plain'
      values['type']="post"
      values['categories']=JSON.stringify(cate)
      sendRequest(id, values, token)
      }).catch(e => {
          console.log("error-----")
          //console.log(token)
          console.log(e)
      })

    // JWT exp is in seconds
  }

          



    return (
    <><NavbarAdd /><Grid
            templateRows='repeat(3, 1fr)'
            templateColumns='repeat(5, 1fr)'
            gap={10}
            p={10}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="1px 1px 3px rgba(0,0,0,0.3)"
        >
        <GridItem rowSpan={3} colSpan={3} bg='white'>

                <Heading as="h1" size="xl" textAlign="center">
                    Create a post
                </Heading>
                
                <Form
                    onSubmit={onSubmit}
                    validate={validate}
                    render={({
                        handleSubmit, form, errors, submitting, pristine, values
                    }) => (
                        <Box
                            as="form"
                            onSubmit={handleSubmit}
                        >
                            <InputControl w={400} name="title" label="Title" />
                            <InputControl w={400} name="description" label="Description" />
                            {!picture ?

                                <InputControl name="content" label="Content" />
                                :
                                setShow(true)
                            }

                            <ButtonGroup size='sm' isAttached variant='outline'>
                                <input
                                    type="file"
                                    name="myImage"
                                    onChange={onChangePicture} />
                                <Button variant='outline' onClick={() => (setPicture(""))}>Remove</Button>
                            </ButtonGroup>
                            {/* <CateControl name="categories" label="Categories" /> */}
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
                            <CheckboxControl name="unlisted">Unlisted</CheckboxControl>
                            <Field
                                name="visibility"
                                component={AdaptedRadioGroup}
                                label="Visibility"
                            >
                                <Radio value="PUBLIC" color="teal">
                                     PUBLIC
                                </Radio>
                                <Radio value="FRIENDS" color="green">
                                        FRIENDS
                                </Radio>
                            </Field>
                            <PercentComplete size="sm" my={5} hasStripe isAnimated />
                            <ButtonGroup spacing={4}>
                                <Button
                                    isLoading={submitting}
                                    loadingText="Submitting"
                                    color="teal.500"
                                    type="submit"
                                >
                                    Submit
                                </Button>
                                <Button
                                    variantcolor="teal"
                                    variant="outline"
                                    onClick={form.reset}
                                    isDisabled={submitting || pristine}
                                >
                                    Reset
                                </Button>
                            </ButtonGroup>
                            <Box as="pre" my={10}>
                                
                                
                                
                            </Box>
                        </Box>

                    )} />
                </GridItem>
                <GridItem borderWidth="1px"
                            borderRadius="lg"
                            boxShadow="1px 1px 3px rgba(0,0,0,0.3)" 
                            colStart={4} colEnd={6} rowStart={2} h='auto' >
                    {show?
                    
                    <><Text mb='10px'>Picture:</Text>
                    <Image  size="xl" src={picture}></Image></>

                    :
                    <Textarea isDisabled placeholder='Here is image' />

                    }
                
                </GridItem>

                
        </Grid></>
    )
};


const CheckboxControl = ({ name, value, children }) => {
  const {
    input: { checked, ...input },
    meta: { error, touched, invalid }
  } = useField(name, {
    type: "checkbox" // important for RFF to manage the checked prop
  });
  return (
    <FormControl isInvalid={touched && invalid} my={4}>
      <Checkbox {...input} isInvalid={touched && invalid} my={4}>
        {children}
      </Checkbox>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};


const AdaptedRadioGroup = ({ input, meta, label, children }) => (
  <FormControl isInvalid={meta.touched && meta.invalid} my={4}>
    <FormLabel htmlFor={input.name}>{label}</FormLabel>
    <RadioGroup {...input}>{children}</RadioGroup>
    <FormErrorMessage>{meta.error}</FormErrorMessage>
  </FormControl>
);

const Control = ({ name, ...rest }) => {
  const {
    meta: { error, touched }
  } = useField(name, { subscription: { touched: true, error: true } });
  return <FormControl {...rest} isInvalid={error && touched} />;
};

const Error = ({ name }) => {
  const {
    meta: { error }
  } = useField(name, { subscription: { error: true } });
  return <FormErrorMessage>{error}</FormErrorMessage>;
};

const InputControl = ({ name, label }) => {
  const { input, meta } = useField(name);
  return (
    <Control name={name} my={4}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Input
        {...input}
        isInvalid={meta.error && meta.touched}
        id={name}
        placeholder={label}
      />
      <Error name={name} />
    </Control>
  );
};

const PercentComplete = props => {
  const form = useForm();
  const numFields = form.getRegisteredFields().length;
  const numErrors = Object.keys(form.getState().errors).length;
  return (
    <Progress
      value={numFields === 0 ? 0 : ((numFields - numErrors) / numFields) * 100}
      {...props}
    />
  );
};
