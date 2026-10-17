import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function BookAppointment() {
  const [formData, setFormData] = useState({
    patient_name: '',
    phone_number: '',
    department: '',
    appointment_date: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Supabase டேட்டாபேஸில் சேமித்தல்
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_name: formData.patient_name,
            phone_number: formData.phone_number,
            department: formData.department,
            appointment_date: formData.appointment_date,
            status: 'Confirmed'
          }
        ]);

      if (error) throw error;

      // 2. n8n Webhook-க்கு நேரடியாக SMS அனுப்ப அழைப்பு (Fetch)
      await fetch('http://localhost:5678/webhook/c0029141-0e8f-4f45-b24d-961419d1195a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          record: {
            patient_name: formData.patient_name,
            phone_number: formData.phone_number
          }
        }),
      });

      alert('Appointment booked successfully! SMS will be sent.');
      
      // Form-ஐ கிளியர் செய்ய
      setFormData({
        patient_name: '',
        phone_number: '',
        department: '',
        appointment_date: ''
      });

    } catch (err) {
      console.error('Error:', err.message);
      alert('Error booking appointment');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Book Medical Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient Name</label>
          <input
            type="text"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
          <input
            type="datetime-local"
            name="appointment_date"
            value={formData.appointment_date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded mt-1"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700 font-semibold"
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
}