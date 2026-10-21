import React from 'react';
import { NotificationItem } from '../types';
import { Bell, X, Check, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatTime, formatDate } from '../utils/journeyState';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 select-none"
      data-testid="notifications-modal"
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-[36px] sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#E5E7E1]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7E1] flex items-center justify-between bg-[#F7F5EF] shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#173F33]" />
            <h2 className="text-base font-extrabold text-[#173F33]">Notifications</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-[#173F33] hover:underline"
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-black/5 text-[#737A74]"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-[#737A74] text-xs">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  n.read
                    ? 'bg-white border-[#E5E7E1]'
                    : 'bg-[#F0F7F1] border-emerald-300 shadow-2xs'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#E7F0E8] text-[#173F33] flex items-center justify-center shrink-0 mt-0.5">
                  {n.type === 'journey' && <CheckCircle className="w-4 h-4 text-emerald-700" />}
                  {n.type === 'emergency' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  {n.type === 'checkin' && <Clock className="w-4 h-4 text-[#173F33]" />}
                  {n.type === 'system' && <Shield className="w-4 h-4 text-[#173F33]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#252B27] truncate">{n.title}</h3>
                    <span className="text-[10px] text-[#737A74] shrink-0">
                      {formatTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-[#737A74] mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[#E5E7E1] bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#173F33] text-white text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
