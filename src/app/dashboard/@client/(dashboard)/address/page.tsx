import { fetchWithAuth } from "@/app/utils/fetchAuth";
import React from "react";

const page = async () => {
  const getAddress = await fetchWithAuth("/client/shipping-address");
  return (
    <div className="space-y-10 pb-10">
      <div>
        <h3 className="font-satoshi font-medium text-3xl text-black">
          My Address
        </h3>
        <p className="font-satoshi text-xl text-black py-5">
          You can view, edit and delete your saved addresses.
        </p>
      </div>
      <div className="bg-white flex flex-col md:flex-row items-start justify-between px-[30px] py-20 rounded-[10px] shadow-card_shadow w-full min-h-[441px] p-[30px]">
        <div className="flex flex-col gap-3 relative">
          <p className="font-satoshi font-medium text-3xl leading-10 text-black">
            Billing Address
          </p>
          <span className="font-satoshi text-xl text-black w-1/3 py-5 px-2">
            Interstate 3322, Onitcha main market 75, Freedom avenue, Anambra
            state Nigeria.
          </span>
          <div className="flex items-center gap-5 absolute bottom-4 left-28">
            <button title="Edit billing address">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7284 3.23722C12.3494 2.56442 12.6599 2.22802 12.9898 2.03179C13.7859 1.55832 14.7662 1.54359 15.5757 1.99295C15.9111 2.17918 16.2311 2.50612 16.8712 3.15998C17.5112 3.81385 17.8313 4.14078 18.0136 4.48346C18.4535 5.31028 18.4391 6.31167 17.9756 7.12493C17.7835 7.46198 17.4542 7.77917 16.7956 8.41352L8.95916 15.9613C7.71106 17.1634 7.08699 17.7645 6.30704 18.0691C5.52709 18.3738 4.66966 18.3513 2.95479 18.3065L2.72148 18.3004C2.19942 18.2868 1.93838 18.2799 1.78665 18.1077C1.63491 17.9355 1.65563 17.6696 1.69706 17.1378L1.71956 16.8491C1.83617 15.3523 1.89447 14.6039 2.18675 13.9312C2.47903 13.2584 2.98319 12.7123 3.99152 11.6198L11.7284 3.23722Z"
                  stroke="black"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.833 3.33398L16.6663 9.16732"
                  stroke="black"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button title="Delete address">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.25 4.58398L15.7336 12.9382C15.6016 15.0727 15.5357 16.1399 15.0007 16.9072C14.7361 17.2866 14.3956 17.6067 14.0006 17.8473C13.2017 18.334 12.1325 18.334 9.99392 18.334C7.8526 18.334 6.78192 18.334 5.98254 17.8464C5.58733 17.6054 5.24667 17.2847 4.98223 16.9047C4.4474 16.1362 4.38287 15.0674 4.25384 12.93L3.75 4.58398"
                  stroke="black"
                  stroke-linecap="round"
                />
                <path
                  d="M2.5 4.58268H17.5M13.3797 4.58268L12.8109 3.40912C12.433 2.62957 12.244 2.23978 11.9181 1.99669C11.8458 1.94277 11.7693 1.8948 11.6892 1.85327C11.3283 1.66602 10.8951 1.66602 10.0287 1.66602C9.14067 1.66602 8.69667 1.66602 8.32973 1.86112C8.24842 1.90436 8.17082 1.95427 8.09774 2.01032C7.76803 2.26327 7.58386 2.66731 7.21551 3.4754L6.71077 4.58268"
                  stroke="black"
                  stroke-linecap="round"
                />
                <path
                  d="M7.91699 13.75V8.75"
                  stroke="black"
                  stroke-linecap="round"
                />
                <path
                  d="M12.083 13.75V8.75"
                  stroke="black"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 relative">
          <p className="font-satoshi font-medium text-3xl leading-10 text-black">
            Shipping Address
          </p>
          <span className="font-satoshi text-xl text-black w-1/3 py-5 px-2">
            Interstate 3322, Onitcha main market 75, Freedom avenue, Anambra
            state Nigeria.
          </span>
          <div className="flex items-center gap-5 absolute bottom-4 left-28">
            <button title="Edit billing address">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7284 3.23722C12.3494 2.56442 12.6599 2.22802 12.9898 2.03179C13.7859 1.55832 14.7662 1.54359 15.5757 1.99295C15.9111 2.17918 16.2311 2.50612 16.8712 3.15998C17.5112 3.81385 17.8313 4.14078 18.0136 4.48346C18.4535 5.31028 18.4391 6.31167 17.9756 7.12493C17.7835 7.46198 17.4542 7.77917 16.7956 8.41352L8.95916 15.9613C7.71106 17.1634 7.08699 17.7645 6.30704 18.0691C5.52709 18.3738 4.66966 18.3513 2.95479 18.3065L2.72148 18.3004C2.19942 18.2868 1.93838 18.2799 1.78665 18.1077C1.63491 17.9355 1.65563 17.6696 1.69706 17.1378L1.71956 16.8491C1.83617 15.3523 1.89447 14.6039 2.18675 13.9312C2.47903 13.2584 2.98319 12.7123 3.99152 11.6198L11.7284 3.23722Z"
                  stroke="black"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.833 3.33398L16.6663 9.16732"
                  stroke="black"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button title="Delete address">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.25 4.58398L15.7336 12.9382C15.6016 15.0727 15.5357 16.1399 15.0007 16.9072C14.7361 17.2866 14.3956 17.6067 14.0006 17.8473C13.2017 18.334 12.1325 18.334 9.99392 18.334C7.8526 18.334 6.78192 18.334 5.98254 17.8464C5.58733 17.6054 5.24667 17.2847 4.98223 16.9047C4.4474 16.1362 4.38287 15.0674 4.25384 12.93L3.75 4.58398"
                  stroke="black"
                  stroke-linecap="round"
                />
                <path
                  d="M2.5 4.58268H17.5M13.3797 4.58268L12.8109 3.40912C12.433 2.62957 12.244 2.23978 11.9181 1.99669C11.8458 1.94277 11.7693 1.8948 11.6892 1.85327C11.3283 1.66602 10.8951 1.66602 10.0287 1.66602C9.14067 1.66602 8.69667 1.66602 8.32973 1.86112C8.24842 1.90436 8.17082 1.95427 8.09774 2.01032C7.76803 2.26327 7.58386 2.66731 7.21551 3.4754L6.71077 4.58268"
                  stroke="black"
                  stroke-linecap="round"
                />
                <path
                  d="M7.91699 13.75V8.75"
                  stroke="black"
                  stroke-linecap="round"
                />
                <path
                  d="M12.083 13.75V8.75"
                  stroke="black"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
