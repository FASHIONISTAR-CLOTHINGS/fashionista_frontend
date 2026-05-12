"use client";
import React, { useState, useRef, useCallback, KeyboardEvent } from "react";

const OTP_INPUT_COUNT = 4;

const VerificationInput = () => {
  const [values, setValues] = useState<string[]>(
    Array.from({ length: OTP_INPUT_COUNT }, () => ""),
  );
  const boxRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleInput = useCallback(
    (
      e: React.FormEvent<HTMLInputElement>,
      currentIndex: number,
      nextIndex: number,
    ) => {
      const { value } = e.currentTarget;
      if (
        value.length === 1 &&
        nextIndex < boxRefs.current.length &&
        boxRefs.current[nextIndex]
      ) {
        boxRefs.current[nextIndex]?.focus();
      }
      setValues((prev) => {
        const newValues = [...prev];
        newValues[currentIndex] = value;
        return newValues;
      });
    },
    [boxRefs],
  );

  const handleKeyDown = useCallback(
    (
      e: KeyboardEvent<HTMLInputElement>,
      currentIndex: number,
      prevIndex: number,
    ) => {
      void currentIndex;
      if (
        e.key === "Backspace" &&
        prevIndex >= 0 &&
        prevIndex < boxRefs.current.length &&
        boxRefs.current[prevIndex] &&
        e.currentTarget.value === ""
      ) {
        boxRefs.current[prevIndex]?.focus();
      }
    },
    [boxRefs],
  );

  const combinedValue = values.join("");

  return (
    <div className="flex justify-between space-x-2 w-full">
      {values.map((value, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          className="w-[120px] h-[80px] text-center text-[32px] font-bold font-satoshi border-[1.5px] border-[#d9d9d9] outline-none rounded-[15px]"
          ref={(node) => {
            boxRefs.current[index] = node;
          }}
          value={value}
          onInput={(e) => handleInput(e, index, index + 1)}
          onKeyDown={(e) => handleKeyDown(e, index, index - 1)}
        />
      ))}
      <input type="hidden" value={combinedValue} name="otp" />
    </div>
  );
};

export default VerificationInput;
