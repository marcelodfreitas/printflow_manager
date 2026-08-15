"use client";

import {
  ReactNode,
  useState,
} from "react";


interface TooltipProps {
  children: ReactNode;
  text: string;
}


export default function Tooltip({
  children,
  text,
}: TooltipProps) {

  const [show, setShow] = useState(false);


  return (
    <div
      className="
        relative
        inline-flex
      "
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >

      {children}


      {show && (

        <div
          className="
            absolute
            bottom-full
            left-1/2
            mb-2
            -translate-x-1/2
            whitespace-nowrap
            rounded-lg
            border
            border-white/10
            bg-[#08111f]
            px-3
            py-2
            text-xs
            text-white
            shadow-lg
            z-50
          "
        >
          {text}
        </div>

      )}

    </div>
  );
}