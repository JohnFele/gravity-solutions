import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight, AiOutlineTrophy } from "react-icons/ai";
import { FiCalendar } from "react-icons/fi";
import { useScrollLock } from "../../hooks/useScrollLock";

const CreateCompetitionModal = ({ mode, competition, onClose, onSave }) => {
  useScrollLock(true);
  const [formData, setFormData] = useState(competition || {
    title: "",
    description: "",
    status: "upcoming",
    prize: "",
    dueDate: "",
    skills: [],
    eligibility: "All users",
    equipment: "",
    fee: "",
    thumbnail: ""
  });

  // const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerState, setDatePickerState] = useState({
    visible: false,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
  });

  const [currentSkill, setCurrentSkill] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setFormData(prev => ({ ...prev, dueDate: formattedDate }));
    setDatePickerState({ ...datePickerState, visible: false });
  };

  const navigateMonth = (direction) => {
    setDatePickerState(prev => {
      let newMonth = prev.currentMonth;
      let newYear = prev.currentYear;

      if (direction === "prev") {
        newMonth -= 1;
        if (newMonth < 0) {
          newMonth = 11;
          newYear -= 1;
        }
      } else {
        newMonth += 1;
        if (newMonth > 11) {
          newMonth = 0;
          newYear += 1;
        }
      }

      return { ...prev, currentMonth: newMonth, currentYear: newYear };
    });
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateDays = () => {
    const { currentMonth, currentYear } = datePickerState;
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

    const prevMonthDays = [];
    const prevMonthDaysCount = firstDayOfMonth;

    if (prevMonthDaysCount > 0) {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

      for (let i = daysInPrevMonth - prevMonthDaysCount + 1; i <= daysInPrevMonth; i++) {
        prevMonthDays.push({
          day: i,
          month: prevMonth,
          year: prevYear,
          currentMonth: false
        });
      }
    }

    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        currentMonth: true
      });
    }

    const nextMonthDays = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays;

    if (remainingDays > 0) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      for (let i = 1; i <= remainingDays; i++) {
        nextMonthDays.push({
          day: i,
          month: nextMonth,
          year: nextYear,
          currentMonth: false
        });
      }
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const isToday = (day, month, year) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelectedDate = (day, month, year) => {
    if (!formData.dueDate) return false;
    const selectedDate = new Date(formData.dueDate);
    return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // const newCompetition = {
    //   ...formData,
    //   id: Date.now(),
    //   participants: 0,
    //   thumbnail: formData.thumbnail || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=225&fit=crop"
    // };
    onSave({
      ...formData,
      id: mode === "edit" ? formData.id : Date.now(),
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800/90 backdrop-blur-xl z-10 p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
              <AiOutlineTrophy className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === "edit" ? "Edit Competition" : "Create Competition"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-700/50 transition-colors"
          >
            <AiOutlineClose className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="space-y-2 relative">
              <label className="block text-sm font-medium text-slate-300">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  readOnly
                  onClick={() => setDatePickerState(prev => ({ ...prev, visible: !prev.visible }))}
                  required
                  className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                  placeholder="Select a date"
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
              {datePickerState.visible && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 mt-1 w-full bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-lg overflow-hidden"
                >
                  <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-700/80 border-b border-slate-700/50">
                    <div className="flex justify-between items-center">
                      <button 
                        type="button"
                        onClick={() => navigateMonth("prev")}
                        className="p-1 rounded-full hover:bg-slate-700/50 text-slate-300"
                      >
                        <AiOutlineLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-white">
                        {monthNames[datePickerState.currentMonth]} {datePickerState.currentYear}
                      </span>
                      <button 
                        type="button"
                        onClick={() => navigateMonth("next")}
                        className="p-1 rounded-full hover:bg-slate-700/50 text-slate-300"
                      >
                        <AiOutlineRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 p-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs text-slate-400 py-1">
                        {day}
                      </div>
                    ))}
                    
                    {generateDays().map((dateObj, index) => {
                      const isCurrentMonth = dateObj.currentMonth;
                      const isTodayDate = isToday(dateObj.day, dateObj.month, dateObj.year);
                      const isSelected = isSelectedDate(dateObj.day, dateObj.month, dateObj.year);

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDateChange(new Date(dateObj.year, dateObj.month, dateObj.day))}
                          className={`p-2 rounded-lg text-sm transition-colors ${
                            isSelected
                              ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
                              : isTodayDate
                                ? "border border-amber-400/50 text-amber-400"
                                : isCurrentMonth
                                  ? "text-slate-300 hover:bg-slate-700/50"
                                  : "text-slate-500 hover:bg-slate-700/30"
                          }`}
                          disabled={!isCurrentMonth}
                        >
                          {dateObj.day}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 bg-slate-800/50 border-t border-slate-700/50 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setDatePickerState(prev => ({ ...prev, visible: false }))}
                      className="px-3 py-1 text-xs text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        handleDateChange(today);
                        setDatePickerState(prev => ({
                          ...prev,
                          currentMonth: today.getMonth(),
                          currentYear: today.getFullYear()
                        }));
                      }}
                      className="px-3 py-1 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 hover:text-white"
                    >
                      Today
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Entry Fee</label>
              <input
                type="text"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                required
                placeholder="e.g. $20 or Free"
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Prize</label>
              <input
                type="text"
                name="prize"
                value={formData.prize}
                onChange={handleChange}
                required
                placeholder="e.g. $1000 + Camera"
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Eligibility</label>
              <select
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                required
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="All users">All users</option>
                <option value="Pro users only">Pro users only</option>
                <option value="Invitation only">Invitation only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Equipment Needed</label>
              <input
                type="text"
                name="equipment"
                value={formData.equipment}
                required
                onChange={handleChange}
                placeholder="e.g. 360° Camera, Editing Software"
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="Leave empty for default image"
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Skills Gained</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentSkill}
                name="skills"
                required
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-gradient-to-r from-primary to-red-600 hover:from-primary hover:to-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill) => (
                <div key={skill} className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full text-sm">
                  <span className="text-slate-300">{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-slate-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-red-600 text-white hover:opacity-90 transition-opacity"
            >
              {mode === "edit" ? "Save Changes" : "Create Competition"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateCompetitionModal;