---
title: typing.Annotated, the new Python cool
date: '2024-01-25T15:54:27.879683+00:00'
tags:
    - Python
    - Backend development
excerpt: Explore the power of `typing.Annotated` in Python, a construct that enhances type hints with additional metadata. Learn how it is revolutionizing libraries like Pydantic, FastAPI, and SQLAlchemy by providing consistent type checking and runtime information.
thumbnail: /posts/images/typing-annotated-the-new-python-cool/thumbnail.svg
---

If, like me, you're a huge fan of what [Pydantic](https://docs.pydantic.dev/latest/) and [FastAPI](https://fastapi.tiangolo.com/) folks are doing, you can't have missed the new [`Annotated`](https://docs.python.org/3/library/typing.html#typing.Annotated) construct, which was introduced in Python 3.9. In a few months, we've seen lot of code examples changed from this:

```python
from uuid import uuid4

from pydantic import BaseModel, Field


class User(BaseModel):
    id: str = Field(default_factory=lambda: uuid4().hex)
```

to this:

```python
from uuid import uuid4

from typing_extensions import Annotated

from pydantic import BaseModel, Field


class User(BaseModel):
    id: Annotated[str, Field(default_factory=lambda: uuid4().hex)]
```

*This is taken directly from [Pydantic documentation](https://docs.pydantic.dev/latest/concepts/fields/#using-annotated).*

At first glance, it doesn't seem really useful or practical. But trust me, `Annotated` can grant *super-powers*. Pydantic and friends quickly understood that and they're already rely on it a lot. By the end of this post, you'll probably understand why 😉

> 👋 If you don't really know about type hints in Python, be sure to [check my previous post](/blog/write-better-python-code-faster-with-type-hints) before!

# Motivation 🥱

So, as you know, type hints gives us direct feedback about the validity of our types while coding. It also helps IDE give us smart auto-completions, which is very handy to list methods and their arguments. So, if we consider again the Pydantic's `User` class:

```py
class User(BaseModel):
    id: str = Field(default_factory=lambda: uuid4().hex)

u = User()
print(u.id)
```

`mypy` and friends know that `u.id` exists *and* that it's a string.

Great! But as you noticed, type annotations are not always enough on their own. It's frequent that we need **runtime information** to finely tune the behavior of the library we're using. Here, we used the `Field` class to tell Pydantic that, by default, we want it to generate an UUID4 for this `id`.

Can you see the problem it causes? We tell the type checker `id` is a string, but we actually assign it to a `Field` object 😱 *We're such scoundrels!*

That's because we use this attribute for two different things actually: tell the type it'll have on an **instance** and tell how we want the **class** to behave for this field. To make the type checker happy, Pydantic sets the `Field` return type to `Any`.

That's actually a very common pattern in Python libraries dealing with data modeling.  For example, this is how [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/index.html) solves this problem:

```py
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
```

They define a special type construct, `Mapped` which expects a generic type and plays well with the `mapped_column` return type. It's more correct semantically, but also a bit more involved for the user. Besides, SQLAlchemy team implemented a complete `mypy` plugin to handle this properly.

Another example of this problem is the dependency injection mechanism of FastAPI:

```py
from fastapi import Depends, FastAPI

app = FastAPI()


async def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}


@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons
```

*This is taken directly from [FastAPI documentation](https://fastapi.tiangolo.com/tutorial/dependencies/#__tabbed_1_4).*

The function `common_parameters` is responsible for retrieving pagination parameters in the URL parameters, and return them as a dictionary. To use it in our API endpoint, we use the `Depends` construct of FastAPI, so it knows it'll have to call this function when we receive a request.

Again, you see here the inconsistency between `commons` being a `dict`, while we're assigning it to a `Depends` object.

# `Annotated` to the rescue 🛟

`Annotated` was purposefully implemented to solve those problems: keep consistent and smart type checking *while* being able to add contextual information for the runtime.

Basically, it works like this:

```py
from typing import Annotated, get_type_hints

class User:
    id: Annotated[str, "This is a metadata"]
```

It's a generic type: the first argument should be the **type** you expect for your argument (here, an `int`). Then, you can have **any number of arguments** of whatever nature; here, the string `"This is a metadata"`.

Type checkers, like `mypy`, will only consider the first argument: the type. The rest can be used (or not) by the actual Python program's logic.

How? Well, like any other type annotations, it can be retrieved using the `get_type_hints` function:

```py
type_hints = get_type_hints(func, include_extras=True)
print(type_hints)  # {'id': typing.Annotated[str, 'This is a metadata']}
print(type_hints["id"].__metadata__)  # ('This is a metadata',)
```

Note that we need to set the `include_extras` argument to `True` to get metadata associated with `Annotated`. Then, once we have an `Annotated` object, we can retrieve this metadata as a tuple through the `__metadata__` attribute.

Now, things can go really wild!

# Working example ⚙️

Let's see how we can implement a class to define a data model with default values for attributes, using `Annotated`. The result we want to achieve will look like this:

```py
class User(DefaultModel):
    id: Annotated[str, Default(factory=lambda: uuid4().hex)]
    name: Annotated[str, Default(value="Anonymous")]
```

We'll be able to create data models and declare attributes with their types and default values if they're not provided by the user.

Since `Annotated` metadata can be anything, a clever and convenient way is to define specific classes that'll allow us to attach some data and behavior. Let's first define a `Default` class:

```py
class Default:
    """
    Class defining a behavior for default value,
    either with a static value or a function factory.
    """

    def __init__(
        self, *, value: Any | None = None, factory: Callable[[], Any] | None = None
    ) -> None:
        self.value = value
        self.factory = factory

    def get_default(self) -> Any:
        if self.value is not None:
            return self.value

        if self.factory is not None:
            return self.factory()

        raise RuntimeError()
```

It's a simple class that accepts either a static value or a factory function, allowing us to generate default values dynamically, like UUID or timestamps.

Now, we'll define a base class for our models, `DefaultModel`, that will define the logic to handle those annotations and fill the defaults.

```py
class DefaultModel:
    """
    Class able to parse type annotations using the `Default` class
    and fill the attributes accordingly if not provided.
    """

    def __init__(self, **kwargs) -> None:
        type_hints = get_type_hints(self, include_extras=True)
        # Iterate through each type-hinted attributes
        for attribute, type_hint in type_hints.items():
            try:
                # The value has been provided by the user
                value = kwargs[attribute]
            except KeyError:
                # Otherwise, look for `Annotated` type hint
                if hasattr(type_hint, "__metadata__"):
                    # Look for the `Default` class in metadata
                    for metadata in type_hint.__metadata__:
                        if isinstance(metadata, Default):
                            # Generate the default value
                            value = metadata.get_default()
            finally:
                # Assign the value!
                setattr(self, attribute, value)
```

The logic is quite straightforward: we iterate through each type-hinted attributes and check if the user has provided a value for it in `kwargs`. If not, we'll explore the `Annotated` type hint and look for `Default` classes. It's important to check the nature of the type hint and metadata, because you can't be sure how the user will actually annotate the final class.

Aaaand... That's about it 🙃 We now have reusable logic to assign default values to class attributes. We can check it works:

```py
class User(DefaultModel):
    id: Annotated[str, Default(factory=lambda: uuid4().hex)]
    name: Annotated[str, Default(value="Anonymous")]


u = User(id="1", name="Arthur")
print(u.id)  # 1
print(u.name)  # Arthur

u_default = User()
print(u_default.id)  # 2d10cd0e9a574ecf817ee02e20a0cf45
print(u_default.name)  # Anonymous
```

Neat, isn't it?

Admittedly, unless you're building Python libraries which requires such nice DX, you'll probably rarely have to implement interpretation logic for `Annotated`. But it's more or less how it works under the hood in Pydantic and FastAPI!

# Usage in the wild 🌍

As we said, this pattern has already made its way into major Python libraries.

## In Pydantic

If we take again our Pydantic example, the `Field` construct can now be added as a metadata in `Annotated`:

```py
class User(BaseModel):
    id: Annotated[str, Field(default_factory=lambda: uuid4().hex)]
```

Another advantage of this technique is that we can assign it to a type and reuse it; which was not possible before:

```py
HexUUID = Annotated[str, Field(default_factory=lambda: uuid4().hex)]

class User(BaseModel):
    id: HexUUID

class Post(BaseModel):
    id: HexUUID
```

The type checker still knows it should type it as a string, but from our point-of-view, it's like using a class type!

And it can go even further: Pydantic allows us to [define completely custom types](https://docs.pydantic.dev/latest/concepts/types/#custom-types) with various constraints and behavior:

```py
TruncatedFloat = Annotated[
    float,
    AfterValidator(lambda x: round(x, 1)),
    PlainSerializer(lambda x: f'{x:.1e}', return_type=str),
    WithJsonSchema({'type': 'string'}, mode='serialization'),
]
```

*This is taken directly from [Pydantic documentation](https://docs.pydantic.dev/latest/concepts/types/#adding-validation-and-serialization).*

## In FastAPI

Looking again at the `common_parameters` dependency example, `Annotated` will turn it into this:

```py
@app.get("/items/")
async def read_items(commons: Annotated[dict, Depends(common_parameters)]):
    return commons
```

`Depends` is now used as an `Annotated` metadata. Of course, the strength of this approach is that we can assign this to a type and reuse it. Much shorter than before!

```py
CommonParameters = Annotated[dict, Depends(common_parameters)]

@app.get("/items/")
async def read_items(commons: CommonParameters):
    return commons

@app.get("/orders/")
async def read_orders(commons: CommonParameters):
    return commons
```

## In SQLAlchemy

Did you ever repeated a column definition; like a datetime column or a primary key, with all its constraints and stuff, in SQLAlchemy? I'm sure you did! No more with `Annotated`:

```py
intpk = Annotated[int, mapped_column(primary_key=True)]
timestamp = Annotated[
    datetime.datetime,
    mapped_column(nullable=False, server_default=func.CURRENT_TIMESTAMP()),
]
required_name = Annotated[str, mapped_column(String(30), nullable=False)]
```

```py
class Base(DeclarativeBase):
    pass


class SomeClass(Base):
    __tablename__ = "some_table"

    id: Mapped[intpk]
    name: Mapped[required_name]
    created_at: Mapped[timestamp]
```

*This is taken directly from [SQLAlchemy documentation](https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html#mapping-whole-column-declarations-to-python-types).*

Awesome! We have a short, easy-to-use and type-checking compliant way to declare column definitions and reuse it in dozens of models.

---

That's a wrap! I hope this article helped to demystify `Annotated`, which can be surprising at first glance. This new construct opens a whole new world of possibilities in Python, rooted in the type-annotated era. We're only at the beginning: I bet lot of [new libraries will emerge](https://twitter.com/fvoron/status/1751535653274173715) with those ideas in mind.
