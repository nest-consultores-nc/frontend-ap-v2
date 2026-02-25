interface UserState {
  email: string
  password: string
}
export function isLoginFormIsValid(user: UserState): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailPattern.test(user.email)

  const isPasswordValid =
    user.password.trim().length > 0 && !/['"=;(){}<>]/.test(user.password) 

  return isEmailValid && isPasswordValid
}
