import { toast } from 'react-toastify';

interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export const useToast = () => {
  const showToast = ({ type, message }: ToastOptions) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return { showToast };
};