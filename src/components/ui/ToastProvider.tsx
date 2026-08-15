"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import Toast from "./Toast";


interface ToastContextProps {
  showToast: (
    message: string,
    type?: "success" | "error" | "warning" | "info"
  ) => void;
}


const ToastContext =
  createContext<ToastContextProps | null>(null);



export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);



  function showToast(
    message: string,
    type = "success"
  ) {

    setToast({
      message,
      type,
    });


    setTimeout(() => {
      setToast(null);
    }, 3000);
  }



  return (
    <ToastContext.Provider
      value={{ showToast }}
    >

      {children}


      {toast && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-50
            w-full
            max-w-sm
          "
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

    </ToastContext.Provider>
  );
}



export function useToastContext() {

  const context =
    useContext(ToastContext);


  if (!context) {
    throw new Error(
      "useToastContext must be used inside ToastProvider"
    );
  }


  return context;
}