import React, { useEffect, useState } from 'react'
import { getAllReports, updateReport, deleteReport } from '../../api/admin'
import '../../styles/ManageReports.css'


export default function ManageReports() {
    const [reports, setReports] = useState([])
    useEffect(() => { load() }, [])
    async function load() { const data = await getAllReports(); setReports(data || []) }


    async function resolve(r) {
        const resolver = prompt('Your name who resolves:')
        if (!resolver) return
        await updateReport(r.report_id || r.id, { status: 'Resolved', resolved_by: resolver })
        load()
    }
    async function remove(r) { if (!confirm('Delete report?')) return; await deleteReport(r.report_id || r.id); load() }


    return (
        <div className="manage-reports">
            <h3>Damage Reports</h3>
            <div className="reports-list">
                {reports.map(r => (
                    <div key={r.report_id || r.id} className="report-card">
                        <h4>Report #{r.report_id || r.id}</h4>
                        <p><strong>Vehicle:</strong> {r.vehicle_id}</p>
                        <p><strong>Reported by:</strong> {r.reported_by}</p>
                        <span className={`report-severity ${(r.severity || 'medium').toLowerCase()}`}>
                            {r.severity || 'Medium'}
                        </span>
                        <p><strong>Description:</strong> {r.description || 'No description'}</p>
                        <p><strong>Status:</strong> {r.status}</p>
                        <div className="report-card-actions">
                            {r.status !== 'Resolved' && <button className="edit-btn" onClick={() => resolve(r)}>Mark Resolved</button>}
                            <button className="delete-btn" onClick={() => remove(r)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}