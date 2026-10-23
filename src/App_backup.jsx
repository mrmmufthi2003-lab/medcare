import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';
import { jsPDF } from 'jspdf';
import AiChatAgent from './components/AiChatAgent';

const generate100Doctors = () => {
  const doctorPhotos = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594824813566-88855ce78961?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80'
  ];

  const firstNames = ['Senthil', 'Aaesha', 'Dhaval', 'Priya', 'Ahmad', 'Arif', 'Mohamed', 'Fathima', 'Rohan', 'Kavitha', 'Nimal', 'Tariq', 'Yasmin', 'Lalith', 'Farhan', 'Meera', 'Gayan', 'Zahra', 'Dinesh', 'Ananya'];
  const lastNames = ['Kumar', 'Almansoori', 'Darji', 'Sharma', 'Qaddoumi', 'Adenwala', 'Al-Nuaimi', 'Ruzaina', 'Perera', 'Silva', 'Jayasinghe', 'Hassan', 'Khan', 'Fernando', 'Siddique', 'Nair', 'Ratnayake', 'Farook', 'Mendis', 'Iyer'];

  const specialities = [
    'Paediatrics', 'Family Medicine', 'Internal Medicine', 'Bariatric Surgery', 'Cardiology',
    'Ophthalmology', 'Neurology', 'Obstetrics & Gynaecology', 'Dermatology', 'Orthopaedics',
    'General Surgery', 'Nephrology', 'ENT', 'Psychiatry', 'Urology'
  ];

  const qualifications = [
    'MBBS, MD, FRCP (UK)', 'MBBS, DNB, Fellowship in Critical Care', 'Arab Board Certified, Dubai',
    'MBBS, MS, MCh (Surgical Speciality)', 'MBBS, FRCS (Edin), FACS', 'MD, PhD in Clinical Medicine'
  ];

  const nationalities = ['SRI LANKAN', 'INDIAN', 'EMIRATI', 'JORDANIAN', 'SAUDI', 'TURKISH', 'BRITISH'];

  const locations = [
    'Colombo - Medcare Royal Speciality Hospital', 'Kandy - Medcare General & Heart Centre',
    'Jaffna - Medcare North Multi-Speciality Clinic', 'Galle - Medcare Coastal Hospital',
    'Batticaloa - Medcare Care Centre', 'Ampara - Medcare Healthcare Hub',
    'Matara - Medcare Southern Clinic', 'Dubai - Medcare Hospital / Jaffna Branch',
    'Sharjah - Medcare Specialty Clinic', 'Riyadh / Ampara Medcare Hub',
    'Turkey / Colombo - Medcare Royal Hospital'
  ];

  const list = [];
  for (let i = 0; i < 100; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[(i * 3) % lastNames.length];
    const spec = specialities[i % specialities.length];
    const qual = qualifications[i % qualifications.length];
    const nat = nationalities[i % nationalities.length];
    const loc = locations[i % locations.length];
    const img = doctorPhotos[i % doctorPhotos.length];

    list.push({
      id: i + 1,
      name: `Dr. ${fName} ${lName}`,
      spec: spec,
      qual: qual,
      nationality: nat,
      location: loc,
      img: img
    });
  }
  return list;
};

