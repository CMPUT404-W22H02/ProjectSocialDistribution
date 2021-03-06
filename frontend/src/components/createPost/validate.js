const validate = values => {
    const errors = {}
    if (!values.title) {
      errors.title = 'Required'
    }
    if (!values.description) {
      errors.description = 'Required'
    }
  

    if (!values.visibility) {
      errors.visibility = 'Please choose public/friend'
    } else if (values.visibility === 'true') {
      errors.visibility = 'You choose unpublic'
    }
    return errors
  }
  export default validate