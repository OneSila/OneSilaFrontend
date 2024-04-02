import Swal from 'sweetalert2';

const showAlert = async (type, title) => {
  var toastMixin = Swal.mixin({
    toast: true,
    animation: true,
    position: 'top-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#181f32',
    padding: '2em',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  toastMixin.fire({
    icon: type,
    title: title,
    customClass: {
      timerProgressBar: getTypeClass(type)
    },
  });
};

const getTypeClass = (type) => {
  switch (type) {
    case 'success':
      return 'bg-success-light dark:bg-success-dark-light';
    case 'error':
      return 'bg-danger-light dark:bg-danger-dark-light';
    case 'warning':
      return 'bg-warning-light dark:bg-warning-dark-light';
    case 'info':
      return 'bg-info-light dark:bg-info-dark-light';
    case 'question':
      return 'bg-primary-light dark:bg-primary-dark-light';
    default:
      return 'bg-secondary-light dark:bg-secondary-dark-light';
  }
};


export class Toast {
  static info(title) {
    showAlert('info', title);
  }

  static success(title) {
    showAlert('success', title);
  }

  static error(title) {
    showAlert('error', title);
  }

  static warning(title) {
    showAlert('warning', title);
  }

  static question(title) {
    showAlert('question', title);
  }

}
