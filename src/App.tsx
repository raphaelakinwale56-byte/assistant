import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MapPin, Heart, MessageSquare, ClipboardCheck, X, ChevronRight, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import AssessmentForm from './components/AssessmentForm';

declare global {
  interface Window {
    prudentWidget: {
      open: () => void;
      close: () => void;
    };
    prudentChat: (message: string, history: any[]) => Promise<string>;
  }
}

export default function App() {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  useEffect(() => {
    // Handle assessment trigger from the widget
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OPEN_ASSESSMENT') {
        setIsAssessmentOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Expose Gemini Chat to the window for the widget to use
  window.prudentChat = async (message: string, history: any[]) => {
    console.log("App: Chat request received", { message, historyLength: history.length });
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }

    const websiteKnowledgeBase = `
PRUDENT HOMECARE WEBSITE CONTENT:

ABOUT US:
Prudent Homecare is a locally owned and operated homecare provider serving Bismarck, Mandan, and Lincoln, North Dakota. 
Our mission is to care for people the way we would want our own loved ones cared for. 
We provide compassionate homecare that supports independence, dignity, and peace of mind.
Our caregivers are trained professionals who are kind, patient, and dedicated.

SERVICES OFFERED:
- Personal Care: Assistance with daily tasks.
- Medication Support: Help with medication management.
- Companionship: Social interaction and support.
- Light Housekeeping: Help with household chores.
- Transportation: Assistance with getting to appointments or community activities.
- Agency Foster Homes (AFHA): 
  - Locations: Sunset Haven and 20th Oasis (both in Bismarck).
  - Description: An alternative to large-scale facilities. Residents live in a homelike setting in the community.
  - Features: 24/7 support by trained staff, overseen by a Registered Nurse. Residential experience in quiet neighborhoods.
  - Integration: Handicap accessible vans are present at the facilities to help with community integration.
- Senior Care services: Personalized support for elderly individuals.
- Community Engagement: Connecting individuals with community resources and knowledge.
- Holistic Well-Being: Addressing physical, mental, and emotional wellness.

SERVICE AREAS:
- Bismarck, North Dakota
- Mandan, North Dakota
- Lincoln, North Dakota

CONTACT INFORMATION:
- Address: 1424 W Century Ave #206, Bismarck, ND 58503
- Phone: +1 701-319-2659
- Email: Coker@prudenthomecarend.com
- Website: https://prudenthomecarend.com/

OFFICE HOURS:
- Monday - Friday: 8:00 AM - 4:00 PM
- Closes at 4:00 PM.

WHY CHOOSE PRUDENT HOMECARE:
- Locally owned and operated.
- Care from the heart with kindness and patience.
- Personalized care plans tailored to individual needs.
- Strong community connections.
- Focus on the comfort of home and aging in place with dignity.
`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const contents = [...history, { role: "user", parts: [{ text: message }] }];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: `You are the Virtual Front Desk Representative for Prudent Homecare. 

CORE RULES:
1. Answer questions using ONLY the information provided in the "PRUDENT HOMECARE WEBSITE CONTENT" section below.
2. If the requested information is not in the provided content, respond exactly with: "I don’t see that information listed on our website. For more details, please call +1 701-319-2659 and our team will assist you."
3. Do NOT fabricate pricing, insurance details, medical advice, certifications not listed, or staff names.
4. If asked for medical advice or treatment guidance, respond exactly with: "For specific medical advice, please contact a healthcare professional or call our office directly at +1 701-319-2659."
5. TONE: Professional, compassionate, calm, clear, and supportive.
6. EMOJIS: Use emojis ONLY in the initial greeting. No emojis in subsequent responses.
7. STYLE: No hype language. No salesy tone. Provide concise, structured answers.

GREETING:
"Hello 👋 Welcome to Prudent Homecare. How can I assist you today?"

GUIDED CONVERSATION:
If a user expresses interest in care, guide them by asking these questions one at a time:
- Who is care for?
- What type of assistance is needed?
- How soon is care required?
- Preferred contact method?

LEAD COLLECTION:
When a user expresses intent to start care or get a consultation, encourage them to use the "Start Registration" form in this chat or call the office.

${websiteKnowledgeBase}`
        }
      });

      return response.text || "I'm here to help. How can I assist you today?";
    } catch (error: any) {
      console.error("App: Gemini Chat Error", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-blue-100">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <h1 className="font-bold text-slate-800 tracking-tight">Prudent <span className="text-blue-600">Care Assistant</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Online</span>
          </div>
          <button 
            onClick={() => setIsAssessmentOpen(true)}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            New Assessment
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] shadow-sm border border-slate-200/50 overflow-hidden min-h-[70vh] flex flex-col"
        >
          {/* Dashboard Welcome */}
          <div className="p-12 text-center border-b border-slate-100 bg-slate-50/30">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6"
            >
              <Heart className="w-8 h-8" />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">How can we support you today?</h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              Welcome to your private care space. Our digital assistant is here to help you navigate homecare options with compassion and clarity.
            </p>
          </div>

          {/* Interaction Area */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="space-y-6 max-w-3xl w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => window.prudentWidget?.open()}
                  className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all text-left group"
                >
                  <MessageSquare className="w-6 h-6 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-800 mb-1">Chat with Assistant</h3>
                  <p className="text-xs text-slate-500">Get instant answers about our services and care options.</p>
                </button>
                <button 
                  onClick={() => setIsAssessmentOpen(true)}
                  className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all text-left group"
                >
                  <ClipboardCheck className="w-6 h-6 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-800 mb-1">Care Assessment</h3>
                  <p className="text-xs text-slate-500">A thoughtful guide to help us understand your specific needs.</p>
                </button>
                <a 
                  href="https://prudenthomecarend.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all text-left group block"
                >
                  <ExternalLink className="w-6 h-6 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-800 mb-1">More About Us</h3>
                  <p className="text-xs text-slate-500">Visit our main website to learn more about our story and mission.</p>
                </a>
              </div>
              
              <div className="pt-8 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest font-bold">Direct Support</p>
                <div className="flex items-center justify-center gap-8">
                  <a href="tel:+17013192659" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">+1 701-319-2659</span>
                  </a>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Bismarck, ND</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subtle Footer */}
        <footer className="mt-12 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          &copy; {new Date().getFullYear()} Prudent Homecare &bull; Private & Secure Care Portal
        </footer>
      </main>

      {/* Assessment Modal */}
      <AnimatePresence>
        {isAssessmentOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssessmentOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Smart Care Assessment</h2>
                  <p className="text-sm text-slate-500">Help us understand how we can best support you.</p>
                </div>
                <button 
                  onClick={() => setIsAssessmentOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <AssessmentForm onClose={() => setIsAssessmentOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
