---
title: Computation platform
client: Groupe Briand
year: 2022
technologies:
    - FastAPI
    - Celery
excerpt: Robust and scalable computation platform accessible through a REST API and a web interface.
thumbnail: /references/images/groupe-briand-computation-platform/cover.jpg
---

[Groupe Briand](https://www.groupebriand.fr/) is the leading company in France for metal, wood and concrete building.

To remain competitive at the cutting edge of innovation, they needed a new computing platform allowing their engineers to define and execute calculations and experiments to improve the design of future buildings.

The goal was to provide a platform where engineers could easily add new functions and computations that would then be automatically available as a REST API or a web interface.

To achieve this, I designed a complete architecture based on the [web-queue-worker model](/blog/create-deploy-reliable-data-ingestion-service-fastapi-sqlmodel-dramatiq).

By using Celery, the most popular task runner in Python, engineers are able to schedule long and complex computations using scientific Python libraries like Numpy or Pandas. Scalability is also built-in: if we need to process more tasks, we just to need to run more workers.

The main challenge with this project was to provide a way to automatically discover functions defined by engineers so they are automatically picked up the REST API. For this, we implemented utility decorators that are responsible to declare the functions to the FastAPI API. By using type hints on the function, we even are able to automatically define a validation schema on the API.
