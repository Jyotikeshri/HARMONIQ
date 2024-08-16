import { API_URI } from "@/utils/constants";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: API_URI,
});
