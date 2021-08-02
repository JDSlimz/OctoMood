document.addEventListener('deviceready', onDeviceReady, false);

var services = Object.create(Backendless.APIServices.OctoMood);

var fcmToken;

function onDeviceReady() {
    Backendless.initApp( "6C3DD1D0-AE6B-7A96-FF61-01FE2A3D8400", "E4E9B376-ED4C-49C4-B2DE-5433EF1578F8" );

    Backendless.UserService.getCurrentUser()
        .then( async function( currentUser ) {
            if(!currentUser){
                window.location.href = "signup.html";
            } else {
                refreshHome();

                cordova.plugins.firebase.messaging.getToken().then(function (token) {
                    console.log("Got device token: " + token);
                    fcmToken = token;
                });

                //Hide Loader Last
                $('.loader').hide();
                $('#octoApp').show();
            }
        })
        .catch( function ( error ) {
            console.log("Current user error: " + error);
        });
}

function newRequestDialog() {
    navigator.notification.prompt(
        'Enter the email address you would like to follow.',
        sendRequest,
        'New Request',
        ['Send', 'Cacncel'],
        'example@gmail.com'
    );
}

async function sendRequest(results) {
    if (results.buttonIndex == 1) {
        var requesteeEmail = results.input1;
        var response = await services.createRequest(requesteeEmail);

        navigator.notification.alert(
            response,  // message
            refreshHome,         // callback
            'Server Repsonse',            // title
            'OK'                  // buttonName
        );
    }
}

async function getRequests(){
   var requests = await services.getRequests();

   if(requests.length > 0){
       $('#requestsBtn').show();

       requests.forEach(element => {
           //populate modal with requests
       });
   } else {
       $('#requestsBtn').hide();
   }
}

async function acceptRequest(requestId){
    var response = await services.acceptRequest(requestId);

    navigator.notification.alert(
        response,  // message
        refreshHome,         // callback
        'Server Repsonse',            // title
        'OK'                  // buttonName
    );
}

async function declineRequest(requestId){
    var response = await services.declineRequest(requestId);

    navigator.notification.alert(
        response,  // message
        refreshHome,         // callback
        'Server Repsonse',            // title
        'OK'                  // buttonName
    );
}

function onMessage(stringMessage) {
    var messageJSON = stringMessage;
    var messageType = messageJSON.headers.messageType;
    var sender = messageJSON.publisherId;

    if (messageType === "mood") {
        console.log(messageJSON);
        cordova.plugins.notification.local.schedule({
            title: 'Mood Change!',
            text: sender + " is " + messageJSON.message,
            foreground: true
        });
        navigator.notification.alert(
            sender + " " + messageJSON.message,
            'Mood Change',
            'OK'
        );
    }
}

async function refreshHome() {
    var currentUser = await Backendless.UserService.getCurrentUser();
    //Get data
    var myMood = await services.getMood(currentUser.objectId);
    var myFollowersMoods = await services.getFollowerMoods();
    var channels = ['default'];

    //Add data to DOM
    $('#octopus').html("<img src='img/" + myMood + ".png' />");
    $("#followers").html("");
    myFollowersMoods.forEach(follower => {
        $("#followers").append("<div class='follower'>" + "<img src='img/" + follower.mood + ".png' />" + "<h5>" + follower.name + "</h5></div>");
        var channelID = follower.id.replace(/-/g, "");
        var channel = Backendless.Messaging.subscribe(channelID);

        
        var selector = "messageType = 'mood'";
        channel.addMessageListener(onMessage, selector);

        var channel = channelID,
            message = "joined";
            pubOps = new Backendless.PublishOptions({
            headers: {
                messageType: "meta"
            }});

        Backendless.Messaging.publish(channel, message);
        channels.push(channel);
        console.log(follower.id.replace(/-/g, ""));
    });

    
    var date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    var expiration = date.getTime();

    Backendless.setupDevice({
        "uuid": makeid(16),
        "platform": "Android",
        "version": "29"
    });

    Backendless.Messaging.registerDevice(fcmToken,
        channels,
        expiration)
        .then(function (response) {
            console.log(JSON.stringify(response));
        })
        .catch(function (error) {
            console.log(error);
        });
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}