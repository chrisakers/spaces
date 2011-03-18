var nodemailer = require("nodemailer");

nodemailer.SMTP = {
    host: "smtp.gmail.com",
    port: 465,
    ssl: true,
    use_authentication: true,
    user: "wdpro.spaces@gmail.com",
    pass: "WDPRO-D1sn3y!"
}

/*nodemailer.SMTP = {
    host: "pooh.wdig.com", // required
    port: 25, // optional, defaults to 25 or 465
    use_authentication: false,
    user: "",
    pass: ""
}*/

var mailer = {
    send: function (to, subject, body, callback) {
        nodemailer.send_mail(
            {
                sender:  "WDPRO Spaces <wdpro.spaces@gmail.com>", 
                to:      to,
                subject: subject,
                body:    body
            },
            function(error, success){
                if (callback) callback(success);
            }
        );
    }
};
    
module.exports = mailer;
