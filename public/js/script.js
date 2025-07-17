(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to

const forms = document.querySelectorAll('.needs-validation')
  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

     let taxSwitch = document.getElementById("flexSwitchCheckDefault");
taxSwitch.addEventListener("click", () => {
    let taxInfo = document.getElementsByClassName("tax-info");
    for (let info of taxInfo) {
        if (info.style.display !== "inline") {
            info.style.display = "inline";
        } else {
            info.style.display = "none";
        }
    }
});

(() => {
  'use strict';

  // Bootstrap validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();


// FAVORITE BUTTON
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.favorite-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const listingId = button.dataset.id;

      try {
        const res = await fetch(`/listings/${listingId}/favorite`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          }
        });

        // 👇🏽 Login check: if not logged in, redirect to login
        if (res.status === 401) {
          alert('Please login or signup first to favorite this listing.');
          window.location.href = '/signup';  // or use '/signup' if you prefer
          return; // 💡 VERY IMPORTANT: stop further execution
        }

        const data = await res.json();

        // ✅ Only update icon if logged in and response is OK
        if (data.favorited) {
          button.innerHTML = '<i class="fa-solid fa-heart"></i>';
          button.classList.add('hearted');
        } else {
          button.innerHTML = '<i class="fa-regular fa-heart"></i>';
          button.classList.remove('hearted');
        }

      } catch (err) {
        console.error('⚠️ Network error:', err);
        alert('Something went wrong. Please try again later.');
      }
    });
  });
});
