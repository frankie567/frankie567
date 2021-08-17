---
title: 'Asynchronous programming is now a thing in Python'
date: '2020-04-14T12:00:00.000Z'
tags:
  - Backend development
canonical: https://www.beemydesk.com/blog/asynchronous-programming-is-now-a-thing-in-python
excerpt: Let's talk about asynchronous I/O, what it is, how it works and why it's becoming a popular pattern in Python.
thumbnail: /posts/images/asynchronous-programming-thing-python/cover.jpg
---

Asynchronous programming have become very popular in the recent years, NodeJS being the locomotive of this trend, highly encouraging the async style and backed by impressive benchmarks.

In recent months, other languages have started to catch up, implementing their own flavor of asynchronous style. Among them, of course, almighty Python (*did I tell you I love Python?*).

But before talking about the Python ecosystem, let's have a quick overview of how asynchronous programming actually works.

## How does asynchronous work?

The main motivation behind asynchronous style can be summed up in one simple statement: I/O is painfully slow. Reading from disk, networks requests, are million times slower than reading from RAM and processing instructions. Traditionally, in a synchronous program, you would do things like this:

```py
with open("file.txt") as f:
    data = f.read()
# The program will block here until the data has been read
print(data)
```

We see that the program will block until we retrieved the data from the disk ; and, as we said, this can be long. 99% percent of the execution time of the program is just to wait for the disk. It's usually not a big deal for simple scripts like this because you probably don't have to perform other operations meanwhile.

However, in more complex cases, this is a waste of resources that could have been used to perform **other things**. For example, think of a web server: if a first user makes a request that needs to block the program for 10 seconds, a second user making a request meanwhile would have to wait for the first one to finish before they get answered. We can simulate this behaviour quite easily with flask and gunicorn:

```py
# app.py
import time
from flask import Flask, request

app = Flask(__name__)

@app.route("/slow")
def slow():
    time.sleep(10)
    return "That was slow!"

@app.route("/fast")
def fast():
    return "That was fast!"
```

```sh
gunicorn --workers=1 app:app
```

If you hit the `/slow` endpoint and right after the `/fast` endpoint, you'll see that you get the `/fast` response only when `/slow` has answered (after 10 seconds have passed).

To circumvent this, web servers usually spawn several threads (notice that we purposely started gunicorn with 1 worker) to be able to serve several users at a time, even if one request takes time to complete.

Solution adopted in asynchronous style doesn't involve threads, as they come with their own difficulties. Asynchronous frameworks implement a concept you probably have already heard of: **event loops**.

An event loop basically is the conductor of your program: at each iteration, it'll check for the completion of the tasks, yield the result if it's done, and go on to the next task. As a developer, your role is thus to send tasks to the event loop, knowing that you'll eventually get their result. Let's rebuild our previous example asynchronously with FastAPI and Uvicorn:

```py
# app.py
import asyncio
from fastapi import FastAPI

app = FastAPI()

@app.get("/slow")
async def slow():
    await asyncio.sleep(10)
    return "That was slow!"

@app.get("/fast")
async def fast():
    return "That was fast!"
```

```sh
uvicorn --workers=1 app:app
```

If you spawn the two requests at the same time like earlier, you'll see that `/fast` has answered immediately, not waiting for `/slow` to finish: the event loop put the `/slow` request in its queue, and moved on to the next one.

Notice that we traded `time.sleep` for `asyncio.sleep`. This is important because the event loop can only manage asynchronous tasks, that give back control to their caller. If you keep `time.sleep`, you'll experience the same behaviour as in the previous example: the thread will be blocked because it didn't yielded to the event loop.

Fine. But how does that solve our I/O problem? If we want to work with our event loop, I/O operations have to work asynchronously. To do this, we leverage an interesting feature of the operating systems: the select and poll calls (and derivatives). Those allow to ask the OS to ping us when something happened on a file or a socket (new data to read, ready to write data...). By using them, we allow the event loop to put the I/O calls in background and handle them once the OS notified us.

That was a very simplified overview of how asynchronous is implemented. If you wish to have a more complete and correct view of what is going on under the hood, be sure to check the references.

## The Python async ecosystem

`asyncio` module is included since Python 3.4 (2014!), and the async/await syntax since Python 3.5. Both have been greatly refined in 3.6 and 3.7; making the use of async style very easy. Logically, the ecosystem has grown since: there are now solid libraries ready for production use. We will just cite a few of them:

* [Starlette](https://www.starlette.io/), an impressively fast and clean framework to build web applications ;
* Its offspring, [FastAPI](https://fastapi.tiangolo.com/), which builds upon Starlette and [Pydantic](https://pydantic-docs.helpmanual.io/) to propose a very efficient developer experience to build API ;
* [HTTPX](https://github.com/encode/httpx), an async-compatible HTTP client with a requests-like API.
* [Tortoise ORM](https://tortoise-orm.readthedocs.io/en/latest/), a Django-like ORM.
* [Motor](https://motor.readthedocs.io/en/stable/index.html), an official MongoDB client.

All those tools allow to build performant web services leveraging the power of the asynchronous paradigm.

## Conclusion

Asynchronous programming is a very interesting pattern that can greatly improve performance in some contexts, especially in web servers. While it has been the privilege of NodeJS for quite some time, other languages are now catching up and it's great to see that Python community is becoming more and more involved in this trend.

As a Python and FastAPI enthusiast, I'm glad to contribute to this ecosystem by releasing open-source libraries like [FastAPI Users](https://github.com/frankie567/fastapi-users) or [HTTPX OAuth](https://github.com/frankie567/httpx-oauth).

## References

* https://en.wikipedia.org/wiki/Asynchronous_I/O
* https://en.wikipedia.org/wiki/Async/await
* https://docs.python.org/3/library/selectors.html
* https://trio.readthedocs.io/en/stable/tutorial.html
* https://trio.readthedocs.io/en/stable/design.html
* https://stackoverflow.com/questions/49005651/how-does-asyncio-actually-work
* http://blog.mixu.net/2011/02/01/understanding-the-node-js-event-loop/
* https://snarky.ca/how-the-heck-does-async-await-work-in-python-3-5/
* https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/
