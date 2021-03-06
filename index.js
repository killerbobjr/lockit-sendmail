var	nodemailer = require('nodemailer'),
	ejs = require('ejs');



/**
 * Email constructor function.
 *
 * @constructor
 * @param {Object} config
 */
var Email = module.exports = function(config)
{
	if(!(this instanceof Email))
	{
		return new Email(config);
	}
	this.template = require(config.mail.emailTemplate);
	this.transport = require(config.mail.emailType);
	this.config = config;
};



/**
 * Send email with nodemailer.
 *
 * @private
 * @param {String} type
 * @param {String} username
 * @param {String} email
 * @param {Function} done
 */
Email.prototype.send = function(type, username, email, token, done)
{
	var config = this.config;
	var that = this;

	var locals = JSON.parse(JSON.stringify(config[type]));

	// default local variables
	locals.appname = config.appname;
	locals.url = config.url;
	locals.path = config.mail.templatefolder;
	locals.link = that.link;
	locals.username = username;
	locals.brand = config.brand;
	locals.fqdn = config.fqdn;
	locals.images = config.images;
	locals.logo = config.logo;
	locals.icon = config.icon;
	locals.emailbodybackground = config.emailbodybackground;
	locals.emailbackground = config.emailbackground;
	locals.emailtext = config.emailtext;
	locals.emailbuttonbackground = config.emailbuttonbackground;
	locals.emailbuttontext = config.emailbuttontext;
	locals.emaillink = config.emaillink;
	locals.emaillinkhover = config.emaillinkhover;
	locals.emaillinkactive = config.emaillinkactive;
	locals.email = email;
	locals.token = token;

	this.template(locals, function(err, html, text)
	{
		if(err)
		{
			return done(err);
		}
		else
		{
			// add options
			var delimiters = {
				openDelimiter: '[',
				closeDelimiter: ']'
			};

			var options = {
				from: config.emailFrom,
				to: email,
				subject: ejs.render(locals.subject, locals, delimiters),
				html: ejs.render(html, locals, delimiters),
				text: ejs.render(text, locals, delimiters)
			};

			// send email with nodemailer
			var transporter = nodemailer.createTransport(that.transport(config.mail.emailSettings));
			transporter.sendMail(options, function(err, res)
			{
				if(err)
					return done(err);
				else
				{
					transporter.close(); // shut down the connection pool, no more messages
					done(null, res);
				}
			});
		}
	});
};


/**
 * Send signup email.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} token
 * @param {Function} done
 */
Email.prototype.signup = function(username, email, token, done)
{
	var c = this.config;
	this.link = c.url + c.signup.route + '/' + token + '?auth=false';
	this.send('emailSignup', username, email, token, done);
};



/**
 * Send signup email again.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} token
 * @param {Function} done
 */
Email.prototype.resend = function(username, email, token, done)
{
	var c = this.config;
	this.link = c.url + c.signup.route + '/' + token + '?auth=false';
	this.send('emailResendVerification', username, email, token, done);
};



/**
 * Send email to email address owner with notice about signup.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} token (unused)
 * @param {Function} done
 */
Email.prototype.taken = function(username, email, token, done)
{
	this.send('emailSignupTaken', username, email, '', done);
};



/**
 * Send email with link for new password.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} token
 * @param {Function} done
 */
Email.prototype.forgot = function(username, email, token, done)
{
	var c = this.config;
	this.link = c.url + c.forgotPassword.route + '/' + token;
	this.send('emailForgotPassword', username, email, token, done);
};



/**
 * Send email with link for email verification.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} token
 * @param {Function} done
 */
Email.prototype.change = function(username, email, token, done)
{
	var c = this.config;
	this.link = c.url + c.changeEmail.route + '/' + token;
	this.send('emailChangeEmail', username, email, token, done);
};



/**
 * Send email with link for email reset.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} token
 * @param {Function} done
 */
Email.prototype.reset = function(username, email, token, done)
{
	var c = this.config;
	this.link = c.url + c.changeEmail.route + '/' + token;
	this.send('emailResetEmail', username, email, token, done);
};



/**
 * Send invite email.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} token
 * @param {Function} done
 */
Email.prototype.invite = function(username, email, token, done)
{
	var c = this.config;
	this.link = c.url + c.invite.route + token;
	this.send('emailInvite', username, email, '', done);
};



/**
 * Send two-factor password email.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} token
 * @param {Function} done
 */
Email.prototype.twoFactor = function(username, email, token, done)
{
	var c = this.config;
	if(c.login.twoFactorRoute.linkText && c.login.twoFactorRoute.linkText.length)
	{
		this.link = c.url + c.login.twoFactorRoute + '/' + token + '?email=' + email;
	}
	this.send('twoFactor', username, email, token, done);
};