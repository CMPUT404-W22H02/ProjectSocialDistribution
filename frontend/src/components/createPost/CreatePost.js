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
  Textarea, useToast
} from "@chakra-ui/react";
import axios from "axios";
import { Form, Field, useField, useForm } from "react-final-form";
import validate from "./validate";
import NavbarAdd from "../../components/navbar/NavbarAdd";
import Identity from '../../model/Identity';
const base_url = process.env.REACT_APP_API_URL || 'http://localhost:8000';
//import Cookies from "universal-cookie";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let identity = Identity.GetIdentity();

export default function CreatePost () {
    //const { id, setId } = useState(identity.id);
    //const { token, setToken } = useState(identity.token);
    const { refreshToken, setRefreshToken } = useState(identity.refreshToken);
    const [picture, setPicture] = useState('');
    const [show, setShow] = useState(false);
    const toast = useToast()
    const toastIdRef = useRef()
    //const  author_id = props?.location?.state?.author_id
    function addToast(toast_data) {
        toastIdRef.current = toast(toast_data)
    }
    const onChangePicture = e => {
        setPicture(URL.createObjectURL(e.target.files[0]));
    };
    console.log(identity)
    console.log(identity.id)
    //setId(identity.id)
    //setToken(identity.token)
    const id = identity.id
    const token = identity.token
    console.log(id)
    console.log(token)
    const onSubmit = async values => {
    await sleep(300);
    //window.alert(JSON.stringify(values, 0, 2));
    

    axios.post(`${id}/posts/`,
    values, {
        headers: {
        'Content-Type': 'application/json',
        "Authorization" : `Bearer ${token}`
        
        }})
    .then((data) => console.log(data),
    
    addToast({description: "create post successfull",
         status: 'success', isClosable: true, duration: 1000,})
    
    ).catch((e)=>{
        console.log(e)
        addToast({description: "create post not successfull",
        status: 'error', isClosable: true, duration: 1000,})
        
    })
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
                            <InputControl name="categories" label="Categories" />

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
                                <p>just for test , will delte in the future</p>
                                {JSON.stringify(values, 0, 2)}
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
