const fastify = require("fastify")({ logger: true });
const mongodb_init = require(__dirname + "/mongodb");
const { get } = require("./mongodb");
const { v4: uuidv4 } = require("uuid");
const cron = require("node-cron");
const axios = require("axios");

require("dotenv").config();
mongodb_init();

const resendAccessToken = process.env.RESEND_TOKEN;

fastify.register(require("@fastify/cors"), {
  origin: "*",
  methods: ["POST, GET"],
});

fastify.get("/", async function handler(request, reply) {
  reply.send("EgloNotificationService");
});

fastify.post("/new-subscriber", async function handler(req, reply) {
  try {
    const client = get();

    let check_for_id = await client
      .db("EgloNS")
      .collection("Users")
      .findOne({ subscriber_id: req.body.subscriber_id });

    if (check_for_id !== null) {
      reply.send({
        success: false,
        error: "User with same Subscriber ID exists",
      });
      return;
    }

    await client.db("EgloNS").collection("Users").insertOne({
      subscriber_id: req.body.subscriber_id,
      notifications: [],
      last_notification_time: Date.now(),
      last_updated_time: Date.now(),
      email: req.body.email,
    });

    reply.send({
      success: true,
      subscriber_id: req.body.subscriber_id,
      registered_on: Date.now(),
    });
  } catch (e) {
    console.log(e);
    reply.send({
      success: false,
      error: "Failed to register user, check ENS console",
    });
  }
});

fastify.post("/delete-subscriber", async function handler(req, reply) {
  try {
    const client = get();

    let check_for_id = await client
      .db("EgloNS")
      .collection("Users")
      .findOne({ subscriber_id: req.body.subscriber_id });

    if (check_for_id === null) {
      reply.send({
        success: false,
        error: "User does not exist",
      });
      return;
    }

    await client.db("EgloNS").collection("Users").deleteOne({
      subscriber_id: req.body.subscriber_id,
    });

    reply.send({
      success: true,
    });
  } catch (e) {
    console.log(e);
    reply.send({
      success: false,
      error: "Failed to delete user, check ENS console",
    });
  }
});

fastify.post("/set-email", async function handler(req, reply) {
  try {
    const client = get();

    let check_for_id = await client
      .db("EgloNS")
      .collection("Users")
      .findOne({ subscriber_id: req.body.subscriber_id });

    if (check_for_id === null) {
      reply.send({
        success: false,
        error: "User does not exist",
      });
      return;
    }

    await client
      .db("EgloNS")
      .collection("Users")
      .updateOne(
        { subscriber_id: req.body.subscriber_id },
        {
          $set: {
            email: req.body.email,
          },
        }
      );

    reply.send({
      success: true,
    });
  } catch (e) {
    console.log(e);
    reply.send({
      success: false,
      error: "Failed to change setting, check ENS console",
    });
  }
});

fastify.post("/read-notification", async function handler(req, reply) {
  try {
    const client = get();

    let check_for_id = await client
      .db("EgloNS")
      .collection("Users")
      .findOne({ subscriber_id: req.body.subscriber_id });

    if (check_for_id === null) {
      reply.send({
        success: false,
        error: "User does not exist",
      });
      return;
    }

    await client
      .db("EgloNS")
      .collection("Users")
      .updateOne(
        {
          subscriber_id: req.body.subscriber_id,
          "notifications.id": req.body.notification_id,
        },
        {
          $set: {
            "notifications.$.read": true,
          },
        }
      );

    reply.send({
      success: true,
    });
  } catch (e) {
    console.log(e);
    reply.send({
      success: false,
      error: "Failed to mark as read, check ENS console",
    });
  }
});

fastify.post("/delete-notification", async function handler(req, reply) {
  try {
    const client = get();

    let check_for_id = await client
      .db("EgloNS")
      .collection("Users")
      .findOne({ subscriber_id: req.body.subscriber_id });

    if (check_for_id === null) {
      reply.send({
        success: false,
        error: "User does not exist",
      });
      return;
    }

    await client
      .db("EgloNS")
      .collection("Users")
      .updateOne(
        {
          subscriber_id: req.body.subscriber_id,
          "notifications.id": req.body.notification_id,
        },
        {
          $pull: { notifications: { id: req.body.notification_id } },
        }
      );

    reply.send({
      success: true,
    });
  } catch (e) {
    console.log(e);
    reply.send({
      success: false,
      error: "Failed to delete, check ENS console",
    });
  }
});

fastify.post("/clear-notifications", async function handler(req, reply) {
  try {
    const client = get();

    let check_for_id = await client
      .db("EgloNS")
      .collection("Users")
      .findOne({ subscriber_id: req.body.subscriber_id });

    if (check_for_id === null) {
      reply.send({
        success: false,
        error: "User does not exist",
      });
      return;
    }

    await client
      .db("EgloNS")
      .collection("Users")
      .updateOne(
        { subscriber_id: req.body.subscriber_id },
        {
          $set: {
            notifications: [],
          },
        }
      );

    reply.send({
      success: true,
    });
  } catch (e) {
    console.log(e);
    reply.send({
      success: false,
      error: "Failed to clear notifications, check ENS console",
    });
  }
});

