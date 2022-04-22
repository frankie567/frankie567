---
title: Zendesk SSO integration
client: DatiPlus
year: 2022
technologies:
    - PHP
    - Symfony
    - JWT
excerpt: Integration of an SSO system between DatiPlus platform and Zendesk.
thumbnail: /references/images/datiplus-sso-zendesk/cover.jpg
---

[DatiPlus](https://dati-plus.com/) designs connected devices to protect workers evolving in dangerous environments

To better serve their customers, they needed to implement a Single-Sign-On mechanism between their platform and support platform based on Zendesk. This way, DatiPlus clients are able to ask for support without having to create another account or authenticate again. Besides, every important information about the user is automatically synchronized with Zendesk, so tech support can immediately have all the necessary insights to solve the problem.

We implemented this through the JSON Web Token (JWT) method, as [specified by Zendesk](https://support.zendesk.com/hc/en-us/articles/4408845838874-Enabling-JWT-JSON-Web-Token-single-sign-on).
