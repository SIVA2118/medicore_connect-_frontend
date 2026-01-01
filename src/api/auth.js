import axios from "axios";

const API = axios.create({
  baseURL: "https://medicore-connect.onrender.com/api",
});

// Separate login APIs
export const loginAdmin = (data) =>
  API.post("/admin/login", data);

export const loginReceptionist = (data) =>
  API.post("/receptionist/login", data);

export const loginDoctor = (data) =>
  API.post("/doctor/login", data);

export const loginScanner = (data) =>
  API.post("/scanner/login", data);

export const loginBiller = (data) =>
  API.post("/biller/login", data);

export const loginLab = (data) =>
  API.post("/lab/login", data);
