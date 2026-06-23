import axios from "axios";
import { encryptPayload } from "./jwe.service.js";

const getClient = () => {
  return axios.create({
    baseURL: process.env.RAMFINCORP_BASE_URL,
    headers: {
      Authorization: process.env.RAMFINCORP_AUTH,
      "Content-Type": "application/jose",
    },
  });
};

export const checkDedupe = async (
  mobile,
  pancard
) => {
  try {
    const client = getClient();

    const encryptedPayload =
      await encryptPayload({
        mobile,
        pancard,
      });

    const response = await client.post(
      "/dsa/v2/check_dedupe",
      encryptedPayload
    );

    return response.data;
  } catch (error) {
    console.error(
      "Dedupe Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const createLead = async (
  leadData
) => {
  try {
    const client = getClient();

    const encryptedPayload =
      await encryptPayload(leadData);

    const response = await client.post(
      "/dsa/v2/lead_create",
      encryptedPayload
    );

    return response.data;
  } catch (error) {
    console.error(
      "Lead Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};