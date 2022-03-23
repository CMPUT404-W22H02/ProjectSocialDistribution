const validate = values => {
    const errors = {}
    if (!values.title) {
      errors.title = 'Required'
    }
    if (!values.description) {
      errors.description = 'Required'
    }
    if (!values.content) {
        errors.content = 'Required'
      }
    if (!values.categories) {
    errors.categories = 'Required'
    }

    if (!values.visibility) {
      errors.visibility = 'You choose public'
    } else if (values.visibility === 'true') {
      errors.visibility = 'You choose unpublic'
    }
    return errors
  }
  export default validate