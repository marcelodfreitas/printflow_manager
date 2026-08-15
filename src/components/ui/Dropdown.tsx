"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownProps {
  trigger?: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}


export default function Dropdown({
  trigger,
  items,
  align = "right",
}: DropdownProps) {

  const [open, setOpen] = useState(false);


  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          transition
          hover:bg-white/5
        "
      >
        {trigger ?? (
          <>
            Menu
            <ChevronDown size={16}/>
          </>
        )}
      </button>



      {open && (

        <>

          <div
            className="
              fixed
              inset-0
              z-40
            "
            onClick={() => setOpen(false)}
          />


          <div
            className={`
              absolute
              top-full
              mt-2
              z-50
              min-w-48
              rounded-2xl
              border
              border-white/10
              bg-[#08111f]
              p-2
              shadow-xl

              ${
                align === "right"
                  ? "right-0"
                  : "left-0"
              }
            `}
          >

            {items.map((item) => (

              <button
                key={item.label}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2
                  text-sm
                  transition

                  ${
                    item.danger
                      ? "text-red-400 hover:bg-red-500/10"
                      : "text-white hover:bg-white/5"
                  }
                `}
              >

                {item.icon}

                {item.label}

              </button>

            ))}

          </div>

        </>

      )}

    </div>
  );
}