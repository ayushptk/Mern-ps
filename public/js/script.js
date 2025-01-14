// Remove the IIFE wrapper
'use strict';

// Fetch all the forms we want to apply custom Bootstrap validation styles to
const forms = Array.from(document.querySelectorAll('.needs-validation'));

// Loop over them and prevent submission
forms.forEach(form => {
  form.addEventListener('submit', event => {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Add the was-validated class to the form
    form.classList.add('was-validated');
  }, false);
});