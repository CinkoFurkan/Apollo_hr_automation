import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, MapPin, Clock, Upload, Video, CheckCircle, AlertCircle, Loader, X, Shield } from 'lucide-react';

const CareerPortal = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    whyApply: '',
    strengths: '',
    teamWork: '',
    adaptQuickly: '',
    officeWork: 'Yes'
  });
  const [cvFile, setCvFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const recaptchaRef = useRef(null);
  const recaptchaWidgetId = useRef(null);

  const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // This is Google's test key

  const jobs = [
    {
      id: 'software-engineer',
      title: 'Software Engineer',
      department: 'Engineering',
      location: 'Istanbul, Turkey',
      type: 'Full-time',
      description: 'We are looking for a talented Software Engineer to join our growing team.',
      responsibilities: [
        'Design and develop scalable web applications',
        'Collaborate with cross-functional teams',
        'Write clean, maintainable code',
        'Participate in code reviews'
      ],
      requirements: [
        '3+ years of software development experience',
        'Proficiency in JavaScript/TypeScript',
        'Experience with React or similar frameworks',
        'Strong problem-solving skills'
      ]
    },
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Remote',
      type: 'Full-time',
      description: 'Join our data team to help drive business decisions through data analysis.',
      responsibilities: [
        'Analyze complex datasets',
        'Create dashboards and reports',
        'Collaborate with stakeholders',
        'Present insights to leadership'
      ],
      requirements: [
        '2+ years of data analysis experience',
        'Proficiency in SQL and Python',
        'Experience with visualization tools',
        'Strong analytical skills'
      ]
    },
    {
      id: 'marketing-intern',
      title: 'Marketing Intern',
      department: 'Marketing',
      location: 'Istanbul, Turkey',
      type: 'Internship',
      description: 'Gain hands-on experience in digital marketing and brand management.',
      responsibilities: [
        'Assist with social media campaigns',
        'Create marketing content',
        'Conduct market research',
        'Support the marketing team'
      ],
      requirements: [
        'Currently pursuing degree in Marketing or related field',
        'Strong communication skills',
        'Creative thinking',
        'Familiarity with social media platforms'
      ]
    }
  ];

  useEffect(() => {
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;

    window.onRecaptchaLoad = () => {
      setRecaptchaLoaded(true);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window.onRecaptchaLoad;
    };
  }, []);

  useEffect(() => {
    if (recaptchaLoaded && selectedJob && recaptchaRef.current && recaptchaWidgetId.current === null) {
      try {
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: handleRecaptchaVerify,
          'expired-callback': handleRecaptchaExpired,
          'error-callback': handleRecaptchaError,
        });
      } catch (error) {
        console.error('reCAPTCHA render error:', error);
      }
    }
  }, [recaptchaLoaded, selectedJob]);

  const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
    setError(null);
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    setError('reCAPTCHA expired. Please verify again.');
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setError('reCAPTCHA error. Please refresh the page and try again.');
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      linkedin: '',
      whyApply: '',
      strengths: '',
      teamWork: '',
      adaptQuickly: '',
      officeWork: 'Yes'
    });
    setCvFile(null);
    setVideoFile(null);
    setError(null);
    setRecaptchaToken(null);
    
    if (window.grecaptcha && recaptchaWidgetId.current !== null) {
      try {
        window.grecaptcha.reset(recaptchaWidgetId.current);
      } catch (error) {
        console.error('reCAPTCHA reset error:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateFile = (file, type) => {
    const maxSize = type === 'cv' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    const allowedTypes = type === 'cv' 
      ? ['application/pdf']
      : ['video/mp4'];

    if (!file) return { valid: false, error: 'No file selected' };
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `${type === 'cv' ? 'CV' : 'Video'} file must be less than ${type === 'cv' ? '10MB' : '50MB'}` 
      };
    }
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid file type. Please upload ${type === 'cv' ? 'a PDF file only' : 'an MP4 video only'}` 
      };
    }
    return { valid: true };
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFile(file, type);
    
    if (!validation.valid) {
      setError(validation.error);
      e.target.value = '';
      return;
    }

    if (type === 'cv') {
      setCvFile(file);
    } else {
      setVideoFile(file);
    }
    setError(null);
  };

  const removeFile = (type) => {
    if (type === 'cv') {
      setCvFile(null);
    } else {
      setVideoFile(null);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (formData.phone && !/^[\d\s+()-]+$/.test(formData.phone)) return 'Invalid phone number format';
    if (formData.linkedin && !formData.linkedin.startsWith('http')) return 'LinkedIn URL must start with http:// or https://';
    if (!formData.whyApply.trim()) return 'Please answer why you applied';
    if (!formData.strengths.trim()) return 'Please describe your strengths and weaknesses';
    if (!formData.teamWork.trim()) return 'Please share your teamwork experience';
    if (!formData.adaptQuickly.trim()) return 'Please share your adaptation experience';
    if (!cvFile) return 'CV/Resume is required';
    if (!recaptchaToken) return 'Please complete the reCAPTCHA verification';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      formDataToSend.append('appliedRole', selectedJob.title);
      formDataToSend.append('jobDepartment', selectedJob.department);
      formDataToSend.append('jobLocation', selectedJob.location);
      formDataToSend.append('jobType', selectedJob.type);
      formDataToSend.append('jobDescription', selectedJob.description);
      formDataToSend.append('jobResponsibilities', JSON.stringify(selectedJob.responsibilities));
      formDataToSend.append('jobRequirements', JSON.stringify(selectedJob.requirements));
      formDataToSend.append('submittedAt', new Date().toISOString());
      
      formDataToSend.append('cv', cvFile);
      if (videoFile) {
        formDataToSend.append('video', videoFile);
      }
      formDataToSend.append('recaptchaToken', recaptchaToken);

      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Submission failed');
      }

      resetForm();
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setError(err.message || 'Failed to submit application. Please check your connection and try again.');
      console.error('Submission error:', err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      if (window.grecaptcha && recaptchaWidgetId.current !== null) {
        try {
          window.grecaptcha.reset(recaptchaWidgetId.current);
          setRecaptchaToken(null);
        } catch (resetError) {
          console.error('reCAPTCHA reset error:', resetError);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
    resetForm();
    recaptchaWidgetId.current = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitting Your Application...</h2>
          <p className="text-gray-600">
            Please wait while we process your application. This may take a few moments.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your application. We'll review your profile and get back to you within 48 hours.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedJob(null);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View More Positions
          </button>
        </div>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToJobs}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
          >
            ← Back to all positions
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedJob.title}</h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="flex items-center gap-2 text-gray-600">
                <Briefcase size={18} />
                {selectedJob.department}
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} />
                {selectedJob.location}
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <Clock size={18} />
                {selectedJob.type}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">About the Role</h3>
              <p className="text-gray-700">{selectedJob.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Responsibilities</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {selectedJob.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {selectedJob.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for this position</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Include country code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Assessment Questions</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why did you apply to this role? *
                    </label>
                    <textarea
                      name="whyApply"
                      rows={3}
                      value={formData.whyApply}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={submitting}
                      placeholder="Tell us what motivated you to apply..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are your strengths and weaknesses for this role? *
                    </label>
                    <textarea
                      name="strengths"
                      rows={3}
                      value={formData.strengths}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={submitting}
                      placeholder="Share your key strengths and areas for improvement..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell me about a time you worked in a team *
                    </label>
                    <textarea
                      name="teamWork"
                      rows={3}
                      value={formData.teamWork}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={submitting}
                      placeholder="Describe a specific team experience..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell me about a time you had to adapt quickly *
                    </label>
                    <textarea
                      name="adaptQuickly"
                      rows={3}
                      value={formData.adaptQuickly}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={submitting}
                      placeholder="Share a situation where you had to adapt..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Are you able to work in our office? *
                    </label>
                    <select
                      name="officeWork"
                      value={formData.officeWork}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CV/Resume * (PDF only, max 10MB)
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition w-fit">
                        <Upload size={18} />
                        Choose File
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, 'cv')}
                          className="hidden"
                          disabled={submitting}
                        />
                      </label>
                      {cvFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                          <span className="flex-1">{cvFile.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile('cv')}
                            className="text-red-500 hover:text-red-700"
                            disabled={submitting}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Introduction (MP4 only, max 50MB)
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Record a 1-minute video introducing yourself
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition w-fit">
                        <Video size={18} />
                        Choose Video
                        <input
                          type="file"
                          accept=".mp4"
                          onChange={(e) => handleFileChange(e, 'video')}
                          className="hidden"
                          disabled={submitting}
                        />
                      </label>
                      {videoFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                          <span className="flex-1">{videoFile.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile('video')}
                            className="text-red-500 hover:text-red-700"
                            disabled={submitting}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-blue-600" />
                  Security Verification
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div ref={recaptchaRef} className="flex justify-center"></div>
                  {!recaptchaLoaded && (
                    <div className="text-center text-sm text-gray-500 py-4">
                      Loading reCAPTCHA...
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    apply.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleBackToJobs}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600">
            Explore exciting opportunities and build your career with us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{job.title}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Briefcase size={16} />
                  {job.department}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock size={16} />
                  {job.type}
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                View & Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareerPortal;