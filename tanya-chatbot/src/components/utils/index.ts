import axios from "axios";
import { getAccessToken } from "./getAccessToken";
import { type SearchConfig } from "../graphQL/queries/types";

export const getSearchResults = async (
  query: string,
  searchConfigs: SearchConfig,
) => {
  const token = await getAccessToken();
  if (!token) throw new Error("Failed to fetch token");
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_BASE_URL}api/search?query=${query}`,
      {
        searchConfigs,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.hits;
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};


export const getSearchResultsNew = async (
  query: string,
  searchConfigs: SearchConfig,
) => {
  const token = await getAccessToken();
  if (!token) throw new Error("Failed to fetch token");
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_BASE_URL}api/search?query=${query}`,
      {
        searchConfigs,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.hits;
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};