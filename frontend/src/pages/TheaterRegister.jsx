import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TheaterRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [theaterData, setTheaterData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    contact: {
      phone: '',
      email: ''
    },
    facilities: [],
    screens: [{ name: '', capacity: '', screenType: 'Regular' }]
  });

  const navigate = useNavigate();

  const facilityOptions = [
    'Parking', 'Food Court', 'AC', 'Wheelchair Access', 'IMAX', '3D', 'Dolby Atmos'
  ];

  const screenTypes = ['Regular', 'IMAX', '3D', '4DX'];

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value
    });
  };

  const handleTheaterChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTheaterData({
        ...theaterData,
        [parent]: {
          ...theaterData[parent],
          [child]: value
        }
      });
    } else {
      setTheaterData({
        ...theaterData,
        [name]: value
      });
    }
  };

  const handleFacilityChange = (facility) => {
    const updatedFacilities = theaterData.facilities.includes(facility)
      ? theaterData.facilities.filter(f => f !== facility)
      : [...theaterData.facilities, facility];
    
    setTheaterData({
      ...theaterData,
      facilities: updatedFacilities
    });
  };

  const handleScreenChange = (index, field, value) => {
    const updatedScreens = theaterData.screens.map((screen, i) => 
      i === index ? { ...screen, [field]: value } : screen
    );
    
    setTheaterData({
      ...theaterData,
      screens: updatedScreens
    });
  };

  const addScreen = () => {
    setTheaterData({
      ...theaterData,
      screens: [...theaterData.screens, { name: '', capacity: '', screenType: 'Regular' }]
    });
  };

  const removeScreen = (index) => {
    if (theaterData.screens.length > 1) {
      const updatedScreens = theaterData.screens.filter((_, i) => i !== index);
      setTheaterData({
        ...theaterData,
        screens: updatedScreens
      });
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (adminData.password !== adminData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: adminData.name,
          email: adminData.email,
          mobile: adminData.mobile,
          password: adminData.password,
          role: 'theater_admin'
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/theater/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(theaterData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Theater registered successfully! Awaiting admin approval.');
        setTimeout(() => {
          navigate('/theater-login');
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Theater registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Registration Successful!</h3>
              <p className="mt-2 text-sm text-gray-600">{success}</p>
              <p className="mt-2 text-xs text-gray-500">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Register Your Theater
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {step} of 2: {step === 1 ? 'Admin Account' : 'Theater Details'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex-1 h-2 rounded-l-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 h-2 rounded-r-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Account Details</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={adminData.name}
                      onChange={handleAdminChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={adminData.email}
                      onChange={handleAdminChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      pattern="[0-9]{10}"
                      value={adminData.mobile}
                      onChange={handleAdminChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength="6"
                      value={adminData.password}
                      onChange={handleAdminChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={adminData.confirmPassword}
                      onChange={handleAdminChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link to="/theater-login" className="text-sm text-blue-600 hover:text-blue-500">
                    Already have an account? Sign in
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Next Step'}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Theater Information</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Theater Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={theaterData.name}
                      onChange={handleTheaterChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      rows="3"
                      value={theaterData.description}
                      onChange={handleTheaterChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      required
                      value={theaterData.address.street}
                      onChange={handleTheaterChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="address.city"
                      required
                      value={theaterData.address.city}
                      onChange={handleTheaterChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="address.state"
                      required
                      value={theaterData.address.state}
                      onChange={handleTheaterChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      required
                      value={theaterData.address.zipCode}
                      onChange={handleTheaterChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <input
                      type="tel"
                      name="contact.phone"
                      required
                      pattern="[0-9]{10}"
                      value={theaterData.contact.phone}
                      onChange={handleTheaterChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      name="contact.email"
                      required
                      value={theaterData.contact.email}
                      onChange={handleTheaterChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {facilityOptions.map((facility) => (
                      <label key={facility} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={theaterData.facilities.includes(facility)}
                          onChange={() => handleFacilityChange(facility)}
                          className="mr-2"
                        />
                        <span className="text-sm">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Screens</label>
                    <button
                      type="button"
                      onClick={addScreen}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Add Screen
                    </button>
                  </div>
                  
                  {theaterData.screens.map((screen, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Screen Name</label>
                          <input
                            type="text"
                            required
                            value={screen.name}
                            onChange={(e) => handleScreenChange(index, 'name', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Capacity</label>
                          <input
                            type="number"
                            required
                            min="50"
                            max="500"
                            value={screen.capacity}
                            onChange={(e) => handleScreenChange(index, 'capacity', parseInt(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Screen Type</label>
                          <div className="flex items-center">
                            <select
                              value={screen.screenType}
                              onChange={(e) => handleScreenChange(index, 'screenType', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              {screenTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            {theaterData.screens.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeScreen(index)}
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Registering Theater...' : 'Register Theater'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterRegister;