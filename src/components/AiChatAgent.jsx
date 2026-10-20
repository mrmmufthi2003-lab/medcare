import React, { useState } from 'react';

export default function AiChatAgent({ setActiveTab, setSelectedDept, setDoctorName }) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am MedCare AI Clinical Agent. What symptoms or medical assistance do you need today?' }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user', text: userQuery }];
    setChatMessages(newMessages);
    const q = userQuery.toLowerCase();
    setUserQuery('');
    setAiLoading(true);

    setTimeout(() => {
      let aiReply = "I can help you schedule a consultation. Would you like to proceed with booking?";

      if (q.includes('heart') || q.includes('chest') || q.includes('நெஞ்சு')) {
        aiReply = "⚠️ Based on symptoms, I recommend Interventional Cardiology (Dr. Senthil Kumar). Shall I direct you to booking?";
        setSelectedDept('Interventional Cardiology');
        setDoctorName('Dr. Senthil Kumar');
      } else if (q.includes('brain') || q.includes('headache') || q.includes('தலைவலி')) {
        aiReply = "🧠 I recommend Neurology & Neurosurgery (Dr. Priya Sharma). Would you like to book?";
        setSelectedDept('Neurology & Neurosurgery');
        setDoctorName('Dr. Priya Sharma');
      } else if (q.includes('report') || q.includes('lab') || q.includes('ரிப்போர்ட்')) {
        aiReply = "📥 You can enter your Patient ID in the 'Online Reports' tab above to download your official PDF report instantly.";
      } else if (q.includes('book') || q.includes('appointment')) {
        aiReply = "🩺 Sure! Directing you to the booking form...";
        setActiveTab('book');
      }

      setChatMessages([...newMessages, { sender: 'ai', text: aiReply }]);
      setAiLoading(false);
    }, 1000);
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
        <div style={{ width: '360px', height: '500px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
          <div style={{ background: '#0f172a', color: '#fff', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900' }}>MedCare Next-Gen AI</h4>
                <span style={{ fontSize: '10px', color: '#10b981' }}>🟢 Autonomous Triage Active</span>
              </div>
            </div>
            <button onClick={() => setShowAiChat(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✖</button>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: msg.sender === 'user' ? '#2563eb' : '#ffffff', color: msg.sender === 'user' ? '#fff' : '#1e293b', padding: '12px 16px', borderRadius: '16px', fontSize: '13px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontWeight: '600' }}>
                {msg.text}
              </div>
            ))}
            {aiLoading && <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>AI is analyzing clinical data...</div>}
          </div>

          <form onSubmit={handleSendAiMessage} style={{ padding: '12px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Describe symptoms (e.g. chest pain)..." value={userQuery} onChange={e => setUserQuery(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Ask AI</button>
          </form>
        </div>
      )}
    </div>
  );
}