module.exports = {
  defaultServerResponse: {
    status: 400,
    message: '',
    body: {}
  },
  feedbackMessage: {
    FEEDBACK_FILE_CREATED:'Feedback Record Generated',
    FILE_NOT_GENERATED:'File Not Generated!',
    FEEDBACK_FETCH_SUCCESS: 'Feedbacks Fetched Successfully',
    NO_FEEDBACK_FOUND: 'No Feedback Found!',
    FEEDBACK_SUBMIT_SUCCESS: 'Feedback Submitted Successfully',
    FEEDBACK_AREADY_SUBMITTED: 'Sorry! You Have Already Submitted Your Feedback '
  },
  requestValidationMessage: {
    BAD_REQUEST: 'Invalid fields',
    TOKEN_MISSING: 'Token missing from header'
  },
  storeMessage: {
    WRONG_PINCODE: 'Incorrect Pincode!!',
    GET_ALL_STORE_SUCCESS: 'Store found in Given Location',
    STORE_NOT_FOUND: 'Store Not Found!'
  },

  userMessage: {
    PROFILE_VIEW_SUCCESS: 'Profile viewed successfully',

    SIGNUP_SUCCESS: 'Signup Success',
    LOGIN_SUCCESS: 'Login Success',
    PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
    PASSWORD_CHANGE_FAILED: 'Incorrect Password/new Password not matched ',
    FORGOTPASSWORD_EMAIL_VALIDATION_SUCCESS: 'Email Validation Success',
    FORGOTPASSWORD_OTP_VALIDATION_SUCCESS: 'Otp Validation Success',
    DUPLICATE_EMAIL: 'User already exist with given email',
    USER_NOT_FOUND: 'User not found',
    INVALID_PASSWORD: 'Incorrect Email/Password',
    PASSWORD_MISSING: 'Password Missing',
    USERNAME_MISSING: 'Username Missing',
    POS_CODE_MISSING: 'POS_CODE Missing',
    USER_DETAILS: 'User Details',
    USER_UPDATED: 'User Updated Successfully',
    CONNECTION_SUCCESS: 'Connection Established',
    CONNECTION_FAILED: 'Connection Failed',
    INVALID_REQUEST_ID: 'Invalid request_id',
    INVALID_REQUEST_TYPE: 'Incorrect REQUEST_TYPE',
    USER_BLACKLISTED: 'You have been blacklisted. Please contact administrator.',
    INVALID_OTP: 'Invalid OTP',
    OTP_SENT: 'OTP sent to your mobile number and email address registered with us',
    LOGIN_REQUIRED: 'Login required',
    VOUCHER_DATA_FETCHED: 'Vouchers fetched.',
    UPDATE: 'Profile update successfully.',
  },
  productMessage: {
    RESOURCE_FOUND: "Resource found.",
    RESOURCE_NOT_FOUND: "Sorry, Resorce not found.",
  },
  cartMessage: {
    RESOURCE_FOUND: "Cart data fetched.",
    RESOURCE_NOT_FOUND: "Sorry, We can't find previous cart history.",
    PRODUCT_ADD: "Product added Successfully.",
    PRODUCT_REMOVE: "Product removed Successfully.",
    CART_CLEAR: "Your cart is empty.",
    TRY_AGAIN: "Please try again!!!.",
  },
  orderMessage: {
    RESOURCE_FOUND: "Your orders.",
    ORDER_PLACED: "Order placed successfully.",
    ORDER_HOLD: "Your order in hold.",
    RESOURCE_NOT_FOUND: "No previous order found.",
    TRY_AGAIN: "Please try again!!!.",
    DOWNLOADED: "Your Order downloaded successfully..",
  },
  BANNER_IMAGE: {
    UPLOADED: "Image upload successfully.",
    UPDATED: "Update successfully.",
    TRY_AGAIN: "Please try again!!!.",
  }
}