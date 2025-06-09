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
