import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineFileText } from 'react-icons/ai';
import { FiHome } from 'react-icons/fi';
import { useQuotation } from '../../context/QuotationContext';

const CustomerDetailsForm = () => {
  const { customerDetails, dispatch } = useQuotation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    dispatch({
      type: 'UPDATE_CUSTOMER_DETAILS',
      payload: { [name]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AiOutlineUser className="text-slate-400" />
            </div>
            <input
              type="text"
              name="firstName"
              value={customerDetails.firstName}
              onChange={handleChange}
              required
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="John"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AiOutlineUser className="text-slate-400" />
            </div>
            <input
              type="text"
              name="lastName"
              value={customerDetails.lastName}
              onChange={handleChange}
              required
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Doe"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AiOutlineMail className="text-slate-400" />
          </div>
          <input
            type="email"
            name="email"
            value={customerDetails.email}
            onChange={handleChange}
            required
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="john.doe@school.edu"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">The quotation will be sent to this email.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">School/Company Name *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiHome className="text-slate-400" />
          </div>
          <input
            type="text"
            name="company"
            value={customerDetails.company}
            onChange={handleChange}
            required
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Sunrise Primary School"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number (Optional)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AiOutlinePhone className="text-slate-400" />
          </div>
          <input
            type="tel"
            name="phone"
            value={customerDetails.phone}
            onChange={handleChange}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="+27 12 345 6789"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Additional Notes (Optional)</label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <AiOutlineFileText className="text-slate-400" />
          </div>
          <textarea
            name="notes"
            value={customerDetails.notes}
            onChange={handleChange}
            rows="4"
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Any specific requirements or questions..."
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsForm;

