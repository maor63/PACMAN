
// Below function Executes on click of login button.

function validate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if(username=='a'&&password=='a')
    {
        alert("good job successfully");
        showSection('settings');
    }
    if (users.contains(username)&& users[username].value== password) {
        alert("found in users");
        showSection('settings');
        //Start();// Redirecting to other page.
        return false;
    }

    else{
        alert("Login failed");
       // attempt --;// Decrementing by one.
        //alert("You have left "+attempt+" attempt;");
            return false;
    }
}
function Resgister() {
    var username = document.getElementById("usernameR").value;
    var password = document.getElementById("passwordR").value;

}