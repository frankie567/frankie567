---
title: Write better Python code faster with type hints
date: '2024-01-24T19:56:58.910120+00:00'
tags:
    - Python
    - Backend development
excerpt: Discover how type hints can help you write better Python code faster. Learn about the benefits of type annotations, how to use static type checkers like `mypy`, and explore advanced type hinting techniques to improve code quality and reduce errors.
thumbnail: /posts/images/write-better-python-code-faster-with-type-hints/thumbnail.svg
---


If you've followed the Python evolutions for the last few years, you probably know that **type hints** are a thing. Since its introduction in Python 3.5, the [`typing` module](https://docs.python.org/3/library/typing.html) has quickly grow and lot of Python codebases nowadays are using type hints.

If you're not using them already, I can guarantee that you will by the end of this post 😉

# The problem 😩

So, as you know, Python is a **dynamically-typed language**. It means that, contrary to compiled languages like C or Rust, variables types are guessed at runtime instead of being validated during a compilation step. Therefore, you can very well write something like this:

```python
a = 42
assert isinstance(a, int)  # `a` is an integer

a = "Polar is so cool"
assert isinstance(a, str)  # `a` is now a string
```

That's convenient because you don't need to explicitly declare the type of the variable. Thank you Python, you're so nice 🥰 Now, let's take a more concrete example:

```python
def sum(a, b):
	return a + b

sum(42, "I'm a string, lol ( ͡° ͜ʖ ͡°)")
```

We define a simple function that should return the sum of two numbers. Then, we call it with an integer and... a string 🤦‍♂️ From Python's point-of-view, this is perfectly valid code. However, it miserably fails at runtime:

```
TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

Of course, we can't add an integer and a string. Obvious, but we had to run it to spot the mistake. Another one? Imagine we have the following class:

```python
class TripToFarFarAway:
    def __init__(self, distance):
        self.distance = distance
        self.progress = 0

    def are_we_there_yet(self):
        return self.progress < self.distance

    def move_forward(self, distance):
        self.progress += distance
```

Let's use it:

```python
trip = TripToFarFarAway(1_000_000)
if not trip.are_we_there():
	print("NOOOO!")
```

Do you see it? No? Python neither... Until we run it:

```
    if not trip.are_we_there():
           ^^^^^^^^^^^^^^^^^
AttributeError: 'TripToFarFarAway' object has no attribute 'are_we_there'. Did you mean: 'are_we_there_yet'?
```

Damned! We misspelled the method's name!

Those are pretty basics examples, but I'm sure you were already confronted to this kind of mistakes; especially in much bigger codebases with dozens of classes, functions, each one with their massive set of arguments. *"Huh, what's the method's name already?"*, *"Oh right, the fourth argument is a string, not an int...*". We all lost *hours* (and our sanity) in those kind of pointless problems. Couldn't we do better? Actually, **we can**.

# Introducing type hints ✍️

The idea is quite simple: add, directly in the code, information about the type we expect on our variables, arguments, properties, etc... A bit similar to what we would do in a compiled language. That's **type hints** (or **type annotations**) .

If we consider our `sum` function again, it would look like this with annotations:

```python
def sum(a: int, b: int) -> int:
	return a + b
```

It looks quite natural: after each argument, we specify the type we expect after a colon `a: int`. The return type is set using an arrow: `-> int`. Cool! So what happens if we run `sum(42, "I'm a string, lol ( ͡° ͜ʖ ͡°)")` again?

```
TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

Oh... It didn't change anything ☹️ That's perfectly normal: Python **is** and **will remain** a **dynamically-typed** language. It means the Python interpreter will simply **ignore the annotations** and do nothing with it. So, how can we use them?

# Introducing static type checkers 🔬

