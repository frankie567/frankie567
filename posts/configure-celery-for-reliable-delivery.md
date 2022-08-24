---
title: 'Configure Celery for reliable delivery'
date: '2022-08-24T12:00:00.000Z'
tags:
  - Backend development
  - Data engineering
excerpt: A comprehensive recipe to make Celery restart unfinished tasks after server failure.
thumbnail: /posts/images/configure-celery-for-reliable-delivery/cover.jpg
---

[Celery](https://docs.celeryq.dev/en/stable/index.html) is probably the most used task runner in the Python ecosystem. Yet, I've found today that configuring it to support a basic scenario for such a critical piece in a software architecture surprisingly difficult and poorly documented.

So, what's the problem? Let's say we have a task taking several minutes to run. Imagine now that we have a server failure, completely independent of our source code: a server restart, a power failure, etc. Thus, the task was stopped in the middle of execution and didn't finished. Fine! Things like that happen often with computers 😏 All we want now is Celery to **execute the task again** after the server restart!

Well, actually, by default: **it won't** 🥹 This is actually an [intended default](https://docs.celeryq.dev/en/stable/userguide/tasks.html#Task.acks_late) of Celery. By the way, this is one of the [main painpoint raised by the author of Dramatiq](https://dramatiq.io/motivation.html#id2), a competing library.

Fortunately, there is a way to do it! And this blog post will save you hours of research 🙃

## TL;DR

Here is the configuration you need to apply for this to work:

```py
app = Celery(
    "tasks",
    broker="YOUR_BROKER",
    backend="YOUR_BACKEND",
)
app.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_state_db="./celery-state.db",
)
```

Don't go now! I highly recommend you to read the rationale about it 👇

## Rationale

So what those options are doing? Basically, we need to tell Celery:

* To acknowledge the task *after* their completion, not right before (`task_acks_late`).
* To reject the task if the worker is lost or shutdown (`task_reject_on_worker_lost`).
* By default, task rejections are persisted only in memory and thus lost if the server is stopped. So we need to setup a state file (`worker_state_db`).

## The visibility timeout quirk

Still, if you test to manually kill the worker while a long task is running before restarting it, you'll see that the task looks like **stuck and never re-executed**.

Actually, this is **normal** behavior. Why? Because tasks are not re-delivered until they reach the **visibility timeout**. And by default, this timeout is 1 hour. It means that your pending task will be executed again in 1 hour.

If you set this value to 30 seconds, you'll see that your task will get executed again within 30 seconds.

It might be tempting to decrease this visibility timeout and keep a very low value but bear in mind that it'll apply for **every tasks**, not only the crashed ones. If you have a task that takes more than 1 hour to execute, it'll be automatically rescheduled on another worker. That's why it's important to keep it quite high, especially if we have long tasks to run.

## References

* https://docs.celeryq.dev/en/stable/faq.html#faq-acks-late-vs-retry
* https://docs.celeryq.dev/en/stable/userguide/configuration.html#task-acks-late
* https://docs.celeryq.dev/en/stable/userguide/configuration.html#task-reject-on-worker-lost
* https://docs.celeryq.dev/en/stable/userguide/workers.html#persistent-revokes
* https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/redis.html#id1
