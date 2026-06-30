"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const Slider = () => {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      text: "Discover Your Style with the Latest Fashion Trends.",
      image: "/couple_assets.svg",
      highlight: "Style",
    },
    {
      text: "Get amazing discounts on your first order.",
      image: "/man2_asset.svg",
      highlight: "discounts",
    },
    {
      text: "Get your exact measurement without stress",
      image: "/man3_assets.svg",
      highlight: "measurement",
    },
  ];
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrent((prevCurrent) =>
        prevCurrent === slides.length - 1 ? 0 : prevCurrent + 1,
      );
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [slides.length]);
  function highlightText(text: string, highlight: string) {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="text-[#fda600]">
          {part}
        </span>
      ) : (
        part
      ),
    );
  }
  const sliders = slides.map((slide, index) => {
    return (
      <div className="w-full flex-shrink-0" key={index}>
        <div className="flex justify-center bg-[#EDE7D9]  md:bg-transparent">
          <p className="font-bon_foyage text-5xl px-6 py-2 leading-[47.62px] md:text-8xl md:leading-[95px] text-center text-black  md:w-1/2 md:px-10 ">
            {highlightText(slide.text, slide.highlight)}
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="z-10 absolute -top-12">
            <Image
              src={slide.image}
              alt=""
              width={720}
              height={720}
              className="w-full h-full"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="overflow-hidden relative mt-5 ">
      <div
        className={`flex transition ease-out duration-400 h-screen`}
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {sliders}
      </div>
    </div>
  );
};
export default Slider;

{
  /* <div>
        <div className="flex justify-center ">
          <p className="font-bon_foyage text-8xl leading-[95px] text-center text-black  w-1/2 px-10 ">
            Your <span className="text-[#fda600]">Style</span> with the Latest
            Fashion Trends.
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="z-10 absolute -top-16">
            <Image src="/couple_assets.svg" alt="" />
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-center ">
          <p className="font-bon_foyage text-8xl leading-[95px] text-center text-black  w-1/2 px-10 ">
            We offer amazing<span className="text-[#fda600]">discounts</span> on
            first order.
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="z-10 absolute -top-16">
            <Image src="/asset4.svg" alt="" />
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-center ">
          <p className="font-bon_foyage text-8xl leading-[95px] text-center text-black  w-1/2 px-10 ">
            Get your exact <span className="text-[#fda600]"> measurement</span>{" "}
            without stress
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="z-10 absolute -top-16">
            <Image src="/man2_asset.svg" alt="" />
          </div>
        </div>
      </div> */
}
