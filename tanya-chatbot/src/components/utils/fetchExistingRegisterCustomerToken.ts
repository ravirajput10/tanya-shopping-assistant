import axios from "axios";

interface Customer {
  access_token: string;
  customerId: string;
}

export const fetchExistingRegisterCustomerToken = async ({
  access_token,
  customerId,
}: Customer) => {
  const URL = `${import.meta.env.VITE_SERVER_BASE_URL}`;
  try {
    const response = await axios.post(
      `${URL}api/auth/token-existing-register-customer/${customerId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (response.status === 200 && response.data) {
      // console.log("customer token res fe", response.data)
      return response.data;
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating basket:", error.response || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

// This function needs to be change WIP.
// First create this fuction in the backend
export const fetchExistingGuestCustomerToken = async ({
  access_token,
  customerId,
}: Customer) => {
  const URL = `${import.meta.env.VITE_SERVER_BASE_URL}`;
  try {
    const response = await axios.post(
      `${URL}api/auth/token-existing-guest-customer/${customerId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (response.status === 200 && response.data) {
      // console.log("customer token res fe", response.data)
      return response.data;
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating basket:", error.response || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};
