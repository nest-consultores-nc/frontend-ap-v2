/**
 * Checks if all values in the provided data object are not empty strings.
 *
 * @function
 * @param {Object} data - An object representing the data from a form.
 * @returns {boolean} Returns `true` if all values in the `data` object are not empty strings, otherwise returns `false`.
 *
 * @example
 * const formData = {
 *   name: 'John',
 *   age: '25',
 *   address: '123 Main St.'
 * };
 *
 * console.log(isFormValid(formData));  // true
 *
 * const incompleteData = {
 *   name: 'John',
 *   age: '',
 *   address: '123 Main St.'
 * };
 *
 * console.log(isFormValid(inc ompleteData));  // false
 */
export const isFormValid = (data = {}) => {
  return Object.values(data).every((value) => value !== '')
}
