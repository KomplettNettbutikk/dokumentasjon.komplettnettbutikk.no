let contactForm = document.querySelector("#contactform form");
  
if (contactForm !== null) {

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    fetch(contactForm.getAttribute('action'), {
      method: 'POST',
      headers: {
        'Accept': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams(formData).toString()
    })
    .then(res => {
      if (res) {
        contactForm.innerHTML = '<strong>Takk for din melding - vi tar kontakt!</strong>';
      }
    });
  });

}