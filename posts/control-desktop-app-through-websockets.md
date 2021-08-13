---
title: 'Control a desktop app through web with WebSockets'
date: '2018-12-13T12:00:00.000Z'
tags:
  - Backend development
canonical: https://medium.com/@fvoron/control-a-desktop-app-through-web-with-websockets-41626d949e3b
excerpt: We demonstrate a way to develop a web interface able to communicate with a desktop client thanks to WebSockets.
thumbnail: /posts/images/control-desktop-app-through-websockets/cover.png
---

Most services we are using nowadays are web-based, and it’s easy to understand why: for the developers, it’s easy to develop, maintain and update. The users have nothing to install and can start to use the product in just a few clicks.

Thanks to the evolution of web technologies these last few years, we can indeed have interactive interfaces that have nothing to envy to good-old desktop applications.

However, in some use cases, a desktop app is still needed. Think for example about services that need to access your local files to synchronize them, like Dropbox or Wuha. It could also be an app that needs to access the local devices, like your GPS in order to update the map.

For this to work, we need them to develop an app with a desktop interface, different and separated from our web one. Painful, hard to maintain, very different from web technologies (we’ll probably need a dedicated developer for that).

**What if we could just have a daemon process giving us access to the local computer that we could control from our web service?**

## Hello, WebSockets!

The problem here is to make the desktop process able to send and receive data to and from our web service. Traditionally, a client makes requests to a server synchronously: its posts the data of a form, and gets a response in return.

![Desktop making HTTP requests to server](/posts/images/control-desktop-app-through-websockets/desktop-server.png "Desktop making HTTP requests to server")

However, how can the server **send** requests to the desktop ? It can’t. Unless we also make the desktop app a server itself. It comes with loads of issues: firewall rules? Proxying? Security? We need a better alternative.

Here comes **WebSockets**: it’s a web standard protocol aiming at opening a full-duplex communication channel between a client and a server. In other words, it opens a tunnel in which correspondents can both **send and receive messages**.

![WebSocket between server and desktop](/posts/images/control-desktop-app-through-websockets/websocket.png "WebSocket between server and desktop")

So, now, what about the **web interface** ? Well, we can just open a WebSocket between the browser and the server ; then, the server will forward the messages from the browser to the desktop app and conversely.

![Server making the bridge between the WebSockets of web and desktop](/posts/images/control-desktop-app-through-websockets/web-server-client.png "Server making the bridge between the WebSockets of web and desktop")

Enough talking, now, let’s code!

## Thank you, NodeJS, but we’ll take it from here

![NodeJS getting bitten by a Python](/posts/images/control-desktop-app-through-websockets/rogue-nodejs.jpeg)

While asynchronous paradigm has been the prerogative of NodeJS for a while, many other languages have now implemented an asynchronous API ; like Python, a *real* language we **all** love (if you don’t, well, you **should** love it).

Why I talk about asynchronous programming? Because we’ll use the Python [Starlette framework](https://github.com/encode/starlette) (from the creator of Django REST framework) which is an API framework leveraging the power of `asyncio`. It also implements an API to create a WebSocket server.

### Prototype

We’ll implement a very simple prototype:

* The server will match a web client and a desktop client through a client_id, and broadcast the messages between them.
* The desktop will report the computer CPU usage each second and make a beep when it receives the appropriate message.
* The web will display the CPU usage it receives and will propose a button to send the beep message.

We’ll go through some parts of the code. The entire implementation is available on GitHub. Try it yourself!

<iframe id="ghcard-frankie567-1" frameborder="0" scrolling="0" allowtransparency="true" src="//cdn.jsdelivr.net/github-cards/1.0.2/cards/default.html?user=frankie567&amp;identity=ghcard-frankie567-1&amp;repo=remote-desktop-control" width="100%" height="150"></iframe>

### Server

The server just accepts WebSockets connections and matches a web client and a desktop client to broadcast the messages between them.

```py
@app.websocket_route('/ws')
async def websocket_endpoint(websocket):
    await websocket.accept()

    # "Authentication" message
    message = await receive_json(websocket)
    client_mode = message['client_mode']
    client_id = message['client_id']
    websockets[client_mode][client_id] = websocket
```

As you can see, serving a WebSocket is a piece of cake with Starlette. After having established the connection, we expect the client to send us an “authentication” message so that we can match it with the other client.

Obviously, in a real-world application, we would have a proper authentication with a token.

We keep the websocket in memory so that we can broadcast messages into it:

```py
try:
    # Broadcast it to the mirror client
    await websockets[mirror_mode][client_id].send_text(
        json.dumps(message)
    )
except KeyError:
    logger.debug(
        f'Client {client_id}[{mirror_mode}] not connected'
    )
```

### Desktop

The desktop also uses the `asyncio` API to report the CPU usage every seconds and reacts to the beep messages.

```py
async def handler(uri, client_id):
    async with websockets.connect(uri) as websocket:
        message = {
            'event': 'authentication',
            'client_id': client_id,
            'client_mode': 'desktop'
        }
        await websocket.send(json_to_payload(message))

        consumer_task = asyncio.ensure_future(
            consumer_handler(websocket))
        producer_task = asyncio.ensure_future(
            cpu_usage_reporter(websocket))
        done, pending = await asyncio.wait(
            [consumer_task, producer_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()
```

### Web

Connecting to WebSockets is very easy in browsers. Just a few lines of JavaScript is enough.

### Let’s see it in action

<iframe width="560" height="315" src="https://www.youtube.com/embed/exkqQUW9O_A" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## One interface to rule them all

We have demonstrated an easy way to create a communication channel between a desktop process and a web-based interface by using standard WebSockets.

Approaches like this allow us to **access the local resources** of the computer while **keeping the user in the same, unique interface**. Less confusion, less code to maintain.
