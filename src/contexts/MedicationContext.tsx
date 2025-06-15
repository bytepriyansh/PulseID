import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  frequency: number; // times per day
  times: string[]; // Array of times in 24-hour format
  startDate: string;
  endDate?: string;
  notes?: string;
  lastTaken?: string;
  nextDue?: string;
}

interface MedicationContextType {
  reminders: MedicationReminder[];
  addReminder: (reminder: Omit<MedicationReminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<MedicationReminder>) => void;
  deleteReminder: (id: string) => void;
  getNextDue: () => MedicationReminder | null;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<MedicationReminder[]>(() => {
    const saved = localStorage.getItem('medicationReminders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('medicationReminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (reminder: Omit<MedicationReminder, 'id'>) => {
    const newReminder = {
      ...reminder,
      id: crypto.randomUUID(),
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const updateReminder = (id: string, updates: Partial<MedicationReminder>) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id ? { ...reminder, ...updates } : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const getNextDue = () => {
    const now = new Date();
    let nextDue: MedicationReminder | null = null;
    let earliestTime: Date | null = null;

    reminders.forEach(reminder => {
      reminder.times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const dueTime = new Date();
        dueTime.setHours(hours, minutes, 0, 0);

        if (dueTime < now) {
          dueTime.setDate(dueTime.getDate() + 1);
        }

        if (!earliestTime || dueTime < earliestTime) {
          earliestTime = dueTime;
          nextDue = { ...reminder, nextDue: dueTime.toISOString() };
        }
      });
    });

    return nextDue;
  };

  return (
    <MedicationContext.Provider
      value={{
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        getNextDue,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedication = () => {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
};
