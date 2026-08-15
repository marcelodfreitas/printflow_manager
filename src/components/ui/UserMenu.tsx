"use client";

import { useState } from "react";
import {
  User,
  Settings,
  LogOut,
} from "lucide-react";

import Avatar from "./Avatar";


interface UserMenuProps {
  name: string;
  email?: string;
  avatar?: string | null;
  onLogout?: () => void;
}



export default function UserMenu({
  name,
  email,
  avatar,
  onLogout,
}: UserMenuProps) {


  const [open, setOpen] = useState(false);



  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          gap-3
          rounded-xl
          p-2
          transition
          hover:bg-white/5
        "
      >

        <Avatar
          src={avatar}
          name={name}
          size="sm"
        />


        <div className="hidden text-left md:block">

          <p className="
            text-sm
            font-medium
            text-white
          ">
            {name}
          </p>


          {email && (
            <p className="
              text-xs
              text-muted
            ">
              {email}
            </p>
          )}

        </div>

      </button>



      {open && (

        <div
          className="
            absolute
            right-0
            mt-2
            w-56
            rounded-2xl
            border
            border-white/10
            bg-[#08111f]
            p-2
            shadow-xl
            z-50
          "
        >

          <button
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2
              text-sm
              text-white
              hover:bg-white/5
            "
          >
            <User size={17}/>
            Perfil
          </button>



          <button
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2
              text-sm
              text-white
              hover:bg-white/5
            "
          >
            <Settings size={17}/>
            Configurações
          </button>



          <button
            onClick={onLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2
              text-sm
              text-red-400
              hover:bg-red-500/10
            "
          >
            <LogOut size={17}/>
            Sair
          </button>


        </div>

      )}

    </div>
  );
}