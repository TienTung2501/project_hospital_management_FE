import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"; // Import component Checkbox
import { Button } from "@/components/ui/button"; // Import component Button
import { Switch } from "@/components/ui/switch"; // Import component Switch
import { FaEdit, FaTrash } from "react-icons/fa";

// Enum for column types
enum ColumnType {
  Text = "text",
  Button = "button",
  Switch = "switch",
  Currency = "currency",
  Date = "date", // Thêm kiểu Date
}

// Function to render cell content based on column type
const renderCellContent = (value: any, columnType: ColumnType) => {
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
          checked={value}
          onCheckedChange={(checked: boolean) => console.log(`Switch is now ${checked}`)}
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
      return <div>{value}</div>; // Fallback for other types
  }
};

// Define an interface that includes id
interface DataType {
  id: string|BigInt; // Add id property
  [key: string]: any; // Allow other properties with any type
}

// Generic function to create columns with a constraint on T
const createColumns = <T extends DataType>(
  data: T[],
  onEdit: (id: string|BigInt) => void, // Add onEdit function as parameter
  onDelete: (id: string |BigInt) => void // Add onDelete function as parameter
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

  const keys = Object.keys(data[0]).filter((key) => key !== "id");

  keys.forEach((key) => {
    let columnType: ColumnType = ColumnType.Text; // Default type

    // Determine column type based on key name
    if (key === "amount") {
      columnType = ColumnType.Currency;
    } else if (key === "status"||key==="healthInsuranceApplied") {
      columnType = ColumnType.Switch;
    } else if (key === "buttonLabel") {
      columnType = ColumnType.Button;
    } else if (key.toLowerCase().includes("date") || key === "created_at" || key === "updated_at") {
      columnType = ColumnType.Date; // Set column type to Date if the key includes "date"
    }

    columns.push({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize header
      cell: ({ row }) => renderCellContent(row.getValue(key), columnType),
    });
  });

  // Add actions column
  columns.push({
    id: "actions", // ID for the actions column
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
