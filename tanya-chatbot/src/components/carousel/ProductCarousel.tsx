/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from "react-redux";
import type { SearchProduct } from "../graphQL/queries/types";
import {
  stringReducer,
  priceFormatter,
  currencyFormatter,
  displayData,
  imageUrlArray,
} from "../utils/helper";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import { setProduct } from "../../store/reducers/productReducer";
import { getProductById } from "../utils";

function useResponsiveProductsPerPage() {
  const getProductsPerPage = () => {
    if (window.innerWidth < 425) return 1; // Below Mobile-L
    if (window.innerWidth < 768) return 2; // Mobile-L to md
    return 4; // md and above
  };

  const [productsPerPage, setProductsPerPage] = useState(getProductsPerPage);

  useEffect(() => {
    const handleResize = () => setProductsPerPage(getProductsPerPage());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return productsPerPage;
}

const ProductCarousel = ({
  product,
  storeDetails,
}: {
  product: SearchProduct[];
  storeDetails: any;
}) => {
  const dispatch = useDispatch();
  // const selectedProduct = useSelector((state: any) => state.product.product);
  const productsPerPage = useResponsiveProductsPerPage();
  const [startIndex, setStartIndex] = useState(0);

  const nextProducts = () => {
    setStartIndex((prevIndex) =>
      prevIndex + productsPerPage >= product.length
        ? 0
        : prevIndex + productsPerPage
    );
  };

  const prevProducts = () => {
    setStartIndex((prevIndex) =>
      prevIndex - productsPerPage < 0
        ? product.length - (product.length % productsPerPage || productsPerPage)
        : prevIndex - productsPerPage
    );
  };

  const getProduct = async (id: number | string) => {
    const product = await getProductById(id);
    dispatch(setProduct(product));
  };

  return (
    <div className="mb-4 overflow-x-hidden">
      <div className="flex items-center justify-center mt-4 gap-4 relative">
        {product?.length > productsPerPage && (
          <button
            onClick={prevProducts}
            className="absolute left-0 z-10 text-white p-2 rounded flex items-center h-fit"
            style={{ color: storeDetails.tanyaThemeColor }}
          >
            <Icon icon="mdi:chevron-left" width="25" />
          </button>
        )}

        <div className="flex gap-4 justify-center flex-1 overflow-hidden px-8">
          {product
            .slice(startIndex, startIndex + productsPerPage)
            .map((prod) => (
              <div
                key={prod.product_id}
                className="flex-shrink-0 flex flex-col w-[150px] h-[200px] items-center justify-between cursor-pointer shadow-lg bg-white rounded-[8px]"
                onClick={() => {
                  // navigate(`/product/${prod.id}?category=${prod.category}`);
                  getProduct(prod.product_id || "");
                }}
              >
                {/* Image */}
                <div className="w-full flex items-center justify-center p-4 bg-white">
                  <img
                    src={
                      imageUrlArray(prod)[0]?.link ||
                      imageUrlArray(prod)[0] || // fallback if it's a string
                      "https://via.placeholder.com/120"
                    }
                    alt={prod?.title ? prod.title : "Product"}
                    className="w-20 h-20 rounded-[3px] transition-transform duration-300 hover:scale-125 object-cover"
                  />
                </div>

                {/* Price & Name */}
                <div
                  className="text-white w-full rounded-[8px] p-2 text-[12px] text-center h-[60px]"
                  style={{ background: storeDetails.tanyaThemeColor }}
                >
                  <div className="text-[14px] mb-1">
                    {currencyFormatter(
                      prod?.price
                        ? Number(prod?.price)
                        : priceFormatter(prod).centAmount || 0,
                      priceFormatter(prod)?.currencyCode
                    )}
                  </div>
                  <div className="relative inline-block group">
                    <div className="w-full line-clamp-1 overflow-hidden text-ellipsis">
                      {prod?.title
                        ? prod.title
                        : prod?.product_name
                        ? prod.product_name
                        : stringReducer(
                            displayData(prod?.name?.["en-US"]),
                            60
                          ) || "Product"}
                    </div>

                    {/* Tooltip */}
                    <div
                      className="absolute left-0 top-full mt-1 w-max max-w-[200px] p-2 bg-white shadow-lg text-black text-xs rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-50 pointer-events-auto"
                      style={{
                        position: "absolute",
                        top: "-100%",
                        left: "0",
                        marginBottom: "5px",
                        zIndex: 50,
                      }}
                    >
                      {prod?.title
                        ? prod.title
                        : prod?.product_name
                        ? prod.product_name
                        : stringReducer(
                            displayData(prod?.name?.["en-US"]),
                            60
                          ) || "Product"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {product?.length > productsPerPage && (
          <button
            onClick={nextProducts}
            className="absolute right-0 z-10 text-white p-2 rounded flex items-center h-fit"
            style={{ color: storeDetails.tanyaThemeColor }}
          >
            <Icon icon="mdi:chevron-right" width="25" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;
