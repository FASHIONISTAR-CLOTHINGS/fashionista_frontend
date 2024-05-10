import Image from "next/image";
import React from "react";
import bg_auth from "../../../public/bg-auth.svg";
import logo from "../../../public/logo.svg";

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="flex">
      <div className="w-full md:w-[40%]">{children}</div>

      <div className="w-full md:w-[60%] h-screen relative">
        <div className="absolute top-[81px] left-4 flex items-center">
          <Image src={logo} alt="logo" />
          <h2 className="font-bon_foyage px-3 text-[50px]">Fashionistar</h2>
        </div>
        {/* //   <div */}
        {/* // className="w-full h-full bg-[url('/bg-auth.svg')] bg-center bg-cover
        bg-no-repeat" */}
        {/* > */}
        <Image src={bg_auth} alt="" className="w-full h-full object-cover  " />
        {/* </div> */}
      </div>
    </div>
  );
};

export default layout;