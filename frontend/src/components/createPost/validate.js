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

    if (!values.unlisted) {
      errors.unlisted = 'You choose unlisted'
    } else if (values.unlisted === 'true') {
      errors.unlisted = 'You choose listed'
    }
    return errors
  }
  export default validate