const useEgAccountBtn = document.querySelector('.example-acc-text')
const labels = document.querySelectorAll('label')

useEgAccountBtn.addEventListener("click", () => {
  emailInput.value = 'tim123@gmail.com';
  passwordInput.value = 'Test123!';
  labels.forEach(label => {
    label.style.top = '2px';
});
});
