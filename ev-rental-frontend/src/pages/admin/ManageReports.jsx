import React, { useEffect, useState } from 'react'
import { getAllReports, updateReport, deleteReport } from '../../api/admin'
import '../../styles/ManageReports.css'

/**
 * MANAGE DAMAGE REPORTS PAGE
 * 
 * Trang quản lí báo cáo hư hỏng xe dành cho admin/staff
 * 
 * Chức năng:
 * 1. Xem danh sách tất cả báo cáo hư hỏng
 * 2. Đánh dấu báo cáo đã sửa (Resolved)
 *    - Yêu cầu nhập tên người sửa
 * 3. Xóa báo cáo hư hỏng
 * 
 * API calls:
 * - getAllReports(): Lấy danh sách tất cả báo cáo
 * - updateReport(id, data): Cập nhật trạng thái báo cáo
 * - deleteReport(id): Xóa báo cáo
 * 
 * Report object structure:
 * {
 *   report_id: "rpt001",
 *   vehicle_id: "v001",
 *   reported_by: "John Doe",
 *   severity: "High" | "Medium" | "Low",
 *   description: "Hư hỏng mô tả chi tiết",
 *   status: "Pending" | "Resolved" | "In Progress",
 *   resolved_by: "Admin Name" (nếu đã sửa)
 * }
 */

export default function ManageReports() {
    /**
     * State reports - Danh sách tất cả báo cáo hư hỏng
     * - Mỗi report chứa thông tin xe, người báo cáo, mức độ, mô tả, trạng thái
     */
    const [reports, setReports] = useState([])

    /**
     * useEffect hook - Chạy khi component mount
     * - Dependencies array rỗng [] → chỉ chạy 1 lần
     * - Gọi load() để lấy dữ liệu báo cáo từ API
     */
    useEffect(() => { load() }, [])

    /**
     * Hàm load() - Lấy danh sách báo cáo từ API
     * - Gọi getAllReports() từ api/admin.js
     * - Cập nhật state reports với data từ API
     * - Nếu data = null → set reports = [] (mảng rỗng)
     */
    async function load() {
        const data = await getAllReports()
        setReports(data || [])
    }

    /**
     * Hàm resolve(r) - Đánh dấu báo cáo đã được sửa
     * 
     * Parameters:
     * - r: report object chứa report_id
     * 
     * Process:
     * 1. Hiển thị prompt dialog yêu cầu nhập tên người sửa
     * 2. Nếu user cancel → return (không làm gì)
     * 3. Nếu user nhập tên → gọi updateReport() với:
     *    - status: "Resolved" (đã sửa)
     *    - resolved_by: tên người sửa (user nhập vào)
     * 4. Sau khi update → gọi load() để refresh danh sách
     * 
     * Example:
     * - User nhập "Nguyễn Văn A"
     * - Report được cập nhật: { status: "Resolved", resolved_by: "Nguyễn Văn A" }
     */
    async function resolve(r) {
        const resolver = prompt('Your name who resolves:')
        if (!resolver) return
        await updateReport(r.report_id || r.id, { status: 'Resolved', resolved_by: resolver })
        load()
    }

    /**
     * Hàm remove(r) - Xóa báo cáo
     * 
     * Parameters:
     * - r: report object chứa report_id
     * 
     * Process:
     * 1. Hiển thị confirmation dialog: "Delete report?"
     * 2. Nếu user click Cancel → return (không làm gì)
     * 3. Nếu user click OK → gọi deleteReport(id)
     * 4. Sau khi xóa → gọi load() để refresh danh sách
     */
    async function remove(r) {
        if (!confirm('Delete report?')) return
        await deleteReport(r.report_id || r.id)
        load()
    }

    return (
        <div className="manage-reports">
            <h3>Damage Reports</h3>

            {/* 
              Container chứa danh sách báo cáo
              - className="reports-list" để áp dụng CSS grid layout
              - Mỗi báo cáo hiển thị trong một card
            */}
            <div className="reports-list">
                {/* 
                  Loop qua reports array → tạo report card cho mỗi báo cáo
                  - key={r.report_id || r.id} → React cần key để track items
                  - className="report-card" → CSS styling cho card
                */}
                {reports.map(r => (
                    <div key={r.report_id || r.id} className="report-card">
                        {/* 
                          Report ID - Số báo cáo
                          - Hiển thị dạng: Report #rpt001
                        */}
                        <h4>Report #{r.report_id || r.id}</h4>

                        {/* ID xe bị hư hỏng */}
                        <p><strong>Vehicle:</strong> {r.vehicle_id}</p>

                        {/* Tên người báo cáo hư hỏng */}
                        <p><strong>Reported by:</strong> {r.reported_by}</p>

                        {/* 
                          Mức độ hư hỏng - Severity badge
                          - Có 3 mức: High (đỏ), Medium (vàng), Low (xanh)
                          - className động: `report-severity ${(r.severity || 'medium').toLowerCase()}`
                          - CSS class thay đổi màu theo mức độ
                        */}
                        <span className={`report-severity ${(r.severity || 'medium').toLowerCase()}`}>
                            {r.severity || 'Medium'}
                        </span>

                        {/* 
                          Mô tả chi tiết hư hỏng
                          - Fallback "No description" nếu không có mô tả
                        */}
                        <p><strong>Description:</strong> {r.description || 'No description'}</p>

                        {/* Trạng thái báo cáo: Pending/Resolved/In Progress */}
                        <p><strong>Status:</strong> {r.status}</p>

                        {/* 
                          Hành động - 2 buttons
                          - className="report-card-actions" → flex layout
                        */}
                        <div className="report-card-actions">
                            {/* 
                              Button "Mark Resolved" - Đánh dấu đã sửa
                              - Chỉ hiển thị nếu status !== 'Resolved'
                              - Conditional: {r.status !== 'Resolved' && <button>...}
                              - Khi click → gọi resolve(r) để nhập tên người sửa
                            */}
                            {r.status !== 'Resolved' && (
                                <button
                                    className="edit-btn"
                                    onClick={() => resolve(r)}
                                >
                                    Mark Resolved
                                </button>
                            )}

                            {/* 
                              Button "Delete" - Xóa báo cáo
                              - Luôn hiển thị
                              - Khi click → gọi remove(r) với confirmation dialog
                            */}
                            <button
                                className="delete-btn"
                                onClick={() => remove(r)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}