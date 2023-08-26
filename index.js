const fastify = require("fastify")({ logger: true });
const mongodb_init = require(__dirname + "/mongodb");
const { get } = require("./mongodb");
const { v4: uuidv4 } = require("uuid");

mongodb_init();

fastify.get("/", function handler(request, reply) {
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
      preferred_notification_method: req.body.preferred_notification_method,
      email: req.body.email,
      phone: req.body.phone,
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

fastify.post("/set-preferred-method", async function handler(req, reply) {
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
        { subscriber_id: user },
        {
          $set: {
            preferred_notification_method:
              req.body.preferred_notification_method,
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
        { subscriber_id: user },
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

fastify.post("/set-phone", async function handler(req, reply) {
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
        { subscriber_id: user },
        {
          $set: {
            phone: req.body.phone,
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

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
