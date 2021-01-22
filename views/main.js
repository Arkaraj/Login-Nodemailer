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
                //console.log('otp generated!');
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

/*$('#getin').on('click', () => {
    let loginUser = $('#loginusr').val();
    let loginPass = $('#loginp').val();

    if (loginUser == '' || loginPass == '') {
        $('#success').hide();
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
            success: async (result) => {
                // result is already parsed
                if (result.auth) {
                    // window.location = '/home';
                    // Storing the JWT
                    localStorage.setItem("token", result.token);
                    $.ajax({
                        url: "/home",
                        headers: {
                            "x-access-token": localStorage.getItem("token")
                        },
                        success: (result) => {
                            // Redirect to home
                        }
                    });

                } else {
                    $("#problem").show();
                    $("#problem").html('Sorry wrong Email or password...');
                    $('#getin').html('SIGN IN');
                    $('#getin').attr('disabled', false);
                }
            }
        });
    }
});*/

$('#sign').on('click', () => {
    let email = $('.email').val();
    let password = $('.password').val();
    let user = $('.User').val();

    if (password == '' || user == '') {
        $('#danger').show();
        $('#danger').html('Please enter Email and password...');
    } else {
        $('#danger').hide();
        $('.User').attr('disabled', true);
        $('.password').attr('disabled', true);
        $.ajax({
            url: '/check',
            type: 'post',
            data: `user=${user}&password=${password}&email=${email}`,
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

$('#forpass').on('click', () => {
    let email = $('#forpem').val();

    if (email == '') {
        $('#warning').show();
        $('#warning').html('Please enter Email...');
    } else {
        $('#warning').hide();
        $('#forpem').attr('disabled', true);
        $('#forpass').attr('disabled', true);
        $.ajax({
            url: '/forgot',
            type: 'post',
            data: `email=${email}`,
            success: (result) => {
                if (result == 'done') {
                    $('#success2').show();
                    $('#success2').html('Old encrypted Pasword is sent to your Email, Give us new Password');
                    // $('#forpass').html('Now Login!!');
                    $('#forpass').hide();
                    $('.newPass').show();
                    $('#uppass').show();
                } else {
                    $('#warning').show();
                    $('#warning').html('Please enter valid Email');
                    $('#forpem').attr('disabled', false);
                    $('#forpass').attr('disabled', false);
                }
            }
        });

    }
});

$('#uppass').on('click', () => {
    let pass = $('#updatePassword').val();
    let email = $('#forpem').val();

    if (pass == '') {
        $('#success2').hide();
        $('#warning').show();
        $('#warning').html('Please enter Password...');
    } else {
        $('#warning').hide();
        $('updatePassword').attr('disabled', true);
        $('#uppass').attr('disabled', true);

        $.ajax({
            url: '/update',
            type: 'patch',
            data: `email=${email}&password=${pass}`,
            success: (result) => {
                if (result == 'done') {
                    $('#success2').show();
                    $('#success2').html('Done Updated password 😀, Try Loggin in now');
                    $('#uppass').html('Now Login!!');
                    $('#uppass').attr('disabled', true);

                } else { // This case can kindda never happen
                    $('#warning').show();
                    $('#warning').html('Password must contain atleast 3 letters');
                    $('#updatePassword').attr('disabled', false);
                    $('#uppass').attr('disabled', false);
                }
            }
        });
    }

});
