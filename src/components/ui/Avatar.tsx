import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}


export default function Avatar({
  src,
  name = "Usuário",
  size = "md",
  className = "",
}: AvatarProps) {


  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };


  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();



  return (
    <div
      className={`
        relative
        flex
        items-center
        justify-center
        overflow-hidden
        rounded-full
        bg-primary/20
        text-primary
        font-semibold
        ${sizes[size]}
        ${className}
      `}
    >

      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="
            object-cover
          "
        />
      ) : (
        initials
      )}

    </div>
  );
}