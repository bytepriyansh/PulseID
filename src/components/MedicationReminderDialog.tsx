import { AlertCircle, Bell, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useMedication, type MedicationReminder } from '@/contexts/MedicationContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const MedicationReminderDialog = () => {
  const { addReminder } = useMedication();
  const [isOpen, setIsOpen] = useState(false);
  const [reminder, setReminder] = useState<Omit<MedicationReminder, 'id'>>({
    name: '',
    dosage: '',
    frequency: 1,
    times: ['08:00'],
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReminder(reminder);
    toast.success('Medication reminder added successfully');
    setIsOpen(false);
    setReminder({
      name: '',
      dosage: '',
      frequency: 1,
      times: ['08:00'],
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      notes: ''
    });
  };

  const addTime = () => {
    if (reminder.times.length < reminder.frequency) {
      setReminder(prev => ({
        ...prev,
        times: [...prev.times, '12:00']
      }));
    }
  };

  const removeTime = (index: number) => {
    setReminder(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTime = (index: number, value: string) => {
    setReminder(prev => ({
      ...prev,
      times: prev.times.map((time, i) => i === index ? value : time)
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-3 bg-white/60 rounded-lg border border-teal-100 hover:bg-white/80 transition-colors"
      >
        <div className="flex-grow">
          <p className="font-medium text-gray-800">Medication Reminder</p>
          <p className="text-sm text-gray-600">Set up medication alerts</p>
          <p className="text-xs text-blue-600 mt-1">+ Add new reminder</p>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <Bell className="w-4 h-4 text-blue-500" />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Medication Reminder</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Medication Name
            </label>
            <input
              type="text"
              required
              value={reminder.name}
              onChange={e => setReminder(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter medication name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dosage
            </label>
            <input
              type="text"
              required
              value={reminder.dosage}
              onChange={e => setReminder(prev => ({ ...prev, dosage: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., 500mg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Frequency (times per day)
            </label>
            <input
              type="number"
              required
              min="1"
              max="6"
              value={reminder.frequency}
              onChange={e => setReminder(prev => ({ ...prev, frequency: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Times
            </label>
            <div className="space-y-2">
              {reminder.times.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => updateTime(index, e.target.value)}
                    className="block rounded-md border border-gray-300 px-3 py-2"
                  />
                  {reminder.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {reminder.times.length < reminder.frequency && (
                <button
                  type="button"
                  onClick={addTime}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              required
              value={reminder.startDate}
              onChange={e => setReminder(prev => ({ ...prev, startDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={reminder.endDate}
              onChange={e => setReminder(prev => ({ ...prev, endDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              value={reminder.notes}
              onChange={e => setReminder(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="Add any additional notes"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Add Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
