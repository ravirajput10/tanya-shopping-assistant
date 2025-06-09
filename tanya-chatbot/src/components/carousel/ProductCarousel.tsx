/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from "react-redux";
import type { SearchProduct } from "../graphQL/queries/types";
import {
  stringReducer,
  priceFormatter,
  currencyFormatter,
  displayData,
  imageUrlArray,
} from "../utils/helper";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { setProduct } from "../../store/reducers/productReducer";

const ProductCarousel = ({
  product,
  storeDetails,
}: {
  product: SearchProduct[];
  storeDetails: any;
}) => {
  const dispatch = useDispatch();
  const selectedProduct = useSelector((state: any) => state.product.product);
  const [startIndex, setStartIndex] = useState(0);
  const productsPerPage = selectedProduct ? 2 : 4;

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
  console.log(product, "product");
  return (
    <div className="mb-4">
      <div className="flex items-center justify-center mt-4 gap-4">
        {product?.length > productsPerPage && (
          <button
            onClick={prevProducts}
            className="text-white p-2 rounded flex items-center h-fit"
            style={{ color: storeDetails.tanyaThemeColor }}
          >
            <Icon icon="mdi:chevron-left" width="25" />
          </button>
        )}

        <div className="flex gap-4 justify-center flex-1">
          {product
            .slice(startIndex, startIndex + productsPerPage)
            .map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col w-[150px] h-[200px] items-center justify-between cursor-pointer shadow-lg bg-white rounded-[8px] overflow-visible" // Make sure overflow is visible
                onClick={() => {
                  // navigate(`/product/${prod.id}?category=${prod.category}`);
                  dispatch(setProduct(prod));
                }}
              >
                {/* Image */}
                <div className="w-full flex items-center justify-center p-2 bg-white">
                  <img
                    src={imageUrlArray(prod)[0]}
                    alt={
                      prod?.title
                        ? prod.title
                        : displayData(prod?.name["en-US"]) || "Product"
                    }
                    className="w-16 h-16 rounded-[3px] transition-transform duration-300 hover:scale-125 object-cover"
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
                        : stringReducer(displayData(prod?.name["en-US"]), 60) ||
                          "Product"}
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
                        : stringReducer(displayData(prod?.name["en-US"]), 60) ||
                          "Product"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {product?.length > productsPerPage && (
          <button
            onClick={nextProducts}
            className="text-white p-2 rounded flex items-center h-fit"
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
