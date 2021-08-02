document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    Backendless.initApp( "6C3DD1D0-AE6B-7A96-FF61-01FE2A3D8400", "E4E9B376-ED4C-49C4-B2DE-5433EF1578F8" );
}

function userLoggedIn( user )
{
    console.log( "user has logged in" );
    window.location.href = "index.html";
}

function gotError( err ) // see more on error handling
{
    console.log( "error message - " + err.message );
    console.log( "error code - " + err.statusCode );
}

function login(){
    var email = $('#email').val();
    var password = $('#password').val();
    Backendless.UserService.login( email, password, true )
        .then( userLoggedIn )
        .catch( gotError );
}

function userRegistered( user )
{
    console.log( "user has been registered" );
    Backendless.UserService.getCurrentUser().then( function( currentUser ) {
        if(currentUser){
            Backendless.UserService.logout();
        }
        window.location.href = "login.html";
    })
    .catch( function ( error ) {
        //Login
        console.log("Current user error: " + error);
    });
}

function submitRegistration(){
    var user = new Backendless.User();
    user.email = $('#email').val();
    user.password = $('#password').val();
    user.name = $('#name').val();

    var passConf = $('#password-conf').val();

    if(user.email != null && user.password != null && user.password == passConf && user.name != null){
        Backendless.UserService.register( user ).then( userRegistered ).catch( gotError );
    }
}