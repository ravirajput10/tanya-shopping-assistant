/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { setProduct } from "../../store/reducers/productReducer";
import { useDispatch } from "react-redux";

const size = ["S", "M", "L", "XL", "XXL"];
const colors = ["gray", "black", "beige", "brown", "wheat"];

const ProductDisplayCard = () => {
  const product = useSelector((state: any) => state.product.product);
  const storeDetails = useSelector((s: any) => s.store.store);
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]);
  const dispatch = useDispatch();
  if (!product) return null;

  return (
    <div className="flex flex-col gap-2 items-center h-[100vh] shadow-xl p-2 border-l-2 bg-white border-gray-200 w-1/2 overflow-y-scroll">
      {/* name and close button  */}
      <div className="mt-3 flex flex-row justify-between w-full ">
        <div>
          <p className="text-[#000000] font-bold font-nunitoSans">
            {product.title}
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
      <div className="flex flex-col items-center justify-center  w-[120px] h-[120px] my-5">
        <img
          src={product.image}
          alt={product.name}
          className="rounded-[10px]"
        />
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
      <div className="mt-3 flex flex-col justify-between w-full text-gray-500">
        <div className="text-[#323135] font-semibold font-nunitoSans">
          Select Size
        </div>
        <div className="flex flex-row items-center gap-4 mt-3">
          {size.map((size) => (
            <div
              key={size}
              className={`border border-[#A7A5AF] text-[#323135] font-normal font-nunitoSans rounded-[6px] w-[30px] h-[30px] text-xs flex items-center justify-center cursor-pointer ${
                selectedSize === size ? "text-[#FBFBFC]" : ""
              }`}
              onClick={() => setSelectedSize(size)}
              style={{
                backgroundColor:
                  selectedSize === size
                    ? storeDetails.tanyaThemeColor
                    : "transparent",
              }}
            >
              {size}
            </div>
          ))}
        </div>
      </div>
      {/* Color */}
      <div className="mt-3 flex flex-col justify-between w-full text-gray-500">
        <div className="text-[#323135] font-[600] font-nunitoSans">
          Select Color
        </div>
        <div className="flex flex-row items-center gap-5 mt-3">
          {colors.map((color, index) => (
            <div
              key={index}
              className={`w-[25px] h-[25px] bg-${color}-800 rounded-full cursor-pointer ${
                selectedColor === color ? "border-2 border-[#6A70FF]" : ""
              }`}
              style={{
                backgroundColor: color,
              }}
              onClick={() => setSelectedColor(color)}
            ></div>
          ))}
        </div>
      </div>
      {/* Description */}
      <div>
        <div className="text-[#323135] font-bold font-nunitoSans mt-3 text-[14px]">
          Product Details
        </div>
        <div
          className="text-[#68656E] font-normal font-nunitoSans text-xs pl-2 mt-3"
          dangerouslySetInnerHTML={{ __html: product.description }}
        ></div>
      </div>
      {/* rating and reviews */}
      <div className="mt-4 flex flex-col gap-2 w-full p-2">
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-2 text-left font-nunitoSans">
            <div className="text-[#323135] font-bold">
              {product?.rating.rate} / <span className="text-[#68656E]">5</span>
            </div>
            <div className="text-[#323135] font-semibold text-sm">
              Overall Rating
            </div>
            <div className="text-[#68656E] font-semibold text-sm">
              {product?.rating.count} ratings
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
                  product?.rating.rate > index
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
        <div
          className="rounded-[5px] shadow-sm text-[#FBFBFC] bg-[#6851C6] p-2 w-full text-center cursor-pointer"
          style={{ backgroundColor: storeDetails.tanyaThemeColor }}
        >
          Add to Cart
        </div>
        <div
          className="rounded-[5px] shadow-sm text-[#FBFBFC] bg-[#6851C6] p-2 w-full text-center cursor-pointer mb-16"
          style={{ backgroundColor: storeDetails.tanyaThemeColor }}
        >
          View more
        </div>
      </div>
    </div>
  );
};

export default ProductDisplayCard;
