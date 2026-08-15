"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Printer as PrinterType } from "@/types";

interface PrinterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<PrinterType, "id" | "createdAt">,
  ) => Promise<void> | void;
  printer?: PrinterType | null;
}

export default function PrinterModal({
  open,
  onClose,
  onSave,
  printer,
}: PrinterModalProps) {
  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("FDM");
  const [volumeX, setVolumeX] = useState("");
  const [volumeY, setVolumeY] = useState("");
  const [volumeZ, setVolumeZ] = useState("");
  const [costPerHour, setCostPerHour] = useState("");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  const isEditing = !!printer;

  useEffect(() => {
    if (!open) return;

    if (printer) {
      setName(printer.name ?? "");
      setManufacturer(printer.manufacturer ?? "");
      setModel(printer.model ?? "");
      setType(String(printer.type ?? "FDM"));
      setCostPerHour(String(printer.costPerHour ?? ""));

      const volume = printer.buildVolume ?? "";
      const parts = volume
        .replace(/mm/gi, "")
        .split("x")
        .map((part) => part.trim());

      setVolumeX(parts[0] ?? "");
      setVolumeY(parts[1] ?? "");
      setVolumeZ(parts[2] ?? "");

      setStatus(
        printer.status === "active" ? "active" : "inactive",
      );
    } else {
      setName("");
      setManufacturer("");
      setModel("");
      setType("FDM");
      setVolumeX("");
      setVolumeY("");
      setVolumeZ("");
      setCostPerHour("");
      setStatus("active");
    }
  }, [open, printer]);

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim()) {
      alert("Informe o nome da impressora.");
      return;
    }

    if (!manufacturer.trim()) {
      alert("Informe o fabricante.");
      return;
    }

    if (!model.trim()) {
      alert("Informe o modelo.");
      return;
    }

    if (!volumeX || !volumeY || !volumeZ) {
      alert("Informe o volume de impressão completo.");
      return;
    }

    setSaving(true);

    try {
      const data = {
        name: name.trim(),
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        type: type as PrinterType["type"],
        status: status as PrinterType["status"],
        buildVolume: `${volumeX} × ${volumeY} × ${volumeZ} mm`,
        costPerHour: Number(costPerHour) || 0,
      } as Omit<PrinterType, "id" | "createdAt">;

      await onSave(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#08111f] shadow-2xl shadow-black/50">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? "Editar impressora" : "Nova impressora"}
            </h2>

            <p className="mt-1 text-sm text-white/40">
              {isEditing
                ? "Atualize as informações da impressora."
                : "Cadastre uma impressora para utilizar no gerenciamento de produção."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            {/* NOME */}
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Nome da impressora
              </label>

              <Input
                placeholder="Ex.: Ender 3 V2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* FABRICANTE / MODELO */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Fabricante
                </label>

                <Input
                  placeholder="Ex.: Creality"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Modelo
                </label>

                <Input
                  placeholder="Ex.: Ender 3 V2"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            {/* TIPO */}
            <div>
              <Select
                label="Tipo de impressão"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  {
                    value: "FDM",
                    label: "FDM",
                  },
                  {
                    value: "SLA",
                    label: "Resina / SLA",
                  },
                  {
                    value: "SLS",
                    label: "SLS",
                  },
                  {
                    value: "DLP",
                    label: "DLP",
                  },
                ]}
              />
            </div>

            {/* VOLUME */}
            <div>
              <label className="mb-3 block text-sm font-medium text-white/60">
                Volume de impressão (mm)
              </label>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="X"
                  type="number"
                  value={volumeX}
                  onChange={(e) => setVolumeX(e.target.value)}
                />

                <Input
                  placeholder="Y"
                  type="number"
                  value={volumeY}
                  onChange={(e) => setVolumeY(e.target.value)}
                />

                <Input
                  placeholder="Z"
                  type="number"
                  value={volumeZ}
                  onChange={(e) => setVolumeZ(e.target.value)}
                />
              </div>

              <p className="mt-2 text-xs text-white/30">
                Informe o tamanho máximo de impressão nos três eixos.
              </p>
            </div>

            {/* CUSTO / STATUS */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Custo por hora
                </label>

                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex.: 4.50"
                  value={costPerHour}
                  onChange={(e) => setCostPerHour(e.target.value)}
                />
              </div>

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  {
                    value: "active",
                    label: "Ativa",
                    dot: "bg-green-400",
                  },
                  {
                    value: "inactive",
                    label: "Inativa",
                    dot: "bg-white/30",
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-xl accent-bg px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff7b24] hover:shadow-lg hover:shadow-[var(--accent)]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Salvar impressora"}
          </Button>
        </div>
      </div>
    </div>
  );
}