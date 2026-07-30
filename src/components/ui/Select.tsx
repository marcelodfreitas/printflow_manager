"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;

  options: Option[];

  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Select({
  id,
  label,
  value,
  defaultValue,
  placeholder,
  className,
  error,
  required,
  disabled,
  options,
  onChange,
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-white/70"
        >
          {label}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onValueChange={(value) => {
          onChange?.({
            target: {
              value,
              name: id,
            },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
      >
        <SelectPrimitive.Trigger
          id={id}
          aria-required={required}
          className={cn(
            `
            flex
            h-11
            w-full
            items-center
            justify-between
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-4
            text-sm
            text-white
            backdrop-blur-xl
            transition-all
            shadow-sm

            hover:border-white/20

            focus:border-[#fd6401]/60
            focus:outline-none
            focus:ring-2
            focus:ring-[#fd6401]/20

            data-[placeholder]:text-white/30
            disabled:opacity-50
            disabled:cursor-not-allowed
            `,
            error && "border-red-500",
            className
          )}
        >
          <SelectPrimitive.Value
            placeholder={placeholder ?? "Selecione"}
          />

          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-white/40" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={8}
            className="
              z-50
              min-w-[220px]
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-[#0A1120]
              shadow-2xl
              shadow-black/60
              backdrop-blur-2xl
            "
          >
            <SelectPrimitive.ScrollUpButton className="flex justify-center py-2">
              <ChevronUp className="h-4 w-4 text-white/40" />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-2">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="
                    relative
                    flex
                    cursor-pointer
                    select-none
                    items-center
                    rounded-lg
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    text-white/80
                    outline-none
                    transition-all

                    hover:bg-[#fd6401]/15
                    focus:bg-[#fd6401]/15

                    data-[state=checked]:bg-[#fd6401]/20
                    data-[state=checked]:text-white
                  "
                >
                  <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4 text-[#fd6401]" />
                    </SelectPrimitive.ItemIndicator>
                  </span>

                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex justify-center py-2">
              <ChevronDown className="h-4 w-4 text-white/40" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && (
        <p className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}