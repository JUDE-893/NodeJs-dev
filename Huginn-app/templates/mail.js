export const passwordResetMail = ({host, protocol, token, mail}) => {
  let url = `${protocol}://${host}/api/auth/password-reset/${token}`
  let text = `<p>You did submited a request for resetting your <strong>Natour</strong> account using this email address : ${mail}</p>
  <br/> To process please click the confirmation <a href='${url}'>link</a><br/>
  if you did not submit ant reset password request, you can safely ignore this email.
  `
}
