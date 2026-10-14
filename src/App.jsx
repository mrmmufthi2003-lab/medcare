import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [reportId, setReportId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginType, setLoginType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);

  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedDept, setSelectedDept] = useState('Interventional Cardiology');
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchAdminData();
    }
  }, [userRole]);

  const fetchAdminData = async () => {
    const { data: appData } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    const { data: repData } = await supabase.from('lab_reports').select('*').order('created_at', { ascending: false });
    if (appData) setAppointments(appData);
    if (repData) setLabReports(repData);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginType === 'admin') {
      if (email === 'admin@medcare.com' && password === 'admin123') {
        setIsLoggedIn(true);
        setUserRole('admin');
        setShowLoginModal(false);
        setActiveTab('admin_dashboard');
        alert('Welcome Admin!');
      } else {
        alert('Invalid Admin Credentials!');
      }
    } else {
      setIsLoggedIn(true);
      setUserRole('patient');
      setShowLoginModal(false);
      alert('Patient Login Successful!');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('appointments').insert([
      { patient_name: patientName, phone_number: phoneNumber, department: selectedDept, appointment_date: new Date().toISOString() }
    ]);
    setLoading(false);
    if (error) alert('Error: ' + error.message);
    else {
      alert(`🎉 Appointment booked successfully for ${patientName}!`);
      setPatientName('');
      setPhoneNumber('');
      if (userRole === 'admin') fetchAdminData();
    }
  };

  const handleFetchReport = async () => {
    if (!reportId) { alert('Please enter Patient ID!'); return; }
    setLoading(true);
    setReportResult(null);
    const { data, error } = await supabase.from('lab_reports').select('*').eq('patient_id', reportId.trim()).single();
    setLoading(false);
    if (error || !data) alert('❌ No report found. Try ID: MED-89421');
    else setReportResult(data);
  };

  const departmentNames = [
    "Interventional Cardiology", "Neurology & Neurosurgery", "Orthopedics & Joint Science", "Oncology & Radiation Therapy", 
    "Gastroenterology & Hepatology", "Nephrology & Kidney Transplantation", "Pulmonology & Sleep Medicine", "Endocrinology & Diabetes", 
    "Dermatology & Cosmetology", "Ophthalmology & Eye Care", "ENT (Ear, Nose, Throat)", "Pediatrics & Neonatology", 
    "Obstetrics & Gynecology", "Urology & Andrology", "Rheumatology & Immunology", "Plastic & Reconstructive Surgery", 
    "Vascular Surgery", "Cardiothoracic Surgery", "General & Laparoscopic Surgery", "Internal Medicine", 
    "Psychiatry & Mental Health", "Physical Medicine & Rehabilitation", "Emergency & Critical Care Medicine", "Radiology & Imaging Sciences", 
    "Nuclear Medicine", "Pathology & Laboratory Medicine", "Anesthesiology & Pain Management", "Hematology & BMT", 
    "Infectious Diseases", "Geriatric Medicine", "Sports Medicine", "Bariatric & Metabolic Surgery", 
    "Hepatobiliary Surgery", "Colorectal Surgery", "Surgical Oncology", "Medical Oncology", 
    "Radiation Oncology", "Pediatric Surgery", "Pediatric Cardiology", "Pediatric Neurology", 
    "Fetal Medicine", "Reproductive Medicine & IVF", "Ayurveda & Integrative Medicine", "Dental & Maxillofacial Surgery", 
    "Pain Medicine", "Palliative Care", "Genetic Medicine", "Clinical Nutrition & Dietetics", 
    "Preventive Health & Wellness", "Trauma Care Center"
  ];

  const doctorNamesList = [
    "Dr. Senthil Kumar", "Dr. Priya Sharma", "Dr. Rajesh Iyer", "Dr. Lakshmi Menon", "Dr. Vikram Singh", "Dr. Anita Desai", "Dr. Arun Chandran", "Dr. Meera Nair", "Dr. Karthik Raja", "Dr. Divya Patel",
    "Dr. Suresh Babu", "Dr. Pooja Hegde", "Dr. Murali Krishna", "Dr. Saranya Devi", "Dr. Naveen Kumar", "Dr. Geetha Reddy", "Dr. Balaji Viswanathan", "Dr. Shalini Singh", "Dr. Praveen Kumar", "Dr. Uma Maheshwari",
    "Dr. Ganesh Prabhu", "Dr. Kavitha Ramachandran", "Dr. Rakesh Sharma", "Dr. Nandini Iyer", "Dr. Vijay Anand", "Dr. Swathi Reddy", "Dr. Sathish Kumar", "Dr. Anjali Menon", "Dr. Hariharan Venkat", "Dr. Revathi Subramanian",
    "Dr. Christopher Daniel", "Dr. Elizabeth Thomas", "Dr. James Wilson", "Dr. Sarah Johnson", "Dr. Michael Brown", "Dr. Emily Davis", "Dr. Robert Miller", "Dr. Jessica Wilson", "Dr. David Smith", "Dr. Jennifer Jones",
    "Dr. Mohamed Farook", "Dr. Aisha Rahman", "Dr. Syed Ibrahim", "Dr. Fatima Bi", "Dr. Abdul Rahman", "Dr. Zoya Khan", "Dr. Imran Khan", "Dr. Hina Khan", "Dr. Salman Khan", "Dr. Katrina Kaif"
  ];

  const diagnosticScansList = [
    "1.5 Tesla Cardiac MRI", "256 Slice Cardiac CT", "Interventional Angiography", "Color Doppler Study", "Nuclear Stress Test", "Transesophageal Echo", "Myocardial Viability Scan", "Peripheral Angiogram", "Electrocardiogram (ECG)", "Carotid Ultrasound",
    "128 Slice Brain CT", "EEG & Nerve Conduction", "Magnetic Resonance Angiogram", "Transcranial Doppler", "Brain PET Scan", "Lumbar Spine MRI", "Sleep Study (Polysomnogram)", "Visual Evoked Potentials", "CT Pulmonology Angio", "Fibreoptic Bronchoscopy",
    "Upper GI Endoscopy", "Colonoscopy & Biopsy", "FibroScan for Liver", "H. Pylori Breath Test", "ERCP Procedure", "Abdominal CT Scan", "Esophageal Manometry", "Renal Angiogram", "DTPA Renal Scan", "Kidney Ultrasound",
    "X-ray Chest PA View", "Mammography (Digital)", "Bone Mineral Density (DEXA)", "Orthopantomogram (OPG)", "Ultrasound Whole Abdomen", "CT Paranasal Sinuses", "MRI Knee Joint", "MRI Lumbar Spine", "Thyroid Ultrasound", "Soft Tissue Ultrasound",
    "Hemoglobin Variant Assay", "Peripheral Blood Smear", "Bone Marrow Aspiration", "Flow Cytometry Study", "Bleeding Time / Clotting Time", "Prothrombin Time (INR)", "Reticulocyte Count", "Ferritin Level Test", "Vitamin B12 Assay", "Folic Acid Assay"
  ];

  const medImages = [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80'
  ];

  const docImages = [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594824813566-88855ce78961?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80'
  ];

  const diagImages = [
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80'
  ];

  const centersList = departmentNames.map((name, i) => ({
    title: name,
    tag: i % 2 === 0 ? 'High Precision Care' : 'Robotic Surgical Suite',
    desc: 'Advanced multi-specialty clinical department offering 24/7 emergency response.',
    img: medImages[i % medImages.length]
  }));

  const doctorsList = Array.from({ length: 50 }, (_, i) => ({
    name: doctorNamesList[i] || `Dr. Specialist ${i + 1}`,
    spec: departmentNames[i % departmentNames.length],
    exp: `${10 + (i % 15)}+ Years Exp`,
    rating: '4.9 ⭐',
    img: docImages[i % docImages.length]
  }));

  const diagnosticsList = Array.from({ length: 50 }, (_, i) => ({
    title: diagnosticScansList[i] || `Advanced Diagnostic Scan #${i + 1}`,
    tag: i % 2 === 0 ? 'AI Assisted Scan' : 'Ultra-Low Radiation',
    desc: 'State-of-the-art imaging equipment for early disease detection and accurate diagnosis.',
    img: diagImages[i % diagImages.length]
  }));

  const filteredCenters = centersList.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDoctors = doctorsList.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.spec.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDiagnostics = diagnosticsList.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const hospitalBgUrl = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80';

  return (
    <div style={{ 
      fontFamily: "'Plus Jakarta Sans', sans-serif", 
      backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.45), rgba(30, 41, 59, 0.45)), url("${hospitalBgUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <style>{`
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 35px rgba(0,0,0,0.2); }
      `}</style>

      {/* Top Emergency Ribbon */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '10px 24px', fontSize: '13px', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🔴 RAPID TRIAGE | EMERGENCY DISPATCH: SLA &lt; 7.8 Mins</span>
        <span style={{ color: '#10b981' }}>🟢 Supabase Live DB Connected | 📞 1800-MED-CARE</span>
      </div>

      {/* Navigation Header */}
      <header style={{ background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #cbd5e1', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
            <div style={{ width: '46px', height: '46px', background: '#2563eb', color: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '26px' }}>+</div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, color: '#0f172a', letterSpacing: '0.5px' }}>MEDCARE</h1>
              <p style={{ fontSize: '11px', fontWeight: '800', margin: 0, color: '#2563eb', letterSpacing: '0.5px' }}>HEALTHCARE NETWORK</p>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'home', label: 'Home' },
              { id: 'centers', label: `Centers (${centersList.length})` },
              { id: 'doctors', label: `Doctors (${doctorsList.length})` },
              { id: 'diagnostics', label: `Diagnostics (${diagnosticsList.length})` },
              { id: 'reports', label: 'Online Reports 📥' },
              { id: 'book', label: 'Book Appointment' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }} 
                style={{ 
                  padding: '10px 18px', 
                  borderRadius: '24px', 
                  border: 'none', 
                  background: activeTab === tab.id ? '#2563eb' : 'transparent', 
                  color: activeTab === tab.id ? '#ffffff' : '#334155', 
                  fontWeight: '800', 
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
            {userRole === 'admin' && (
              <button onClick={() => setActiveTab('admin_dashboard')} style={{ padding: '10px 18px', borderRadius: '24px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '900', fontSize: '15px', cursor: 'pointer' }}>⚡ Admin Dashboard</button>
            )}
          </nav>

          <button onClick={() => { if (isLoggedIn) { setIsLoggedIn(false); setUserRole(null); setActiveTab('home'); } else { setShowLoginModal(true); } }} style={{ background: isLoggedIn ? '#dc2626' : '#2563eb', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: '24px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
            {isLoggedIn ? `Logout (${userRole})` : 'Portal Login 🔑'}
          </button>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', width: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button onClick={() => setShowLoginModal(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', textAlign: 'center' }}>MedCare Portal Login</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setLoginType('patient')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: loginType === 'patient' ? '#2563eb' : '#f1f5f9', color: loginType === 'patient' ? '#fff' : '#475569', fontWeight: '800', cursor: 'pointer' }}>Patient</button>
              <button onClick={() => setLoginType('admin')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: loginType === 'admin' ? '#ef4444' : '#f1f5f9', color: loginType === 'admin' ? '#fff' : '#475569', fontWeight: '800', cursor: 'pointer' }}>Admin</button>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="email" placeholder={loginType === 'admin' ? 'admin@medcare.com' : 'Patient Email'} value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              <input type="password" placeholder="Password (Admin: admin123)" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              <button type="submit" style={{ background: loginType === 'admin' ? '#ef4444' : '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Login Now 🚀</button>
            </form>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '40px 24px', flex: 1, boxSizing: 'border-box' }}>
        
        {/* HOME PAGE */}
        {activeTab === 'home' && (
          <div style={{ backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '32px', padding: '80px 60px', color: '#ffffff', marginBottom: '60px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <span style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>🛡️ JCI ACCREDITED NETWORK</span>
            <h1 style={{ fontSize: '58px', fontWeight: '900', lineHeight: '1.1', margin: '24px 0 20px 0' }}>Your Health, <br/><span style={{ color: '#60a5fa' }}>Our Ultimate Priority.</span></h1>
            <p style={{ color: '#cbd5e1', fontSize: '18px', maxWidth: '700px', marginBottom: '35px' }}>World-class multidisciplinary clinical care across 50 Centers, 50 Doctors, and 50 Diagnostics suites with Supabase Live Database connection.</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setActiveTab('book')} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '16px', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>Book Clinical Consult 🩺</button>
              <button onClick={() => setActiveTab('reports')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '18px 32px', borderRadius: '16px', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>Download Lab Reports 📥</button>
            </div>
          </div>
        )}

        {/* CENTERS PAGE */}
        {activeTab === 'centers' && (
          <div>
            <h2 style={{ fontSize: '34px', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '15px' }}>Centers of Excellence (50 Hospital Suites)</h2>
            <input type="text" placeholder="Search centers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', marginBottom: '25px', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {filteredCenters.map((dept, i) => (
                <div key={i} className="card-hover" style={{ background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                  <img src={dept.img} alt={dept.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>{dept.tag}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '10px 0', color: '#0f172a' }}>{dept.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>{dept.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCTORS PAGE */}
        {activeTab === 'doctors' && (
          <div>
            <h2 style={{ fontSize: '34px', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '15px' }}>Doctors Directory (50 Professional Doctors)</h2>
            <input type="text" placeholder="Search doctor or specialty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', marginBottom: '25px', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {filteredDoctors.map((doc, idx) => (
                <div key={idx} className="card-hover" style={{ background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                  <img src={doc.img} alt={doc.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 4px 0', color: '#0f172a' }}>{doc.name}</h3>
                    <p style={{ color: '#2563eb', fontSize: '13px', fontWeight: '800', margin: '0 0 10px 0' }}>{doc.spec}</p>
                    <button onClick={() => setActiveTab('book')} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Book Consult</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIAGNOSTICS PAGE */}
        {activeTab === 'diagnostics' && (
          <div>
            <h2 style={{ fontSize: '34px', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '15px' }}>Diagnostics & Scans (50 Medical Equipment)</h2>
            <input type="text" placeholder="Search diagnostics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', marginBottom: '25px', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              {filteredDiagnostics.map((diag, i) => (
                <div key={i} className="card-hover" style={{ background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                  <img src={diag.img} alt={diag.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  <div style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '10px 0 8px 0', color: '#0f172a' }}>{diag.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>{diag.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ONLINE LAB REPORTS PAGE */}
        {activeTab === 'reports' && (
          <div style={{ maxWidth: '650px', margin: '30px auto', background: '#ffffff', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '10px', color: '#0f172a' }}>📥 Online Patient Lab Reports</h2>
            <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '14px' }}>Enter Patient ID (Try: <strong>MED-89421</strong>)</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="Patient ID..." value={reportId} onChange={(e) => setReportId(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
              <button onClick={handleFetchReport} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
                {loading ? 'Fetching...' : 'Fetch Report 📄'}
              </button>
            </div>
            {reportResult && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '12px', textAlign: 'left', marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#166534' }}>✅ Report Record Found!</h4>
                <p><strong>Patient Name:</strong> {reportResult.patient_name}</p>
                <p><strong>Test Name:</strong> {reportResult.test_name}</p>
                <p><strong>Status:</strong> {reportResult.result_status}</p>
                <a href={reportResult.pdf_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '800', marginTop: '10px' }}>Download PDF Report 📥</a>
              </div>
            )}
          </div>
        )}

        {/* BOOK APPOINTMENT PAGE */}
        {activeTab === 'book' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', color: '#0f172a' }}>Book Consultation (Live Database)</h2>
            <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              <input type="text" placeholder="Patient Full Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} required style={{ padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
              <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required style={{ padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
              
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }}>
                {departmentNames.map((deptName, index) => (
                  <option key={index} value={deptName}>
                    {deptName}
                  </option>
                ))}
              </select>

              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
                {loading ? 'Saving...' : 'Confirm Real-Time Booking 🚀'}
              </button>
            </form>
          </div>
        )}

        {/* ADMIN DASHBOARD PAGE */}
        {activeTab === 'admin_dashboard' && userRole === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', margin: 0 }}>⚡ Admin Management Dashboard</h2>
              <button onClick={fetchAdminData} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>🔄 Refresh Live Data</button>
            </div>

            <div style={{ background: '#ffffff', padding: '25px', borderRadius: '20px', marginBottom: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
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

            <div style={{ background: '#ffffff', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
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
        )}
      </main>

      <footer style={{ background: '#0a0f1d', color: '#94a3b8', padding: '40px 24px', textAlign: 'center', marginTop: '60px' }}>
        <p style={{ margin: 0, fontWeight: '700', color: '#ffffff' }}>MEDCARE HEALTHCARE NETWORK © 2026</p>
      </footer>
    </div>
  );
}