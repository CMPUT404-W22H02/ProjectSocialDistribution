const validate = values => {
    const errors = {}
    if (!values.Title) {
      errors.Title = 'Required'
    }
    if (!values.Description) {
      errors.Description = 'Required'
    }
    if (!values.Content) {
        errors.Content = 'Required'
      }
    if (!values.Categories) {
    errors.Categories = 'Required'
    }

    if (!values.unlisted) {
      errors.unlisted = 'You choose unlisted'
    } else if (values.unlisted === 'true') {
      errors.unlisted = 'You choose listed'
    }
    return errors
  }
  export default validate