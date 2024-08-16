export const API_URI = import.meta.env.VITE_BACKEND_URL;

export const AUTH_ROUTES = `${API_URI}/api/auth`;

export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`;
export const UPDATE_USER_INFO = `${AUTH_ROUTES}/update-user`;
export const ADD_PROFILE_IMAGE = `${AUTH_ROUTES}/add-profile-image`;
export const REMOVE_PROFILE_IMAGE = `${AUTH_ROUTES}/remove-profile-image`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;

export const CONTACT_ROUTES = `${API_URI}/api/contact`;

export const SEARCH_CONTACT_ROUTE = `${CONTACT_ROUTES}/search`;
export const GET_ALL_CONTACTS = `${CONTACT_ROUTES}/get-all-contacts`;

export const MESSAGE_ROUTES = `${API_URI}/api/message`;

export const GET_MESSAGES = `${MESSAGE_ROUTES}/get-messages`;
export const GET_CONTACTS_DM = `${MESSAGE_ROUTES}/get-contact-for-dm`;
export const UPLOAD_FILE_ROUTE = `${MESSAGE_ROUTES}/upload-files`;

export const CHANNEL_ROUTES = `${API_URI}/api/channel`;
export const CREATE_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/create-channel`;
export const GET_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/get-all-channels`;
export const GET_CHANNEL_MESSAGES = `${CHANNEL_ROUTES}/get-channel-messages`;
