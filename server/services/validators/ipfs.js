const yup = require('yup');
const {
  FormValidationError,
} = require('../../utils/ApiError');

exports.validateIpfsUpload = async (body) => {
  try {
    const schema = yup.object()
      .shape({
        name: yup.string('Name must be a string value')
          .required('Name is required'),
        description: yup.string('Description must be a string value')
          .required('Description is required'),
      });

    await schema.validate(body, {
      abortEarly: false,
    });
  } catch (e) {
    throw new FormValidationError(e, e.message);
  }
};

exports.validateIpfsUploadWithUrl = async (body) => {
  try {
    const schema = yup.object()
      .shape({
        name: yup.string('Name must be a string value')
          .required('Name is required'),
        description: yup.string('Description must be a string value')
          .required('Description is required'),
        imageUrl: yup.string('Image url must be a string value')
          .required('Image Url is required'),
      });

    await schema.validate(body, {
      abortEarly: false,
    });
  } catch (e) {
    throw new FormValidationError(e);
  }
};
