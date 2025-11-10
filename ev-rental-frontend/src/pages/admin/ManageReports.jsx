import React, { useEffect, useState } from 'react'
import { getAllReports, updateReport, deleteReport } from '../../api/admin'


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
        <div>
            <h3>Damage Reports</h3>
            <table style={{ width: '100%' }}>
                <thead><tr><th>ID</th><th>Vehicle</th><th>Reported by</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    {reports.map(r => (
                        <tr key={r.report_id || r.id}>
                            <td>{r.report_id || r.id}</td>
                            <td>{r.vehicle_id}</td>
                            <td>{r.reported_by}</td>
                            <td>{r.status}</td>
                            <td>
                                {r.status !== 'Resolved' && <button onClick={() => resolve(r)}>Mark Resolved</button>}
                                <button onClick={() => remove(r)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}