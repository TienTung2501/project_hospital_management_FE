import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FaEdit, FaTrash } from "react-icons/fa";

// Enum for column types
enum ColumnType {
  Text = "text",
  Button = "button",
  Switch = "switch",
  Currency = "currency",
  Date = "date",
}

// Function to render cell content based on column type
const renderCellContent = (
  value: any, 
  columnType: ColumnType, 
  onStatusChange?: (newValue: number) => void
) => {
  switch (columnType) {
    case ColumnType.Text:
      return <div className="capitalize">{value}</div>;
    case ColumnType.Currency:
      return (
        <div className="text-right font-medium w-fit">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)}
        </div>
      );
    case ColumnType.Switch:
      return (
        <Switch
          checked={value === 1} // Assuming 1 is the "active" status
          onCheckedChange={(newValue) => onStatusChange?.(newValue ? 1 : 0)} // Chuyển đổi boolean về number
        />
      );
    case ColumnType.Button:
      return (
        <Button onClick={() => alert(`Button clicked: ${value}`)} variant="ghost">
          {value}
        </Button>
      );
    case ColumnType.Date:
      return (
        <div>
          {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value))}
        </div>
      );
    default:
      return <div>{value}</div>;
  }
};

// Define an interface that includes id
interface DataType {
  id: string | BigInt;
  [key: string]: any;
}

// Generic function to create columns with a constraint on T
const createColumns = <T extends DataType>(
  data: T[],
  onEdit: (id: string | BigInt) => void,
  onDelete: (id: string | BigInt) => void,
  onStatusChange: (id: string | BigInt, newValue: number) => void // Update type for newValue
): ColumnDef<T>[] => {
  const columns: ColumnDef<T>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
    if (!Array.isArray(data) || data.length === 0) {
      // Xử lý trường hợp không có dữ liệu
      console.warn("No data available to create columns.");
      return [];
  }
  const keys = Object.keys(data[0]).filter((key) => key !== "id");

  keys.forEach((key) => {
    let columnType: ColumnType = ColumnType.Text; // Default type

    // Determine column type based on key name
    if (key === "amount") {
      columnType = ColumnType.Currency;
    } else if (key === "status" || key === "healthInsuranceApplied") {
      columnType = ColumnType.Switch;
    } else if (key === "buttonLabel") {
      columnType = ColumnType.Button;
    } else if (key.toLowerCase().includes("date") || key === "created_at" || key === "updated_at") {
      columnType = ColumnType.Date;
    }

    columns.push({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize header
      cell: ({ row }) => renderCellContent(row.getValue(key), columnType, key === "status" ? (newValue) => onStatusChange(row.original.id, newValue ? 1 : 0) : undefined), // Chuyển đổi boolean về number
    });
  });

  // Add actions column
  columns.push({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="space-x-2 w-fit">
        <Button onClick={() => onEdit(row.original.id)} variant="ghost">
          <FaEdit />
        </Button>
        <Button onClick={() => onDelete(row.original.id)} variant="ghost">
          <FaTrash />
        </Button>
      </div>
    ),
    enableSorting: false,
  });

  return columns;
};

export default createColumns;
