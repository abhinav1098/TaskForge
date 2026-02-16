import { api } from "../../lib/ApiClient";
import type {
  LoginPayload,
  TokenPair,
  TokenResponse,
  RefreshPayload,
} from "./types";


/* =============================
   LOGIN
============================= */

export const loginUser = async (
  payload: LoginPayload
): Promise<TokenPair> => {
  const formData = new URLSearchParams();
  formData.append("username", payload.username.trim());
  formData.append("password", payload.password);

  const response = await api.post<TokenPair>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};


/* =============================
   REFRESH ACCESS TOKEN
============================= */

export const refreshAccessToken = async (
  payload: RefreshPayload
): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>(
    "/auth/refresh",
    payload
  );

  return response.data;
};
