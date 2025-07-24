console.log("Script loaded successfully!");

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Thank you for contacting Lex Vertex! We'll get back to you soon.");
      form.reset();
    });
  }
});
