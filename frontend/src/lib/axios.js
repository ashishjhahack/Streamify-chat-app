import axios from "axios";

// this base_url should be the same as the one in the backend
// by this we don't haveb to write the full URL in every request
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});