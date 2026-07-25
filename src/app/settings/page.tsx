export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <p className="text-slate-400 mb-8">Manage your account and AI workflow preferences.</p>
      
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Gemini API Key</label>
            <input 
              type="password" 
              value="************************"
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-500"
            />
            <p className="text-xs text-slate-500 mt-2">API key is managed securely on the backend environment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
