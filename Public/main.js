const signUpButton = $('#signUp');
const signInButton = $('#signIn');
const container = document.getElementById('container');

signUpButton.on('click', () => {
    container.classList.add("right-panel-active");
    $.ajax({
        url: '/otp',
        type: 'get',
        success: (result) => {
            if (result == 'done') {
                console.log('otp generated!');
            }
        }
    });
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
            data: `email=${email}`,
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
                    $('#danger').show()
                    $('#danger').html('Check your email once');
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
                    $('.otp').attr('disabled', true);
                    $('#verify').hide();
                    $('#success').show();
                    $('#success').html('Verified Email✔️');
                    $('#sign').attr('disabled', false);

                } else {
                    $('#danger').show();
                    $('#danger').html('Wrong OTP entered');
                }
            }
        });
    }
}

$('#getin').on('click', () => {
    let loginUser = $('#loginusr').val();
    let loginPass = $('#loginp').val();

    if (loginUser == '' || loginPass == '') {
        $("#problem").show();
        $("#problem").html('Enter Email and Password');
    } else {
        $("#problem").hide();
        $('#getin').html('Checking...');
        $('#getin').attr('disabled', true);

        $.ajax({
            url: '/login',
            type: 'post',
            data: `loginusr=${loginUser}&loginp=${loginPass}`,
            success: (result) => {
                if (result == 'done') {
                    window.location = '/home';
                } else {
                    $("#problem").show();
                    $("#problem").html('Sorry wrong Email or password...');
                    $('#getin').html('SIGN IN');
                    $('#getin').attr('disabled', false);
                }
            }
        });
    }
});

$('#sign').on('click', () => {
    let email = $('.email').val();
    let password = $('.password').val();
    let user = $('.User').val();

    if (password == '' || user == '') {
        // Enter username and password
    } else {
        $('.User').attr('disabled', true);
        $('.password').attr('disabled', true);
        $.ajax({
            url: '/check',
            type: 'post',
            data: `user=${user}&pass=${password}&email=${email}`,
            success: (result) => {
                if (result == 'added') {
                    $('#success').show();
                    $('#success').html('Added your information✔️');
                    $('#sign').attr('disabled', true);
                    $('#sign').html('Now Login!!');
                }
            }
        });
    }
});

