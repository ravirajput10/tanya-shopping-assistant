/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { setProduct } from "../../store/reducers/productReducer";
import { useDispatch } from "react-redux";

const ProductDisplayCard = () => {
  const product = useSelector((state: any) => state.product.product);
  const storeDetails = useSelector((s: any) => s.store.store);
  const dispatch = useDispatch();

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

  return (
    <div className="flex flex-col gap-2 items-center h-[100vh] shadow-xl p-2 border-l-2 bg-white border-gray-200 w-1/2 overflow-y-scroll">
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
