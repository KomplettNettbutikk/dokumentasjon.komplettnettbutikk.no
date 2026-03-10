let contactForm = document.querySelector("#contactform form");
  
if (contactForm !== null) {

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    fetch(contactForm.getAttribute('action'), {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Accept': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams(formData).toString()
    })
    .then(res => {
      // FormSubmit returnerer 302 redirect til _next; med redirect: 'manual' følger vi ikke, så ingen CORS
      if (res.type === 'opaqueredirect' || res.status === 302 || res.status === 0 || res.ok) {
        contactForm.innerHTML = '<strong>Takk for din melding - vi tar kontakt!</strong>';
      }
    })
    .catch(() => {
      contactForm.innerHTML = '<strong>Takk for din melding - vi tar kontakt!</strong>';
    });
  });

}