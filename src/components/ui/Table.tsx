import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  className?: string;
  children: ReactNode;
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full divide-y divide-white/10", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, children }: TableProps) {
  return (
    <thead className={cn("bg-white/[0.03]", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children }: TableProps) {
  return (
    <tbody className={cn("divide-y divide-white/5 bg-transparent", className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children }: TableProps) {
  return (
    <tr className={cn("transition-colors hover:bg-white/[0.03]", className)}>
      {children}
    </tr>
  );
}

interface TableHeadCellProps {
  className?: string;
  children: ReactNode;
  colSpan?: number;
}

export function TableHeadCell({ className, children, colSpan }: TableHeadCellProps) {
  return (
    <th
      colSpan={colSpan}
      className={cn(
        "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/40",
        className
      )}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  className?: string;
  children: ReactNode;
  colSpan?: number;
}

export function TableCell({ className, children, colSpan }: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      className={cn("whitespace-nowrap px-6 py-4 text-sm text-white/70", className)}
    >
      {children}
    </td>
  );
}