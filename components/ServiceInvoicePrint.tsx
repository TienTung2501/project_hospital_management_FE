'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ServicePatient } from '@/types';

export type ServiceInvoicePrintHandle = {
  handlePrint: () => void;
};

type Props = {
  patient: any;
  servicePatients: ServicePatient[];
};
function formatDateCustom(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

const ServiceInvoicePrint = forwardRef<ServiceInvoicePrintHandle, Props>(
  ({ patient, servicePatients }, ref) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
      const printContents = printRef.current?.innerHTML;
      if (!printContents) return alert('Không có nội dung để in.');
    
      const newWindow = window.open('', '', 'width=820,height=600');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Hóa đơn</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  line-height: 1.6;
                  font-size: 14px;
                }
                h2 {
                  text-align: center;
                  margin-bottom: 24px;
                  font-size: 20px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 24px;
                  table-layout: fixed;
                }
                th, td {
                  border: 1px solid #333;
                  padding: 10px 12px;
                  text-align: left;
                  word-wrap: break-word;
                }
                th {
                  background-color: #f5f5f5;
                  font-weight: bold;
                  text-align: center;
                }
                tr:nth-child(even) {
                  background-color: #fafafa;
                }
                td:last-child, th:last-child {
                  text-align: right;
                }
              </style>
            </head>
            <body>
              ${printContents}
            </body>
          </html>
        `);
    
        newWindow.document.close();
    
        // ✅ Thêm delay để đảm bảo DOM render xong rồi mới in
        setTimeout(() => {
          newWindow.focus();
          newWindow.print();
          newWindow.close();
        }, 500);
      }
    };
    
    const columnServicePartientNotHeaderMap = {
      service_name: "Tên dịch vụ",
      department_name: "Tên khoa",
      room_code: "Phòng",
      price: "Giá",
    };
    useImperativeHandle(ref, () => ({ handlePrint }));
    console.log(servicePatients.reduce((sum, s) => sum + s.price, 0).toLocaleString("en-US", { minimumFractionDigits: 3 }));
    return (
      <div ref={printRef} className="w-full">
        <h2>HÓA ĐƠN DỊCH VỤ KHÁM BỆNH</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p><strong>Tên bệnh nhân:</strong> {patient?.name || "Không có"}</p>
            <p><strong>Ngày sinh:</strong> {patient?.birthday ? formatDateCustom(patient.birthday) : "Không có"}</p>
            <p><strong>Giới tính:</strong> {patient?.gender === 1 ? "Nam" : patient?.gender === 2 ? "Nữ" : "Không có"}</p>
            <p><strong>Điện thoại:</strong> {patient?.phone || "Không có"}</p>
          </div>
          <div>
            <p><strong>Địa chỉ:</strong> {patient?.address || "Không có"}</p>
            <p><strong>Số CCCD:</strong> {patient?.cccd_number || "Không có"}</p>
            <p><strong>Mã thẻ BHYT:</strong> {patient?.health_insurance_code || "Không có"}</p>
            <p><strong>Điện thoại người giám hộ:</strong> {patient?.guardian_phone || "Không có"}</p>
          </div>
        </div>

        <table className="w-full">
  <thead className="text-left">
    <tr>
      <th>STT</th>
      {Object.values(columnServicePartientNotHeaderMap).map((title, idx) => (
        <th key={idx}>{title}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {servicePatients.map((s, index) => {
    const price = isNaN(parseFloat(s.price)) ? 0 : parseFloat(s.price); // Đảm bảo giá trị price hợp lệ
    const formattedPrice = price.toLocaleString("vi-VN"); // Format giá trị
    return (
      <tr key={String(s.id)}>
        <td>{index + 1}</td>
        <td>{s.service_name}</td>
        <td>{s.department_name}</td>
        <td>{s.room_code}</td>
        <td className="text-right">{formattedPrice} đ</td>
      </tr>
    );
  })}

<tr>
  <td colSpan={Object.keys(columnServicePartientNotHeaderMap).length+1} className="text-right w-full">
    <strong>
      Tổng cộng:{" "}
      {parseFloat(
        servicePatients.reduce(
          (sum, s) => sum + (isNaN(parseFloat(s.price)) ? 0 : parseFloat(s.price)),
          0
        )
      ).toLocaleString("vi-VN")} đ
    </strong>
  </td>
</tr>

  </tbody>
</table>
      </div>
    );
  }
);

export default ServiceInvoicePrint;
