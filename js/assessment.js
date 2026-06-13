function assessCareer() {
    const answers = [];

    // Loop through each question
    for (let i = 1; i <= 10; i++) {
        const questionElement = document.getElementById(`q${i}`);
        if (!questionElement) continue;

        const radioButtonYes = questionElement.querySelector('input[value="yes"]');
        const radioButtonNo = questionElement.querySelector('input[value="no"]');

        // Check which radio button is checked and add the corresponding answer to the array
        if (radioButtonYes && radioButtonYes.checked) {
            answers.push('yes');
        } else if (radioButtonNo && radioButtonNo.checked) {
            answers.push('no');
        }
    }

    // Calculate the result based on the number of 'yes' answers
    let result = "";
    const yesAnswers = answers.filter(answer => answer === 'yes').length;

    if (yesAnswers > 7) {
        result = "Your career is on track.";
    } else if (yesAnswers >= 4 && yesAnswers <= 6) {
        result = "Your career is somewhat on track.";
    } else {
        result = "Your career may need some redirection at the moment.";
    }

    // Use innerHTML to include HTML content with styling
    document.getElementById("assessmentResult").innerHTML = "<div class='highlight'>" + result + "</div>";
}
