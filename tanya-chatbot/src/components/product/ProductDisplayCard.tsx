/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Icon } from "@iconify/react";
import { setProduct } from "../../store/reducers/productReducer";
import { addProductToBasket, createBasket } from "../api/api";
import { fetchTokenSFCC } from "../utils/fetchTokenSFCC";
import {
  getStoredBasketId,
  getStoredToken,
  setStoredBasketId,
  setStoredToken,
} from "../utils/localStorage";
import { toast } from "react-toastify";
import { TOKEN_EXPIRY_KEY } from "../../config/constant";

const ProductDisplayCard = () => {
  const dispatch = useDispatch();
  const product = useSelector((state: any) => state.product.product);
  const storeDetails = useSelector((s: any) => s.store.store);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedWidth, setSelectedWidth] = useState<string>("");

  // Memoize attributes to prevent recalculation on every render
  const attributes = useMemo(() => {
    if (!product?.variation_attributes)
      return { sizeAttr: null, colorAttr: null, widthAttr: null };

    return {
      sizeAttr: product.variation_attributes.find((a: any) => a.id === "size"),
      colorAttr: product.variation_attributes.find(
        (a: any) => a.id === "color"
      ),
      widthAttr: product.variation_attributes.find(
        (a: any) => a.id === "width"
      ),
    };
  }, [product?.variation_attributes]);

  // Update selected values when product or attributes change
  useEffect(() => {
    if (!product?.variation_attributes) return;

    const { sizeAttr, colorAttr, widthAttr } = attributes;

    setSelectedSize(sizeAttr?.values?.[0]?.value || "");
    setSelectedColor(colorAttr?.values?.[0]?.value || "");
    setSelectedWidth(widthAttr?.values?.[0]?.value || "");
  }, [product, attributes]);

  if (!product) return null;

  const { sizeAttr, colorAttr, widthAttr } = attributes;

  const addToCart = async () => {
    try {
      // Check if product and variants exist
      if (!product?.variants?.[0]?.product_id) {
        console.error("No product variant found");
        return;
      }

      const productData = [
        {
          product_id: product.variants?.[0].product_id,
          quantity: 1,
        },
      ];

      let token = getStoredToken();
      const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      const currentTime = Date.now();

      // If no token, get a new one
      if (!token || !tokenExpiry || currentTime >= parseInt(tokenExpiry)) {
        // Get token once and use it for both calls (createBasket, addProductToBasket)
        token = await fetchTokenSFCC();
        if (!token) {
          console.error("Failed to get token");
          return;
        }
        // Store new token with expiry time (4 minutes from now)
        const newExpiryTime = currentTime + 4 * 60 * 1000; // 4 minutes in milliseconds
        setStoredToken(token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, newExpiryTime.toString());

        // Create new basket with new token
        const basketResponse = await createBasket(token);
        if (!basketResponse?.basket_id) {
          console.error("Failed to create basket");
          return;
        }

        // Store new basket ID
        setStoredBasketId(basketResponse.basket_id);

        // Add product to new basket
        const response = await addProductToBasket(
          basketResponse.basket_id,
          productData,
          token
        );

        if (response?.product_items?.length > 0) {
          const addedProduct = response.product_items.at(-1);
          // const addedProduct = response.product_items[response.product_items.length - 1];
          addedProduct.product_name;
          addedProduct.product_id;
          toast.success(`Added to cart`, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } else {
        // Use existing token and basket ID
        const basketId = getStoredBasketId();
        if (!basketId) {
          console.error("No basket ID found");
          return;
        }

        const response = await addProductToBasket(basketId, productData, token);
        if (response?.product_items?.length > 0) {
          const addedProduct = response.product_items.at(-1);
          // const addedProduct = response.product_items[response.product_items.length - 1];
          addedProduct.product_name;
          addedProduct.product_id;
          toast.success(`Added to cart`, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart", {
        position: "bottom-right",
        autoClose: 3000,
      });

      if (
        error?.response?.status === 404 || // Basket not found
        error?.response?.status === 401 // Unauthorized/expired
      ) {
        // Clear only basket ID for 404
        if (error?.response?.status === 404) {
          setStoredBasketId(null);
        }
        // Clear both for 401
        if (error?.response?.status === 401) {
          setStoredBasketId(null);
          setStoredToken(null);
        }
      } else {
        console.error("Failed to add product to basket:", error.message);
        toast.error("Failed to add product to cart", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
      />
      <div className="flex flex-col gap-2 items-center h-[90vh] absolute right-0 bottom-0 z-50 w-full md:w-1/2 md:h-[100vh] lg:w-1/2 lg:h-[100vh] shadow-xl p-2 border-l-2 bg-white border-gray-200 overflow-y-scroll">
        {/* name and close button  */}
        <div className="mt-3 flex flex-row justify-between w-full ">
          <div>
            <p className="text-[#000000] font-bold font-nunitoSans">
              {product.name}
            </p>
          </div>
          <div>
            <Icon
              icon="mdi:close"
              className="text-[#555555] w-6 h-6"
              onClick={() => dispatch(setProduct(null))}
            />
          </div>
        </div>
        {/* image and variants */}
        <div className="flex flex-row gap-2 items-center flex-wrap">
          <div className="flex flex-row items-center justify-center  w-[120px] h-[120px] my-5">
            <img
              src={
                product.image_groups?.[0]?.images?.[0]?.link ||
                "https://via.placeholder.com/120"
              }
              alt={product.name}
              className="rounded-[10px]"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            {product.image_groups
              .slice(1, 2)
              .map((group: any) =>
                group.images
                  .slice(0, 3)
                  .map((image: any) => (
                    <img
                      key={image.link}
                      src={image.link}
                      alt={product.name}
                      className="rounded-[10px] w-[60px] h-[60px]"
                    />
                  ))
              )}
          </div>
        </div>
        {/* price and discount */}
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center gap-2">
            <p className="text-[#14121F] font-bold font-nunitoSans">
              {" "}
              ${product.price.toFixed(2)}
            </p>{" "}
            <p className="text-[#14121F] font-normal line-through text-sm font-nunitoSans">
              {" "}
              ${(product.price + 5).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[#EC5050] font-bold font-nunitoSans">
              {product.discount}
            </p>
          </div>
        </div>
        {/* horizontal line */}
        <div className="mt-2 w-full border-t-2 border-gray-200"></div>
        {/* Size */}
        {sizeAttr ? (
          <div className="mt-3 flex flex-col justify-between w-full text-gray-500">
            <div className="text-[#323135] font-semibold font-nunitoSans">
              Select Size
            </div>
            <div className="flex flex-row flex-wrap items-center gap-4 mt-3">
              {sizeAttr.values.map((size: any) => (
                <div
                  key={size.value}
                  className={`border border-[#A7A5AF] text-[#323135] font-normal font-nunitoSans rounded-[6px] w-[30px] h-[30px] p-2 flex-wrap text-xs flex items-center justify-center cursor-pointer ${
                    selectedSize === size.value ? "text-[#FBFBFC]" : ""
                  }`}
                  onClick={() => setSelectedSize(size.value)}
                  style={{
                    backgroundColor:
                      selectedSize === size.value
                        ? storeDetails.tanyaThemeColor
                        : "transparent",
                  }}
                >
                  {size.name}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Color */}
        {colorAttr ? (
          <div className="mt-3 flex flex-col justify-between w-full text-gray-500">
            <div className="text-[#323135] font-[600] font-nunitoSans">
              Select Color
            </div>
            <div className="flex flex-row items-center gap-5 mt-3">
              {colorAttr.values.map((color: any) => (
                <div
                  key={color.value}
                  className={`w-[25px] h-[25px] rounded-full cursor-pointer ${
                    selectedColor === color.value
                      ? "border-2 border-[#6A70FF]"
                      : ""
                  }`}
                  style={{
                    backgroundColor: color.name?.toLowerCase() || "#ccc",
                  }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                ></div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Width */}
        {widthAttr ? (
          <div className="mt-3 flex flex-col justify-between w-full text-gray-500">
            <div className="text-[#323135] font-semibold font-nunitoSans">
              Select Width
            </div>
            <div className="flex flex-row items-center gap-4 mt-3">
              {widthAttr.values.map((width: any) => (
                <div
                  key={width.value}
                  className={`border border-[#A7A5AF] text-[#323135] font-normal font-nunitoSans rounded-[6px] w-[40px] h-[30px] text-xs flex items-center justify-center cursor-pointer ${
                    selectedWidth === width.value ? "text-[#FBFBFC]" : ""
                  }`}
                  onClick={() => setSelectedWidth(width.value)}
                  style={{
                    backgroundColor:
                      selectedWidth === width.value
                        ? storeDetails.tanyaThemeColor
                        : "transparent",
                  }}
                >
                  {width.name}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {/* Description */}
        <div className="w-full text-left">
          <div className="text-[#323135] font-bold font-nunitoSans mt-3 text-[14px]">
            Product Details
          </div>
          <div
            className="text-[#68656E] font-normal font-nunitoSans text-xs pl-2 mt-3"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          ></div>
        </div>
        {/* rating and reviews */}
        <div className="mt-4 flex flex-col gap-2 w-full p-2">
          <div className="flex flex-row items-center gap-2">
            <div className="flex items-center gap-2 text-left font-nunitoSans">
              <div className="text-[#323135] font-bold">
                {product?.rating?.rate || 0} /{" "}
                <span className="text-[#68656E]">5</span>
              </div>
              <div className="text-[#323135] font-semibold text-sm">
                Overall Rating
              </div>
              <div className="text-[#68656E] font-semibold text-sm">
                {product?.rating?.count || 0} ratings
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-row items-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Icon
                key={index}
                icon="mdi:star"
                width="20"
                height="20"
                className={`text-yellow-500 
                ${
                  product?.rating?.rate > index
                    ? "text-yellow-500"
                    : "text-gray-300"
                }
              `}
              />
            ))}
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-between font-nunitoSans font-semibold w-5/6 text-black gap-2"
          style={{ marginTop: "150px" }}
        >
          <button
            className="rounded-[5px] shadow-sm text-[#FBFBFC] bg-[#6851C6] p-2 w-full text-center cursor-pointer"
            style={{ backgroundColor: storeDetails.tanyaThemeColor }}
            onClick={addToCart}
          >
            Add to Cart
          </button>
          <button
            className="rounded-[5px] shadow-sm text-[#FBFBFC] bg-[#6851C6] p-2 w-full text-center cursor-pointer mb-16"
            style={{ backgroundColor: storeDetails.tanyaThemeColor }}
          >
            View more
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductDisplayCard;
