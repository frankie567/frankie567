---
title: Securitas API integration
client: DatiPlus
year: 2022
technologies:
    - PHP
    - Symfony
    - REST API
excerpt: Integration of the Securitas API on the DatiPlus platform.
thumbnail: /references/images/datiplus-securitas/cover.jpg
---

[DatiPlus](https://dati-plus.com/) designs connected devices to protect workers evolving in dangerous environments.

To achieve this, DatiPlus partners with Securitas, one of the biggest security company in the world. When an alert is raised on the device, Securitas can handle it and dispatch a team to save the worker in danger.

Until now, new devices enrollments involved to manually fill a PDF form and send it by e-mail to Securitas services. Hence, 48 hours were needed before the device could be operational with Securitas. In 2022, Securitas introduced a REST API to automate this process.

My work involved to understand their specification and create a synchronization bridge between DatiPlus plaform and Securitas API.

After this, we were able to reduce the enrollment time of a new device to only a **few seconds**. Every updates are now automatically reported in the Securitas API so the two companies stay in sync to better protect their customers.
