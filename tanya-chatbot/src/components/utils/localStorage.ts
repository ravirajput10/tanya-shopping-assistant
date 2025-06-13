const BASKET_ID_KEY = "sfcc_basket_id";
const TOKEN_KEY = "sfcc_token";

export const getStoredBasketId = (): string | null => {
  try {
    return localStorage.getItem(BASKET_ID_KEY);
  } catch (error) {
    console.error("Error reading basket ID from storage:", error);
    return null;
  }
};

export const setStoredBasketId = (basketId: string | null): void => {
  try {
    if (basketId) {
      localStorage.setItem(BASKET_ID_KEY, basketId);
    } else {
      localStorage.removeItem(BASKET_ID_KEY);
    }
  } catch (error) {
    console.error("Error saving basket ID to storage:", error);
  }
};

export const clearBasketStorage = (): void => {
  try {
    localStorage.removeItem(BASKET_ID_KEY);
  } catch (error) {
    console.error("Error clearing basket storage:", error);
  }
};

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error reading token:", error);
    return null;
  }
};

export const setStoredToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error("Error storing token:", error);
  }
};