fastify.post("/notify", async function handler(req, reply) {
  try {
    const client = get();

    for (const user of req.body.subscribers) {
      let found_user = await client.db("EgloNS").collection("Users").findOne({
        subscriber_id: user,
      });

      if (found_user !== null) {
        let notification_id = uuidv4();

        await client
          .db("EgloNS")
          .collection("Users")
          .updateOne(
            { subscriber_id: user },
            {
              $push: {
                notifications: {
                  icon: req.body.icon,
                  title: req.body.title,
                  text: req.body.text,
                  read: false,
                  id: notification_id,
                },
              },
            }
          );

        await client
          .db("EgloNS")
          .collection("Users")
          .updateOne(
            { subscriber_id: user },
            {
              $set: {
                last_notification_time: Date.now(),
              },
            }
          );
      }
    }

    reply.send({
      success: true,
    });
  } catch (e) {
    console.log(e);
    reply.send({
      success: false,
      error: "Failed to notify user(s), check ENS console",
    });
  }
});

fastify.post("/get-notifications", async function handler(req, reply) {
  try {
    const client = get();

    let check_for_id = await client
      .db("EgloNS")
      .collection("Users")
      .findOne({ subscriber_id: req.body.subscriber_id });

    if (check_for_id === null) {
      reply.send({
        success: false,
        error: "User does not exist",
      });
      return;
    }

    await client
      .db("EgloNS")
      .collection("Users")
      .updateOne(
        { subscriber_id: req.body.subscriber_id },
        {
          $set: {
            last_updated_time: Date.now(),
          },
        }
      );

    let user = await client
      .db("EgloNS")
      .collection("Users")
      .findOne({ subscriber_id: req.body.subscriber_id });

    reply.send(user.notifications);
  } catch (e) {
    console.log(e);
    reply.send({
      success: false,
      error: "Failed to get notifications, check ENS console",
    });
  }
});

