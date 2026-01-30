import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export const OnboardingPortal: React.FC = () => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [step, setStep] = useState(1);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsSigned(false);
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Please provide a signature.");
      return;
    }
    const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    console.log("Signature captured:", signatureData);
    setIsSigned(true);
    setStep(3);
    // In real app, call Wails backend: PeopleService.ActivateEmployee(empId, signatureData)
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Employee Onboarding</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-3 h-3 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} 
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Review Contract</h3>
          <div className="h-64 overflow-y-auto p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
            <p className="mb-4 font-bold">EMPLOYMENT AGREEMENT</p>
            <p>This document serves as the official employment agreement between SENT LLC and the undersigned employee...</p>
            <p className="mt-4">By proceeding, you agree to all terms and conditions outlined in the SENT Employee Handbook.</p>
          </div>
          <button 
            onClick={() => setStep(2)}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            I Accept Terms & Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Digital Signature</h3>
          <p className="text-sm text-slate-500">Please sign in the box below using your mouse or touch screen.</p>
          
          <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor='navy'
              canvasProps={{width: 600, height: 200, className: 'sigCanvas'}}
            />
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={clear}
              className="flex-1 py-2 px-4 border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
            >
              Clear
            </button>
            <button 
              onClick={save}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Confirm Signature
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Activation Complete!</h3>
          <p className="text-slate-600">Your digital contract has been generated and stored in SENTvault. You now have full access to the SENT Ecosystem.</p>
          <button 
            className="mt-6 px-8 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
