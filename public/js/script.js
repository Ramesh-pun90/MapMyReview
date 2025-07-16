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


// // FAVORITE BUTTON
// document.addEventListener('DOMContentLoaded', () => {
//   document.querySelectorAll('.favorite-btn').forEach(button => {
//     button.addEventListener('click', async (e) => {
//       e.preventDefault();
//       e.stopPropagation();


//       const listingId = button.dataset.id;

//       try {
//         const res = await fetch(`/listings/${listingId}/favorite`, {
//           method: 'POST',
//           headers: {
//             'Accept': 'application/json'
//           }
//         });

//         if (!res.ok) {
//           console.error('Server error:', await res.text());
//           alert('Please SignIn first After You Can Able To Add Favorite');
//           return;
//         }

//         const data = await res.json(); 
//         button.innerText = data.favorited ? '❤️' : '🤍';

//       } catch (err) {
//         console.error('Network error:', err);
//       }
//     });
//   });
// });

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

        if (!res.ok) {
          console.error('Server error:', await res.text());
          alert('Please SignIn first After You Can Able To Add Favorite');
          return;
        }

        const data = await res.json();

        if (data.favorited) {
          // Favorite भयो भने ❤️ देखाउने
          button.innerHTML = '<i class="fa-solid fa-heart"></i>';
          button.classList.add('hearted');
        } else {
          // Unfavorite भयो भने 🤍 देखाउने र card हटाउने
          button.innerHTML = '<i class="fa-regular fa-heart"></i>';
          button.classList.remove('hearted');

          // यदि यो favorites page मा छ भने card DOM बाट हटाउनु
          if (window.location.pathname.includes('/favorites')) {
            const card = button.closest('.col');
            if (card) card.remove();

            // सबै card हरु हटे भने message देखाउने
            if (document.querySelectorAll('.favorite-btn').length === 0) {
              const container = document.querySelector('.row');
              container.innerHTML = `
                <div class="col-8 text-center">
                  <div class="alert alert-warning shadow-sm">
                    <i class="fa-solid fa-heart-crack me-2"></i>
                    You have no favorite listings yet.
                  </div>
                </div>
              `;
            }
          }
        }

      } catch (err) {
        console.error('Network error:', err);
      }
    });
  });
});



