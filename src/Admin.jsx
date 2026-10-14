import React, { useState } from 'react';
import { 
  Activity, Users, Calendar, Plus, Trash2, LayoutDashboard, Stethoscope, Clock, ShieldCheck
} from 'lucide-react';

export default function Admin() {
  const [doctorsList, setDoctorsList] = useState([
    { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiology • Iruadhayaviyal", fee: "₹700", available: "Today" },
    { id: 2, name: "Dr. Rajesh Kumar", specialty: "Pediatrics • Kulandhai Nalam", fee: "₹500", available: "Today" },
    { id: 3, name: "Dr. Anita Desai", specialty: "Dental • Pal Maruthuvam", fee: "₹400", available: "Tomorrow" }
  ]);

  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocFee, setNewDocFee] = useState('');

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDocName || !newDocSpecialty || !newDocFee) return;
    const newDoc = {
      id: Date.now(),
      name: newDocName,
      specialty: newDocSpecialty,
      fee: newDocFee,
      available: "Available"
    };
    setDoctorsList([...doctorsList, newDoc]);
    setNewDocName('');
    setNewDocSpecialty('');
    setNewDocFee('');
  };

  const handleDeleteDoctor = (id) => {
    setDoctorsList(doctorsList.filter(doc => doc.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Admin Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">MEDCARE</h1>
              <p className="text-xs font-medium text-blue-400">ADMIN FRONTEND PORTAL</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/20">
              ● Admin Logged In
            </span>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-blue-900 text-white p-6 rounded-3xl mb-8 flex justify-between items-center shadow-lg">
          <div>
            <span className="bg-blue-800 text-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Management Console
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">Clinic Admin Dashboard</h2>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase">Total Doctors</p>
            <p className="text-3xl font-black text-blue-900 mt-1">{doctorsList.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase">Today Appointments</p>
            <p className="text-3xl font-black text-blue-900 mt-1">24</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase">System Status</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">Active</p>
          </div>
        </div>

        {/* Add Doctor & List Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-1">
            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Add New Doctor
            </h3>
            <form onSubmit={handleAddDoctor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Doctor Name</label>
                <input 
                  type="text" 
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. John" 
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Specialty</label>
                <input 
                  type="text" 
                  value={newDocSpecialty}
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  placeholder="e.g. Neurology" 
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Fee</label>
                <input 
                  type="text" 
                  value={newDocFee}
                  onChange={(e) => setNewDocFee(e.target.value)}
                  placeholder="e.g. ₹600" 
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow transition">
                Save Doctor
              </button>
            </form>
          </div>

          {/* List Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2">
            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Manage Doctors List
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase">
                    <th className="pb-3">Doctor Name</th>
                    <th className="pb-3">Specialty</th>
                    <th className="pb-3">Fee</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorsList.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-800">{doc.name}</td>
                      <td className="py-3 text-slate-500">{doc.specialty}</td>
                      <td className="py-3 font-semibold text-blue-900">{doc.fee}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => handleDeleteDoctor(doc.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}