const toggleButtons = document.querySelectorAll('.toggle-button');
    
toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
        const answer = this.parentElement.nextElementSibling;  // Find the answer list
        
        if (answer.style.display === "none" || answer.style.display === "") {
            answer.style.display = "block";  // Show the answer
            this.textContent = "−";  // Change button to minus
        } else {
            answer.style.display = "none";  // Hide the answer
            this.textContent = "+";  // Change button to plus
        }
    });
});