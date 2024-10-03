interface UserState {
  email: string
  password: string
}
export function isLoginFormIsValid(user: UserState): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Valida que el email tenga un formato válido
  const isEmailValid = emailPattern.test(user.email)

  // Valida que la contraseña no esté vacía y no contenga caracteres peligrosos
  const isPasswordValid =
    user.password.trim().length > 0 && !/['"=;(){}<>]/.test(user.password) // Evita caracteres que podrían ser usados en SQL Injection

  return isEmailValid && isPasswordValid
}
