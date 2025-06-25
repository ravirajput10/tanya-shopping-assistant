/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Popover, PopoverTrigger } from "../ui/popover";
// import tanyaChatBotIcon from "@/assets/tanya-chatbot/chat-with-tanya.png";
// import { getAccessToken } from "../utils/getAccessToken";
import { getSearchResults } from "../utils";
import type { SearchProduct } from "../graphQL/queries/types";
import {
  // decryptData,
  // currencyFormatter,
  formatStringToHtml,
  // priceFormatter,
} from "../utils/helper";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import ProductDisplay from "../carousel/ProductDisplay";
import { useDispatch, useSelector } from "react-redux";
import useSessionTracker from "../hooks/useSessionTracker";
import { fetchStoreConfig } from "../api/api";
import { setStore } from "../../store/reducers/storeReducer";
import ProductDisplayCard from "../product/ProductDisplayCard";
import { apiConfig, createSignedHeaders } from "../../config/api";
const TanyaShoppingAssistantStream = () => {
  // Shopping options
  const shoppingOptions = [
    "Myself",
    "My Child",
    "My Grandchild",
    "Niece/Nephew",
    "My Friends",
    "Others",
  ];

  const payloadMapping: Record<string, string> = {
    Myself: "himself/herself",
    "My Child": "his/her child",
    "My Grandchild": "his/her grandchild",
    "Niece/Nephew": "his/her niece/nephew",
    "My Friends": "his/her friends",
    Others: "others",
  };

  const messageMapping: Record<string, string> = {
    Myself: "Great choice! Let’s find something special just for you.",
    "My Child": "Aww, shopping for your little one? Let’s find the best picks!",
    "My Grandchild":
      "How sweet! Let’s find something your grandchild will love.",
    "Niece/Nephew":
      "Shopping for your niece or nephew? Let’s pick something fun!",
    "My Friends":
      "Finding the perfect gift for your friends? Let’s get started!",
    Others: "Shopping for someone special? Let’s make it amazing!",
  };

  const sessionData = useSessionTracker();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(
    searchParams.get("shoppingassist") === "true"
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [whom, setWhom] = useState("");
  const dispatch = useDispatch();

  const [chatHistory, setChatHistory] = useState<
    {
      query: string;
      response: string;
      potentialQuestions: string;
      products?: { keyword: string; items: SearchProduct[] }[];
      keywords: string;
    }[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const storeCode =
    searchParams.get("storeCode") || localStorage.getItem("storeCode");
  const storeDetails = useSelector((s: any) => s.store.store);
  const product = useSelector((s: any) => s.product.product);

  const openPanel = () => {
    setIsVisible(true);
    setTimeout(() => setIsAnimating(true), 10); // trigger opening animation
  };

  const closePanel = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300); // // wait for exit animation
  };

  useEffect(() => {
    if (isOpen) openPanel();
    else closePanel();
  }, [isOpen]);

  useEffect(() => {
    if (storeCode) {
      console.log(storeCode, "storeCode");
      fetchStoreConfig(storeCode).then((res) => {
        dispatch(setStore({ ...res, storeCode }));
      });
    }
  }, [storeCode]);

  // Handle selecting "whom" option
  const handleWhomSelection = (selected: string) => {
    setWhom(payloadMapping[selected]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop += 150; // Scrolls down by 50px
    }
  }, [chatHistory]);

  const handleSendMessage = async (question?: string) => {
    const newQuery = question || inputText.trim();
    if (!newQuery) return;

    setIsLoading(true);
    setInputText("");
    setChatHistory((prev) => [
      ...prev,
      {
        query: newQuery,
        response: "",
        potentialQuestions: "",
        products: [],
        keywords: "",
      },
    ]);

    try {
      const sanitizedWhom = whom;
      const user = localStorage.getItem("customerNumber");
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const { aiConversationUrl } = apiConfig();
      const queryParams = new URLSearchParams({
        registered: String(isLoggedIn || true),
        userId: String(user || new Date().getTime()),
        // application: "tanya",
      });

      const URL = `${aiConversationUrl}?${queryParams.toString()}`;

      const payload = JSON.stringify({
        flowId: storeDetails.flowId,
        flowAliasId: storeDetails.aliasId,
        input: {
          userPrompt: newQuery,
          whom: sanitizedWhom,
          storeCode: storeCode,
          sessionMetadata: sessionData,
        },
      });

      // AWS credentials
      const accessKeyId = "AKIAVVUIS3W7V7ZQR6KT";
      const secretAccessKey = "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";
      const region = "us-east-1";
      const service = "execute-api";

      // Note: createSignedHeaders is now async
      const headers = await createSignedHeaders(
        URL,
        "POST",
        payload,
        accessKeyId,
        secretAccessKey,
        region,
        service
      );

      const response = await fetch(URL, {
        signal: AbortSignal.timeout(30000),
        method: "POST",
        headers: headers,
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) throw new Error("Readable stream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let keywords = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const jsonData = line.slice(5).trim();
            try {
              const parsedData = JSON.parse(jsonData);
              if (parsedData.index == 1) keywords = parsedData.data;

              setChatHistory((prev) =>
                prev.map((msg, idx) =>
                  idx === prev.length - 1
                    ? {
                        ...msg,
                        [parsedData.index == 0
                          ? "response"
                          : parsedData.index == 1
                          ? "keywords"
                          : "potentialQuestions"]: parsedData.data,
                      }
                    : msg
                )
              );
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          }
        }
      }

      getKeywords(sanitizeKeywords(keywords));
    } catch (error) {
      console.error("Error sending message to Tanya:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sanitizeKeywords = (response: string) => {
    const keywordMatch = response.match(
      /top five relevant product or category names are: (.*)/i
    );
    const keywordsString = keywordMatch ? keywordMatch[1] : response;
    const keywordsArray = keywordsString.split(", ");
    const sanitizedKeywords = keywordsArray.map((keyword) => {
      return keyword.replace(/\s*(Toys|Bags|Miniature|etc\.*)\s*/gi, "").trim();
    });
    const uniqueKeywords = [...new Set(sanitizedKeywords)].filter(Boolean);
    return uniqueKeywords.join(",");
  };

  const getKeywords = async (keywords: string[] | string) => {
    if (typeof keywords === "string") {
      console.log("in one string");
      const splitedKeywords = keywords.split(",");
      for (const keyword of splitedKeywords) {
        const results = await getSearchResults(
          keyword
          // storeDetails.searchConfigs
        );
        if (results?.length > 0) {
          setChatHistory((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1
                ? {
                    ...msg,
                    products: [
                      ...(msg.products || []),
                      { keyword: keyword, items: results },
                    ],
                  }
                : msg
            )
          );
        }
      }
    } else {
      console.log("in two string");
      for (const keyword of keywords) {
        const results = await getSearchResults(
          keyword
          // storeDetails.searchConfigs
        );
        if (results?.length > 0) {
          setChatHistory((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1
                ? {
                    ...msg,
                    products: [
                      ...(msg.products || []),
                      { keyword: keyword, items: results },
                    ],
                  }
                : msg
            )
          );
        }
      }
    }
  };

  // Update the main container div's className
  return (
    <div className="relative flex justify-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          onClick={() => setIsOpen(true)}
          style={
            {
              // background: storeDetails.tanyaThemeColor,
            }
          }
          className="flex items-center rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        >
          {/* <img
              src={tanyaChatBotIcon}
              alt="Chat with Tanya"
              className="w-[20%] pl-[5px] pt-[2px]"
            /> */}
          {/* <Icon
            icon="fluent:search-sparkle-28-filled"
            width="28"
            height="28"
            color={storeDetails?.tanyaThemeContrastColor}
            className="ml-3"
          /> */}

          <div className="flex flex-col p-[5px]">
            {/* <span className="text-white text-[14px]">
              {storeDetails?.tanyaName ? storeDetails.tanyaName : "TANYA"}
            </span>
            <span className="text-white text-[12px] hidden sm:inline">
              Your AI Shopping Assistant
            </span> */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_958_585)">
                <path
                  d="M30.0002 5C31.7683 5 33.464 5.70238 34.7142 6.95262C35.9644 8.20286 36.6668 9.89856 36.6668 11.6667V25C36.6668 26.7681 35.9644 28.4638 34.7142 29.714C33.464 30.9643 31.7683 31.6667 30.0002 31.6667H25.6902L21.1785 36.1783C20.8915 36.4653 20.5097 36.6377 20.1046 36.6631C19.6996 36.6886 19.2992 36.5654 18.9785 36.3167L18.8218 36.1783L14.3085 31.6667H10.0002C8.28976 31.6667 6.64478 31.0093 5.40548 29.8305C4.16617 28.6516 3.42735 27.0416 3.34183 25.3333L3.3335 25V11.6667C3.3335 9.89856 4.03588 8.20286 5.28612 6.95262C6.53636 5.70238 8.23205 5 10.0002 5H30.0002Z"
                  fill="url(#paint0_linear_958_585)"
                />
                <path
                  d="M28.3335 15.6511V11.6667C28.3335 11.6667 22.2774 12.6042 20.1148 15.4167C17.9521 18.2292 18.6644 26.6667 18.6644 26.6667H22.5321C22.5321 26.6667 22.0614 18.9323 23.4989 17.2917C24.9364 15.6511 28.3335 15.6511 28.3335 15.6511Z"
                  fill="white"
                />
                <path
                  d="M13.3335 11.6667H19.6184V15.4167H13.3335V11.6667Z"
                  fill="white"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_958_585"
                  x1="20.0002"
                  y1="5"
                  x2="35.0002"
                  y2="30"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#452697" />
                  <stop offset="1" stop-color="#7C5BFF" />
                </linearGradient>
                <clipPath id="clip0_958_585">
                  <rect width="40" height="40" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </PopoverTrigger>

        {/* Absolute Positioned PopoverContent and Custom Sidebar Panel */}
        {isVisible && (
          <>
            {/* Overlay For closing tanya popup by clicking on side or background */}
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setIsOpen(false)}
            />
            <div
              className={`
                fixed z-50 h-screen w-[100vw] sm:w-[80vw] md:w-[770px] border-0 bg-white lg:rounded-l-xl overflow-hidden flex flex-col shadow-xl
                top-0 right-0
                transition-transform duration-300 ease-in-out
                lg:transform
                ${isAnimating ? "lg:translate-x-0" : "lg:translate-x-full"}
                // For mobile: animate from bottom
                ${isAnimating ? "translate-y-0" : "translate-y-full"}
                lg:translate-y-0
              `}
            >
              {/* // <PopoverContent
              // side="right"
              // align="end"
              // sideOffset={0}
            //   alignOffset={0}
            //   className="relative h-screen w-[125vw] sm:w-[80vw] md:w-[770px] border-0 bg-white p-0 rounded-xl overflow-hidden flex flex-col"
            // > */}
              {/* Header */}
              <div
                className={`flex justify-between p-1 lg:rounded-tl-xl lg:rounded-bl-xl`}
                style={{
                  background: storeDetails?.tanyaThemeColor,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color: storeDetails.tanyaThemeContrastColor,
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {/* <img src={tanyaChatBotIcon} alt="Chat with Tanya" width={50} /> */}
                  <Icon
                    icon="fluent:search-sparkle-28-filled"
                    width="38"
                    height="38"
                    color="white"
                  />
                  <div>
                    <p className="text-xs font-light mt-1">Chat with</p>
                    <p className="font-bold m-0">
                      TANYA{" "}
                      <span className="text-xs font-light">
                        (AI Shopping Assistant)
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    margin: "0.75rem",
                  }}
                >
                  <Icon
                    icon="fluent:dismiss-24-filled"
                    color={storeDetails?.tanyaThemeContrastColor}
                    width="24"
                    height="24"
                    className="cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  />
                </div>
              </div>
              {/* Chat Container */}
              <div className={`flex h-full md:flex-row lg:flex-row`}>
                <div
                  className={`flex flex-col h-full ${
                    product ? "lg:w-2/3 w-full" : "w-full"
                  }`}
                >
                  {/* Chat Body - Scrollable */}
                  <div
                    ref={scrollRef}
                    className="overflow-y-auto pr-5 pb-2 space-y-4 hide-scrollbar flex-grow"
                  >
                    <div
                      className="text-sm text-[16px] rounded-r-xl p-3 m-3 rounded-bl-xl w-3/4"
                      style={{
                        backgroundColor: storeDetails.tanyaThemeColorLight,
                      }}
                    >
                      Hey there! I'm Tanya, your AI shopping assistant. Think of
                      me as your helpful friend who knows all the best stuff at{" "}
                      {storeDetails.websiteTitle}. Ready to find something
                      amazing?
                    </div>

                    {/* Shopping Options */}
                    {storeDetails?.whomRequired && (
                      <div
                        className="mx-3 p-3 rounded-2xl"
                        style={{
                          color: storeDetails?.tanyaThemeContrastColor,
                          backgroundColor: storeDetails.tanyaThemeColor,
                          width: "fit-content",
                        }}
                      >
                        <div className="flex gap-2">
                          <Icon
                            icon="mdi:shopping"
                            color="white"
                            width="22"
                            height="22"
                          />
                          <p className="font-semibold text-white">
                            Who are you shopping for?
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {shoppingOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleWhomSelection(option)}
                              className="px-4 py-2 text-sm border-2 rounded-xl"
                              style={{
                                backgroundColor:
                                  whom === payloadMapping[option]
                                    ? storeDetails?.tanyaThemeColorLight
                                    : "transparent",
                                borderColor: storeDetails?.tanyaThemeColorLight,
                                color:
                                  whom === payloadMapping[option]
                                    ? storeDetails?.tanyaThemeColor || "#ffffff"
                                    : storeDetails?.tanyaThemeContrastColor ||
                                      "#000000",
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {storeDetails?.whomRequired && whom && (
                      <div className="flex items-center mx-3 mt-1">
                        <Icon
                          icon="fluent:shopping-bag-24-filled"
                          color={storeDetails.tanyaThemeColor}
                          width="22"
                          height="22"
                        />
                        <p
                          className="text-sm text-white  p-2 font-bold"
                          style={{ color: storeDetails.tanyaThemeColor }}
                        >
                          {(() => {
                            const selectedKey = Object.keys(
                              payloadMapping
                            ).find((key) => payloadMapping[key] === whom);
                            return selectedKey
                              ? messageMapping[selectedKey]
                              : "";
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Chat History */}
                    {chatHistory.map((chat, index) => (
                      <div key={index}>
                        <div className="flex justify-end">
                          <p
                            className="text-sm rounded-l-xl p-3 m-3 mb-4 rounded-br-xl max-w-[75%]"
                            style={{
                              color: storeDetails?.tanyaThemeContrastColor,
                              backgroundColor: storeDetails.tanyaThemeColor,
                            }}
                          >
                            {chat.query}
                          </p>
                        </div>
                        {chat.response && (
                          <div className="mt-4">
                            <div
                              className="text-sm text-[#232323] bg-[#FFFFFF] px-7 py-4 rounded-r-xl rounded-bl-2xl w-full"
                              dangerouslySetInnerHTML={{
                                __html: formatStringToHtml(chat.response),
                              }}
                              style={{
                                backgroundColor:
                                  storeDetails.tanyaThemeColorLight,
                                margin: "0.75rem",
                              }}
                            />
                          </div>
                        )}
                        {chat?.products && chat?.products?.length > 0 && (
                          <ProductDisplay
                            chat={chat.products}
                            storeDetails={storeDetails}
                          />
                        )}

                        {/* Potential Questions */}
                        {chat.potentialQuestions.length > 0 && (
                          <div className="my-2 mb-8 px-4 text-sm text-gray-700">
                            <p
                              className="font-semibold"
                              style={{ color: storeDetails.themeDarkColor }}
                            >
                              Why not explore these inquiries...
                            </p>
                            {chat.potentialQuestions
                              .split(",")
                              .map((question, idx) => (
                                <button
                                  key={idx}
                                  className={`cursor-pointer text-[#232323] border bg-[#804C9E0D] border-${storeDetails.themeDarkColor} m-1 rounded-xl px-2 py-1`}
                                  onClick={() => handleSendMessage(question)}
                                  style={{
                                    backgroundColor:
                                      storeDetails.tanyaThemeColorLight,
                                  }}
                                >
                                  {question}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Input Field - Always at Bottom */}
                  <div className="sticky bottom-0 w-[96%] drop-shadow-xl flex items-center rounded-full bg-white border border-gray-300 m-[15px]">
                    <input
                      placeholder="Ask me anything"
                      className="w-full rounded-full p-4 outline-none border-none focus:ring-0 focus:border-transparent"
                      value={inputText}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          handleSendMessage();
                        }
                      }}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`mr-6 text-[${storeDetails.themeDarkColor}] font-medium`}
                      style={{ color: storeDetails.themeDarkColor }}
                      onClick={() => handleSendMessage()}
                    >
                      {isLoading ? (
                        <div
                          className="m-3 animate-spin rounded-full h-6 w-6 border-b-2"
                          style={{
                            borderBottom: "2px solid",
                            color: storeDetails.tanyaThemeColor,
                          }}
                        />
                      ) : (
                        <Icon
                          icon="fluent:send-48-filled"
                          color={storeDetails.tanyaThemeColor}
                          width="24"
                          height="24"
                        />
                      )}
                    </button>
                  </div>
                </div>

                <ProductDisplayCard />
              </div>
              {/* </PopoverContent> */}
            </div>
          </>
        )}
      </Popover>
    </div>
  );
};

export default TanyaShoppingAssistantStream;

// ${import.meta.env.VITE_SERVER_BASE_URL}api/web-bff/assistantStream
