import React from 'react';

export default function AdminDashboard({ appointments, labReports, fetchAdminData }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0 }}>⚡ Admin Management Dashboard</h2>
        <button onClick={fetchAdminData} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
          🔄 Refresh Live Data
        </button>
      </div>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '15px', color: '#2563eb' }}>📅 Live Patient Appointments ({appointments.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Patient Name</th>
                <th style={{ padding: '12px' }}>Phone</th>
                <th style={{ padding: '12px' }}>Department</th>
                <th style={{ padding: '12px' }}>Date / Time</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: '800' }}>#{a.id}</td>
                  <td style={{ padding: '12px' }}>{a.patient_name}</td>
                  <td style={{ padding: '12px' }}>{a.phone_number}</td>
                  <td style={{ padding: '12px' }}><span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '6px', fontWeight: '800' }}>{a.department}</span></td>
                  <td style={{ padding: '12px' }}>{new Date(a.appointment_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '15px', color: '#10b981' }}>🧪 Patient Lab Reports Records ({labReports.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Patient ID</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Test Name</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>PDF Link</th>
              </tr>
            </thead>
            <tbody>
              {labReports.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: '800' }}>{r.patient_id}</td>
                  <td style={{ padding: '12px' }}>{r.patient_name}</td>
                  <td style={{ padding: '12px' }}>{r.test_name}</td>
                  <td style={{ padding: '12px' }}><span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontWeight: '800' }}>{r.result_status}</span></td>
                  <td style={{ padding: '12px' }}><a href={r.pdf_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '800' }}>View PDF 📥</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}