cron.schedule("0 0 * * *", async () => {
  //cron.schedule("* * * * *", async () => {
  try {
    function formatDate(unixTimestamp) {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const date = new Date(unixTimestamp); // No need to multiply by 1000
      const month = months[date.getMonth()];
      const day = date.getDate();

      const formattedDate = `${month} ${day}`;
      return formattedDate;
    }

    const client = get();

    let all_users_with_email = await client
      .db("EgloNS")
      .collection("Users")
      .find({ email: { $ne: "" } })
      .toArray();

    for (const user of all_users_with_email) {
      let user_data = await client
        .db("EgloNS")
        .collection("Users")
        .findOne({ subscriber_id: user.subscriber_id });

      let fun_fact = await axios
        .get("https://catfact.ninja/fact")
        .catch((error) => {
          console.log(error);
          return;
        });

      const emailData = {
        from: "Eglo Notification Service <recover@main.eglo.pw>",
        to: user_data.email,
        subject: "Your Eglo Notification summary",
        html:
          '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> <meta http-equiv="x-ua-compatible" content="ie=edge"> <meta name="x-apple-disable-message-reformatting"> <meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="format-detection" content="telephone=no, date=no, address=no, email=no"> <style type="text/css"> body,table,td{font-family:Helvetica,Arial,sans-serif !important}.ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:150%}a{text-decoration:none}*{color:inherit}a[x-apple-data-detectors],u+#body a,#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}img{-ms-interpolation-mode:bicubic}table:not([class^=s-]){font-family:Helvetica,Arial,sans-serif;mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;border-collapse:collapse}table:not([class^=s-]) td{border-spacing:0px;border-collapse:collapse}@media screen and (max-width: 600px){.w-full,.w-full>tbody>tr>td{width:100% !important}.w-24,.w-24>tbody>tr>td{width:96px !important}.p-lg-10:not(table),.p-lg-10:not(.btn)>tbody>tr>td,.p-lg-10.btn td a{padding:0 !important}.p-3:not(table),.p-3:not(.btn)>tbody>tr>td,.p-3.btn td a{padding:12px !important}.p-6:not(table),.p-6:not(.btn)>tbody>tr>td,.p-6.btn td a{padding:24px !important}*[class*=s-lg-]>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}.s-4>tbody>tr>td{font-size:16px !important;line-height:16px !important;height:16px !important}.s-5>tbody>tr>td{font-size:20px !important;line-height:20px !important;height:20px !important}.s-6>tbody>tr>td{font-size:24px !important;line-height:24px !important;height:24px !important}.s-10>tbody>tr>td{font-size:40px !important;line-height:40px !important;height:40px !important}}</style> </head> <body class="bg-light" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#f7fafc"> <table class="bg-light body" valign="top" role="presentation" border="0" cellpadding="0" cellspacing="0" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#f7fafc"> <tbody> <tr> <td valign="top" style="line-height: 24px; font-size: 16px; margin: 0;" align="left" bgcolor="#f7fafc"> <table class="container" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;"> <tbody> <tr> <td align="center" style="line-height: 24px; font-size: 16px; margin: 0; padding: 0 16px;"><!--[if (gte mso 9)|(IE)]> <table align="center" role="presentation"> <tbody> <tr> <td width="600"><![endif]--> <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;"> <tbody> <tr> <td style="line-height: 24px; font-size: 16px; margin: 0;" align="left"> <table class="s-10 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;" align="left" width="100%" height="40"> &#160; </td></tr></tbody> </table> <table class="ax-center" role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;"> <tbody> <tr> <td style="line-height: 24px; font-size: 16px; margin: 0;" align="left"> <img class="w-24" src="https://cdn.eglo.pw/api/public/dl/YJR44Ju-?inline=true" style="height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; width: 96px; border-style: none; border-width: 0;" width="96"> </td></tr></tbody> </table> <table class="s-10 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;" align="left" width="100%" height="40"> &#160; </td></tr></tbody> </table> <table class="card p-6 p-lg-10 space-y-4" role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-radius: 6px; border-collapse: separate !important; width: 100%; overflow: hidden; border: 1px solid #e2e8f0;" bgcolor="#ffffff"> <tbody> <tr> <td style="line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 40px;" align="left" bgcolor="#ffffff"> <h1 class="h3 fw-700" style="padding-top: 0; padding-bottom: 0; font-weight: 700 !important; vertical-align: baseline; font-size: 28px; line-height: 33.6px; margin: 0;" align="left"> Notification sumary </h1> <table class="s-4 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;" align="left" width="100%" height="16"> &#160; </td></tr></tbody> </table> <p class="" style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"> Here is your daily Eglo Notification summary: </p><table class="s-4 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;" align="left" width="100%" height="16"> &#160; </td></tr></tbody> </table> <table class="s-10 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;" align="left" width="100%" height="40"> &#160; </td></tr></tbody> </table> <div class=""> <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">You currently have</p><h1 style="padding-top: 0; padding-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 36px; line-height: 43.2px; margin: 0;" align="left">' +
          user_data.notifications.length +
          ' Notifications</h1> </div><table class="s-4 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;" align="left" width="100%" height="16"> &#160; </td></tr></tbody> </table> <table class="s-10 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;" align="left" width="100%" height="40"> &#160; </td></tr></tbody> </table> <div class=""> <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Your last notification was on</p><h1 style="padding-top: 0; padding-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 36px; line-height: 43.2px; margin: 0;" align="left"> ' +
          formatDate(user_data.last_notification_time) +
          '</h1> </div><table class="s-4 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;" align="left" width="100%" height="16"> &#160; </td></tr></tbody> </table> <table class="s-10 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;" align="left" width="100%" height="40"> &#160; </td></tr></tbody> </table> <div class=""> <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Fun cat fact</p><h1 style="padding-top: 0; padding-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 36px; line-height: 43.2px; margin: 0;" align="left"> ' +
          fun_fact.data.fact.slice(0, -1) +
          ' </h1> </div><table class="s-4 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;" align="left" width="100%" height="16"> &#160; </td></tr></tbody> </table> <table class="s-5 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 20px; font-size: 20px; width: 100%; height: 20px; margin: 0;" align="left" width="100%" height="20"> &#160; </td></tr></tbody> </table> <div class=""> <table class="btn btn-primary p-3 fw-700" role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-radius: 6px; border-collapse: separate !important; font-weight: 700 !important;"> <tbody> <tr> <td style="line-height: 24px; font-size: 16px; border-radius: 6px; font-weight: 700 !important; margin: 0;" align="center" bgcolor="#0d6efd"> <a href="https://app.eglo.pw" style="color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, sans-serif; text-decoration: none; border-radius: 6px; line-height: 20px; display: block; font-weight: 700 !important; white-space: nowrap; background-color: #0d6efd; padding: 12px; border: 1px solid #0d6efd;">Login</a> </td></tr></tbody> </table> </div></td></tr></tbody> </table> <table class="s-6 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;" align="left" width="100%" height="24"> &#160; </td></tr></tbody> </table> <div class="text-muted text-center" style="color: #718096;" align="center"> Sent with &lt;3 from Eglo Development. <br><br>You can disable Eglo Summary from your settings.<br></div><table class="s-6 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%"> <tbody> <tr> <td style="line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;" align="left" width="100%" height="24"> &#160; </td></tr></tbody> </table> </td></tr></tbody> </table><!--[if (gte mso 9)|(IE)]> </td></tr></tbody> </table><![endif]--> </td></tr></tbody> </table> </td></tr></tbody> </table> </body></html>',
      };

      const headers = {
        Authorization: `Bearer ${resendAccessToken}`,
        "Content-Type": "application/json",
      };

      await axios
        .post("https://api.resend.com/emails", emailData, { headers })
        .catch((error) => {
          console.log(error);
        });

      console.log("Sent email to " + user_data.subscriber_id);
    }
  } catch (e) {
    console.log(e);
  }
});

if (process.env.ENVIROMENT === "local") {
  fastify.listen({ port: 3000 }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
}

if (process.env.ENVIROMENT === "docker") {
  fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
}
