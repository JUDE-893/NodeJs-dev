export const passwordResetMail = ({token, mail}) => {
  let url = `${process.env.CLIENT_SCHEME}/reset-password/${token}`
  let text = `<p>You did submited a request for resetting your <strong>Huginn</strong> account password using this email address : ${mail}</p>
  <br/> To process please click the confirmation <a href='${url}'>link</a><br/>
  if you did not submit ant reset password request, you can safely ignore this email.
  `
  return text
}

export const accountVerificationMail = ({host, protocol, token, user}) => {
  let url = `${protocol}://${host}/huginn/api/auth/verify-Account/${token}`
  let text = `<strong>Hello ${user.name} !</strong><br><p><strong>Welcome to Huginn</strong>—your account has been successfully created! We're thrilled to have you on board. To ensure a secure and seamless experience, you'll need to verify your identity. This step helps protect your account and grants you access to all the features Huginn has to offer.</p><br><br>
  <br/> To process please click this confirmation <a href='${url}'>link</a><br/>
  if you did not attempted to create a Huginn account using this mail : ${user.email}, you can safely ignore this email.<br><br>If you need any assistance, we're here to help!
  `
  return text
}
