import toast from 'react-hot-toast';
import { LuInfo } from "react-icons/lu";

// Consistent toast styling
const toastStyle = {
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: '500',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

export const SuccessToast = (message, duration = 4000) => {
  toast.success(message, {
    duration,
    style: {
      ...toastStyle,
      background: '#f0fdf4',
      border: '1px solid #22c55e',
      color: '#166534',
    },
    iconTheme: {
      primary: '#22c55e',
      secondary: '#ffffff',
    },
  });
};

export const ErrorToast = (message, duration = 5000) => {
  toast.error(message, {
    duration,
    style: {
      ...toastStyle,
      background: '#fef2f2',
      border: '1px solid #ef4444',
      color: '#991b1b',
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff',
    },
  });
};

export const InfoToast = (message, duration = 4000) => {
  toast(message, {
    duration,
    icon: <LuInfo size={20} />,
    style: {
      ...toastStyle,
      background: '#eff6ff',
      border: '1px solid #3b82f6',
      color: '#1e40af',
    },
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#ffffff',
    },
  });
};

export const WarningToast = (message, duration = 4000) => {
  toast(message, {
    duration,
    icon: '⚠️',
    style: {
      ...toastStyle,
      background: '#fffbeb',
      border: '1px solid #f59e0b',
      color: '#92400e',
    },
    iconTheme: {
      primary: '#f59e0b',
      secondary: '#ffffff',
    },
  });
};