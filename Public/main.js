const signUpButton = $('#signUp');
const signInButton = $('#signIn');
const container = document.getElementById('container');

signUpButton.on('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.on('click', () => {
    container.classList.remove("right-panel-active");
});

const email_otp = $('.otp');
const verificationPanel = $('#set2');
const send_otp = $('#send');
verificationPanel.hide();

send_otp.on('click', () => {
    let email = $('.email').val();
    if (email == '') {
        $('#danger').html('Please enter email id');
    }
    else {
        $('#danger').hide();
        send_otp.html('Please wait..');
        send_otp.attr('disabled', true);
        /*$.ajax({
            url:'/',
            type: 'post',
            data:'',
            success: (result) =>{
                
            }
        });*/
        verificationPanel.show();
        //send_otp.hide();
    }

});

verificationPanel.on('click', verifyOTP);

function verifyOTP() {
    console.log('Checking!');
}

