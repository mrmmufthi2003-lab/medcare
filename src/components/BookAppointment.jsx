import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function BookAppointment({ userRole, fetchAdminData }) {
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // 50 Centers of Excellence List
  const allCenters = [
    { title: "Interventional Cardiology" },
    { title: "Neurology & Neurosurgery" },
    { title: "Orthopedics & Joint Science" },
    { title: "Oncology & Radiation Therapy" },
    { title: "Gastroenterology & Hepatology" },
    { title: "Nephrology & Kidney Transplantation" },
    { title: "Pulmonology & Sleep Medicine" },
    { title: "Endocrinology & Diabetes" },
    { title: "Dermatology & Cosmetology" },
    { title: "Ophthalmology & Eye Care" },
    { title: "ENT (Ear, Nose, Throat)" },
    { title: "Pediatrics & Neonatology" },
    { title: "Obstetrics & Gynecology" },
    { title: "Urology & Andrology" },
    { title: "Rheumatology & Immunology" },
    { title: "Plastic & Reconstructive Surgery" },
    { title: "Vascular Surgery" },
    { title: "Cardiothoracic Surgery" },
    { title: "General & Laparoscopic Surgery" },
    { title: "Internal Medicine" },
    { title: "Psychiatry & Mental Health" },
    { title: "Physical Medicine & Rehabilitation" },
    { title: "Emergency & Critical Care Medicine" },
    { title: "Radiology & Imaging Sciences" },
    { title: "Nuclear Medicine" },
    { title: "Pathology & Laboratory Medicine" },
    { title: "Anesthesiology & Pain Management" },
    { title: "Hematology & BMT" },
    { title: "Infectious Diseases" },
    { title: "Geriatric Medicine" },
    { title: "Sports Medicine" },
    { title: "Bariatric & Metabolic Surgery" },
    { title: "Hepatobiliary Surgery" },
    { title: "Colorectal Surgery" },
    { title: "Surgical Oncology" },
    { title: "Medical Oncology" },
    { title: "Radiation Oncology" },
    { title: "Pediatric Surgery" },
    { title: "Pediatric Cardiology" },
    { title: "Pediatric Neurology" },
    { title: "Fetal Medicine" },
    { title: "Reproductive Medicine & IVF" },
    { title: "Ayurveda & Integrative Medicine" },
    { title: "Dental & Maxillofacial Surgery" },
    { title: "Pain Medicine" },
    { title: "Palliative Care" },
    { title: "Genetic Medicine" },
    { title: "Clinical Nutrition & Dietetics" },
    { title: "Preventive Health & Wellness" },
    { title: "Trauma Care Center" }
  ];

  const [selectedDept, setSelectedDept] = useState(allCenters[0].title);
  const [loading, setLoading] = useState(false);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('appointments').insert([
      { 
        patient_name: patientName, 
        phone_number: phoneNumber, 
        department: selectedDept, 
        appointment_date: new Date().toISOString() 
      }
    ]);
    setLoading(false);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert(`🎉 Appointment booked successfully for ${patientName}!`);
      setPatientName('');
      setPhoneNumber('');
      if (userRole === 'admin' && fetchAdminData) {
        fetchAdminData();
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Book Consultation (Live Database)</h2>
      <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        <input 
          type="text" 
          placeholder="Patient Full Name" 
          value={patientName} 
          onChange={(e) => setPatientName(e.target.value)} 
          required 
          style={{ padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
        />
        <input 
          type="tel" 
          placeholder="Phone Number" 
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
          required 
          style={{ padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
        />
        
        {/* All 50 Departments Dropdown */}
        <select 
          value={selectedDept} 
          onChange={(e) => setSelectedDept(e.target.value)} 
          style={{ padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }}
        >
          {allCenters.map((center, index) => (
            <option key={index} value={center.title}>
              {center.title}
            </option>
          ))}
        </select>

        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Confirm Real-Time Booking 🚀'}
        </button>
      </form>
    </div>
  );
}