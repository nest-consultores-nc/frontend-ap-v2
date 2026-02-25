import { IProjectData } from "../interfaces/projects/project-form.interface"

/**
 *
 * @function
 * @param {Object} data 
 * @returns {boolean} 
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
export const isFormValid = <T extends object>(data: T): boolean => {
  return Object.values(data).every((value) => {
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return value > 0
    return value !== null && value !== undefined
  })
}


export const isProjectFormValid = (data: IProjectData): boolean => {
  return (
    data.project_name.trim() !== '' &&
    data.description.trim() !== '' &&
    Number(data.project_client_id) > 0 &&
    Number(data.project_type_id) > 0 &&
    Number(data.project_category_id) > 0
  )
}