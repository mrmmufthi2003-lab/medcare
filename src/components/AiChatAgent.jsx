import React, { useState } from 'react';

export default function AiChatAgent({ setActiveTab, setSelectedDept, setDoctorName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I am MedCare Autonomous AI Health Agent. How can I help you today? (You can click on the options below)" }
  ]);
  const [inputVal, setInputVal] = useState('');

  const quickActions = [
    { label: '🩺 Book Appointment', tab: 'book' },
    { label: '⏱️ Live Queue Status', tab: 'queue' },
    { label: '👨‍⚕️ Doctors Directory', tab: 'doctors' },
    { label: '🏥 IPD Room Admission', tab: 'ipd' },
    { label: '🏠 HomeCare Services', tab: 'homecare' },
    { label: '📹 teleMEDCARE Video', tab: 'telemedcare' },
    { label: '🩺 Chronic Care Program', tab: 'chronic' },
    { label: '💊 Pharmacy OCR Delivery', tab: 'pharmacy' },
    { label: '📍 Hospital Locations', tab: 'locations' },
    { label: '📦 Health Packages', tab: 'packages' },
    { label: '💳 PayHere Gateway', tab: 'payments' },
    { label: '📥 Download Lab Report', tab: 'reports' },
    { label: '👤 Patient Dashboard', tab: 'dashboard' },
    { label: '⭐ Patient Reviews', tab: 'reviews' },
    { label: '🤝 Medical Referrals', tab: 'referral' }
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputVal('');

    setTimeout(() => {
      let aiReply = "I am sorry, I didn't quite understand that. Please use the quick options below or specify your request.";
      const lower = userText.toLowerCase();

      if (lower.includes('book') || lower.includes('appointment')) {
        setActiveTab('book');
        aiReply = "I have redirected you to the Booking page. Please fill in your details to confirm!";
      } else if (lower.includes('queue') || lower.includes('token')) {
        setActiveTab('queue');
        aiReply = "Switched to Live Queue Tracker. Enter your token or Patient ID to check your live status.";
      } else if (lower.includes('doctor') || lower.includes('specialist')) {
        setActiveTab('doctors');
        aiReply = "Opened the 100+ Doctors Directory. You can search and book your preferred specialist.";
      } else if (lower.includes('ipd') || lower.includes('room') || lower.includes('ward')) {
        setActiveTab('ipd');
        aiReply = "Redirected to the Inpatient Ward (IPD) Admission portal.";
      } else if (lower.includes('home') || lower.includes('nurse')) {
        setActiveTab('homecare');
        aiReply = "You are now on the HomeCare Services page. Book doctor visits, nursing, or lab collections at home.";
      } else if (lower.includes('tele') || lower.includes('video')) {
        setActiveTab('telemedcare');
        aiReply = "Switched to teleMEDCARE for live HD Video Consultations.";
      } else if (lower.includes('chronic')) {
        setActiveTab('chronic');
        aiReply = "Redirected to the 1-Year Chronic Care Management Program.";
      } else if (lower.includes('pharmacy') || lower.includes('ocr') || lower.includes('medicine')) {
        setActiveTab('pharmacy');
        aiReply = "Opened Pharmacy OCR Delivery. Upload your prescription to extract medicines.";
      } else if (lower.includes('location') || lower.includes('branch')) {
        setActiveTab('locations');
        aiReply = "Here are all MedCare hospital branches and locations across Sri Lanka.";
      } else if (lower.includes('package')) {
        setActiveTab('packages');
        aiReply = "Here is the list of available Health Screening & Wellness packages.";
      } else if (lower.includes('pay') || lower.includes('gateway')) {
        setActiveTab('payments');
        aiReply = "Opened PayHere LKR secure online payment gateway.";
      } else if (lower.includes('report') || lower.includes('pdf')) {
        setActiveTab('reports');
        aiReply = "Redirected to Lab Reports & Instant PDF Generation page.";
      } else if (lower.includes('review')) {
        setActiveTab('reviews');
        aiReply = "Opened Patient Reviews & Ratings page.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px 22px', borderRadius: '30px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🤖 MedCare Next-Gen AI
        </button>
      ) : (
        <div style={{ background: '#fff', width: '380px', height: '560px', borderRadius: '22px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
          <div style={{ background: '#2563eb', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🤖</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900' }}>MedCare Next-Gen AI</h4>
                <span style={{ fontSize: '10px', color: '#bfdbfe' }}>Online | Autonomous Health Agent</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>✖</button>
          </div>

          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', background: m.sender === 'user' ? '#2563eb' : '#ffffff', color: m.sender === 'user' ? '#fff' : '#0f172a', padding: '10px 14px', borderRadius: '14px', fontSize: '13px', maxWidth: '85%', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: m.sender === 'ai' ? '1px solid #e2e8f0' : 'none' }}>
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: '8px 12px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {quickActions.map((qa, i) => (
              <button 
                key={i} 
                onClick={() => {
                  setActiveTab(qa.tab);
                  setMessages(prev => [...prev, { sender: 'user', text: qa.label }, { sender: 'ai', text: `Switched to ${qa.label} section successfully!` }]);
                }}
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', color: '#2563eb' }}
              >
                {qa.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', padding: '10px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
            <input 
              type="text" 
              placeholder="Type your symptom or service..." 
              value={inputVal} 
              onChange={e => setInputVal(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }} 
            />
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0 14px', borderRadius: '10px', fontWeight: '900', marginLeft: '6px', cursor: 'pointer', fontSize: '12px' }}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}