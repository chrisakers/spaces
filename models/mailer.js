var nodemailer = require("nodemailer");

nodemailer.SMTP = {
    host: "smtp.gmail.com",
    port: 465,
    ssl: true,
    use_authentication: true,
    user: "no.reply@gmail.com",
    pass: "NoReply"
}

var mailer = {
    send: function (to, subject, body, callback) {
        nodemailer.send_mail(
            {
                sender:  "No-Reply <no.reply@gmail.com>", 
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
