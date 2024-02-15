export const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;
export const CREATE_ADDRESS = () => `${API_URL}/address`;
export const GET_ADDRESS_LIST = () => `${API_URL}/address`;
export const DELETE_ADDRESS = (id: string) => `${API_URL}/address/${id}`;
export const PATCH_ADDREES = (id: string,isCurrentLocation: boolean) => `${API_URL}/address/${id}`;
