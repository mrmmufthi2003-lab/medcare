import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';
import { jsPDF } from 'jspdf';
import AiChatAgent from './components/AiChatAgent';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [reportId, setReportId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Menus State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSpecialitiesMenu, setShowSpecialitiesMenu] = useState(false);

  // Auth & Roles
  const [loginType, setLoginType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Admin Logs
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);

  // Booking Form State
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [selectedDept, setSelectedDept] = useState('Interventional Cardiology');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('05:00 PM');
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // HomeCare Form State
  const [homeCareName, setHomeCareName] = useState('');
  const [homeCareMobile, setHomeCareMobile] = useState('');
  const [homeCareEmail, setHomeCareEmail] = useState('');
  const [homeCareService, setHomeCareService] = useState('Nurse @Home');
  const [homeAddress, setHomeAddress] = useState('');

  // IPD Admission Form State
  const [ipdPatientName, setIpdPatientName] = useState('');
  const [ipdMobile, setIpdMobile] = useState('');
  const [ipdEmail, setIpdEmail] = useState('');
  const [ipdRoomType, setIpdRoomType] = useState('Private Deluxe Room');

  // Referral Form State
  const [refDocName, setRefDocName] = useState('');
  const [refDocMobile, setRefDocMobile] = useState('');
  const [refDocEmail, setRefDocEmail] = useState('');
  const [refSpeciality, setRefSpeciality] = useState('Cardiology');

  // Locations Filter State
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('ALL');

  // TeleMEDCARE State
  const [telePatientName, setTelePatientName] = useState('');
  const [teleMobile, setTeleMobile] = useState('');
  const [teleEmail, setTeleEmail] = useState('');
  const [teleService, setTeleService] = useState('Live Teleconsultation');

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

  // Direct n8n Local Webhook Trigger Helper
  const triggerN8nWorkflow = (payload) => {
    fetch('http://localhost:5678/webhook/medcare-booking-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record: payload })
    }).catch(err => console.error('n8n direct trigger error:', err));
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

  const timeSlotsList = [
    '09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '05:00 PM', '05:20 PM', '05:40 PM', '06:00 PM', '06:40 PM', '07:20 PM', '08:00 PM'
  ];

  // 1. DOCTORS / PACKAGES BOOKING APPOINTMENT
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const generatedPatientId = "MED-" + Math.floor(10000 + Math.random() * 90000); 
    const finalBookingDate = selectedDate || new Date().toISOString().split('T')[0];

    const newAppointment = { 
      patient_name: patientName, 
      phone_number: phoneNumber, 
      Email: patientEmail, 
      doctor_name: doctorName || `Specialist (${selectedDept})`, 
      department: selectedDept, 
      appointment_date: finalBookingDate,
      service_type: doctorName.includes('Package:') ? 'Package Health Check' : 'Doctor Consultation'
    };

    const { error: appError } = await supabase.from('appointments').insert([newAppointment]).select();

    if (!appError) {
      triggerN8nWorkflow(newAppointment);

      const newLabReport = {
        patient_id: generatedPatientId.trim(),
        patient_name: patientName,
        test_name: doctorName.includes('Package:') ? doctorName : `${selectedDept} Diagnostic Report`,
        result_status: 'Pending / Sample Collection Required',
        pdf_url: '#'
      };

      await supabase.from('lab_reports').insert([newLabReport]);

      setTimeout(async () => {
        await supabase
          .from('lab_reports')
          .update({ result_status: 'Completed & Ready' })
          .eq('patient_id', generatedPatientId.trim());
      }, 8000);

      try {
        await emailjs.send(
          'service_9n54anx',     
          'template_vocoao8',    
          {
            to_name: patientName,
            to_email: patientEmail,
            service_title: '🩺 Doctor / Package Consultation Booking',
            details_line1: `Doctor / Package: ${doctorName || `Specialist (${selectedDept})`}`,
            details_line2: `Department: ${selectedDept}`,
            details_line3: `Appointment Date & Slot: ${finalBookingDate} at ${selectedTimeSlot}`,
            app_no: Math.floor(Math.random() * 30) + 1,
            patient_id: generatedPatientId
          },
          'ix48ntLo80BcgczaW'    
        );
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
      }
    }

    setLoading(false);

    if (appError) {
      alert('Error: ' + appError.message);
    } else {
      alert(`🎉 Booking Saved in Supabase & n8n Email Triggered!\n\nPatient ID: ${generatedPatientId}`);
      setPatientName('');
      setPhoneNumber('');
      setPatientEmail('');
      setDoctorName('');
      if (userRole === 'admin') fetchAdminData();
    }
  };

  // 2. IPD ADMISSION BOOKING
  const handleIpdAdmission = async (e) => {
    e.preventDefault();
    setLoading(true);

    const generatedIpdId = "IPD-" + Math.floor(10000 + Math.random() * 90000);
    const todayDate = new Date().toISOString().split('T')[0];

    const newIpdRecord = {
      patient_name: ipdPatientName,
      phone_number: ipdMobile,
      Email: ipdEmail,
      department: 'Inpatient Department (IPD)',
      doctor_name: `Room: ${ipdRoomType}`,
      appointment_date: todayDate,
      service_type: 'IPD Ward Admission',
      room_type: ipdRoomType
    };

    const { error } = await supabase.from('appointments').insert([newIpdRecord]);

    if (!error) {
      triggerN8nWorkflow(newIpdRecord);

      try {
        await emailjs.send(
          'service_9n54anx',
          'template_vocoao8',
          {
            to_name: ipdPatientName,
            to_email: ipdEmail,
            service_title: '🏥 MedCare IPD Room & Ward Admission Confirmation',
            details_line1: `Selected Ward/Room: ${ipdRoomType}`,
            details_line2: `Department: Inpatient Department (IPD)`,
            details_line3: `Admission Request Date: ${todayDate}`,
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedIpdId
          },
          'ix48ntLo80BcgczaW'
        );
        alert(`🏥 IPD Admission Saved & n8n Email Triggered!`);
      } catch (err) {
        console.error("EmailJS Error:", err);
      }
      setIpdPatientName('');
      setIpdMobile('');
      setIpdEmail('');
    } else {
      alert('Error saving to Supabase: ' + error.message);
    }
    setLoading(false);
  };

  // 3. HOMECARE BOOKING
  const handleHomeCareBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    const generatedHomeId = "HOME-" + Math.floor(10000 + Math.random() * 90000);
    const todayDate = new Date().toISOString().split('T')[0];

    const newHomeRecord = {
      patient_name: homeCareName,
      phone_number: homeCareMobile,
      Email: homeCareEmail,
      department: 'HomeCare Services',
      doctor_name: `Service: ${homeCareService}`,
      appointment_date: todayDate,
      service_type: 'HomeCare Service'
    };

    const { error } = await supabase.from('appointments').insert([newHomeRecord]);

    if (!error) {
      triggerN8nWorkflow(newHomeRecord);

      try {
        await emailjs.send(
          'service_9n54anx',
          'template_vocoao8',
          {
            to_name: homeCareName,
            to_email: homeCareEmail,
            service_title: '🏠 MedCare HomeCare Booking Confirmation',
            details_line1: `Service Requested: ${homeCareService}`,
            details_line2: `Home Address: ${homeAddress}`,
            details_line3: `Scheduled Date: ${todayDate}`,
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedHomeId
          },
          'ix48ntLo80BcgczaW'
        );
        alert(`🏠 HomeCare Booked & n8n Email Triggered!`);
      } catch (err) {
        console.error("EmailJS Error:", err);
      }
      setHomeCareName('');
      setHomeCareMobile('');
      setHomeCareEmail('');
      setHomeAddress('');
    } else {
      alert('Error saving to Supabase: ' + error.message);
    }
    setLoading(false);
  };

  // 4. TELEMEDCARE BOOKING (Updated with Send Email Alert)
  const handleTeleMedcareBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    const generatedTeleId = "TELE-" + Math.floor(10000 + Math.random() * 90000);
    const todayDate = new Date().toISOString().split('T')[0];

    const newTeleRecord = {
      patient_name: telePatientName,
      phone_number: teleMobile,
      Email: teleEmail,
      department: 'teleMEDCARE Video Consult',
      doctor_name: `Category: ${teleService}`,
      appointment_date: todayDate,
      service_type: 'teleMEDCARE Video Call'
    };

    const { error } = await supabase.from('appointments').insert([newTeleRecord]);

    if (!error) {
      triggerN8nWorkflow(newTeleRecord);

      try {
        await emailjs.send(
          'service_9n54anx',
          'template_vocoao8',
          {
            to_name: telePatientName,
            to_email: teleEmail,
            service_title: '📹 teleMEDCARE Live Video Consultation Link',
            details_line1: `Consultation Category: ${teleService}`,
            details_line2: `Platform: Secure HD Video Link`,
            details_line3: `Session Scheduled: Immediate / On-Demand Slot`,
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedTeleId
          },
          'ix48ntLo80BcgczaW'
        );
        alert(`🎉 teleMEDCARE Booked & Email Sent Successfully!`);
      } catch (err) {
        console.error("EmailJS Error:", err);
        alert(`🎉 teleMEDCARE Saved & n8n Triggered!`);
      }
      setTelePatientName('');
      setTeleMobile('');
      setTeleEmail('');
    } else {
      alert('Error saving to Supabase: ' + error.message);
    }
    setLoading(false);
  };

  // 5. REFERRAL SUBMISSION
  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const generatedRefId = "REF-" + Math.floor(10000 + Math.random() * 90000);
    const todayDate = new Date().toISOString().split('T')[0];

    const newRefRecord = {
      patient_name: `Dr. ${refDocName} (Referral)`,
      phone_number: refDocMobile,
      Email: refDocEmail,
      department: 'Medical Referral Network',
      doctor_name: `Speciality: ${refSpeciality}`,
      appointment_date: todayDate,
      service_type: 'Doctor Referral'
    };

    const { error } = await supabase.from('appointments').insert([newRefRecord]);

    if (!error) {
      triggerN8nWorkflow(newRefRecord);

      try {
        await emailjs.send(
          'service_9n54anx',
          'template_vocoao8',
          {
            to_name: `Dr. ${refDocName}`,
            to_email: refDocEmail,
            service_title: '🤝 MedCare Medical Referral Confirmation',
            details_line1: `Referring Doctor: Dr. ${refDocName}`,
            details_line2: `Target Speciality: ${refSpeciality}`,
            details_line3: `Submission Date: ${todayDate}`,
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedRefId
          },
          'ix48ntLo80BcgczaW'
        );
        alert(`🤝 Referral Submitted Successfully & n8n Email Sent to Dr. ${refDocName}!`);
      } catch (err) {
        console.error("EmailJS Error:", err);
        alert(`🤝 Referral Saved in Supabase & n8n Triggered!`);
      }
      setRefDocName('');
      setRefDocMobile('');
      setRefDocEmail('');
    } else {
      alert('Error saving to Supabase: ' + error.message);
    }
    setLoading(false);
  };

  const handleFetchReport = async () => {
    if (!reportId) { alert('Please enter Patient ID!'); return; }
    setLoading(true);
    setReportResult(null);

    const cleanId = reportId.trim();
    const { data, error } = await supabase.from('lab_reports').select('*').ilike('patient_id', cleanId);

    setLoading(false);

    if (error || !data || data.length === 0) {
      alert(`❌ No report found for ID: ${cleanId}`);
    } else {
      setReportResult(data[0]);
    }
  };

  const loadImageData = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const generatePDFReport = async (data) => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const heartImg = await loadImageData('https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=400&q=80');

      doc.setFillColor(238, 242, 246);
      doc.rect(0, 0, 297, 210, 'F');

      doc.setFillColor(15, 23, 42);
      doc.rect(10, 10, 277, 26, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text("Overview Condition | MedCare Health OS", 18, 23);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Patient: ${String(data.patient_name || 'N/A')}  |  ID: ${String(data.patient_id || 'N/A')}`, 18, 30);

      doc.setFillColor(16, 185, 129);
      doc.rect(215, 16, 62, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("● " + String(data.result_status || 'Completed'), 222, 25);

      doc.setFillColor(255, 255, 255);
      doc.rect(10, 42, 110, 158, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text("● My Heart & Anatomical Focus", 18, 54);

      if (heartImg) {
        doc.addImage(heartImg, 'PNG', 20, 60, 90, 60);
      }

      doc.setFillColor(37, 99, 235);
      doc.rect(20, 126, 90, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("Heart Rate Monitor", 28, 137);
      doc.setFontSize(20);
      doc.text("120 bps / min", 28, 150);

      doc.setFillColor(241, 245, 249);
      doc.rect(20, 164, 42, 28, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text("My Heart", 25, 175);
      doc.setTextColor(16, 185, 129);
      doc.text("● Normal", 25, 185);

      doc.setFillColor(241, 245, 249);
      doc.rect(68, 164, 42, 28, 'F');
      doc.setTextColor(15, 23, 42);
      doc.text("My Liver", 73, 175);
      doc.setTextColor(37, 99, 235);
      doc.text("● Optimal", 73, 185);

      doc.setFillColor(255, 255, 255);
      doc.rect(126, 42, 161, 74, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text("● My Heart Condition Vitals", 134, 54);

      doc.setFillColor(239, 246, 255);
      doc.rect(134, 60, 72, 24, 'F');
      doc.setFontSize(9);
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.text("Blood Status (BP)", 140, 68);
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("116 / 70 mmHg", 140, 78);

      doc.setFillColor(37, 99, 235);
      doc.rect(210, 60, 72, 24, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text("Heart Rate", 216, 68);
      doc.setFontSize(12);
      doc.text("120 bps", 216, 78);

      doc.setFillColor(248, 250, 252);
      doc.rect(134, 88, 72, 22, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text("Blood Count", 140, 96);
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("80 - 90", 140, 105);

      doc.setFillColor(248, 250, 252);
      doc.rect(210, 88, 72, 22, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text("Glucose Level", 216, 96);
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("90 mg/dL", 216, 105);

      doc.setFillColor(255, 255, 255);
      doc.rect(126, 122, 161, 78, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text("● Autonomous AI Clinical Findings", 134, 134);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Test Evaluated: ${String(data.test_name || 'General Scan')}`, 134, 145);
      doc.text("• All physiological parameters fall within healthy clinical limits.", 134, 153);
      doc.text("• Zero acute structural anomalies or vascular obstructions detected.", 134, 161);
      doc.text("• Routine wellness review scheduled in 6 months.", 134, 169);

      doc.setFillColor(241, 245, 249);
      doc.rect(134, 175, 145, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text("Authorized: Dr. Senthil Kumar (MD) | AI Agent Verified", 140, 186);

      doc.save(`Behance_Report_${data.patient_id}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("PDF Error: " + err.message);
    }
  };

  const departmentNames = [
    "Aesthetics", "Arm & Hand Surgery", "Audiology", "Bariatric Surgery", "Cardiology", "Dentistry", 
    "Dermatology", "Diet & Nutrition", "Emergency Medicine", "Ear, Nose & Throat (ENT)", "Endocrinology", 
    "Family Medicine", "Gastroenterology", "General Surgery", "Gene Therapy", "Hepatobiliary", "Haematology", 
    "Hair Transplant", "Internal Medicine", "Mental Health", "Nephrology", "Neurology", "Neurosurgery", 
    "Neonatology", "Obstetrics & Gynaecology", "Oncology", "Ophthalmology", "Orthopaedics", "Paediatric Orthopaedics", 
    "Paediatrics", "Pain Management", "Physiotherapy", "Plastic Surgery", "Pulmonology", "Robotic Surgery", 
    "Rheumatology", "Spine Surgery", "Sports Medicine", "Urology", "Vascular Surgery", "Vitamin Infusion Therapy"
  ];

  const doctorNamesList = [
    "Dr. Dhaval P. Darji", "Dr. Aaesha Almansoori", "Dr. Abeer Hassan Ahmed Kassem", "Dr. Senthil Kumar", "Dr. Priya Sharma", "Dr. Rajesh Iyer", "Dr. Lakshmi Menon", "Dr. Vikram Singh", "Dr. Anita Desai", "Dr. Arun Chandran", "Dr. Meera Nair", "Dr. Karthik Raja", "Dr. Divya Patel",
    "Dr. Suresh Babu", "Dr. Pooja Hegde", "Dr. Murali Krishna", "Dr. Saranya Devi", "Dr. Naveen Kumar", "Dr. Geetha Reddy", "Dr. Balaji Viswanathan", "Dr. Shalini Singh", "Dr. Praveen Kumar", "Dr. Uma Maheshwari",
    "Dr. Ganesh Prabhu", "Dr. Kavitha Ramachandran", "Dr. Rakesh Sharma", "Dr. Nandini Iyer", "Dr. Vijay Anand", "Dr. Swathi Reddy", "Dr. Sathish Kumar", "Dr. Anjali Menon", "Dr. Hariharan Venkat", "Dr. Revathi Subramanian"
  ];

  const sriLankaLocationsList = [
    { id: "colombo-1", name: "Colombo - Medcare Royal Speciality Hospital", address: "Kirimandala Mawatha, Narahenpita, Colombo 05", beds: "120", doctors: "45", specialities: "28", img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80" },
    { id: "colombo-2", name: "Colombo - Medcare Medical & Diagnostic Centre", address: "Galle Road, Kollupitiya, Colombo 03", beds: "Outpatient", doctors: "25", specialities: "18", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80" },
    { id: "kandy-1", name: "Kandy - Medcare General & Heart Centre", address: "Peradeniya Road, Kandy, Central Province", beds: "85", doctors: "32", specialities: "22", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80" },
    { id: "galle-1", name: "Galle - Medcare Coastal Hospital", address: "Matara Road, Galle, Southern Province", beds: "60", doctors: "20", specialities: "15", img: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80" },
    { id: "jaffna-1", name: "Jaffna - Medcare North Multi-Speciality Clinic", address: "Hospital Road, Jaffna, Northern Province", beds: "40", doctors: "18", specialities: "12", img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80" },
    { id: "trinco-1", name: "Trincomalee - Medcare Eastern Diagnostic Centre", address: "Inner Harbour Road, Trincomalee", beds: "Outpatient", doctors: "14", specialities: "10", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80" },
    { id: "batti-1", name: "Batticaloa - Medcare Care Centre", address: "Main Street, Batticaloa, Eastern Province", beds: "30", doctors: "12", specialities: "08", img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80" },
    { id: "negombo-1", name: "Negombo - Medcare Airport Road Hospital", address: "Colombo Road, Negombo, Western Province", beds: "55", doctors: "22", specialities: "14", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80" }
  ];

  const packagesList = [
    { title: "Men Wellness (>40)", cat: "Men Health", desc: "Comprehensive Screening including Cardiac, Metabolic & Prostate check.", price: "LKR 25,000" },
    { title: "Women Preventative (>40)", cat: "Women Health", desc: "Hormonal, Mammography, Bone Density & Full Metabolic Screening.", price: "LKR 28,000" },
    { title: "Cardiac Health Screening", cat: "Heart Health", desc: "256 Slice CT Angio, Stress Test & Echocardiogram Package.", price: "LKR 42,000" },
    { title: "Child Growth & Vaccination", cat: "Paediatrics", desc: "Pediatric screening, Vitamin Profiling & Developmental Assessment.", price: "LKR 15,000" },
    { title: "Diabetes Comprehensive Care", cat: "Metabolic", desc: "HbA1c, Lipid profile, Nephropathy check & Diabetologist consultation.", price: "LKR 18,000" },
    { title: "Full Body Advanced MRI Package", cat: "Radiology", desc: "Brain, Spine, Whole Abdomen MRI scan with Specialist Radiology Review.", price: "LKR 75,000" },
    { title: "Ortho & Joint Health Check", cat: "Orthopaedics", desc: "Bone densitometry, Calcium profile, Vitamin D & Rheumatology consult.", price: "LKR 22,000" },
    { title: "Oncology Preventative Screening", cat: "Oncology", desc: "Tumor markers, Ultrasound screening & Oncologist evaluation.", price: "LKR 55,000" },
    { title: "Dental & Oral Hygiene Care", cat: "Dental", desc: "Scaling, Full mouth X-ray, Dental consultation & Gum assessment.", price: "LKR 10,000" },
    { title: "Eye Care & Vision Package", cat: "Ophthalmology", desc: "Glaucoma screening, Retinal scan, Vision test & Optometrist check.", price: "LKR 12,500" }
  ];

  const docImages = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594824813566-88855ce78961?auto=format&fit=crop&w=600&q=80'
  ];

  const doctorsList = Array.from({ length: 30 }, (_, i) => ({
    name: doctorNamesList[i] || `Dr. Specialist ${i + 1}`,
    spec: departmentNames[i % departmentNames.length],
    exp: `${10 + (i % 15)}+ Years Exp`,
    rating: '4.9 ⭐',
    img: docImages[i % docImages.length]
  }));

  const filteredDoctors = doctorsList.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.spec.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredLocations = sriLankaLocationsList.filter(loc => {
    if (selectedLocationFilter === 'ALL') return true;
    return loc.id === selectedLocationFilter;
  });

  const hospitalBgUrl = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80';

  return (
    <div style={{ 
      fontFamily: "'Plus Jakarta Sans', sans-serif", 
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.88)), url("${hospitalBgUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      color: '#0f172a'
    }}>
      <style>{`
        .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); border: 1px solid rgba(203, 213, 225, 0.6); box-shadow: 0 10px 25px rgba(0,0,0,0.15); color: #0f172a; }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 35px rgba(37,99,235,0.25); }
        .nav-scroll::-webkit-scrollbar { display: none; }
        .nav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top Ribbon Bar */}
      <div style={{ background: '#090d16', color: '#94a3b8', padding: '6px 20px', fontSize: '11px', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span>🔴 SRI LANKA MEDCARE HEALTH OS | EMERGENCY RESPONSE: SLA &lt; 7.8 Mins</span>
        <span style={{ color: '#10b981' }}>🟢 Supabase Connected | 📞 +94 11 234 5678</span>
      </div>

      {/* Clean Navbar with Dark Background */}
      <header style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>+</div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: '#f8fafc', letterSpacing: '0.5px' }}>MEDCARE</h1>
              <p style={{ fontSize: '9px', fontWeight: '800', margin: 0, color: '#60a5fa', letterSpacing: '1px' }}>SRI LANKA</p>
            </div>
          </div>

          <nav className="nav-scroll" style={{ display: 'flex', gap: '4px', overflowX: 'auto', maxWidth: '100%', padding: '2px 0' }}>
            {[
              { id: 'home', label: 'HOME' },
              { id: 'specialities', label: 'SPECIALITIES ▼', action: () => setShowSpecialitiesMenu(!showSpecialitiesMenu) },
              { id: 'doctors', label: 'DOCTORS' },
              { id: 'ipd', label: 'IPD 🏥' },
              { id: 'homecare', label: 'HOMECARE' },
              { id: 'telemedcare', label: 'teleMEDCARE 📹' },
              { id: 'locations', label: 'LOCATIONS 📍' },
              { id: 'packages', label: 'PACKAGES' },
              { id: 'referral', label: 'REFERRALS' },
              { id: 'reports', label: 'REPORTS 📥' }
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={item.action ? item.action : () => setActiveTab(item.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    fontWeight: '800',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { if(!isActive) e.currentTarget.style.background = '#1e293b'; }}
                  onMouseOut={e => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button 
            onClick={() => { if (isLoggedIn) { setIsLoggedIn(false); setUserRole(null); setActiveTab('home'); } else { setShowLoginModal(true); } }} 
            style={{ background: isLoggedIn ? '#dc2626' : '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '12px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', whiteSpace: 'nowrap' }}
          >
            {isLoggedIn ? `Logout (${userRole})` : 'Portal Login'}
          </button>
        </div>

        {/* SPECIALITIES MEGA MENU DROPDOWN (BRIGHT WHITE) */}
        {showSpecialitiesMenu && (
          <div style={{ background: '#ffffff', borderTop: '2px solid #2563eb', borderBottom: '1px solid #cbd5e1', padding: '24px 30px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'absolute', width: '100%', left: 0, top: '100%', zIndex: 1100 }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>All Medical Specialities</h3>
                <button onClick={() => setShowSpecialitiesMenu(false)} style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: '#ef4444' }}>Close ✖</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {departmentNames.map((dept, idx) => (
                  <div key={idx} onClick={() => { setSelectedDept(dept); setActiveTab('book'); setShowSpecialitiesMenu(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', color: '#1e293b', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: '1px solid #cbd5e1', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#eff6ff'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>
                    ● {dept}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button onClick={() => setShowLoginModal(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '18px', textAlign: 'center' }}>Portal Login</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
              <button onClick={() => setLoginType('patient')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: loginType === 'patient' ? '#2563eb' : '#f1f5f9', color: loginType === 'patient' ? '#fff' : '#475569', fontWeight: '800', cursor: 'pointer' }}>Patient</button>
              <button onClick={() => setLoginType('admin')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: loginType === 'admin' ? '#ef4444' : '#f1f5f9', color: loginType === 'admin' ? '#fff' : '#475569', fontWeight: '800', cursor: 'pointer' }}>Admin</button>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="email" placeholder={loginType === 'admin' ? 'admin@medcare.com' : 'Email Address'} value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              <button type="submit" style={{ background: loginType === 'admin' ? '#ef4444' : '#2563eb', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Login Now 🚀</button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '35px 24px', flex: 1, boxSizing: 'border-box' }}>
        
        {/* OVERVIEW DASHBOARD */}
        {activeTab === 'home' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: '28px', padding: '45px 50px', color: '#ffffff', marginBottom: '35px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', display: 'inline-block' }}>🛡️ SRI LANKA MEDCARE HEALTH OS</span>
              <h1 style={{ fontSize: '40px', fontWeight: '900', lineHeight: '1.15', margin: '18px 0 12px 0' }}>Overview Condition <br/><span style={{ color: '#93c5fd' }}>Autonomous Care Network</span></h1>
              <p style={{ color: '#e2e8f0', fontSize: '15px', maxWidth: '680px', marginBottom: '25px' }}>Real-time biometric telemetry, automated scheduling engine across Colombo, Kandy, Galle & Jaffna.</p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('book')} style={{ background: '#ffffff', color: '#1e3a8a', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}>Book Clinical Consult 🩺</button>
                <button onClick={() => setActiveTab('ipd')} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}>IPD Admission 🏥</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '22px', borderRadius: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>BLOOD STATUS (BP)</span>
                <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '6px 0' }}>116 / 70 <span style={{ fontSize: '13px', color: '#10b981' }}> mmHg</span></h3>
                <p style={{ fontSize: '12px', color: '#166534', margin: 0, fontWeight: '700' }}>🟢 Optimal Pressure Range</p>
              </div>
              <div className="glass-card" style={{ padding: '22px', borderRadius: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>HEART RATE MONITOR</span>
                <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '6px 0' }}>120 <span style={{ fontSize: '13px', color: '#2563eb' }}> bpm</span></h3>
                <p style={{ fontSize: '12px', color: '#2563eb', margin: 0, fontWeight: '700' }}>⚡ Telemetry Active</p>
              </div>
              <div className="glass-card" style={{ padding: '22px', borderRadius: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>GLUCOSE & METABOLIC</span>
                <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '6px 0' }}>90 <span style={{ fontSize: '13px', color: '#10b981' }}> mg/dL</span></h3>
                <p style={{ fontSize: '12px', color: '#166534', margin: 0, fontWeight: '700' }}>🟢 Normal Fasting Level</p>
              </div>
            </div>
          </div>
        )}

        {/* IPD INPATIENT ADMISSION */}
        {activeTab === 'ipd' && (
          <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '720px', margin: '0 auto' }}>
            <span style={{ background: '#7c3aed', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>🏥 IPD SERVICES</span>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>Inpatient Department (IPD) Admission</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Book comfortable hospital rooms, private wards, and 24/7 intensive nursing care across Sri Lanka branches.</p>
            
            <form onSubmit={handleIpdAdmission} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Patient Full Name</label>
                <input type="text" placeholder="Enter patient name" value={ipdPatientName} onChange={e=>setIpdPatientName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Mobile Number</label>
                  <input type="text" placeholder="+94..." value={ipdMobile} onChange={e=>setIpdMobile(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Gmail Address (For Confirmation & n8n Email)</label>
                  <input type="email" placeholder="patient@gmail.com" value={ipdEmail} onChange={e=>setIpdEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Select Room / Ward Type</label>
                <select value={ipdRoomType} onChange={e=>setIpdRoomType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }}>
                  <option value="Private Deluxe Room">Private Deluxe Room (AC, TV, Sofa)</option>
                  <option value="Semi-Private Ward">Semi-Private Ward (2-Bed sharing)</option>
                  <option value="General Ward">General Ward (Standard care)</option>
                  <option value="ICU (Intensive Care Unit)">ICU (Intensive Care Unit - 24/7 Vitals)</option>
                  <option value="VIP Presidential Suite">VIP Presidential Suite</option>
                </select>
              </div>
              <button type="submit" disabled={loading} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}>
                {loading ? 'Saving...' : 'Confirm IPD Admission & Send Email 🏥'}
              </button>
            </form>
          </div>
        )}

        {/* TELEMEDCARE VIDEO CONSULTATION (Updated Button Text & Alert) */}
        {activeTab === 'telemedcare' && (
          <div style={{ background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ background: '#1e3a8a', padding: '35px 50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '25px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: '#93c5fd', fontSize: '13px', fontWeight: '800', letterSpacing: '1px' }}>📹 teleMEDCARE</span>
                <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', margin: '8px 0', fontFamily: 'serif' }}>Live Telemedicine Consultations</h1>
                <p style={{ color: '#e2e8f0', fontSize: '14px', maxWidth: '480px' }}>Consult top Sri Lankan medical specialists live via HD Video Call from anywhere.</p>
              </div>
            </div>

            <div style={{ padding: '35px 40px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '35px' }}>
              <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>teleMEDCARE SERVICES</h3>
                {['teleUrology ➔', 'telePost-Procedure Care ➔', 'teleWeight Management ➔', 'teleGeriatrics ➔', 'teleNutrition ➔', 'telePediatrics ➔', 'teleCardiology ➔'].map((item, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '10px', borderBottom: '1px solid #f1f5f9', color: '#2563eb', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }} onMouseOver={e=>e.currentTarget.style.background='#eff6ff'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    {item}
                  </div>
                ))}
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: 0 }}>Book Live Video Consultation</h3>
                <form onSubmit={handleTeleMedcareBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '5px', color: '#1e293b' }}>Full Name</label>
                    <input type="text" placeholder="Enter patient name" value={telePatientName} onChange={e=>setTelePatientName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '5px', color: '#1e293b' }}>Mobile Number</label>
                    <input type="text" placeholder="+94..." value={teleMobile} onChange={e=>setTeleMobile(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '5px', color: '#1e293b' }}>Gmail Address (For Video Link & n8n Email)</label>
                    <input type="email" placeholder="patient@gmail.com" value={teleEmail} onChange={e=>setTeleEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '5px', color: '#1e293b' }}>Consultation Category</label>
                    <select value={teleService} onChange={e=>setTeleService(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                      <option value="Live Teleconsultation">Live Teleconsultation</option>
                      <option value="teleUrology">teleUrology</option>
                      <option value="telePost-Procedure Care">telePost-Procedure Care</option>
                      <option value="teleWeight Management">teleWeight Management</option>
                      <option value="teleNutrition">teleNutrition</option>
                    </select>
                  </div>
                  <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
                    {loading ? 'Saving...' : 'Agree and Proceed to Video Consultation & Send Email 📹'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* DOCTORS DIRECTORY */}
        {activeTab === 'doctors' && (
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#f8fafc', marginBottom: '14px' }}>Doctors Directory</h2>
            <input type="text" placeholder="Search doctor or specialty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '22px', background: '#fff', boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {filteredDoctors.map((doc, idx) => (
                <div key={idx} className="card-hover glass-card" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                  <img src={doc.img} alt={doc.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '18px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '900', margin: '0 0 4px 0', color: '#0f172a' }}>{doc.name}</h3>
                    <p style={{ color: '#2563eb', fontSize: '12px', fontWeight: '800', margin: '0 0 10px 0' }}>{doc.spec}</p>
                    <button onClick={() => { setDoctorName(doc.name); setSelectedDept(doc.spec); setActiveTab('book'); }} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Book Consult 🩺</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HOMECARE SERVICES */}
        {activeTab === 'homecare' && (
          <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '650px', margin: '0 auto' }}>
            <span style={{ background: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>🏠 HOMECARE</span>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>HomeCare Services (Nurse & Doctor @Home)</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '22px' }}>Professional Sri Lankan healthcare brought directly to your home doorstep.</p>
            
            <form onSubmit={handleHomeCareBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Patient Full Name</label>
                <input type="text" placeholder="Enter patient name" value={homeCareName} onChange={e=>setHomeCareName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Mobile Number</label>
                  <input type="text" placeholder="+94..." value={homeCareMobile} onChange={e=>setHomeCareMobile(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Gmail Address (For n8n Email)</label>
                  <input type="email" placeholder="patient@gmail.com" value={homeCareEmail} onChange={e=>setHomeCareEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Select Required Service</label>
                <select value={homeCareService} onChange={e=>setHomeCareService(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }}>
                  <option value="Nurse @Home">Nurse @Home</option>
                  <option value="Doctor @Home">Doctor @Home</option>
                  <option value="Lab @Home">Lab @Home (Sample Collection)</option>
                  <option value="Physio @Home">Physio @Home</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Home Address in Sri Lanka</label>
                <textarea placeholder="Enter street, city, district..." value={homeAddress} onChange={e=>setHomeAddress(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', height: '90px', background: '#fff' }}></textarea>
              </div>
              <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>
                {loading ? 'Saving...' : 'Book HomeCare Service & Send Email 🏠'}
              </button>
            </form>
          </div>
        )}

        {/* LOCATIONS SECTION */}
        {activeTab === 'locations' && (
          <div style={{ background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ background: '#1e3a8a', padding: '35px 50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '25px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: '#93c5fd', fontSize: '13px', fontWeight: '800', letterSpacing: '1px' }}>📍 LOCATIONS</span>
                <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', margin: '8px 0 0 0', fontFamily: 'serif' }}>Locations</h1>
              </div>
            </div>

            <div style={{ padding: '35px 40px' }}>
              <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '900', color: '#2563eb', marginBottom: '22px' }}>Medcare Branches & Hospital Locations</h2>

              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
                  🏠 / <span style={{ color: '#2563eb' }}>LOCATIONS</span>
                </div>

                <div style={{ minWidth: '300px' }}>
                  <select value={selectedLocationFilter} onChange={e=>setSelectedLocationFilter(e.target.value)} style={{ width: '100%', padding: '10px 16px', borderRadius: '10px', border: '2px solid #2563eb', color: '#2563eb', fontWeight: '800', fontSize: '13px', outline: 'none', cursor: 'pointer', background: '#fff' }}>
                    <option value="ALL">All Sri Lanka Locations (8 Branches)</option>
                    {sriLankaLocationsList.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '25px' }}>
                {filteredLocations.map((loc) => (
                  <div key={loc.id} style={{ background: '#f8fafc', borderRadius: '18px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ height: '160px', overflow: 'hidden' }}>
                        <img src={loc.img} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>{loc.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.4' }}>📍 {loc.address}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#e2e8f0', padding: '10px', borderRadius: '10px', textAlign: 'center', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>Beds</div>
                            <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{loc.beds}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>Doctors</div>
                            <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{loc.doctors}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>Specialities</div>
                            <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{loc.specialities}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '0 20px 20px 20px' }}>
                      <button onClick={() => setActiveTab('book')} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Book Appointment Here 🩺</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HEALTH PACKAGES */}
        {activeTab === 'packages' && (
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#f8fafc', marginBottom: '14px' }}>Health Screening Packages</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {packagesList.map((pkg, idx) => (
                <div key={idx} className="glass-card card-hover" style={{ borderRadius: '20px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>{pkg.cat}</span>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>{pkg.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.4', marginBottom: '16px' }}>{pkg.desc}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb', marginBottom: '12px' }}>{pkg.price}</div>
                    <button onClick={() => { setDoctorName(`Package: ${pkg.title}`); setActiveTab('book'); }} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Select Package 🩺</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REFERRAL SYSTEM */}
        {activeTab === 'referral' && (
          <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Medical Referral Network 🤝</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '22px' }}>External doctors & clinics can securely refer patients to MedCare Speciality Centres.</p>
            
            <form onSubmit={handleReferralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Referring Doctor Name</label>
                <input type="text" placeholder="Dr. ..." value={refDocName} onChange={e=>setRefDocName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Mobile Number</label>
                  <input type="text" placeholder="+94..." value={refDocMobile} onChange={e=>setRefDocMobile(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Gmail Address (For Email Confirmation)</label>
                  <input type="email" placeholder="doctor@gmail.com" value={refDocEmail} onChange={e=>setRefDocEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Target Speciality</label>
                <select value={refSpeciality} onChange={e=>setRefSpeciality(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }}>
                  {departmentNames.map((d, i)=>(<option key={i} value={d}>{d}</option>))}
                </select>
              </div>
              <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>
                {loading ? 'Submitting...' : 'Submit Referral & Send Email 🤝'}
              </button>
            </form>
          </div>
        )}

        {/* LAB REPORTS & PDF DOWNLOAD */}
        {activeTab === 'reports' && (
          <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '700px', margin: '0 auto' }}>
            <span style={{ background: '#10b981', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>📥 LAB REPORTS</span>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>Download Lab Reports & PDF Summaries</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '22px' }}>Enter your Patient ID (e.g., MED-XXXXX) given during booking to instantly fetch and download your official PDF report.</p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
              <input type="text" placeholder="Enter Patient ID (e.g. MED-54321)" value={reportId} onChange={e=>setReportId(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#fff' }} />
              <button onClick={handleFetchReport} disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
                {loading ? 'Searching...' : 'Fetch Report 🔍'}
              </button>
            </div>

            {reportResult && (
              <div style={{ background: '#f8fafc', padding: '22px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Patient: {reportResult.patient_name}</h3>
                  <span style={{ background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>{reportResult.result_status}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}><b>Test Name:</b> {reportResult.test_name}</p>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}><b>Patient ID:</b> {reportResult.patient_id}</p>
                
                <button onClick={() => generatePDFReport(reportResult)} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Download Official PDF Report 📄
                </button>
              </div>
            )}
          </div>
        )}

        {/* BOOKING APPOINTMENT FORM TAB */}
        {activeTab === 'book' && (
          <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '700px', margin: '0 auto' }}>
            <span style={{ background: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>🩺 CLINICAL BOOKING</span>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>Book Doctor or Package Consultation</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '22px' }}>Instant Supabase booking with automated n8n Gmail confirmation and Lab ID generation.</p>

            <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Select Department</label>
                <select value={selectedDept} onChange={e=>setSelectedDept(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }}>
                  {departmentNames.map((d, i)=>(<option key={i} value={d}>{d}</option>))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Doctor Name / Package Title</label>
                <input type="text" placeholder="e.g. Dr. Dhaval P. Darji or Package: Full Body" value={doctorName} onChange={e=>setDoctorName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Patient Full Name</label>
                  <input type="text" placeholder="Enter name" value={patientName} onChange={e=>setPatientName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Mobile Number</label>
                  <input type="text" placeholder="+94..." value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Gmail Address (For Confirmation & n8n Email)</label>
                <input type="email" placeholder="patient@gmail.com" value={patientEmail} onChange={e=>setPatientEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Appointment Date</label>
                  <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Time Slot</label>
                  <select value={selectedTimeSlot} onChange={e=>setSelectedTimeSlot(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    {timeSlotsList.map((slot, i)=>(<option key={i} value={slot}>{slot}</option>))}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}>
                {loading ? 'Processing Booking...' : 'Confirm Booking & Send Email 🩺'}
              </button>
            </form>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {activeTab === 'admin_dashboard' && userRole === 'admin' && (
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '35px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginBottom: '22px' }}>Admin Dashboard - Supabase Realtime Logs</h2>
            
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2563eb', marginBottom: '12px' }}>All Appointments ({appointments.length})</h3>
            <div style={{ overflowX: 'auto', marginBottom: '35px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px' }}>Patient Name</th>
                    <th style={{ padding: '10px' }}>Phone</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Doctor / Service</th>
                    <th style={{ padding: '10px' }}>Date & Slot</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app, i)=>(
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                      <td style={{ padding: '10px', fontWeight: '800' }}>{app.patient_name}</td>
                      <td style={{ padding: '10px' }}>{app.phone_number}</td>
                      <td style={{ padding: '10px' }}>{app.Email}</td>
                      <td style={{ padding: '10px', color: '#2563eb', fontWeight: '700' }}>{app.doctor_name || app.department}</td>
                      <td style={{ padding: '10px' }}>{app.appointment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#7c3aed', marginBottom: '12px' }}>All Lab Reports & Patient IDs ({labReports.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px' }}>Patient ID</th>
                    <th style={{ padding: '10px' }}>Patient Name</th>
                    <th style={{ padding: '10px' }}>Test / Package</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {labReports.map((rep, i)=>(
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                      <td style={{ padding: '10px', fontWeight: '900', color: '#2563eb' }}>{rep.patient_id}</td>
                      <td style={{ padding: '10px', fontWeight: '800' }}>{rep.patient_name}</td>
                      <td style={{ padding: '10px' }}>{rep.test_name}</td>
                      <td style={{ padding: '10px', color: '#10b981', fontWeight: '700' }}>{rep.result_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Floating Autonomous AI Agent */}
      <AiChatAgent
        setActiveTab={setActiveTab}
        setSelectedDept={setSelectedDept}
        setDoctorName={setDoctorName}
      />
    </div>
  );
}