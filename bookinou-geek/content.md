---
title: "Bookinou Geek - Astuces et bidouilles techniques"
date: "2024-01-01T00:00:00.000000+00:00"
excerpt: "Découvrez mes astuces techniques pour tirer le meilleur parti de Bookinou, le lecteur d'histoires pour enfants"
---

# Bookinou Geek 🛠️📚

Bienvenue dans mon espace dédié aux astuces et bidouilles techniques autour de [Bookinou](https://www.mybookinou.com) ! Je m'appelle [François](/) et je suis papa d'un petit Arthur qui est un vrai fan de sa Bookinou 😊 En tant que passionné de technologie et utilisateur quotidien, je partage ici mes retours d'expérience, mes astuces et mes solutions pour tirer le meilleur parti de ce lecteur d'histoires magique.

## Qu'est-ce que Bookinou ?

[Bookinou](https://www.mybookinou.com) est un lecteur d'histoires audio innovant qui permet aux parents, grands-parents et proches d'enregistrer des histoires pour les enfants. C'est une alternative magique aux écrans, parfaite pour les moments de calme et d'imagination. Arthur l'adore pour écouter ses histoires préférées que ce soit à la maison, en sortie ou pendant les trajets en voiture.

## Astuces débutants

### L'application web

La version mobile est parfaite pour enregistrer des histoires, elle ne permet pas d'utiliser des fichiers audio déjà existants, indispensable si on veut aller plus loin et faire des enregistrements plus pro sur l'ordinateur et mixer plusieurs pistes, ou tout simplement utiliser les fichiers proposés par certains éditeurs.

Bookinou dispose d'une version web accessible à l'adresse [https://app.mybookinou.com](https://app.mybookinou.com) qui permet de faire ça. Il suffit de se connecter avec son compte et de cliquer sur **Importer**. De là, il suffit de sélectionner un fichier audio sur son ordinateur, préciser les détails de l'histoire et valider. L'histoire sera alors disponible dans votre bibliothèque.

![Importer un fichier audio dans l'application web](/bookinou-geek/images/web-import.png)

Une fois cela fait, il faut passer par l'application mobile, comme d'habitude, pour transférer l'histoire vers le Bookinou et l'associer à une gommette.

### Gommettes génériques

Il est possible d'acheter des gommettes génériques sans marque, qui sont proposées à des tarifs très compétitifs. Par exemple, ce [lot de 50 gommettes est proposé à 8.99€ sur Amazon](https://www.amazon.fr/dp/B0F9YRG5TQ?tag=fvoron07-21), soit environ 0.18€ la gommette. Je les ai testées et elles fonctionnent sans aucun problème.

Techniquement, il faut utiliser des puces NFC de type **NTAG213** (norme ISO 14443-3A). Elles sont souvent proposées en rouleaux d'autocollants, mais aussi au [format carte](https://www.amazon.fr/dp/B074BRHJG1?tag=fvoron07-21), ce qui peut être intéressant pour faire des cartes de playlists ou [cloner la carte nomade](#cloner-la-carte-nomade).

## Astuces avancées

> Ce type de manipulation s'adresse à des utilisateurs plus avancés, à l'aise avec les outils informatiques et prêts à expérimenter.

### Fonctionnement des gommettes et de la carte nomade

Chaque gommette est une puce NFC de type NTAG213, qui peut stocker une petite quantité de données (144 octets). Chaque tag NFC contient un identifiant unique (UID) qui est figé en usine à la fabrication de la puce et ne peut pas être modifié.

Lorsqu'on on associe une histoire à une gommette, le Bookinou lit l'UID de la puce et utilise cet identifiant pour faire le lien avec l'histoire correspondante dans sa bibliothèque. La mémoire de la gommette reste donc vierge, seul l'UID est utilisé pour l'association.

La carte nomade est également une puce NFC de type NTAG213, mais cette fois, sa mémoire est utilisée. Elle contient un enregistrement avec un identifiant fixe, `3770013172038`. Le Bookinou est programmé pour lancer le mode nomade s'il lit un tag NFC avec cet enregistrement. Sachant cela, il est possible de [cloner la carte nomade](#cloner-la-carte-nomade).

### Cloner la carte nomade

Avoir une carte nomade de secours peut être très pratique, typiquement pour l'avoir toujours sous la main dans la voiture.

Pour cloner la carte nomade, il suffit de copier l'enregistrement `3770013172038` sur une autre puce NFC de type NTAG213. Le plus simple, c'est d'utiliser un smartphone compatible NFC (la plupart des smartphones récents le sont) et l'application [NFC Tools](https://apps.apple.com/fr/app/nfc-tools/id1252962749). Ça permet de lire et d'écrire des tags NFC facilement depuis son téléphone.

Voici les étapes à suivre pour cloner la carte nomade :

1. Ouvrir l'application NFC Tools et aller dans l'onglet **Ecrire**.
2. Appuyer sur **Plus d'options**.
3. Appuyer sur **Importer depuis un tag NFC**.
4. À ce moment-là, il faut présenter la **carte nomade originale** au dos du téléphone pour lire son contenu. L'application va alors la mettre en mémoire.
5. L'enregistrement `3770013172038` doit apparaître dans la liste des données à écrire. Appuyer sur **Ecrire / 20 bytes**.
6. Maintenant, il faut présenter la **nouvelle puce NFC** au dos du téléphone pour écrire l'enregistrement dessus. Ça fonctionne avec n'importe quelle puce NTAG213, que ce soit une gommette générique ou une carte.

Et voilà ! Vous pouvez maintenant présenter cette nouvelle puce NFC à votre Bookinou pour lancer le mode nomade, exactement comme avec la carte originale.
