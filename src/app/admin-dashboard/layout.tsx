"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../../public/logo.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import menu from "../../../public/menu.svg";
import AdminTopBanner from "../components/AdminTopBanner";

const layout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  return (
    <div className="flex flex-col">
      <div className="p-[11px] w-full bg-[#F4F3EC]">
        <div className="flex items-center justify-between px-2.5 bg-[#EDE7D9] rounded-[5px] h-[50px] lg:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="w-[34px] h-[34px] flex justify-center  items-center bg-[#F4F3EC] border-[0.8px] border-black rounded-full"
          >
            <Image src={menu} alt="" />
          </button>
          <div className="flex items-center">
            <Image src={logo} alt="logo" className="w-[39px] h-[38px]" />
            <h2 className="font-bon_foyage px-3 text-[25px] leading-[25px] text-black">
              Fashionistar
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex justify-center items-center border border-[#282828] rounded-full bg-white">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.86878 8.61825C3.81367 9.66525 3.87702 10.7798 2.9416 11.4813C2.50623 11.8079 2.25 12.3203 2.25 12.8645C2.25 13.6131 2.83635 14.25 3.6 14.25H14.4C15.1637 14.25 15.75 13.6131 15.75 12.8645C15.75 12.3203 15.4938 11.8079 15.0584 11.4813C14.1229 10.7798 14.1863 9.66525 14.1312 8.61825C13.9876 5.88917 11.7329 3.75 9 3.75C6.26713 3.75 4.01241 5.88917 3.86878 8.61825Z"
                  stroke="#282828"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.875 2.34375C7.875 2.96507 8.3787 3.75 9 3.75C9.6213 3.75 10.125 2.96507 10.125 2.34375C10.125 1.72243 9.6213 1.5 9 1.5C8.3787 1.5 7.875 1.72243 7.875 2.34375Z"
                  stroke="#282828"
                />
                <path
                  d="M11.25 14.25C11.25 15.4927 10.2427 16.5 9 16.5C7.75732 16.5 6.75 15.4927 6.75 14.25"
                  stroke="#282828"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="w-8 h-8 flex justify-center items-center border border-[#282828] rounded-full bg-white">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 4.5L6.68477 7.43773C8.5962 8.52075 9.4038 8.52075 11.3152 7.43773L16.5 4.5"
                  stroke="#282828"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.51183 10.1067C1.56086 12.4059 1.58537 13.5554 2.43372 14.4071C3.28206 15.2586 4.46275 15.2882 6.82412 15.3476C8.27948 15.3842 9.72053 15.3842 11.1759 15.3476C13.5373 15.2882 14.7179 15.2586 15.5663 14.4071C16.4147 13.5554 16.4392 12.4059 16.4881 10.1067C16.504 9.36743 16.504 8.63258 16.4881 7.8933C16.4392 5.59415 16.4147 4.44457 15.5663 3.593C14.7179 2.74142 13.5373 2.71176 11.1759 2.65243C9.72053 2.61586 8.27947 2.61586 6.82411 2.65242C4.46275 2.71175 3.28206 2.74141 2.43371 3.59299C1.58537 4.44456 1.56085 5.59414 1.51182 7.8933C1.49605 8.63258 1.49606 9.36743 1.51183 10.1067Z"
                  stroke="#282828"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="w-[34px] h-[34px] flex justify-center items-center rounded-full bg-[#fda600]">
              <span className="font-medium text-white">G</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full lg:left-0 md:w-[40%] lg:w-[25%] z-50 h-screen bg-[#141414] fixed top-0 transition-all duration-300 ${
          isOpen ? "left-0" : "left-[-100%]"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className=" w-8 h-8 flex justify-center items-center absolute top-2 right-2 md:hidden"
        >
          <svg
            className="text-white "
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.8334 4.1665L4.16675 15.8332M4.16675 4.1665L15.8334 15.8332"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex items-center md:justify-center px-10 py-5 md:py-[30px] border-b-[1.2px] border-b-[#282828]">
          <Image src={logo} alt="logo" className="w-[55px] h-[54px]" />
          <h2 className="font-bon_foyage px-3 text-4xl leading-9 text-white">
            Fashionistar
          </h2>
        </div>

        <nav className="px-10 py-[30px] flex flex-col justify-between h-[86%] ">
          <div className="flex flex-col gap-9">
            <Link
              href="/admin-dashboard"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname == "/admin-dashboard"
                  ? "text-[#fda600]"
                  : "text-[#bbb]"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 5C16 4.06812 16 3.60218 16.1522 3.23463C16.3552 2.74458 16.7446 2.35523 17.2346 2.15224C17.6022 2 18.0681 2 19 2C19.9319 2 20.3978 2 20.7654 2.15224C21.2554 2.35523 21.6448 2.74458 21.8478 3.23463C22 3.60218 22 4.06812 22 5V9C22 9.93188 22 10.3978 21.8478 10.7654C21.6448 11.2554 21.2554 11.6448 20.7654 11.8478C20.3978 12 19.9319 12 19 12C18.0681 12 17.6022 12 17.2346 11.8478C16.7446 11.6448 16.3552 11.2554 16.1522 10.7654C16 10.3978 16 9.93188 16 9V5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M16 19C16 18.0681 16 17.6022 16.1522 17.2346C16.3552 16.7446 16.7446 16.3552 17.2346 16.1522C17.6022 16 18.0681 16 19 16C19.9319 16 20.3978 16 20.7654 16.1522C21.2554 16.3552 21.6448 16.7446 21.8478 17.2346C22 17.6022 22 18.0681 22 19C22 19.9319 22 20.3978 21.8478 20.7654C21.6448 21.2554 21.2554 21.6448 20.7654 21.8478C20.3978 22 19.9319 22 19 22C18.0681 22 17.6022 22 17.2346 21.8478C16.7446 21.6448 16.3552 21.2554 16.1522 20.7654C16 20.3978 16 19.9319 16 19Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M2 16C2 14.1144 2 13.1716 2.58579 12.5858C3.17157 12 4.11438 12 6 12H8C9.88562 12 10.8284 12 11.4142 12.5858C12 13.1716 12 14.1144 12 16V18C12 19.8856 12 20.8284 11.4142 21.4142C10.8284 22 9.88562 22 8 22H6C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V16Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M2 5C2 4.06812 2 3.60218 2.15224 3.23463C2.35523 2.74458 2.74458 2.35523 3.23463 2.15224C3.60218 2 4.06812 2 5 2H9C9.93188 2 10.3978 2 10.7654 2.15224C11.2554 2.35523 11.6448 2.74458 11.8478 3.23463C12 3.60218 12 4.06812 12 5C12 5.93188 12 6.39782 11.8478 6.76537C11.6448 7.25542 11.2554 7.64477 10.7654 7.84776C10.3978 8 9.93188 8 9 8H5C4.06812 8 3.60218 8 3.23463 7.84776C2.74458 7.64477 2.35523 7.25542 2.15224 6.76537C2 6.39782 2 5.93188 2 5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/admin-dashboard/orders"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname == "/admin-dashboard/orders"
                  ? "text-[#fda600]"
                  : "text-[#bbb]"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.365 2.86816V4.78057M11.584 2.86816V4.78057M6.80298 2.86816V4.78057"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.4563 13.3863V9.56144C3.4563 6.85689 3.4563 5.50461 4.2965 4.66442C5.13669 3.82422 6.48897 3.82422 9.19352 3.82422H13.9745C16.6791 3.82422 18.0313 3.82422 18.8716 4.66442C19.7118 5.50461 19.7118 6.85689 19.7118 9.56144V13.3863C19.7118 16.0908 19.7118 17.4431 18.8716 18.2833C18.0313 19.1235 16.6791 19.1235 13.9745 19.1235H9.19352C6.48897 19.1235 5.13669 19.1235 4.2965 18.2833C3.4563 17.4431 3.4563 16.0908 3.4563 13.3863Z"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                />
                <path
                  d="M3.4563 16.2549V9.56144C3.4563 6.85689 3.4563 5.50461 4.2965 4.66442C5.13669 3.82422 6.48897 3.82422 9.19352 3.82422H13.9745C16.6791 3.82422 18.0313 3.82422 18.8716 4.66442C19.7118 5.50461 19.7118 6.85689 19.7118 9.56144V16.2549C19.7118 18.9594 19.7118 20.3117 18.8716 21.1519C18.0313 21.9921 16.6791 21.9921 13.9745 21.9921H9.19352C6.48897 21.9921 5.13669 21.9921 4.2965 21.1519C3.4563 20.3117 3.4563 18.9594 3.4563 16.2549Z"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                />
                <path
                  d="M7.75903 15.2996H11.5839M7.75903 10.5186H15.4087"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
              </svg>
              Orders
            </Link>
            {/* <Link
              href="/admin-dashboard/products"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname == "/admin-dashboard/products"
                  ? "text-[#fda600]"
                  : "text-[#bbb]"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.80298 17.1676V13.3428"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
                <path
                  d="M11.584 17.1675V7.60547"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
                <path
                  d="M16.365 17.1679V11.4307"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
                <path
                  d="M2.5 12.3867C2.5 8.10447 2.5 5.96336 3.83031 4.63304C5.16063 3.30273 7.30173 3.30273 11.5839 3.30273C15.8661 3.30273 18.0072 3.30273 19.3376 4.63304C20.6679 5.96336 20.6679 8.10447 20.6679 12.3867C20.6679 16.6688 20.6679 18.81 19.3376 20.1403C18.0072 21.4706 15.8661 21.4706 11.5839 21.4706C7.30173 21.4706 5.16063 21.4706 3.83031 20.1403C2.5 18.81 2.5 16.6688 2.5 12.3867Z"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinejoin="round"
                />
              </svg>
              Products
            </Link> */}
            <Link
              href="/admin-dashboard/collections"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname == "/admin-dashboard/collections"
                  ? "text-[#fda600]"
                  : "text-[#bbb]"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.80298 17.1676V13.3428"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
                <path
                  d="M11.584 17.1675V7.60547"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
                <path
                  d="M16.365 17.1679V11.4307"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
                <path
                  d="M2.5 12.3867C2.5 8.10447 2.5 5.96336 3.83031 4.63304C5.16063 3.30273 7.30173 3.30273 11.5839 3.30273C15.8661 3.30273 18.0072 3.30273 19.3376 4.63304C20.6679 5.96336 20.6679 8.10447 20.6679 12.3867C20.6679 16.6688 20.6679 18.81 19.3376 20.1403C18.0072 21.4706 15.8661 21.4706 11.5839 21.4706C7.30173 21.4706 5.16063 21.4706 3.83031 20.1403C2.5 18.81 2.5 16.6688 2.5 12.3867Z"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinejoin="round"
                />
              </svg>
              Collections
            </Link>
            <Link
              href="/admin-dashboard/transactions"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname.includes("/transactions")
                  ? "text-[#fda600]"
                  : "text-[#bbb]"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.4526 8.12725C14.4526 8.12725 14.9307 8.12725 15.4088 9.08346C15.4088 9.08346 16.9275 6.69295 18.2775 6.21484"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.146 7.64919C21.146 10.2897 19.0055 12.4302 16.365 12.4302C13.7245 12.4302 11.584 10.2897 11.584 7.64919C11.584 5.0087 13.7245 2.86816 16.365 2.86816C19.0055 2.86816 21.146 5.0087 21.146 7.64919Z"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
                <path
                  d="M21.8631 13.6201C21.8624 13.2239 21.5407 12.9034 21.1447 12.9042C20.7486 12.9049 20.4281 13.2265 20.4288 13.6226L21.8631 13.6201ZM8.77821 7.41281C9.17428 7.41057 9.49354 7.08768 9.4913 6.69162C9.48905 6.29555 9.16616 5.97629 8.7701 5.97853L8.77821 7.41281ZM13.0182 21.2754H10.1496V22.7097H13.0182V21.2754ZM10.1496 21.2754C8.33576 21.2754 7.03573 21.2743 6.0369 21.1615C5.05125 21.0501 4.45403 20.8381 4.00337 20.4822L3.11443 21.6078C3.86349 22.1994 4.76464 22.4612 5.8759 22.5867C6.97399 22.7107 8.36943 22.7097 10.1496 22.7097V21.2754ZM1.30469 14.3429C1.30469 16.0152 1.30332 17.3374 1.43628 18.3802C1.57178 19.4426 1.85624 20.3086 2.49323 21.0231L3.56384 20.0686C3.19414 19.6539 2.97525 19.1098 2.85907 18.1987C2.74036 17.2678 2.73899 16.0532 2.73899 14.3429H1.30469ZM4.00337 20.4822C3.84384 20.3563 3.69682 20.2178 3.56384 20.0686L2.49323 21.0231C2.68227 21.2352 2.89018 21.4308 3.11443 21.6078L4.00337 20.4822ZM20.4288 14.3429C20.4288 16.0532 20.4274 17.2678 20.3087 18.1987C20.1925 19.1098 19.9736 19.6539 19.604 20.0686L20.6745 21.0231C21.3115 20.3086 21.596 19.4426 21.7315 18.3802C21.8644 17.3374 21.8631 16.0152 21.8631 14.3429H20.4288ZM13.0182 22.7097C14.7984 22.7097 16.1937 22.7107 17.2919 22.5867C18.4032 22.4612 19.3043 22.1994 20.0534 21.6078L19.1644 20.4822C18.7137 20.8381 18.1165 21.0501 17.1308 21.1615C16.1321 21.2743 14.832 21.2754 13.0182 21.2754V22.7097ZM19.604 20.0686C19.4709 20.2178 19.324 20.3563 19.1644 20.4822L20.0534 21.6078C20.2776 21.4308 20.4855 21.2352 20.6745 21.0231L19.604 20.0686ZM2.73899 14.3429C2.73899 12.6326 2.74036 11.418 2.85907 10.4871C2.97525 9.57601 3.19414 9.0318 3.56384 8.61713L2.49323 7.66265C1.85624 8.37714 1.57178 9.24315 1.43628 10.3056C1.30332 11.3483 1.30469 12.6706 1.30469 14.3429H2.73899ZM3.11443 7.07791C2.89018 7.25501 2.68227 7.45061 2.49323 7.66265L3.56384 8.61713C3.69682 8.46797 3.84384 8.32952 4.00337 8.20354L3.11443 7.07791ZM21.8631 14.3429C21.8631 14.095 21.8635 13.8524 21.8631 13.6201L20.4288 13.6226C20.4292 13.8534 20.4288 14.0916 20.4288 14.3429H21.8631ZM8.7701 5.97853C7.42419 5.98615 6.32869 6.01715 5.43126 6.15877C4.52041 6.30253 3.76081 6.56743 3.11443 7.07791L4.00337 8.20354C4.39281 7.89598 4.89164 7.69599 5.65486 7.57555C6.43151 7.45298 7.42572 7.42046 8.77821 7.41281L8.7701 5.97853Z"
                  fill="currentColor"
                />
                <path
                  d="M9.67163 18.168H11.1059"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.9744 18.168H17.3211"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.5 11.4746H9.67153"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Transaction
            </Link>
            <Link
              href="/admin-dashboard/sellers"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname.includes("/sellers") ? "text-[#fda600]" : "text-[#bbb]"
              }`}
            >
              <svg
                width="23"
                height="23"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.08441 1.91211H13.8656L14.4889 8.14434C14.6672 9.9274 13.267 11.4746 11.475 11.4746C9.68308 11.4746 8.28289 9.9274 8.46119 8.14434L9.08441 1.91211Z"
                  stroke="currentColor"
                />
                <path
                  d="M3.18407 5.11682C3.35436 4.26537 3.4395 3.83965 3.61262 3.49455C3.9774 2.76737 4.63378 2.22928 5.41837 2.01419C5.79073 1.91211 6.22488 1.91211 7.09318 1.91211H9.08439L8.39156 8.8404C8.24202 10.3358 6.98366 11.4746 5.48079 11.4746C3.63479 11.4746 2.25028 9.78578 2.6123 7.97562L3.18407 5.11682Z"
                  stroke="currentColor"
                />
                <path
                  d="M19.7659 5.11682C19.5956 4.26537 19.5104 3.83965 19.3374 3.49455C18.9725 2.76737 18.3162 2.22928 17.5316 2.01419C17.1592 1.91211 16.7251 1.91211 15.8568 1.91211H13.8656L14.5584 8.8404C14.708 10.3358 15.9663 11.4746 17.4692 11.4746C19.3152 11.4746 20.6997 9.78578 20.3377 7.97562L19.7659 5.11682Z"
                  stroke="currentColor"
                />
                <path
                  opacity="0.5"
                  d="M8.3672 20.5602C8.3672 20.9562 8.6883 21.2773 9.08439 21.2773C9.48048 21.2773 9.80157 20.9562 9.80157 20.5602H8.3672ZM13.1484 20.5602C13.1484 20.9562 13.4696 21.2773 13.8656 21.2773C14.2617 21.2773 14.5828 20.9562 14.5828 20.5602H13.1484ZM11.9531 20.3211H10.9969V21.7555H11.9531V20.3211ZM4.06408 13.3883V10.5195H2.6297V13.3883H4.06408ZM18.8859 10.5195V13.3883H20.3203V10.5195H18.8859ZM10.9969 20.3211C9.17349 20.3211 7.87809 20.3196 6.89539 20.1874C5.93331 20.0581 5.37902 19.8155 4.97433 19.4108L3.96007 20.4251C4.6757 21.1407 5.58313 21.4583 6.70426 21.6091C7.80475 21.757 9.21404 21.7555 10.9969 21.7555V20.3211ZM2.6297 13.3883C2.6297 15.1711 2.62818 16.5804 2.77613 17.6809C2.92686 18.802 3.24445 19.7095 3.96007 20.4251L4.97433 19.4108C4.56964 19.0062 4.32706 18.4518 4.19772 17.4898C4.0656 16.5071 4.06408 15.2117 4.06408 13.3883H2.6297ZM11.9531 21.7555C13.736 21.7555 15.1453 21.757 16.2457 21.6091C17.3669 21.4583 18.2743 21.1407 18.99 20.4251L17.9757 19.4108C17.571 19.8155 17.0167 20.0581 16.0547 20.1874C15.0719 20.3196 13.7765 20.3211 11.9531 20.3211V21.7555ZM18.8859 13.3883C18.8859 15.2117 18.8844 16.5071 18.7523 17.4898C18.623 18.4518 18.3804 19.0062 17.9757 19.4108L18.99 20.4251C19.7056 19.7095 20.0231 18.802 20.1739 17.6809C20.3219 16.5804 20.3203 15.1711 20.3203 13.3883H18.8859ZM9.80157 20.5602V17.6914H8.3672V20.5602H9.80157ZM13.1484 17.6914V20.5602H14.5828V17.6914H13.1484ZM11.475 16.018C11.9351 16.018 12.2322 16.0186 12.4574 16.0391C12.6726 16.0586 12.7507 16.0915 12.7899 16.1141L13.507 14.8718C13.2133 14.7023 12.9015 14.6391 12.5868 14.6106C12.2819 14.5829 11.9087 14.5836 11.475 14.5836V16.018ZM14.5828 17.6914C14.5828 17.2577 14.5835 16.8845 14.5559 16.5796C14.5274 16.2649 14.4642 15.9531 14.2946 15.6594L13.0523 16.3766C13.0749 16.4157 13.1078 16.4938 13.1273 16.7091C13.1478 16.9342 13.1484 17.2314 13.1484 17.6914H14.5828ZM12.7899 16.1141C12.8989 16.177 12.9894 16.2676 13.0523 16.3766L14.2946 15.6594C14.1058 15.3323 13.8341 15.0607 13.507 14.8718L12.7899 16.1141ZM9.80157 17.6914C9.80157 17.2314 9.80224 16.9342 9.82271 16.7091C9.84222 16.4938 9.87511 16.4157 9.89768 16.3766L8.65545 15.6594C8.48584 15.9531 8.42268 16.2649 8.39415 16.5796C8.36651 16.8845 8.3672 17.2577 8.3672 17.6914H9.80157ZM11.475 14.5836C11.0414 14.5836 10.6681 14.5829 10.3632 14.6106C10.0485 14.6391 9.73674 14.7023 9.44298 14.8718L10.1602 16.1141C10.1993 16.0915 10.2774 16.0586 10.4927 16.0391C10.7179 16.0186 11.015 16.018 11.475 16.018V14.5836ZM9.89768 16.3766C9.9606 16.2676 10.0512 16.177 10.1602 16.1141L9.44298 14.8718C9.11591 15.0607 8.84429 15.3323 8.65545 15.6594L9.89768 16.3766Z"
                  fill="currentColor"
                />
              </svg>
              Sellers
            </Link>
            <Link
              href="/admin-dashboard/accounts"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname.includes("/accounts")
                  ? "text-[#fda600]"
                  : "text-[#bbb]"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.9103 20.0804H18.379C19.4785 20.0804 20.353 19.5794 21.1382 18.879C23.133 17.0995 18.4439 15.2993 16.8431 15.2993M14.9307 5.80306C15.1478 5.76 15.3733 5.7373 15.6046 5.7373C17.3448 5.7373 18.7555 7.02163 18.7555 8.60592C18.7555 10.1902 17.3448 11.4745 15.6046 11.4745C15.3733 11.4745 15.1478 11.4519 14.9307 11.4087"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                  strokeLinecap="round"
                />
                <path
                  d="M4.39444 16.3614C3.26711 16.9655 0.311286 18.1991 2.11157 19.7427C2.991 20.4968 3.97046 21.0361 5.20187 21.0361H12.2286C13.46 21.0361 14.4395 20.4968 15.3189 19.7427C17.1192 18.1991 14.1634 16.9655 13.036 16.3614C10.3924 14.9447 7.03804 14.9447 4.39444 16.3614Z"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                />
                <path
                  d="M12.5403 8.12755C12.5403 10.2399 10.8278 11.9524 8.71544 11.9524C6.60305 11.9524 4.89062 10.2399 4.89062 8.12755C4.89062 6.01516 6.60305 4.30273 8.71544 4.30273C10.8278 4.30273 12.5403 6.01516 12.5403 8.12755Z"
                  stroke="currentColor"
                  strokeWidth="1.43431"
                />
              </svg>
              Account
            </Link>
            <Link
              href="/admin-dashboard/reviews"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname.includes("/reviews") ? "text-[#fda600]" : "text-[#bbb]"
              }`}
            >
              <svg
                width="23"
                height="23"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 21.0827C16.7927 21.0827 21.0834 16.792 21.0834 11.4993C21.0834 6.20662 16.7927 1.91602 11.5 1.91602C6.20729 1.91602 1.91669 6.20662 1.91669 11.4993C1.91669 13.0324 2.27666 14.4813 2.91667 15.7663C3.08675 16.1078 3.14336 16.4981 3.04476 16.8666L2.47397 18.9999C2.22618 19.926 3.0734 20.7731 3.99948 20.5254L6.13277 19.9546C6.50129 19.856 6.8916 19.9127 7.23307 20.0827C8.51804 20.7227 9.96697 21.0827 11.5 21.0827Z"
                  stroke="currentColor"
                />
                <path
                  d="M7.66669 10.0625H15.3334"
                  stroke="currentColor"
                  stroke-linecap="round"
                />
                <path
                  d="M7.66669 13.416H12.9375"
                  stroke="currentColor"
                  stroke-linecap="round"
                />
              </svg>
              Reviews
            </Link>
            <Link
              href="/admin-dashboard/brands"
              className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4 ${
                pathname.includes("/brands") ? "text-[#fda600]" : "text-[#bbb]"
              }`}
            >
              <svg
                width="23"
                height="23"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.0834 11.4993C21.0834 16.792 16.7928 21.0827 11.5001 21.0827C6.20735 21.0827 1.91675 16.792 1.91675 11.4993C1.91675 6.20662 6.20735 1.91602 11.5001 1.91602C16.7928 1.91602 21.0834 6.20662 21.0834 11.4993Z"
                  fill="currentColor"
                />
                <path
                  d="M9.97876 8.14338L10.1358 7.8617C10.7427 6.77292 11.0462 6.22852 11.4999 6.22852C11.9536 6.22852 12.2571 6.77291 12.864 7.8617L13.0211 8.14339C13.1935 8.45278 13.2797 8.60747 13.4142 8.70954C13.5486 8.81162 13.7162 8.84951 14.0511 8.92528L14.3559 8.99428C15.5346 9.26095 16.1239 9.39428 16.2641 9.84517C16.4043 10.296 16.0026 10.7657 15.1991 11.7054L14.9911 11.9484C14.7629 12.2154 14.6487 12.3489 14.5973 12.5141C14.546 12.6792 14.5632 12.8574 14.5977 13.2136L14.6292 13.5379C14.7507 14.7915 14.8113 15.4184 14.4443 15.6969C14.0773 15.9756 13.5255 15.7216 12.422 15.2135L12.1365 15.082C11.8229 14.9377 11.6661 14.8654 11.4999 14.8654C11.3337 14.8654 11.177 14.9377 10.8633 15.082L10.5778 15.2135C9.47432 15.7216 8.92257 15.9756 8.55551 15.6969C8.18846 15.4184 8.2492 14.7915 8.37067 13.5379L8.4021 13.2136C8.43662 12.8574 8.45388 12.6792 8.40252 12.5141C8.35116 12.3489 8.237 12.2154 8.00867 11.9484L7.8008 11.7054C6.99731 10.7657 6.59556 10.296 6.73577 9.84517C6.87597 9.39428 7.46528 9.26094 8.64387 8.99428L8.94878 8.92528C9.28371 8.84951 9.45117 8.81162 9.58565 8.70954C9.7201 8.60747 9.80635 8.45278 9.97876 8.14338Z"
                  fill="black"
                />
              </svg>
              Brands
            </Link>
          </div>

          <Link
            href="/admin-dashboard/settings"
            className={`text-xl leading-[27px] font-medium font-satoshi  flex items-center gap-4  ${
              pathname == "/admin-dashboard/settings"
                ? "text-[#fda600]"
                : "text-[#fff]"
            }`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.3175 7.14139L20.8239 6.28479C20.4506 5.63696 20.264 5.31305 19.9464 5.18388C19.6288 5.05472 19.2696 5.15664 18.5513 5.36048L17.3311 5.70418C16.8725 5.80994 16.3913 5.74994 15.9726 5.53479L15.6357 5.34042C15.2766 5.11043 15.0004 4.77133 14.8475 4.37274L14.5136 3.37536C14.294 2.71534 14.1842 2.38533 13.9228 2.19657C13.6615 2.00781 13.3143 2.00781 12.6199 2.00781H11.5051C10.8108 2.00781 10.4636 2.00781 10.2022 2.19657C9.94085 2.38533 9.83106 2.71534 9.61149 3.37536L9.27753 4.37274C9.12465 4.77133 8.84845 5.11043 8.48937 5.34042L8.15249 5.53479C7.73374 5.74994 7.25259 5.80994 6.79398 5.70418L5.57375 5.36048C4.85541 5.15664 4.49625 5.05472 4.17867 5.18388C3.86109 5.31305 3.67445 5.63696 3.30115 6.28479L2.80757 7.14139C2.45766 7.74864 2.2827 8.05227 2.31666 8.37549C2.35061 8.69871 2.58483 8.95918 3.05326 9.48012L4.0843 10.6328C4.3363 10.9518 4.51521 11.5078 4.51521 12.0077C4.51521 12.5078 4.33636 13.0636 4.08433 13.3827L3.05326 14.5354C2.58483 15.0564 2.35062 15.3168 2.31666 15.6401C2.2827 15.9633 2.45766 16.2669 2.80757 16.8741L3.30114 17.7307C3.67443 18.3785 3.86109 18.7025 4.17867 18.8316C4.49625 18.9608 4.85542 18.8589 5.57377 18.655L6.79394 18.3113C7.25263 18.2055 7.73387 18.2656 8.15267 18.4808L8.4895 18.6752C8.84851 18.9052 9.12464 19.2442 9.2775 19.6428L9.61149 20.6403C9.83106 21.3003 9.94085 21.6303 10.2022 21.8191C10.4636 22.0078 10.8108 22.0078 11.5051 22.0078H12.6199C13.3143 22.0078 13.6615 22.0078 13.9228 21.8191C14.1842 21.6303 14.294 21.3003 14.5136 20.6403L14.8476 19.6428C15.0004 19.2442 15.2765 18.9052 15.6356 18.6752L15.9724 18.4808C16.3912 18.2656 16.8724 18.2055 17.3311 18.3113L18.5513 18.655C19.2696 18.8589 19.6288 18.9608 19.9464 18.8316C20.264 18.7025 20.4506 18.3785 20.8239 17.7307L21.3175 16.8741C21.6674 16.2669 21.8423 15.9633 21.8084 15.6401C21.7744 15.3168 21.5402 15.0564 21.0718 14.5354L20.0407 13.3827C19.7887 13.0636 19.6098 12.5078 19.6098 12.0077C19.6098 11.5078 19.7888 10.9518 20.0407 10.6328L21.0718 9.48012C21.5402 8.95918 21.7744 8.69871 21.8084 8.37549C21.8423 8.05227 21.6674 7.74864 21.3175 7.14139Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M15.5195 12C15.5195 13.933 13.9525 15.5 12.0195 15.5C10.0865 15.5 8.51953 13.933 8.51953 12C8.51953 10.067 10.0865 8.5 12.0195 8.5C13.9525 8.5 15.5195 10.067 15.5195 12Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Settings
          </Link>
        </nav>
      </div>
      <div className="lg:ml-[25%] bg-[#F4F3EC] min-h-screen flex flex-col">
        <AdminTopBanner title="Jennifer" pathname={pathname} />
        <div className="p-3 md:p-[30px] mt-1 lg:mt-[100px] bg-inherit space-y-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default layout;