import { getAccessToken } from "../utils/getAccessToken";
import axios from "axios";

export const fetchStoreConfig = async (storeCode: string) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_BASE_URL}api/logo?storeCode=${storeCode}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data, "response.data");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching logo details:", error);
  }
};

interface Product {
  product_id: string;
  quantity: number;
}

export const createBasket = async (token: string) => {
  const URL = `${import.meta.env.VITE_SERVER_BASE_URL}`;
  try {
    const response = await axios.post(
      `${URL}api/basket/create`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (response.status === 201 && response.data) {
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

export const addProductToBasket = async (
  basketId: string,
  products: Product[],
  token: string
) => {
  const URL = `${import.meta.env.VITE_SERVER_BASE_URL}`;
  try {
    const response = await axios.post(
      `${URL}api/basket/add-product/${basketId}`,
      products,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (response.status === 200 && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error adding products to basket:",
        error.response || error.message
      );
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};
