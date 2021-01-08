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
    let user = $('.User').val();
    if (email == '' || user == '') {
        $('#danger').html('Please enter email id and username');
    }
    else {
        $('#danger').hide();
        send_otp.html('Please wait..');
        send_otp.attr('disabled', true);

        let password = $('.password').val();

        $.ajax({
            url: '/',
            type: 'post',
            data: `email=${email}&user=${user}&pass=${password}`,
            success: (result) => {
                if (result == 'done') {
                    $('.email').attr('disabled', true);
                    verificationPanel.show();
                    send_otp.hide();
                }
                else if (result == 'email_present') {
                    send_otp.html('SEND OTP');
                    send_otp.attr('disabled', false);
                    $('#danger').show();
                    $('#danger').html('Email id already exists');
                } else {
                    send_otp.html('SEND OTP');
                    send_otp.attr('disabled', false);
                    $('#danger').html('Please try after sometime');
                }
            }
        });
    }

});

$('#verify').on('click', verifyOTP);

function verifyOTP() {
    let userotp = $('.otp').val();
    if (userotp == '') {
        $('#danger').show();
        $('#danger').html('Enter Something...');
    } else {
        $('#danger').hide();

        $.ajax({
            url: '/otp',
            type: 'post',
            data: `otp=${userotp}`,
            success: (result) => {
                if (result == 'done') {
                    $('#verify').hide();
                    $('#success').html('Verified ✔️');
                    $('#sign').attr('disabled', false);

                } else {
                    $('#danger').show();
                    $('#danger').html('Wrong OTP entered');
                }
            }
        });
    }
}

