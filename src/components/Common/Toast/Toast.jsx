import toast from 'react-hot-toast';
import { LuInfo } from "react-icons/lu";
export const SuccessToast = (message) => {
  toast.success(message, {
    style: {
      border: "1px solid #ff6900",
      padding: "5px 10px",
      color: "#ff6900",
    },
    iconTheme: {
      primary: "#ff6900",
      secondary: "#ffffff",
    },
  });
};

export const ErrorToast = (message) => {
  toast.error(message, {
    style: {
      border: "1px solid #ff0000",
      padding: "5px 10px",
      color: "#ff0000",
    },
    iconTheme: {
      primary: "#ff0000",
      secondary: "#ffffff",
    },
  });
};
export const InfoToast = (message) => {
  toast(message, {
    icon: <LuInfo size={20} />,
    style: {
      border: "1px solid #007bff",
      padding: "5px 10px",
      color: "#007bff",
    },
    iconTheme: {
      primary: "#007bff",
      secondary: "#ffffff",
    },
  });
};