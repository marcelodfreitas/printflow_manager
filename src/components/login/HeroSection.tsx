import Image from "next/image";
import logo from "@/assets/logo.png";

export function HeroSection() {
  return (
    <section className="relative flex flex-col justify-center py-6 lg:py-10">
      <div className="login-rise relative z-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[15px] bg-white/45 shadow-2xl shadow-black/35 backdrop-blur-xl">
          <Image
            src={logo}
            alt="PrintFlow"
            width={54}
            height={54}
            className="object-contain rounded-xl"
            priority
          />
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight text-white">
            PrintFlow
          </p>
          <p className="text-xs font-medium uppercase tracking-[.26em] text-white/45">
            MANAGER 3D
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-12 max-w-xl">
        <h1 className="text-3xl font-semibold leading-[1.05] tracking-normal text-white sm:text-3xl xl:text-4xl">
          Organize sua produção
        </h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">
          Clientes, pedidos, custos e financeiro em uma única plataforma
          desenhada para operações de impressão 3D
        </p>
      </div>

      <p className="relative z-10 mt-12 flex items-center gap-3 text-sm text-white/42">
        
        Desenvolvido para makers, estúdios e empresas de impressão 3D.
      </p>
    </section>
  );
}