A static type checker is a program able to **parse and analyze your source code** to tell you if your code is consistent regarding typing. For Python, the reference type checker is [`mypy`](https://github.com/python/mypy). Give it a script as input, and it'll check that your type annotations are respected. Let's see this with our `sum` example:

```bash
$ mypy sum.py
sum.py:4: error: Argument 2 to "sum" has incompatible type "str"; expected "int"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

Wow, that's interesting! `mypy` tells us that the second argument is a string, while we expect an integer. It's worth to note that `mypy` doesn't even need to actually run your program: it infers everything from the type hints 🧠

With this tool, we have a way to know quickly if we're making a mistake. Of course, it integrates very well with IDE like Visual Studio Code, so the feedback directly shows up while you're coding!

![Typing error in EDE](/posts/images/write-better-python-code-faster-with-type-hints/typing_error.png)

Talking about IDE, some also ship with their own static type checkers so they can offer smart autocompletions or imports. Visual Studio Code (again), uses Pyright to show you things like this:

![Autocompletion in IDE](/posts/images/write-better-python-code-faster-with-type-hints/autocompletion.png)

See? VS Code automatically suggests methods and properties from the `TripToFarFarAway` class. No more back and forth with the class definition or the library' docs!

Needless to say those tools will help you to:

* Save time
* *Dramatically* reduce errors

# More complex type hints 📈

The example we've seen so far was pretty simple, but in the real world, we use much more than just scalar types like `int` or `str`. What about data structures? Callables? Generators? Don't worry, they are supported to!

Let's see how we can define a **list of integers** and a **dictionary mapping strings to integers**.

```python
l: list[int] = [1, 2, 3, 4, 5]
d: dict[str, int] = {"a": 1, "b": 2, "c": 3}
```

Again, we define the type after a colon. Here we use the builtin types `list` and `dict` to which we add a type variable between square brackets. That's quite close to the concept of [Generics](https://en.wikipedia.org/wiki/Generic_programming). Now, type checkers will now that `l` contains only integers and `d` should only map strings to integers. So the following code:

```python
# Try to append a string to `l`
l.append("I'm a string, lol ( ͡° ͜ʖ ͡°)")
# Try to sum an item of `d` with a string
d["a"] + "I'm a string, lol ( ͡° ͜ʖ ͡°)"
```

...will produce the following errors with `mypy`:

```
type_hints.py:5: error: Argument 1 to "append" of "list" has incompatible type "str"; expected "int"  [arg-type]
type_hints.py:7: error: Unsupported operand types for + ("int" and "str")  [operator]
```

As we said, Python will remain a dynamically-typed language. So we can very well have a list with elements of different types, like a list with both `int` and `float`. This can be expressed like this in annotations:

```py
l: list[int | float] = [42, 3.14, 1337]
```

With the pipe `|`, we specify an **union** of possible types. That one is also very useful for **optional arguments** in functions:

```py
def greeting(name: str | None = None) -> str:
        return f"Hello, {name if name else 'Anonymous'}"
```

Note how the type annotation for `None` is just... `None`!

> **Type annotations were different before Python 3.9**
>
> Before Python 3.9, it wasn’t possible to annotate lists, tuples, sets, and dictionaries using the builtin type. Special construct from `typing` module were needed: `l: typing.List[int] = [1, 2, 3, 4, 5]`.
>
> Likewise, the `|` wasn't available: `typing.Union[int, float]`.
>
> This way of annotating is now deprecated, but you may still find it in backwards-compatible code.

Of course, we can go way further than that, but we'll stop here for this introduction. If you want to go further, `mypy` documentation is a must-read: [https://mypy.readthedocs.io/en/stable/index.html](https://mypy.readthedocs.io/en/stable/index.html)

# Introspection 😌

In programming, introspection is the ability for a program to get information about an object **at runtime**. As you may know, Python is *very* good at this. It even has a [whole module in the standard library](https://docs.python.org/3/library/inspect.html) dedicated to this. A small example:

```py
import inspect

def sum(a, b):
    """Returns the sum of two integers."""
    return a + b

sum_signature = inspect.signature(sum)
print(sum_signature.parameters)
print(inspect.getdoc(sum))
```

The output of this program is the following:

```
OrderedDict({'a': <Parameter "a">, 'b': <Parameter "b">})
Returns the sum of two integers.
```

Impressive! Python is able to give us the signature of the function, and even the attached docstring! Do you guess why I'm talking about this? Because we can **introspect type hints** too 🤯

Let's try again with the type annotated version of `sum`:

```py
def sum(a: int, b: int) -> int:
    """
    Returns the sum of two integers.
    """
    return a + b

sum_signature = inspect.signature(sum)
print(sum_signature.parameters)
```

```
OrderedDict({'a': <Parameter "a: int">, 'b': <Parameter "b: int">})
```

The signature is able to give us an ordered dictionary of all the arguments expected by the function. Each one is a [`Parameter`](https://docs.python.org/3/library/inspect.html#inspect.Parameter) object and **it does retain the type annotation**:

```py
print(sum_signature.parameters["a"].annotation)
```

```
<class 'int'>
```

Boom! `a` should be an `int`. That's a **game changer**: it means that we can actually use this information at runtime to change the behavior of our program.

A quite natural example could be to implement a decorator to checks the validity of a function arguments:

```py
import functools
import inspect

def check_arguments_type(f):
    parameters = inspect.signature(f).parameters
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        # Check args
        for arg, (parameter_name, parameter) in zip(args, parameters.items()):
            assert isinstance(arg, parameter.annotation), f"{parameter_name} should be {parameter.annotation}"

        # Check kwargs
        for key, value in kwargs.items():
            parameter = parameters[key]
            assert isinstance(value, parameter.annotation), f"{key} should be {parameter.annotation}"

        return f(*args, **kwargs)
    return wrapper

@check_arguments_type
def sum(a: int, b: int) -> int:
    """
    Returns the sum of two integers.
    """
    return a + b

sum(42, "I'm a string, lol ( ͡° ͜ʖ ͡°)")
```

> ⚠️ This is a very naive approach with lot of edge cases — don't use it like this in your projects!

Now, we have a type check at runtime!

```
Traceback (most recent call last):
  File "sum.py", line 29, in <module>
    sum(42, "I'm a string, lol ( ͡° ͜ʖ ͡°)")
  File "sum.py", line 11, in wrapper
    assert isinstance(arg, parameter.annotation), f"{parameter_name} should be {parameter.annotation}"
AssertionError: b should be <class 'int'>
```

This example was focused on functions, but it works with any Python objects accepting type hints. In general, we can use the function [`typing.get_type_hints()`](https://docs.python.org/3/library/typing.html#typing.get_type_hints) to get annotations for any arbitrary object:

```py
class Movie:
    title: str
    duration_minutes: int

print(typing.get_type_hints(Movie))
```

```
{'title': <class 'str'>, 'duration_minutes': <class 'int'>}
```

## How it's used in the real-world?

This technique is really clever and powerful, and it actually made its way into major Python libraries and frameworks. In particular, this is at the heart of [Pydantic](https://docs.pydantic.dev/latest/), the data validation library. With it, you define models using type annotations:

```py
class Delivery(BaseModel):
    timestamp: datetime
    dimensions: tuple[int, int]
```

And it'll use them at runtime to perform complex data validation and conversion!

Another great example is [FastAPI](https://fastapi.tiangolo.com/), which automatically determines the input data expected by an API endpoint using type hints (and Pydantic models 😉):

```py
@app.post("/items/")
async def create_item(item: Item):
    return item
```

In this example, FastAPI will:

* Generate an API schema
* Validate the JSON input so it conforms to the `Item` model
* Give you a ready-to-use instance of `Item`.

The cherry-on-the-cake of those approaches is that it gives us good type checking out of the box!

---

That's all I wanted to share with you about Python type hints! If you didn't know it, I hope it'll give you good reasons to start using them.

In my next post, we'll focus on a recent and *really powerful* typing construct: `Annotated`! See you soon 👋
