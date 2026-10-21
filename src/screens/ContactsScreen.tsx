import React, { useState } from 'react';
import { TrustedContact } from '../types';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Shield,
  Star,
  Trash2,
  X,
  Check,
  AlertCircle,
  Bell,
} from 'lucide-react';

interface ContactsScreenProps {
  contacts: TrustedContact[];
  onAddContact: (contact: TrustedContact) => void;
  onDeleteContact: (id: string) => void;
  onTogglePriority: (id: string) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onTogglePriority,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Family');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter contact name');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter a phone number for SMS alerts');
      return;
    }

    const newContact: TrustedContact = {
      id: 'cnt_' + Date.now(),
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      isPriority,
      notifyOnStart: true,
      notifyOnArrival: true,
      notifyOnDeviation: true,
      notifyOnSOS: true,
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + contacts.length}?auto=format&fit=crop&w=150&q=80`,
    };

    onAddContact(newContact);
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setIsPriority(false);
    setErrorMsg('');
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F7F5EF] select-none"
      data-testid="contacts-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-[#173F33] tracking-tight">
            Trusted Contacts
          </h1>
          <p className="text-xs text-[#737A74] font-medium">
            Emergency alert & journey sharing network
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#173F33] text-white text-xs font-bold hover:bg-[#103329] transition-colors shadow-xs cursor-pointer"
          aria-label="Add trusted contact"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-2xl bg-[#E7F0E8] border border-[#D5E2D7] text-xs text-[#173F33] flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-[#173F33] shrink-0" />
        <span>
          Priority contacts receive instant alerts if an SOS is activated or check-in is overdue.
        </span>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-2xl p-4 border border-[#E5E7E1] shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    contact.avatarUrl ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={contact.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-[#E5E7E1]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#252B27]">{contact.name}</h3>
                    {contact.isPriority && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-emerald-800" />
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#737A74] mt-0.5">{contact.relationship}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onTogglePriority(contact.id)}
                  title={contact.isPriority ? 'Remove Priority' : 'Make Priority'}
                  className={`p-2 rounded-xl border text-xs transition-colors ${
                    contact.isPriority
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'border-[#E5E7E1] text-[#737A74] hover:bg-[#F7F5EF]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${contact.isPriority ? 'fill-amber-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteContact(contact.id)}
                  aria-label={`Remove contact ${contact.name}`}
                  className="p-2 rounded-xl border border-[#E5E7E1] text-[#737A74] hover:text-[#C84C4C] hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F7F5EF]">
              <div className="flex items-center gap-2 text-[#737A74]">
                <Phone className="w-3.5 h-3.5 text-[#173F33]" />
                <span className="truncate">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#737A74]">
                <Mail className="w-3.5 h-3.5 text-[#173F33]" />
                <span className="truncate">{contact.email}</span>
              </div>
            </div>

            {/* Notification Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F5EF] text-[#173F33]">
                SOS Alert
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F5EF] text-[#173F33]">
                Live Location
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F5EF] text-[#173F33]">
                Arrival Confirmation
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E5E7E1]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#173F33]">Add Trusted Contact</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-[#737A74]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#C84C4C] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-1">
                  Contact Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl px-3 py-2.5 text-xs text-[#252B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl px-3 py-2.5 text-xs text-[#252B27]"
                >
                  <option value="Family">Family / Sister / Brother</option>
                  <option value="Partner">Partner / Spouse</option>
                  <option value="Friend">Close Friend</option>
                  <option value="Roommate">Roommate</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-1">
                  Phone Number (for SMS & SOS)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl px-3 py-2.5 text-xs text-[#252B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl px-3 py-2.5 text-xs text-[#252B27]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="priorityCheck"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="w-4 h-4 rounded text-[#173F33] focus:ring-[#173F33]"
                />
                <label htmlFor="priorityCheck" className="text-xs font-semibold text-[#252B27]">
                  Mark as Priority Emergency Contact
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[#E5E7E1] text-xs font-bold text-[#737A74]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#173F33] text-white text-xs font-bold shadow-md hover:bg-[#103329]"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
