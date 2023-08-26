# EgloNS
## _Eglo Notification Service_

[[EGLO]](https://eglo.pw)

Simple and easy to use POST Request based notification service.

- Simple
- Easy to use
- ✨Magic ✨

## Features:

EgloNS is a simple notifcation service, supporting email notifications, text messages, and in-app notifications.

> NOTE: It is easy to mess up, as there is minimal server-side validation,
> just follow the docs

## Installation:

> This requires having Docker installed

+ Download the Github repository
+ Create a MongoDB instance
+ Run the server with Docker after you build the file
+ Add the .env based off of the "example.env" provided in the repository
+ You should now be good to go, visit localhost:3000 (or where you have set it to run)
+ If you have any issues, email contact@eglo.pw, or make a GitHub issue

## Routes:
**ALL OF THESE ARE POST REQUESTS, AND EITHER RETURN SUCCESS TRUE OR FALSE**

Add new subscriber
>http://localhost:3000/new-subscriber
```sh
{
    subscriber_id: "unique identifier" (string),
    receiving_notifcations: true/false (boolean),
    preferred_notification_method: "in-app/email/phone" (string),
    email: "email address" (string),
    phone: "phone number" (string)
    
}
```

Delete subscriber
>http://localhost:3000/delete-subscriber
```sh
{
    subscriber_id: "unique identifier" (string)
}
```

Set preferred method
>http://localhost:3000/set-preferred-method
```sh
{
    subscriber_id: "unique identifier" (string),
    preferred_notification_method: "in-app/email/phone" (string)
}
```

Set email
>http://localhost:3000/set-email
```sh
{
    subscriber_id: "unique identifier" (string),
    email: "email address" (string)
}
```

Set phone
>http://localhost:3000/set-email
```sh
{
    subscriber_id: "unique identifier" (string),
    phone: "phone number" (string)
}
```

Read notification
>http://localhost:3000/read-notification
```sh
{
    subscriber_id: "unique identifier" (string),
    notification_id: "unique identifier" (string)
}
```

Clear notifications
>http://localhost:3000/clear-notifications
```sh
{
    subscriber_id: "unique identifier" (string)
}
```

Notify users
>http://localhost:3000/notify
```sh
{
    subscribers: ["array", "of", "unique", "identifiers"] (array/string),
    icon: "url to icon" (string),
    title: "title of notification" (string),
    text: "subtext for notification" (string)
}
```

Get notifications
>http://localhost:3000/get-notifications
```sh
{
    subscriber_id: "unique identifier" (string)
}
```

## ???:
If I am being honest I wrote this at 1AM and my English isnt goog, if there is anything that needs to be improved or you need help just email us (contact@eglo.pw) or make a pull/merge request, or submit and issue. Sorry for the bad code, but at least it works.