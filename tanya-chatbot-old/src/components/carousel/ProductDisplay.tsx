/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductCarousel from "./ProductCarousel";
import { initialCapital } from "../utils/helper";

const ProductDisplay = ({ chat, storeDetails }: any) => {
  return (
    <div className="text-sm text-[#232323] bg-[#FFFFFF] px-7 py-4 rounded-r-xl rounded-bl-2xl w-full">
      {chat.map((products: any, i: number) => (
        <div
          key={i}
          className="mb-4 p-3 rounded-xl"
          style={{ backgroundColor: storeDetails.tanyaThemeColorLight }} // slightly darker grey // light grey section bg
        >
          <div
            className="font-semibold mb-2 border p-2 w-fit rounded-[20px]"
            style={{
              color: storeDetails?.tanyaThemeContrastColor,
              border: `1px solid ${storeDetails.tanyaThemeColor}`,
              backgroundColor: storeDetails.tanyaThemeColor,
            }}
          >
            {initialCapital(products.keyword) || "No keyword"}
          </div>

          <ProductCarousel
            product={products.items}
            storeDetails={storeDetails}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductDisplay;
