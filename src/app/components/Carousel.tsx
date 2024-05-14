"use client";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import couple from "../../../public/couple_assets.svg";
import man from "../../../public/asset4.svg";
import man2 from "../../../public/man2_asset.svg";

const Slider = () => {
  return (
    <Carousel showArrows={false} infiniteLoop={true} autoPlay={true}>
      <div>
        <div className="flex justify-center ">
          <p className="font-bon_foyage text-8xl leading-[95px] text-center text-black  w-1/2 px-10 ">
            Your <span className="text-[#fda600]">Style</span> with the Latest
            Fashion Trends.
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="z-10 absolute -top-16">
            <Image src={couple} alt="" />
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
            <Image src={man} alt="" />
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
            <Image src={man2} alt="" />
          </div>
        </div>
      </div>
    </Carousel>
  );
};
export default Slider;