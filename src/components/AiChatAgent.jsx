import React, { useState } from 'react';

export default function AiChatAgent({ setActiveTab, setSelectedDept, setDoctorName }) {
  const [showAiChat, setShowAiChat] = useState(false);
  
  const initialMessage = [
    { sender: 'ai', text: 'Hello! I am MedCare AI Clinical Agent. Select any option below or type your symptoms/services:' }
  ];

  const [chatMessages, setChatMessages] = useState(initialMessage);
  const [userQuery, setUserQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleClearChat = () => {
    setChatMessages(initialMessage);
  };

  const processQuery = (queryText) => {
    const q = queryText.toLowerCase();
    let aiReply = "I can help you with all MedCare services. Please select from the options below:";
    let targetTabName = '';
    let shouldRedirectBook = false;

    if (q.includes('heart') || q.includes('chest') || q.includes('cardio') || q.includes('நெஞ்சு')) {
      aiReply = "⚠️ Based on symptoms, I recommend Interventional Cardiology (Dr. Senthil Kumar). Directing to booking...";
      setSelectedDept('Interventional Cardiology');
      setDoctorName('Dr. Senthil Kumar');
      shouldRedirectBook = true;
    }
    else if (q.includes('skin') || q.includes('derma') || q.includes('rash')) {
      aiReply = "✨ I recommend Dermatology & Cosmetology (Dr. Anita Desai). Directing to booking...";
      setSelectedDept('Dermatology');
      setDoctorName('Dr. Anita Desai');
      shouldRedirectBook = true;
    }
    else if (q.includes('bone') || q.includes('ortho') || q.includes('joint')) {
      aiReply = "🦴 I recommend Orthopaedics (Dr. Rajesh Iyer). Directing to booking...";
      setSelectedDept('Orthopaedics');
      setDoctorName('Dr. Rajesh Iyer');
      shouldRedirectBook = true;
    }
    else if (q.includes('child') || q.includes('paediatric') || q.includes('baby')) {
      aiReply = "👶 I recommend Paediatrics (Dr. Suresh Babu). Directing to booking...";
      setSelectedDept('Paediatrics');
      setDoctorName('Dr. Suresh Babu');
      shouldRedirectBook = true;
    }
    else if (q.includes('home') || q.includes('nurse') || q.includes('doorstep')) {
      aiReply = "🏠 Opening HomeCare Services (Nurse & Doctor @Home)!";
      targetTabName = 'homecare';
    }
    else if (q.includes('ipd') || q.includes('room') || q.includes('ward') || q.includes('admission')) {
      aiReply = "🏥 Opening Inpatient Department (IPD) Admissions!";
      targetTabName = 'ipd';
    }
    else if (q.includes('video') || q.includes('tele') || q.includes('consult')) {
      aiReply = "📹 Opening teleMEDCARE Live Video Consultations!";
      targetTabName = 'telemedcare';
    }
    else if (q.includes('package') || q.includes('screening') || q.includes('checkup')) {
      aiReply = "📦 Opening Health Screening Packages!";
      targetTabName = 'packages';
    }
    else if (q.includes('report') || q.includes('pdf') || q.includes('download')) {
      aiReply = "📥 Opening Lab Reports & PDF Download Section!";
      targetTabName = 'reports';
    }
    else if (q.includes('location') || q.includes('branch') || q.includes('hospital') || q.includes('colombo') || q.includes('kandy')) {
      aiReply = "📍 Opening MedCare Branches & Hospital Locations across Sri Lanka!";
      targetTabName = 'locations';
    }
    else if (q.includes('doctor') || q.includes('specialist')) {
      aiReply = "👨‍⚕️ Opening Doctors Directory!";
      targetTabName = 'doctors';
    }
    else if (q.includes('referral')) {
      aiReply = "🤝 Opening Medical Referral Network!";
      targetTabName = 'referral';
    }
    else if (q.includes('home') || q.includes('main')) {
      aiReply = "🏠 Returning to Home Dashboard!";
      targetTabName = 'home';
    }

    setChatMessages(prev => [...prev, { sender: 'user', text: queryText }, { sender: 'ai', text: aiReply }]);
    setAiLoading(false);

    if (shouldRedirectBook) {
      setTimeout(() => setActiveTab('book'), 1000);
    } else if (targetTabName) {
      setTimeout(() => setActiveTab(targetTabName), 1000);
    }
  };

  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const txt = userQuery;
    setUserQuery('');
    setAiLoading(true);
    setTimeout(() => processQuery(txt), 600);
  };

  return (
    <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 3000 }}>
      {!showAiChat ? (
        <button 
          onClick={() => setShowAiChat(true)} 
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '16px 24px', borderRadius: '50px', fontWeight: '900', boxShadow: '0 10px 25px rgba(37,99,235,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}
        >
          🤖 MedCare AI Agent
        </button>
      ) : (
        <div style={{ width: '380px', height: '560px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
          
          {/* Header */}
          <div style={{ background: '#0f172a', color: '#fff', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900' }}>MedCare Next-Gen AI</h4>
                <span style={{ fontSize: '10px', color: '#10b981' }}>🟢 Autonomous Triage Active</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={handleClearChat} 
                title="Clear Chat History"
                style={{ background: '#334155', border: 'none', color: '#f8fafc', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
              >
                🧹 Clear
              </button>
              <button onClick={() => setShowAiChat(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: msg.sender === 'user' ? '#2563eb' : '#ffffff', color: msg.sender === 'user' ? '#fff' : '#1e293b', padding: '10px 14px', borderRadius: '14px', fontSize: '12.5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontWeight: '600' }}>
                {msg.text}
              </div>
            ))}
            {aiLoading && <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>AI is routing to requested service...</div>}
          </div>

          {/* Quick Option Buttons (Covers ALL app options) */}
          <div style={{ padding: '8px 12px', background: '#f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid #e2e8f0' }}>
            {[
              { label: '🩺 Doctors', val: 'doctors' },
              { label: '🏥 IPD', val: 'ipd' },
              { label: '🏠 HomeCare', val: 'home' },
              { label: '📹 TeleMED', val: 'video' },
              { label: '📍 Locations', val: 'location' },
              { label: '📦 Packages', val: 'package' },
              { label: '🤝 Referrals', val: 'referral' },
              { label: '📥 Reports', val: 'report' }
            ].map((btn, i) => (
              <button 
                key={i} 
                onClick={() => { setAiLoading(true); setTimeout(() => processQuery(btn.val), 500); }}
                style={{ background: '#e2e8f0', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', color: '#1e293b' }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendAiMessage} style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Type symptoms or select option above..." value={userQuery} onChange={e => setUserQuery(e.target.value)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' }}>Ask</button>
          </form>

        </div>
      )}
    </div>
  );
}