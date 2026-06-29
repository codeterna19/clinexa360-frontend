import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { HeartPulse, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(email, password);
      switch (user.role) {
        case 'SuperAdmin':
          navigate('/superadmin');
          break;
        case 'ClinicAdmin':
          navigate('/clinic-admin');
          break;
        case 'Doctor':
          navigate('/doctor');
          break;
        case 'Receptionist':
          navigate('/receptionist');
          break;
        case 'Nurse':
          navigate('/nurse');
          break;
        case 'LabAssistant':
        case 'LabTechnician':
          navigate('/lab-assistant');
          break;
        case 'Accountant':
          navigate('/accountant');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary">
          <HeartPulse size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
          Sign in to Clinexa360
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Enter your credentials to access your portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-subtle rounded-[20px] sm:px-10 border border-border-light">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-text-primary ml-1">
                Email address
              </label>
              <div className="mt-1.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary ml-1">
                Password
              </label>
              <div className="mt-1.5 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 block w-full pl-4 pr-12 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between ml-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-primary hover:text-primary-600 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full flex justify-center items-center px-6 border border-transparent rounded-full shadow-primary text-sm font-bold text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border-light text-xs text-center text-text-secondary">
              <p className="font-semibold mb-3">Quick Demo Logins:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button type="button" onClick={() => { setEmail('admin@clinexa360.com'); setPassword('password123'); }} className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-text-primary transition-colors cursor-pointer">Super Admin</button>
                <button type="button" onClick={() => { setEmail('clinicadmin@citycare.com'); setPassword('password123'); }} className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-text-primary transition-colors cursor-pointer">Clinic Admin</button>
                <button type="button" onClick={() => { setEmail('doctor@abcclinic.com'); setPassword('password123'); }} className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-text-primary transition-colors cursor-pointer">Doctor</button>
                <button type="button" onClick={() => { setEmail('payal@gmail.com'); setPassword('password123'); }} className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-text-primary transition-colors cursor-pointer">Receptionist (Payal)</button>
                <button type="button" onClick={() => { setEmail('nurse@abcclinic.com'); setPassword('password123'); }} className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-text-primary transition-colors cursor-pointer">Nurse</button>
                <button type="button" onClick={() => { setEmail('raghav@gmail.com'); setPassword('password123'); }} className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-text-primary transition-colors cursor-pointer">Lab Assistant (Raghav)</button>
                <button type="button" onClick={() => { setEmail('accountant@abcclinic.com'); setPassword('password123'); }} className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-text-primary transition-colors cursor-pointer col-span-2 sm:col-span-3">Accountant</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
