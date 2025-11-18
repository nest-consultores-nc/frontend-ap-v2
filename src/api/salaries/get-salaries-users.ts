import { fetchFromApi } from '.';
import { IUsers } from '../../interfaces/users/users.interface';

export const fetchUsers = async (token: string): Promise<IUsers[]> => {
  const response = await fetchFromApi<IUsers[]>('usuarios', token, 'GET');
  return response;
};
