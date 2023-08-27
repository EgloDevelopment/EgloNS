# EgloNS
## _Eglo Notification Service_

[[EGLO]](https://eglo.pw)

Simple and easy to use POST Request based notification service.

- Simple
- Easy to use
- ✨Magic ✨

## Features:

Supports email and in-app notifications.
Send a daily summary of notifications.
Easy to setup.

> NOTE: It is easy to mess up, as there is minimal server-side validation,
> just follow the docs

## Installation:

> This requires having Docker installed

+ Download the Github repository
+ Create a MongoDB instance
+ Run the server with Docker after you build the file
+ Add the .env based off of the "example.env" provided in the repository (YOU MUST HAVE A RESEND.COM TOKEN)
+ You should now be good to go, visit localhost:3000 (or where you have set it to run)
+ If you have any issues, email contact@eglo.pw, or make a GitHub issue

## Routes:
**ALL OF THESE ARE POST REQUESTS, AND EITHER RETURN SUCCESS TRUE OR FALSE**

Add new subscriber
>http://localhost:3000/new-subscriber
```sh
{
    subscriber_id: "unique identifier" (string),
    email: "email address" (string)
    
}
```

Delete subscriber
>http://localhost:3000/delete-subscriber
```sh
{
    subscriber_id: "unique identifier" (string)
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

# Settings
Daily notification summary can be disabled by not having any users with an email, just set the email when you register a new subscriber to "".

At some point we will add text-messaging support. 

## ???:
If I am being honest I wrote this at 1AM and my English isnt goog, if there is anything that needs to be improved or you need help just email us (contact@eglo.pw) or make a pull/merge request, or submit and issue. Sorry for the bad code, but at least it works.