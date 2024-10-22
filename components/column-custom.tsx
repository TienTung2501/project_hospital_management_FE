import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

// Enum for column types
enum ColumnType {
  Text = "text",
  Button = "button",
  Switch = "switch",
  Currency = "currency",
  Date = "date",
  Gender = "gender",    // Thêm kiểu cột cho giới tính
  Status = "examination_status",    // Thêm kiểu cột cho trạng thái khám
}
// Interface cho cấu hình cột kiểu Switch
interface SwitchConfig {
  key: string; // Key của cột sẽ dùng switch
  onStatusChange: (id: string | BigInt, newValue: number) => void; // Hàm xử lý thay đổi
}

interface DataType {
  id: string | BigInt;
  [key: string]: any;
}

// Interface for action buttons configuration
interface ActionButtonsConfig {
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
}

// Function to map the header label
const getHeaderLabel = (key: string, columnHeaderMap: { [key: string]: string }) => {
  return columnHeaderMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

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
      case ColumnType.Gender:  // Xử lý cột giới tính
      return <div>{value === 1 ? "Nam" : "Nữ"}</div>;
    case ColumnType.Status:  // Xử lý cột trạng thái khám
      return (
        <div>
          {value === 1
            ? "Đã khám"
            : value === 0
            ? "Chưa khám"
            : "Đang khám"}
        </div>
      );
    default:
      return <div>{value}</div>;
  }
};

// Generic function to create columns with a constraint on T
const createColumns = <T extends DataType>(
  data: T[],
  onView: (id: string | BigInt) => void,
  onEdit: (id: string | BigInt) => void,
  onDelete: (id: string | BigInt) => void,
  columnHeaderMap: { [key: string]: string }, // Map header
  actionButtonsConfig: ActionButtonsConfig, // Cấu hình cho các nút hành động
  switchConfig: SwitchConfig[] // Cấu hình cho cột kiểu switch
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

    // Xác định kiểu cột dựa trên cấu hình switch
    const switchColumn = switchConfig.find((config) => config.key === key);

    if (switchColumn) {
      columnType = ColumnType.Switch;
    } else if (key === "amount") {
      columnType = ColumnType.Currency;
    } else if (key === "buttonLabel") {
      columnType = ColumnType.Button;
    } else if (key.toLowerCase().includes("date") || key === "created_at" || key === "updated_at") {
      columnType = ColumnType.Date;
    }
    else if (key === "gender") {  // Thêm cột xử lý giới tính
      columnType = ColumnType.Gender;
    } else if (key === "examination_status") {  // Thêm cột xử lý trạng thái khám
      columnType = ColumnType.Status;
    }

    columns.push({
      accessorKey: key,
      header: getHeaderLabel(key, columnHeaderMap),
      cell: ({ row }) =>
        renderCellContent(
          row.getValue(key),
          columnType,
          switchColumn ? (newValue) => switchColumn.onStatusChange(row.original.id, newValue ? 1 : 0) : undefined
        ),
    });
  });

  // Thêm cột hành động
  if (actionButtonsConfig.view || actionButtonsConfig.edit || actionButtonsConfig.delete) {
    columns.push({
      id: "actions",
      header: () => (
        <div className="text-center">
          Hành động
        </div>
      ),
      cell: ({ row }) => (
        <div className="space-x-2 w-fit flex justify-center items-center mx-auto">
          {actionButtonsConfig.view && (
            <Button
              onClick={() => onView?.(row.original.id)}
              variant="ghost"
              className="p-1 m-0 w-6 h-6 flex justify-center items-center"
            >
              <FaEye size={12} />
            </Button>
          )}
          {actionButtonsConfig.edit && (
            <Button
              onClick={() => onEdit?.(row.original.id)}
              variant="ghost"
              className="p-1 m-0 w-6 h-6 flex justify-center items-center"
            >
              <FaEdit size={12} />
            </Button>
          )}
          {actionButtonsConfig.delete && (
            <Button
              onClick={() => onDelete?.(row.original.id)}
              variant="ghost"
              className="p-1 m-0 w-6 h-6 flex justify-center items-center"
            >
              <FaTrash size={12} />
            </Button>
          )}
        </div>
      ),
      enableSorting: false,
    });
    
  }

  return columns;
};

export default createColumns;