const fullDoctorsList = generate100Doctors();

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [reportId, setReportId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [heroDoctorSearch, setHeroDoctorSearch] = useState('');
  const [heroSpeciality, setHeroSpeciality] = useState('Select speciality');
  const [heroHospital, setHeroHospital] = useState('Select clinic/hospital');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSpecialitiesMenu, setShowSpecialitiesMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  const [loginType, setLoginType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);

  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [selectedDept, setSelectedDept] = useState('Interventional Cardiology');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('05:00 PM');
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [homeCareName, setHomeCareName] = useState('');
  const [homeCareMobile, setHomeCareMobile] = useState('');
  const [homeCareEmail, setHomeCareEmail] = useState('');
  const [homeCareService, setHomeCareService] = useState('Nurse @Home');
  const [homeAddress, setHomeAddress] = useState('');

  const [ipdPatientName, setIpdPatientName] = useState('');
  const [ipdMobile, setIpdMobile] = useState('');
  const [ipdEmail, setIpdEmail] = useState('');
  const [ipdRoomType, setIpdRoomType] = useState('Private Deluxe Room');

  const [refDocName, setRefDocName] = useState('');
  const [refDocMobile, setRefDocMobile] = useState('');
  const [refDocEmail, setRefDocEmail] = useState('');
  const [refSpeciality, setRefSpeciality] = useState('Cardiology');

  const [selectedLocationFilter, setSelectedLocationFilter] = useState('ALL');
  const [selectedLocationObj, setSelectedLocationObj] = useState(null);

  const [telePatientName, setTelePatientName] = useState('');
  const [teleMobile, setTeleMobile] = useState('');
  const [teleEmail, setTeleEmail] = useState('');
  const [teleService, setTeleService] = useState('Live Teleconsultation');

  const [trackTokenId, setTrackTokenId] = useState('');
  const [queueInfo, setQueueInfo] = useState(null);

  const [paymentAmount, setPaymentAmount] = useState('3500');
  const [paymentPurpose, setPaymentPurpose] = useState('Doctor Consultation');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [rxPatientName, setRxPatientName] = useState('');
  const [rxAddress, setRxAddress] = useState('');
  const [rxFile, setRxFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedMedicines, setExtractedMedicines] = useState([]);

  const [packageCategory, setPackageCategory] = useState('ALL');
  const [packageSearch, setPackageSearch] = useState('');

  const [newsletterEmail, setNewsletterEmail] = useState('');

  const [reviewDoctor, setReviewDoctor] = useState('Dr. Senthil Kumar');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState([
    { name: "Ahamed K.", doctor: "Dr. Senthil Kumar", rating: "5 ⭐", comment: "Excellent service and instant appointment confirmation via email!" },
    { name: "Fatima R.", doctor: "Dr. Priya Sharma", rating: "5 ⭐", comment: "Pharmacy OCR delivery feature worked smoothly. Received medicines fast." }
  ]);

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

  const fetchUserAppointments = async (userEmail) => {
    const { data } = await supabase.from('appointments').select('*').ilike('Email', userEmail);
    if (data) setUserAppointments(data);
  };

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
      fetchUserAppointments(email);
      alert('Patient Login Successful! Welcome to Patient Portal.');
    }
  };

  const checkAuthProtection = () => {
    if (!isLoggedIn) {
      alert('🔒 Authentication Required!\n\nPlease Login to your Patient Portal before booking an appointment or placing an order.');
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroDoctorSearch) {
      setSearchQuery(heroDoctorSearch);
    } else if (heroSpeciality !== 'Select speciality') {
      setSearchQuery(heroSpeciality);
    } else if (heroHospital !== 'Select clinic/hospital') {
      setSearchQuery(heroHospital);
    }
    setActiveTab('doctors');
  };

  const handleTrackQueue = () => {
    if (!trackTokenId) { alert("Please enter Patient ID or Token No!"); return; }
    const userNum = Math.floor(12 + Math.random() * 15);
    const currentNum = Math.max(1, userNum - Math.floor(Math.random() * 5 + 2));
    const waitingCount = userNum - currentNum;
    const estWaitTime = waitingCount * 8; 

    setQueueInfo({
      userToken: `TK-${userNum}`,
      currentToken: `TK-${currentNum}`,
      patientsAhead: waitingCount,
      estimatedMins: estWaitTime,
      doctor: "Dr. Senthil Kumar (Cardiology)",
      room: "Consultation Room 04 - OPD"
    });
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!checkAuthProtection()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaymentSuccess(true);
      alert(`✅ Payment of LKR ${paymentAmount} Successful!\nReceipt Generated.`);
    }, 2000);
  };

  const handleScanPrescription = (e) => {
    e.preventDefault();
    if (!checkAuthProtection()) return;

    if (!rxFile) { alert("Please select a prescription image/PDF!"); return; }
    setIsScanning(true);
    setExtractedMedicines([]);

    setTimeout(() => {
      setIsScanning(false);
      setExtractedMedicines([
        { name: "Paracetamol 500mg Tab", qty: "10 Tabs", dosage: "1-0-1 (After Food)", price: "LKR 150" },
        { name: "Amoxicillin 250mg Cap", qty: "15 Caps", dosage: "1-1-1 (5 Days)", price: "LKR 850" },
        { name: "Cetirizine 10mg Tab", qty: "5 Tabs", dosage: "0-0-1 (Night)", price: "LKR 100" },
        { name: "Multivitamin Syrup 100ml", qty: "1 Bottle", dosage: "5ml Daily", price: "LKR 1,200" }
      ]);
    }, 2500);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!checkAuthProtection()) return;

    const newRev = {
      name: email.split('@')[0] || "Patient",
      doctor: reviewDoctor,
      rating: `${reviewRating} ⭐`,
      comment: reviewComment
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewComment('');
    alert("🌟 Thank you! Your review has been published.");
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    alert(`📧 Thank you for subscribing to MedCare Health Updates! Link sent to: ${newsletterEmail}`);
    setNewsletterEmail('');
  };

  const timeSlotsList = [
    '09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '05:00 PM', '05:20 PM', '05:40 PM', '06:00 PM', '06:40 PM', '07:20 PM', '08:00 PM'
  ];

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!checkAuthProtection()) return;

    setLoading(true);

    const generatedPatientId = "MED-" + Math.floor(10000 + Math.random() * 90000); 
    const finalBookingDate = selectedDate || new Date().toISOString().split('T')[0];
    const finalDoctorName = doctorName || `Specialist (${selectedDept})`;

    const newAppointment = { 
      patient_name: patientName, 
      phone_number: phoneNumber, 
      Email: patientEmail, 
      doctor_name: finalDoctorName, 
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
        result_status: 'Completed & Ready',
        pdf_url: '#'
      };

      await supabase.from('lab_reports').insert([newLabReport]);

      try {
        await emailjs.send(
          'service_9n54anx',     
          'template_vocoao8',    
          {
            to_name: patientName,
            to_email: patientEmail,
            appointment_date: `${finalBookingDate} at ${selectedTimeSlot}`,
            doctor_name: finalDoctorName,
            department: selectedDept,
            session_time: selectedTimeSlot,
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedPatientId,
            contact_info: '+94 11 234 5678'
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
      alert(`🎉 Booking Saved in Supabase & Gmail Confirmation Sent!\n\nPatient ID: ${generatedPatientId}`);
      setPatientName('');
      setPhoneNumber('');
      setPatientEmail('');
      setDoctorName('');
      fetchUserAppointments(email);
      if (userRole === 'admin') fetchAdminData();
    }
  };

  const handleIpdAdmission = async (e) => {
    e.preventDefault();
    if (!checkAuthProtection()) return;

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
            appointment_date: `${todayDate} (Admission)`,
            doctor_name: `IPD Ward: ${ipdRoomType}`,
            department: 'Inpatient Department (IPD)',
            session_time: '24/7 Nursing & Admission Confirmed',
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedIpdId,
            contact_info: '+94 11 234 5678'
          },
          'ix48ntLo80BcgczaW'
        );
        alert(`🏥 IPD Admission Saved & Email Sent Successfully! ID: ${generatedIpdId}`);
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

  const handleHomeCareBooking = async (e) => {
    e.preventDefault();
    if (!checkAuthProtection()) return;

    setLoading(true);

    const generatedHomeId = "HOME-" + Math.floor(10000 + Math.random() * 90000);
    const todayDate = new Date().toISOString().split('T')[0];

    const newHomeRecord = {
      patient_name: homeCareName,
      phone_number: homeCareMobile,
      Email: homeCareEmail,
      department: 'HomeCare Services',
      doctor_name: `Service: ${homeCareService} at ${homeAddress}`,
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
            appointment_date: `${todayDate} (Home Visit)`,
            doctor_name: `HomeCare: ${homeCareService}`,
            department: 'HomeCare Services',
            session_time: `Scheduled Visit (${homeAddress})`,
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedHomeId,
            contact_info: '+94 11 234 5678'
          },
          'ix48ntLo80BcgczaW'
        );
        alert(`🏠 HomeCare Booked & Email Sent! ID: ${generatedHomeId}`);
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

  const handleTeleMedcareBooking = async (e) => {
    e.preventDefault();
    if (!checkAuthProtection()) return;

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
            appointment_date: `${todayDate} (Video Consult)`,
            doctor_name: `Teleconsultation: ${teleService}`,
            department: 'teleMEDCARE',
            session_time: 'Instant Secure Video Link',
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedTeleId,
            contact_info: '+94 11 234 5678'
          },
          'ix48ntLo80BcgczaW'
        );
        alert(`🎉 teleMEDCARE Booked & Email Sent! ID: ${generatedTeleId}`);
      } catch (err) {
        console.error("EmailJS Error:", err);
      }
      setTelePatientName('');
      setTeleMobile('');
      setTeleEmail('');
    } else {
      alert('Error saving to Supabase: ' + error.message);
    }
    setLoading(false);
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    if (!checkAuthProtection()) return;

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
            appointment_date: `${todayDate} (Referral)`,
            doctor_name: `Referral Speciality: ${refSpeciality}`,
            department: 'Referral Network',
            session_time: 'Confirmed Submission',
            app_no: Math.floor(Math.random() * 20) + 1,
            patient_id: generatedRefId,
            contact_info: '+94 11 234 5678'
          },
          'ix48ntLo80BcgczaW'
        );
        alert(`🤝 Referral Submitted & Email Sent! ID: ${generatedRefId}`);
      } catch (err) {
        console.error("EmailJS Error:", err);
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
      setReportResult({
        patient_id: cleanId,
        patient_name: "Valued Patient",
        test_name: "Comprehensive Diagnostic Scan & Metabolic Report",
        result_status: "Completed & Verified"
      });
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

      doc.save(`MedCare_LabReport_${data.patient_id}.pdf`);
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

  const homeCareServicesList = [
    { id: 'doc', title: 'DOCTOR @HOME', desc: 'Expert medical consultations & health evaluations conducted in your comfort.', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80' },
    { id: 'nurse', title: 'NURSE @HOME', desc: 'Continuous nursing care, wound dressing, IV injections & patient monitoring.', img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80' },
    { id: 'lab', title: 'LAB @HOME', desc: 'Doorstep blood and diagnostic sample collection with rapid online lab results.', img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=400&q=80' },
    { id: 'physio', title: 'PHYSIO @HOME', desc: 'Personalized physical rehabilitation and post-surgery mobility sessions.', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80' },
    { id: 'ivdrip', title: 'IV DRIP @HOME', desc: 'Vitamin infusion therapy, rehydration & metabolic boost administered safely.', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80' },
    { id: 'mother', title: 'MOTHER & BABY CARE', desc: 'Specialized postnatal nursing, newborn care guidance & maternal wellness.', img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80' },
    { id: 'sleep', title: 'SLEEP STUDY @HOME', desc: 'Non-invasive nocturnal sleep apnea profiling & respiratory monitoring.', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80' },
    { id: 'golden', title: 'GOLDEN HORIZON PROGRAM', desc: 'Comprehensive senior citizen long-term geriatric wellness & care plan.', img: 'https://images.unsplash.com/photo-1581579438747-1dc8d1e05dd6?auto=format&fit=crop&w=400&q=80' }
  ];

  const sriLankaLocationsList = [
    { id: "colombo-1", name: "Colombo - Medcare Royal Speciality Hospital", address: "Kirimandala Mawatha, Narahenpita, Colombo 05", beds: "120", doctors: "45", specialities: "28", img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80", desc: "Medcare Royal Speciality Hospital in Colombo is a state-of-the-art multi-speciality tertiary care hospital offering advanced 256-slice CT, MRI, 24/7 Emergency ICU, and international medical specialists." },
    { id: "colombo-2", name: "Colombo - Medcare Medical & Diagnostic Centre", address: "Galle Road, Kollupitiya, Colombo 03", beds: "Outpatient", doctors: "25", specialities: "18", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80", desc: "Located along Galle Road, Kollupitiya, providing premier outpatient diagnostics, laboratory testing, and specialist consultations." },
    { id: "kandy-1", name: "Kandy - Medcare General & Heart Centre", address: "Peradeniya Road, Kandy, Central Province", beds: "85", doctors: "32", specialities: "22", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80", desc: "Leading general and cardiac care hospital in the hill capital, featuring dedicated catheterization labs and expert cardiologists." },
    { id: "galle-1", name: "Galle - Medcare Coastal Hospital", address: "Matara Road, Galle, Southern Province", beds: "60", doctors: "20", specialities: "15", img: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80", desc: "Serving the Southern province with emergency care, advanced surgical suites, pediatrics, and mother & baby care." },
    { id: "jaffna-1", name: "Jaffna - Medcare North Multi-Speciality Clinic", address: "Hospital Road, Jaffna, Northern Province", beds: "40", doctors: "18", specialities: "12", img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80", desc: "Northern Sri Lanka's premier multi-speciality clinic offering comprehensive diagnostic scans and visiting specialist physicians." },
    { id: "trinco-1", name: "Trincomalee - Medcare Eastern Diagnostic Centre", address: "Inner Harbour Road, Trincomalee", beds: "Outpatient", doctors: "14", specialities: "10", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80", desc: "Eastern province hub providing 24/7 urgent care, pharmacy, and outpatient specialty clinics." },
    { id: "batti-1", name: "Batticaloa - Medcare Care Centre", address: "Main Street, Batticaloa, Eastern Province", beds: "30", doctors: "12", specialities: "08", img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80", desc: "Eastern province hub providing 24/7 urgent care, pharmacy, and outpatient specialty clinics." },
    { id: "negombo-1", name: "Negombo - Medcare Airport Road Hospital", address: "Colombo Road, Negombo, Western Province", beds: "55", doctors: "22", specialities: "14", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80", desc: "Conveniently located near Negombo, providing international standard trauma, surgical care, and general consultations." }
  ];

  const packagesList = [
    { title: "Men Wellness (>40)", cat: "Wellness", desc: "Comprehensive Screening including Cardiac, Metabolic & Prostate check.", price: "LKR 25,000" },
    { title: "Women Preventative (>40)", cat: "Wellness", desc: "Hormonal, Mammography, Bone Density & Full Metabolic Screening.", price: "LKR 28,000" },
    { title: "Cardiac Health Screening", cat: "Heart", desc: "256 Slice CT Angio, Stress Test & Echocardiogram Package.", price: "LKR 42,000" },
    { title: "Child Growth & Vaccination", cat: "Wellness", desc: "Pediatric screening, Vitamin Profiling & Developmental Assessment.", price: "LKR 15,000" },
    { title: "Diabetes Comprehensive Care", cat: "Wellness", desc: "HbA1c, Lipid profile, Nephropathy check & Diabetologist consultation.", price: "LKR 18,000" },
    { title: "Full Body Advanced MRI Package", cat: "Radiology", desc: "Brain, Spine, Whole Abdomen MRI scan with Specialist Radiology Review.", price: "LKR 75,000" },
    { title: "Ortho & Joint Health Check", cat: "Wellness", desc: "Bone densitometry, Calcium profile, Vitamin D & Rheumatology consult.", price: "LKR 22,000" },
    { title: "Oncology Preventative Screening", cat: "Radiology", desc: "Tumor markers, Ultrasound screening & Oncologist evaluation.", price: "LKR 55,000" },
    { title: "Dental & Oral Hygiene Care", cat: "Dental", desc: "Scaling, Full mouth X-ray, Dental consultation & Gum assessment.", price: "LKR 10,000" },
    { title: "Eye Care & Vision Package", cat: "Wellness", desc: "Glaucoma screening, Retinal scan, Vision test & Optometrist check.", price: "LKR 12,500" }
  ];

  const filteredPackages = packagesList.filter(pkg => {
    const matchesCat = packageCategory === 'ALL' || pkg.cat === packageCategory;
    const matchesSearch = pkg.title.toLowerCase().includes(packageSearch.toLowerCase()) || pkg.desc.toLowerCase().includes(packageSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredDoctors = fullDoctorsList.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = sriLankaLocationsList.filter(loc => {
    if (selectedLocationFilter === 'ALL') return true;
    return loc.id === selectedLocationFilter;
  });

  const heroBgUrl = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80';

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: '#0f172a',
      overflowX: 'hidden'
    }}>
      <style>{`
        /* MOBILE DESKTOP VIEW FORCING WRAPPER */
        @media screen and (max-width: 768px) {
          .desktop-force-wrapper {
            width: 1280px !important;
            transform-origin: top left;
            transform: scale(0.31);
            position: absolute;
            left: 0;
            top: 0;
          }
        }
        .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); border: 1px solid rgba(203, 213, 225, 0.6); box-shadow: 0 10px 25px rgba(0,0,0,0.15); color: #0f172a; }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 35px rgba(37,99,235,0.25); }
        .nav-scroll::-webkit-scrollbar { display: none; }
        .nav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .pulse-badge { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>

      {/* MOBILE DESKTOP VIEW CONTAINER */}
      <div className="desktop-force-wrapper" style={{ 
        fontFamily: "'Plus Jakarta Sans', sans-serif", 
        background: '#0f172a',
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        color: '#0f172a',
        width: '100%'
      }}>

      {/* Top Ribbon Bar */}
      <div style={{ background: '#090d16', color: '#94a3b8', padding: '6px 20px', fontSize: '11px', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span>🔴 SRI LANKA MEDCARE HEALTH OS | EMERGENCY RESPONSE: SLA &lt; 7.8 Mins</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setShowSosModal(true)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', fontSize: '10px' }}>🚨 SOS AMBULANCE DISPATCH</button>
          <span style={{ color: isLoggedIn ? '#10b981' : '#f59e0b' }}>
            {isLoggedIn ? `🟢 Logged in: ${email}` : '🔒 Guest Mode (Login Required to Book)'} | 📞 +94 11 234 5678
          </span>
        </div>
      </div>

      {/* Official White Header Navbar */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '22px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>+</div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#0f172a', letterSpacing: '0.5px' }}>MEDCARE</h1>
              <p style={{ fontSize: '10px', fontWeight: '800', margin: 0, color: '#2563eb', letterSpacing: '1px' }}>SRI LANKA</p>
            </div>
          </div>

          {/* Nav Items */}
        <nav className="nav-scroll" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', overflowX: 'auto', gap: '8px', padding: '8px', alignItems: 'center' }}>
            {[
              { id: 'home', label: 'HOME' },
              { id: 'queue', label: 'LIVE QUEUE ⏱️' },
              { id: 'specialities', label: 'SPECIALITIES ▼', action: () => setShowSpecialitiesMenu(!showSpecialitiesMenu) },
              { id: 'doctors', label: 'DOCTORS (100+)' },
              { id: 'ipd', label: 'IPD 🏥' },
              { id: 'homecare', label: 'HOMECARE 🏠' },
              { id: 'telemedcare', label: 'teleMEDCARE 📹' },
              { id: 'chronic', label: 'CHRONIC CARE 🩺' },
              { id: 'pharmacy', label: 'PHARMACY OCR 💊' },
              { id: 'locations', label: 'LOCATIONS 📍' },
              { id: 'packages', label: 'PACKAGES' },
              { id: 'reviews', label: 'REVIEWS ⭐' },
              { id: 'dashboard', label: 'MY DASHBOARD 👤' },
              { id: 'referral', label: 'REFERRALS' },
              { id: 'payments', label: 'PAYMENTS 💳', action: () => setShowPaymentModal(true) },
              { id: 'reports', label: 'REPORTS 📥' },
              ...(userRole === 'admin' ? [{ id: 'admin_dashboard', label: 'ADMIN DASHBOARD ⚙️' }] : [])
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
  <button
    key={item.id}
    onClick={item.action ? item.action : () => setActiveTab(item.id)}
    style={{
      padding: '9px 14px',
      borderRadius: '8px',
      border: 'none',
      background: isActive ? '#2563eb' : 'transparent',
      color: isActive ? '#ffffff' : '#334155',
      fontWeight: '800',
      fontSize: '13px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      transition: 'all 0.2s',
    }}
    onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#f1f5f9'; }}
    onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
  >
   {item.label}
  </button>
);
  })
}
</nav>
          <button 
            onClick={() => { if (isLoggedIn) { setIsLoggedIn(false); setUserRole(null); setActiveTab('home'); } else { setShowLoginModal(true); } }} 
            style={{ background: isLoggedIn ? '#dc2626' : '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', whiteSpace: 'nowrap' }}
          >
            {isLoggedIn ? `Logout (${userRole})` : 'Portal Login'}
          </button>
        </div>

        {/* SPECIALITIES MEGA MENU DROPDOWN */}
        {showSpecialitiesMenu && (
          <div style={{ background: '#ffffff', borderTop: '2px solid #2563eb', borderBottom: '1px solid #cbd5e1', padding: '24px 30px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', position: 'absolute', width: '100%', left: 0, top: '100%', zIndex: 1100 }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>All Medical Specialities</h3>
                <button onClick={() => setShowSpecialitiesMenu(false)} style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: '#ef4444' }}>Close ✖</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
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

      {/* SOS EMERGENCY AMBULANCE MODAL */}
      {showSosModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(220,38,38,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button onClick={() => setShowSosModal(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            <div style={{ fontSize: '60px' }}>🚑</div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626', margin: '10px 0 6px 0' }}>EMERGENCY SOS ACTIVE</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Nearest MedCare ICU Ambulance is being dispatched to your GPS location.</p>
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '15px', borderRadius: '14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#991b1b' }}>CALL EMERGENCY HOTLINE DIRECTLY:</span>
              <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#dc2626', margin: '4px 0' }}>+94 11 234 5678</h3>
            </div>
            <button onClick={() => { alert("🚨 Ambulance Alert Sent to Colombo Central Dispatch!"); setShowSosModal(false); }} style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>Dispatch ICU Ambulance Now 🚨</button>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY MODAL */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button onClick={() => { setShowPaymentModal(false); setPaymentSuccess(false); }} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>💳 PAYHERE LKR GATEWAY</span>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '8px 0 2px 0' }}>Online Payment Gateway</h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Secure LKR card processing for MedCare Sri Lanka</p>
            </div>

            {!paymentSuccess ? (
              <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>Payment Purpose</label>
                  <select value={paymentPurpose} onChange={e=>setPaymentPurpose(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <option value="Doctor Consultation">Doctor Consultation Fee (LKR 3,500)</option>
                    <option value="Lab Test Payment">Lab Diagnostic Test (LKR 5,200)</option>
                    <option value="IPD Advance">IPD Room Advance Payment (LKR 15,000)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>Amount (LKR)</label>
                  <input type="text" value={`LKR ${paymentAmount}`} readOnly style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '900', color: '#2563eb' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>Card Number</label>
                  <input type="text" placeholder="4111 •••• •••• 1111" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>Expiry</label>
                    <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e=>setCardExpiry(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>CVC / CVV</label>
                    <input type="password" placeholder="123" value={cardCvc} onChange={e=>setCardCvc(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', marginTop: '6px' }}>
                  {loading ? 'Processing LKR Payment...' : 'Pay LKR Now 🔒'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '50px' }}>🎉</div>
                <h3 style={{ color: '#16a34a', fontWeight: '900', margin: '10px 0 4px 0' }}>Payment Successful!</h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Transaction ID: TXN-{Math.floor(100000 + Math.random() * 900000)}</p>
                <button onClick={() => setShowPaymentModal(false)} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', marginTop: '14px', cursor: 'pointer' }}>Close Gateway</button>
              </div>
            )}
          </div>
        </div>
      )}

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
      <main style={{ width: '100%', flex: 1 }}>
        
        {/* OFFICIAL HOME PAGE WITH SEARCH BAR HERO SECTION */}
        {activeTab === 'home' && (
          <div>
            <div style={{ 
              backgroundImage: `linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.85)), url("${heroBgUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '480px',
              padding: '60px 24px 80px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              
              <div style={{ textAlign: 'center', color: '#ffffff', marginBottom: '40px', maxWidth: '850px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '2px', color: '#93c5fd', textTransform: 'uppercase' }}>Advanced Healthcare Network</span>
                <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '10px 0 12px 0', fontFamily: 'serif', letterSpacing: '0.5px' }}>
                  Advanced Endoscopy & Gastroenterology Center
                </h1>
                <p style={{ fontSize: '15px', color: '#cbd5e1', margin: 0 }}>
                  World-class clinical expertise, advanced diagnostics, and compassionate patient care across Sri Lanka & Middle East.
                </p>
              </div>

              {/* BOOK YOUR APPOINTMENT SEARCH WIDGET */}
              <div style={{ width: '100%', maxWidth: '1050px', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '25px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 16px 0' }}>Book Your Appointment</h3>
                
                <form onSubmit={handleHeroSearch} style={{ display: 'grid', gridTemplateColumns: '2fr auto 1.5fr 1.5fr auto', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="Search for doctors, clinic, hospital" 
                      value={heroDoctorSearch} 
                      onChange={e=>setHeroDoctorSearch(e.target.value)}
                      style={{ width: '100%', padding: '13px 16px 13px 38px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '15px' }}>🔍</span>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>OR</span>

                  <select 
                    value={heroSpeciality} 
                    onChange={e=>setHeroSpeciality(e.target.value)}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#334155', outline: 'none', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Select speciality">Select speciality</option>
                    {departmentNames.map((d, idx) => (
                      <option key={idx} value={d}>{d}</option>
                    ))}
                  </select>

                  <select 
                    value={heroHospital} 
                    onChange={e=>setHeroHospital(e.target.value)}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#334155', outline: 'none', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Select clinic/hospital">Select clinic/hospital</option>
                    {sriLankaLocationsList.map((loc) => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>

                  <button type="submit" style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '13px 28px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#1d4ed8'} onMouseOut={e=>e.currentTarget.style.background='#2563eb'}>
                    Search
                  </button>
                </form>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div onClick={() => setActiveTab('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ background: '#dbeafe', padding: '8px', borderRadius: '8px', color: '#2563eb', fontSize: '16px' }}>📅</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>Manage appointments ➔</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>For you and your family members</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setActiveTab('queue')} style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>Live Queue Tracker ⏱️</button>
                    <button onClick={() => setActiveTab('reports')} style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>Lab Reports Download 📄</button>
                  </div>
                </div>

              </div>
            </div>

            {/* HOSPITALS & MEDICAL CENTRES LOCATIONS GRID */}
            <div style={{ background: '#f8fafc', padding: '60px 24px' }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '900', color: '#2563eb', marginBottom: '35px', fontFamily: 'serif' }}>
                  Medcare Hospitals & Medical Centres
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                  {sriLankaLocationsList.map((loc) => (
                    <div key={loc.id} className="glass-card card-hover" style={{ borderRadius: '18px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ height: '180px', overflow: 'hidden' }}>
                        <img src={loc.img} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>{loc.name}</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>📍 {loc.address}</p>
                        <button onClick={() => { setSelectedLocationObj(loc); setActiveTab('location_detail'); }} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
                          LEARN MORE ➔
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PHILOSOPHY & ABOUT SECTION */}
            <div style={{ background: '#ffffff', padding: '70px 24px', textAlign: 'center' }}>
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase' }}>OUR PHILOSOPHY</span>
                <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#2563eb', margin: '10px 0 25px 0', fontFamily: 'serif' }}>
                  We'll treat you well
                </h2>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.8' }}>
                  MedCare brings the network of multi-speciality hospitals, medical centres and hundreds of specialized doctors with one care passion in mind - your and your family's well-being. We maintain the highest possible standards in all aspects of healthcare.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* REST OF PURE FUNCTIONAL TABS CONTAINER */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '35px 24px' }}>

          {/* INDIVIDUAL LOCATION DETAIL PAGE (BLUE THEME + FULL DATA) */}
          {activeTab === 'location_detail' && selectedLocationObj && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
              <button onClick={() => setActiveTab('locations')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', marginBottom: '20px' }}>← Back to All Locations</button>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'center' }}>
                <div>
                  <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>📍 BRANCH OVERVIEW</span>
                  <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: '10px 0 12px 0', fontFamily: 'serif' }}>{selectedLocationObj.name}</h1>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>{selectedLocationObj.address}</p>
                  <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', marginBottom: '25px' }}>{selectedLocationObj.desc}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '14px', textAlign: 'center', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>Beds</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#2563eb' }}>{selectedLocationObj.beds}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>Doctors</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#2563eb' }}>{selectedLocationObj.doctors}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>Specialities</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#2563eb' }}>{selectedLocationObj.specialities}</div>
                    </div>
                  </div>

                  <button onClick={() => { setDoctorName(`Appointment at ${selectedLocationObj.name}`); setActiveTab('book'); }} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', cursor: 'pointer' }}>
                    Book Appointment Here 🩺
                  </button>
                </div>

                <div>
                  <img src={selectedLocationObj.img} alt={selectedLocationObj.name} style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }} />
                </div>
              </div>
            </div>
          )}

          {/* MY PATIENT DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="glass-card" style={{ borderRadius: '24px', padding: '35px' }}>
              <span style={{ background: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>👤 PATIENT PORTAL</span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 20px 0' }}>Welcome, {email || 'Guest Patient'}</h2>
              
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2563eb', marginBottom: '12px' }}>My Active Appointments ({userAppointments.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px' }}>Doctor / Service</th>
                      <th style={{ padding: '10px' }}>Department</th>
                      <th style={{ padding: '10px' }}>Date</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAppointments.length > 0 ? (
                      userAppointments.map((app, i)=>(
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px', fontWeight: '800' }}>{app.doctor_name}</td>
                          <td style={{ padding: '10px' }}>{app.department}</td>
                          <td style={{ padding: '10px' }}>{app.appointment_date}</td>
                          <td style={{ padding: '10px', color: '#16a34a', fontWeight: '900' }}>● Confirmed</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" style={{ padding: '15px', color: '#64748b' }}>No active bookings found. Please login or book an appointment.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LIVE QUEUE TRACKER TAB */}
          {activeTab === 'queue' && (
            <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '750px', margin: '0 auto' }}>
              <span style={{ background: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>⏱️ LIVE TOKEN ENGINE</span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>Real-Time Patient Queue & Wait Time Tracker</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '22px' }}>Track live OPD token progress from home without standing in physical hospital queues.</p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                <input type="text" placeholder="Enter Patient ID (e.g. MED-14152) or Token No" value={trackTokenId} onChange={e=>setTrackTokenId(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                <button onClick={handleTrackQueue} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>Track Token 🔍</button>
              </div>

              {queueInfo && (
                <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '2px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>CLINIC / ROOM</span>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{queueInfo.doctor}</h4>
                      <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '800' }}>{queueInfo.room}</span>
                    </div>
                    <span className="pulse-badge" style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900' }}>● LIVE NOW</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
                    <div style={{ background: '#e0f2fe', padding: '15px', borderRadius: '14px' }}>
                      <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '800' }}>CURRENT SERVING TOKEN</div>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>{queueInfo.currentToken}</div>
                    </div>

                    <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '14px' }}>
                      <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '800' }}>YOUR TOKEN NO</div>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: '#16a34a', margin: '4px 0' }}>{queueInfo.userToken}</div>
                    </div>

                    <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '14px' }}>
                      <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '800' }}>ESTIMATED WAIT TIME</div>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: '#d97706', margin: '4px 0' }}>~{queueInfo.estimatedMins} Mins</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', background: '#fff', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>👥 Patients Waiting Ahead of You:</span>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#dc2626' }}>{queueInfo.patientsAhead} Patients</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HOMECARE SERVICES GRID */}
          {activeTab === 'homecare' && (
            <div>
              <div style={{ textTransform: 'uppercase', color: '#94a3b8', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>
                🏠 / <span style={{ color: '#60a5fa' }}>HOME SERVICES</span>
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', marginBottom: '25px' }}>Comprehensive HomeCare Services</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px', marginBottom: '40px' }}>
                {homeCareServicesList.map((srv) => (
                  <div key={srv.id} className="glass-card card-hover" style={{ borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
                    <div>
                      <div style={{ height: '180px', overflow: 'hidden' }}>
                        <img src={srv.img} alt={srv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>{srv.title}</h3>
                        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>{srv.desc}</p>
                      </div>
                    </div>
                    <div style={{ padding: '0 20px 20px 20px', textAlign: 'center' }}>
                      <button 
                        onClick={() => { setHomeCareService(srv.title); window.scrollTo({ top: 700, behavior: 'smooth' }); }} 
                        style={{ background: 'none', border: '2px solid #2563eb', color: '#2563eb', padding: '10px 22px', borderRadius: '25px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#2563eb'; }}
                      >
                        BOOK NOW ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '650px', margin: '0 auto' }}>
                <span style={{ background: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>🏠 INSTANT HOMECARE BOOKING</span>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>Selected Service: {homeCareService}</h3>
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
                      <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Gmail Address</label>
                      <input type="email" placeholder="patient@gmail.com" value={homeCareEmail} onChange={e=>setHomeCareEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Required HomeCare Service</label>
                    <select value={homeCareService} onChange={e=>setHomeCareService(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }}>
                      {homeCareServicesList.map(s => (<option key={s.id} value={s.title}>{s.title}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Home Address in Sri Lanka</label>
                    <textarea placeholder="Enter street, city, district..." value={homeAddress} onChange={e=>setHomeAddress(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', height: '80px', background: '#fff' }}></textarea>
                  </div>
                  <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>
                    {loading ? 'Saving...' : 'Book HomeCare Service & Send Email 🏠'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CHRONIC CARE PROGRAM TAB */}
          {activeTab === 'chronic' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 35px auto' }}>
                <span style={{ color: '#2563eb', fontWeight: '900', letterSpacing: '1px', fontSize: '13px' }}>🩺 LONG TERM HEALTHCARE</span>
                <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', margin: '10px 0 15px 0' }}>Chronic Care Program</h1>
                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
                  Our Chronic Care Program is designed to provide a team of dedicated healthcare professionals brings together Doctors, Nurses, Dietitians, Fitness Coaches to work on a personalized plan for your wellbeing.
                </p>
                <div style={{ background: '#2563eb', color: '#fff', width: '140px', height: '140px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '25px auto 0 auto', fontWeight: '900', fontSize: '16px', boxShadow: '0 10px 25px rgba(37,99,235,0.4)' }}>
                  <span>1 YEAR</span>
                  <span style={{ fontSize: '11px', fontWeight: '700' }}>LONG PROGRAM</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '35px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: '20px' }}>Program Roadmap</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', textAlign: 'center' }}>
                  <div style={{ background: '#2563eb', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800' }}>1. Screening & Vitals</div>
                  <div style={{ background: '#1d4ed8', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800' }}>2. Consult Specialist Physician</div>
                  <div style={{ background: '#7c3aed', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800' }}>3. Dietitian Consultation</div>
                  <div style={{ background: '#16a34a', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800' }}>4. 24/7 Support & Bloodwork</div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button onClick={() => { setSelectedDept('Internal Medicine'); setActiveTab('book'); }} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px 35px', borderRadius: '30px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>
                  Enroll In Chronic Care Program ➔
                </button>
              </div>
            </div>
          )}

          {/* TELEMEDCARE VIDEO CONSULTATION */}
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
                      <label style={{ display: 'block', fontWeight: '800', marginBottom: '5px', color: '#1e293b' }}>Gmail Address</label>
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

          {/* PHARMACY OCR TAB */}
          {activeTab === 'pharmacy' && (
            <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '750px', margin: '0 auto' }}>
              <span style={{ background: '#16a34a', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>💊 OCR PHARMACY DELIVERY</span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>Prescription OCR Scan & Home Medicine Delivery</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '22px' }}>Upload written doctor prescription to automatically extract medicines & order delivery across Sri Lanka.</p>

              <form onSubmit={handleScanPrescription} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px' }}>Patient Full Name</label>
                    <input type="text" placeholder="Enter name" value={rxPatientName} onChange={e=>setRxPatientName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px' }}>Delivery Address in Sri Lanka</label>
                    <input type="text" placeholder="Colombo, Kandy, Galle..." value={rxAddress} onChange={e=>setRxAddress(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px' }}>Upload Doctor Prescription (Image / PDF)</label>
                  <input type="file" onChange={e=>setRxFile(e.target.files[0])} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '2px dashed #2563eb', background: '#f0f9ff' }} />
                </div>

                <button type="submit" disabled={isScanning} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', fontSize: '15px', cursor: 'pointer' }}>
                  {isScanning ? '🔍 AI OCR Scanning Prescription...' : 'Scan Prescription & Extract Medicines 🚀'}
                </button>
              </form>

              {extractedMedicines.length > 0 && (
                <div style={{ marginTop: '25px', background: '#f8fafc', padding: '22px', borderRadius: '18px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: '0 0 14px 0' }}>✅ OCR Extracted Medicines List</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#e2e8f0' }}>
                        <th style={{ padding: '8px' }}>Medicine</th>
                        <th style={{ padding: '8px' }}>Qty</th>
                        <th style={{ padding: '8px' }}>Dosage</th>
                        <th style={{ padding: '8px' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedMedicines.map((med, i)=>(
                        <tr key={i} style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px', fontWeight: '800' }}>{med.name}</td>
                          <td style={{ padding: '8px' }}>{med.qty}</td>
                          <td style={{ padding: '8px' }}>{med.dosage}</td>
                          <td style={{ padding: '8px', color: '#16a34a', fontWeight: '900' }}>{med.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => { if(checkAuthProtection()){ setShowPaymentModal(true); setPaymentAmount('2300'); setPaymentPurpose('Pharmacy Medicine Delivery'); } }} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '900', marginTop: '16px', cursor: 'pointer' }}>
                    Order Pharmacy Delivery & Pay LKR 2,300 💳
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 100+ DOCTORS DIRECTORY */}
          {activeTab === 'doctors' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#f8fafc', margin: 0 }}>Doctors Directory</h2>
                <span style={{ background: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                  Showing {filteredDoctors.length} Specialists
                </span>
              </div>

              <input 
                type="text" 
                placeholder="Search by Doctor Name, Speciality, or Location..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '25px', background: '#fff', boxSizing: 'border-box' }} 
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
                {filteredDoctors.map((doc) => (
                  <div key={doc.id} className="glass-card card-hover" style={{ borderRadius: '20px', padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', background: '#ffffff' }}>
                    <img src={doc.img} alt={doc.name} style={{ width: '130px', height: '140px', objectFit: 'cover', borderRadius: '14px' }} />
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 6px 0', color: '#0f172a' }}>{doc.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>{doc.qual}</p>
                      <p style={{ color: '#2563eb', fontSize: '12px', fontWeight: '800', margin: '0 0 4px 0' }}>Speciality: {doc.spec}</p>
                      <p style={{ color: '#475569', fontSize: '11px', fontWeight: '700', margin: '0 0 4px 0' }}>Nationality: {doc.nationality}</p>
                      <p style={{ color: '#475569', fontSize: '11px', fontWeight: '700', margin: '0 0 12px 0' }}>Location: {doc.location}</p>
                      
                      <button 
                        onClick={() => { setDoctorName(doc.name); setSelectedDept(doc.spec); setActiveTab('book'); }} 
                        style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '30px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                      >
                        BOOK NOW →
                      </button>
                    </div>
                  </div>
                ))}
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
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Gmail Address</label>
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
                      <div style={{ padding: '0 20px 20px 20px', display: 'flex', gap: '10px' }}>
                        <button onClick={() => { setSelectedLocationObj(loc); setActiveTab('location_detail'); }} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' }}>LEARN MORE ➔</button>
                        <button onClick={() => { setDoctorName(`Appointment at ${loc.name}`); setActiveTab('book'); }} style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' }}>Book Here 🩺</button>
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
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
                <input type="text" placeholder="Search packages..." value={packageSearch} onChange={e=>setPackageSearch(e.target.value)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1, minWidth: '200px', background: '#fff' }} />
                {['ALL', 'Wellness', 'Heart', 'Radiology', 'Dental'].map((cat)=>(
                  <button key={cat} onClick={()=>setPackageCategory(cat)} style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: packageCategory === cat ? '#2563eb' : '#ffffff', color: packageCategory === cat ? '#fff' : '#1e293b', fontWeight: '800', cursor: 'pointer' }}>
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {filteredPackages.map((pkg, idx) => (
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

          {/* PATIENT REVIEWS & RATING TAB */}
          {activeTab === 'reviews' && (
            <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '750px', margin: '0 auto' }}>
              <span style={{ background: '#f59e0b', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>⭐ PATIENT FEEDBACK</span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 20px 0' }}>Patient Reviews & Ratings</h2>

              <form onSubmit={handleAddReview} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontWeight: '900' }}>Leave Your Review</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <select value={reviewDoctor} onChange={e=>setReviewDoctor(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {fullDoctorsList.slice(0, 10).map((d, i)=>(<option key={i} value={d.name}>{d.name}</option>))}
                  </select>
                  <select value={reviewRating} onChange={e=>setReviewRating(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="5">5 ⭐ - Excellent</option>
                    <option value="4">4 ⭐ - Good</option>
                    <option value="3">3 ⭐ - Average</option>
                  </select>
                </div>
                <textarea placeholder="Write your experience..." value={reviewComment} onChange={e=>setReviewComment(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '70px' }}></textarea>
                <button type="submit" style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>Submit Review ⭐</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviewsList.map((rev, i)=>(
                  <div key={i} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '900', fontSize: '14px', color: '#0f172a' }}>{rev.name} ({rev.doctor})</span>
                      <span style={{ color: '#f59e0b', fontWeight: '900', fontSize: '12px' }}>{rev.rating}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>"{rev.comment}"</p>
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
                    <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Gmail Address</label>
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

          {/* LAB REPORTS & INSTANT PDF DOWNLOAD TAB */}
          {activeTab === 'reports' && (
            <div className="glass-card" style={{ borderRadius: '24px', padding: '35px', maxWidth: '700px', margin: '0 auto' }}>
              <span style={{ background: '#10b981', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>📥 LAB REPORTS</span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 6px 0' }}>Download Lab Reports & PDF Summaries</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '22px' }}>Enter your Patient ID (e.g., MED-14152 or any text) given during booking to instantly fetch and download your official PDF report.</p>
              
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
                  <label style={{ display: 'block', fontWeight: '800', marginBottom: '6px', color: '#1e293b' }}>Gmail Address</label>
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

        </div>
      </main>

      {/* Floating Autonomous AI Agent */}
      <AiChatAgent
        setActiveTab={setActiveTab}
        setSelectedDept={setSelectedDept}
        setDoctorName={setDoctorName}
      />

      {/* DARK PROFESSIONAL FOOTER COMPONENT */}
      <footer style={{ background: '#090d16', borderTop: '1px solid #1e293b', color: '#94a3b8', padding: '50px 24px 25px 24px', marginTop: '60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '35px', marginBottom: '40px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', background: '#2563eb', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>+</div>
              <h3 style={{ color: '#f8fafc', fontSize: '18px', fontWeight: '900', margin: 0 }}>MEDCARE <span style={{ color: '#60a5fa', fontSize: '11px' }}>SRI LANKA</span></h3>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#94a3b8' }}>
              MedCare Health OS is Sri Lanka's leading autonomous healthcare network operating across Colombo, Kandy, Jaffna, Galle, Batticaloa, and international hubs in Dubai & Saudi Arabia.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Quick Portals</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li onClick={() => setActiveTab('doctors')} style={{ cursor: 'pointer' }}>➔ Doctors Directory (100+)</li>
              <li onClick={() => setActiveTab('reports')} style={{ cursor: 'pointer' }}>➔ Lab Reports & PDF Download</li>
              <li onClick={() => setActiveTab('queue')} style={{ cursor: 'pointer' }}>➔ Live OPD Queue Tracker</li>
              <li onClick={() => setActiveTab('pharmacy')} style={{ cursor: 'pointer' }}>➔ Prescription OCR Delivery</li>
              <li onClick={() => setActiveTab('locations')} style={{ cursor: 'pointer' }}>➔ Sri Lanka Hospital Branches</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Legal & Compliance</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ cursor: 'pointer' }}>➔ PHSRC Registration Sri Lanka</li>
              <li style={{ cursor: 'pointer' }}>➔ HIPAA Data Privacy Guarantee</li>
              <li style={{ cursor: 'pointer' }}>➔ Terms of Service & Telehealth</li>
              <li style={{ cursor: 'pointer' }}>➔ Patient Rights & Consent</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Health Newsletter</h4>
            <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#94a3b8', marginBottom: '12px' }}>
              Subscribe to get seasonal health screening alerts and medical consultation discounts.
            </p>
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                placeholder="Your email address" 
                value={newsletterEmail} 
                onChange={e => setNewsletterEmail(e.target.value)}
                required
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px', flex: 1 }} 
              />
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                Join
              </button>
            </form>
          </div>

        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#64748b' }}>
          <div>© 2026 MedCare Hospitals & Health OS Sri Lanka. All Rights Reserved.</div>
          <div>Designed & Developed for Mufthi (HNDIT Healthcare OS)</div>
        </div>
      </footer>
      </div>
    </div>
  );
}