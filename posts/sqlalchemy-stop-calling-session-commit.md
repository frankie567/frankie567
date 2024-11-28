---
title: 'SQLAlchemy: stop calling `session.commit()`'
date: '2024-03-08T11:01:55.124406+00:00'
tags:
  - Python
  - Backend development
excerpt: Discover why calling `session.commit()` frequently in SQLAlchemy can lead to issues and learn the best practices for managing transactions effectively.
thumbnail: /posts/images/sqlalchemy-stop-calling-session-commit/thumbnail.svg
---

When programming, you probably often have, like me, those *Aha!* moments: when things that were not really clear or obvious in your mind suddenly start to make sense. This week, I had one of these... Even if it turned out to also be a *Doh!* moment 😰

This time, it was brought to me by [SQLAlchemy](https://www.sqlalchemy.org/). This Python library is the de-facto standard for working with SQL databases. It's *super* powerful... But also hard to tame.

So let's review a code snippet, typical of what I was doing when working with SQLAlchemy. Let's say we have [SQLAlchemy ORM models](https://docs.sqlalchemy.org/en/20/orm/mapping_styles.html#orm-declarative-mapping) called `User` and `Post` and a ready-to-use [engine](https://docs.sqlalchemy.org/en/20/core/connections.html#sqlalchemy.engine.Engine).

```py
def create_user(session):
	user = User(email="king.arthur@camelot.bt")
	session.add(user)
	session.commit()
	return user

def create_post(session, user):
	post = Post(title="SQLAlchemy: stop calling `session.commit()`", user=user)
	session.add(post)
	session.commit()
	return post

def main():
	with Session(engine) as session:
		user = create_user(session)
		post = create_post(session, user)
```

If that looks okay to you, then read this post in full. Because you're doing it **wrong**.

# `session.commit()` is not your friend

The core of SQLAlchemy usage is the [`Session`](https://docs.sqlalchemy.org/en/20/orm/session_api.html#sqlalchemy.orm.Session) object. Under the hood, besides maintaining ORM objects state, it also manages an **SQL transaction**. It means that you can safely perform queries: if something goes wrong along the way, you can always **rollback** to the previous state, leaving the DB untouched...

... unless you call `session.commit()`.

This method does two things:

1. It flushes all the pending changes to the database (objects creation, update, deletion, etc.).
2. It `COMMIT` the SQL transaction, as its name rightfully suggest: the changes are definitely written to the DB and there is no way back.

Meaning that, if you need to `ROLLBACK`, that's too late. **Even if you are in a nested transaction**. What does it mean if we go back to our example?

Let's say something goes wrong during `create_post`: an API call fails, a bug (😱) occurs, the server shuts down abruptly... The result is that you'll have a user in your database, but not the post; meaning your database is an incoherent state. If you want to retry the task, you'll likely have issues since they are already half of the objects there.

So, what should our example look like to avoid this?

```py
def create_user(session):
	user = User(email="king.arthur@camelot.bt")
	session.add(user)
	return user

def create_post(session, user):
	post = Post(title="SQLAlchemy: stop calling `session.commit()`", user=user)
	session.add(post)
	return post

def main():
	with Session(engine) as session:
		user = create_user(session)
		post = create_post(session, user)
        session.commit()
```

That's the key takeaway of this post. Write it on a post-it. Stick it on your screen:

<p style="text-align:center;font-size: 1.5em;font-weight:bold;color:red">Call session.commit() only once at the end</p>

Said another way, if you have `session.commit()` calls in your business logic, it's a **code smell**.

Generally speaking, `session.commit()` should only appear in "lifecycle" logic, which is managed by your framework or global application scope: a FastAPI dependency, a middleware, a context manager, etc.

# `session.flush()` is probably what you want

At this point, you probably want to ask: *"Ok, but what if I need to execute queries along the way? Or if I want to trigger the database integrity checks or defaults?"* That's indeed a perfectly legitimate concern.

In a complex program, we might create dozens of object in one operation and perform a `SELECT` query, expecting our new data to be available. That's probably why you called `session.commit()` at first.

What you want is actually `session.flush()`. Basically, it's only the first step of the `session.commit()` operation: it sends pending operation to the database, but the transaction is **not** committed. So, it allows us to do this kind of things:

```py
def handle_payment(session, account, amount, fees):
    payment_transaction = Transaction(amount=amount, account=account)
    fees_transaction = Transaction(amount=-fees, account=account)

    session.add(payment_transaction)
    session.add(fees_transaction)

    session.flush()
    # payment_transaction and fees_transaction are flushed to the DB
    #but we're still in the transaction

    account_balance_statement = select(sum(Transaction.amount)).where(
        Transaction.account == account
    )
    account_balance = session.execute(account_balance_statement).scalar()

    account.balance = account_balance
    session.add(account)
```

Here, we are able to update the account balance knowing that the new transactions will be available to the `SELECT SUM...` statement; since we flushed right before. But we'll still have the chance to **rollback** if something goes wrong.

## Autoflush has your back

Actually, in our example above, calling `session.flush()` is not even needed. By default, whenever you `execute` a query, SQLAlchemy will automatically flush pending changes. That's `autoflush`. Most of the time, you probably don't need to worry about it. Don't disable it.

# Conclusion

As I mentioned in introduction, it truly was an *Aha!* moment for me, and now that I re-read this post, it feels so obvious.

And it's also a *Doh!* moment for two reasons:

1. I have to revisit lot of things on the codebases I work on (including Polar).
2. This is actually very well explained in SQLAlchemy documentation, but I missed it: https://docs.sqlalchemy.org/en/20/orm/session_basics.html#when-do-i-construct-a-session-when-do-i-commit-it-and-when-do-i-close-it

Therefore, I hope you'll find this post before it's too late so you can use SQLAlchemy sessions *the right way*. Cheers 😉
