import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Phone } from 'lucide-react';

interface AssessmentFormProps {
  onClose: () => void;
}

export default function AssessmentForm({ onClose }: AssessmentFormProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    patientName: '',
    contactName: '',
    phone: '',
    careType: 'Personal Care',
    urgency: 'Routine',
    details: ''
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.contactName || data.patientName,
          phone: data.phone,
          email: 'assessment@digital.assistant',
          message: `SMART ASSESSMENT: Patient: ${data.patientName}. Type: ${data.careType}. Urgency: ${data.urgency}. Details: ${data.details}`
        })
      });
      if (res.ok) {
        setStep(3);
      }
    } catch (err) {
      alert('Error submitting. Please call us at +1 701-319-2659');
    }
  };

  if (step === 3) {
    return (
      <div className="text-center py-12">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Assessment Received</h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Thank you. A care coordinator will review your information and contact you at <span className="font-bold text-slate-700">{data.phone}</span> shortly.
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {step === 1 ? (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Who needs care?"
                value={data.patientName}
                onChange={e => setData({...data, patientName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Phone</label>
              <input 
                type="tel" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Best number to reach you"
                value={data.phone}
                onChange={e => setData({...data, phone: e.target.value})}
              />
            </div>
          </div>
          <button 
            onClick={() => setStep(2)}
            disabled={!data.patientName || !data.phone}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-30"
          >
            Next Step <ChevronRight size={20} />
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type of Care</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                value={data.careType}
                onChange={e => setData({...data, careType: e.target.value})}
              >
                <option>Personal Care</option>
                <option>Companionship</option>
                <option>Medication Support</option>
                <option>Transportation</option>
                <option>Agency Foster Home</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgency</label>
              <div className="flex gap-2">
                {['Routine', 'Urgent', 'Immediate'].map(u => (
                  <button 
                    key={u}
                    onClick={() => setData({...data, urgency: u})}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${data.urgency === u ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Details</label>
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Any specific concerns?"
                rows={3}
                value={data.details}
                onChange={e => setData({...data, details: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setStep(1)}
              className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Back
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Submit Assessment
            </button>
          </div>
        </motion.div>
      )}
      
      <div className="flex items-center justify-center gap-2 text-slate-400">
        <Phone size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Or call +1 701-319-2659</span>
      </div>
    </div>
  );
}
