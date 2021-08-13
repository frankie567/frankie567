---
title: 'Air de cour : interest for Music Information Retrieval'
date: '2017-06-04T12:00:00.000Z'
tags:
  - Computer Science
  - History
excerpt: Air de cour is a nearly forgotten music genre from the 16th century. We study how this genre could be of interest in the Music Information Retrieval field.
thumbnail: /posts/images/air-de-cour-interest-music-information-retrieval/illustration-tablatures-moulinie.png
---

> In 2013, during my first year of Machine Learning and Data Mining Master’s Degree, I took a very interesting course about Music Information Retrieval ; a field between musicology, physics and machine learning aiming at extracting information from musical data.
>
> We were asked to write a small report on a musical genre of our choice and explain how it could be interesting for the research in this field.
>
> My interest for History made me to work on a forgotten genre, the air de cour, a very popular music genre at the French court and parisian salons in the XVIIth century, essentially vocal and sometimes accompanied by a lute.
>
> Here is this report, mined from the bottom of one of my folders, which is, I believe, not without interest.

<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/110385172&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>

*An air de cour, brilliantly interpreted by the [Ensemble Faenza](http://www.faenza.fr/), to get into the mood. 🎵*

## Abstract

In this report, we will study a specific musical genre, who were very popular in France at the royal court, between the late 16th century and early 17th, the “Air de cour”. Nearly forgotten today, we will see its features and the difficulties one may encounter to read and process these old compositions, melting scores in mensural notations, lyrics in old-fashioned French and lute tablatures.

## Introduction

At the end of the 16th century, France is marked by the wars of religions between Catholics and Protestants. At the end of the Renaissance, period where Europe changed completely its vision of the world, we see the emergence of a new artistic movement, trying to show the exuberance and the grandeur, the Baroque, through all the arts, and of course in music. It is in this context that appear the “Airs de cour”, a very specific musical genre, nearly forgotten today.

## Air de cour

Adrian le Roy (c. 1520-1598), a french musician of the Renaissance, was the first to use the term “Air de cour” with the publication of his collection of songs “Airs de cour miz sur le luth”[^1] in 1571.[^2] This genre were very popular in France at the royal court, and more widely with the Parisian aristocracy and the “salons” until the mid-17th, making “Air de cour” a musical style placed at the border between Renaissance and Baroque periods.

“Air de cour” is essentially a vocal music genre. With time, it successively passed from solo voice to multiple voices, and again solo. It could come with no accompaniment but, usually, it is accompanied by a lute ; therefore, composers write them with the vocal melody, the lyrics in French and the lute accompaniment, as we will see.

Many composers from the late 16th century to early 17th, such as Étienne Moulinié or Bénigne de Bacilly, composed some “airs de cour”.

![Charles Mouton, a famous luth player, by Gérard Edelinck, 1692](/posts/images/air-de-cour-interest-music-information-retrieval/charles-mouton.jpg "Figure 1: Charles Mouton, a famous luth player, by Gérard Edelinck, 1692")

### Musical approach

An “air de cour” is composed of several stanzas, each one sung on the same melody and split in two parts, the second one being repeated once more, playing the role of a chorus. The metric is quite unusual and may appear irregular for us today. Indeed, “airs de cour” were heavily influenced by the principle of “musique mesurée”[^3], a style trying to adapt the rhythm of the melody to the verse ; longer syllabes set to longer notes and shorter syllabes to shorter notes.

There is today few artists who recorded these musical pieces. We can however mention the work of Suzie Le Blanc[^4] on Moulinié’s compositions or that of Claudine Ansermet[^5] on Bacilly’s work. While listening, we clearly hear the two influences of the Renaissance, with the light lute accompaniment, and the Baroque, with the way of declamating the lyrics that will influence the french opera later, especially the french lyric tragedy of Lully.

## Study of musical scores

As few studies were lead on this particular style, the best way to understand it is to study in more detail some scores of this time. Fortunately, some of this scores are digitized and freely available to download on the International Music Score Library Project (IMSLP), a project who tries to scan old scores on public domain and publish them to the web. We chose here to focus on the “Airs de cour miz sur le luth” by Adrien le Roy[^6] and on the first book of “Airs de cour” by Étienne Moulinié[^7].

### Structure

The presentation and structure of a piece is quite similar in both books. We find the three essential elements : the melody score, the lyrics and the lute part. It is important to notice that the lute is written in the form of a tablature and not with a pitch representation. We don’t really know why, apart from the fact that this representation is quite usual for string instruments like the lute or the guitar.
Concerning the lyrics, we can say that, even if they are not in what we call usually “Old French”, they are in a old-fashioned French and with some typographic particularities ; but they are still understandable without particular knowledge.

### Musical notation

As we stated before, “airs de cour” are at the edge of the Renaissance and the Baroque periods. This is why, in Le Roy’s book, we have a mensural notation8 whereas in Moulinié’s one, we already have a form of our modern notation, as we can see in Figure 2a and Figure 2b.

![Extract of a score from Adrien Le Roy (1571)](/posts/images/air-de-cour-interest-music-information-retrieval/leroy_score.png "Figure 2a: Extract of a score from Adrien Le Roy (1571)")

![Extract of a score from Étienne Moulinié (1624)](/posts/images/air-de-cour-interest-music-information-retrieval/moulinie_score.png "Figure 2b: Extract of a score from Étienne Moulinié (1624)")

We say “a form” because, as you can see in Moulinié’s score, it is still melted with old-fashioned notations. The G clef, for instance, is quite different from its modern form.

Moreover, it seems that, in both books, metric is written with the mensural notation. As we can see in Figure 3 and Figure 4, they use unusual signs. This needs some explanations. This system is much more complex than the modern one. Indeed, it allowed to define different divisions for two following note types. For example, the division of a Breve into a Semibreve (our modern Whole), called Tempus, could be different from the division of a Semibreve into Minims (our modern Half), called Prolatio. Furthermore, each of these levels could be divided in three (“Perfect” or “Maior” ) or in two (“Imperfect” or “Minor” ). Finally, another notation, a vertical stroke through the previous signs, represents a division by two of all temporal values.

![Detail on a metric notation from Adrien Le Roy (1571)](/posts/images/air-de-cour-interest-music-information-retrieval/leroy_metric.png "Figure 3: Detail on a metric notation from Adrien Le Roy (1571)")

![Detail on a metric notation from Étienne Moulinié (1624)](/posts/images/air-de-cour-interest-music-information-retrieval/moulinie_metric.png "Figure 4: Detail on a metric notation from Étienne Moulinié (1624)")

So, as we can see in Figure 4, we can say that, in this score, a Breve is divided in two Semibreves and Semibreves in two Minims. This corresponds roughly to a meter of 2/4 in our modern notation.

But this doesn’t explain the “3” that we see in Figure 3, and that we find throughout the two books. In this scores, the metric could be changed during the composition : either by inserting one of the previous signs we saw, or by inserting a numerical value, like this “3” that means that the length of the notes must be divided by three.

## Research interest

The “airs de cour” seems to have had little attention from the scientific community. The reasons are multiples: complete desuetude of the genre, very specific in its form (only vocal with one instrument accompanying), lack of reputation of its principal composers, lack of scores… However, thanks to the International Music Score Library Project, we can find some of this scores freely in PDF format, of variable quality though.

Today’s Music Information Retrieval’s system could help to fully digitize all this compositions and save them from a complete oblivion: technologies like Optical Music Recognition (OMR) could be used to detect and transcribe the scores. A research project could try to establish a system solving all the challenging issues we would encounter with “airs de cour” scores :

* Recognize mensural notation, or worse, semi-modern notations like Moulinié’s one ;
* Transcribe such recognized mensural notation in modern system ;
* Process the lute tablature ;
* Recognize and process the lyrics in an old-fashioned French with all its grammatical and typographical issues ; involving Optical Character Recognition technologies, and maybe even Machine Translation’s ones.

---

[^1]: Adrien Le Roy. Livre d’airs de cour miz sur le luth. http://imslp.org/wiki/Livre_d%27airs_de_cour_miz_sur_le_luth_(Le_Roy,_Adrien), 1571.
[^2]: Wikipedia. Air de cour — Wikipedia, the free encyclopedia. https://en.wikipedia.org/wiki/Air_de_cour, October 2013.
[^3]: Wikipedia. Musique mesurée — Wikipedia, the free encyclopedia. https://fr.wikipedia.org/wiki/Musique_mesur%C3%A9e_%C3%A0_l%27antique, October 2013.
[^4]: Suzie Le Blanc. Moulinie: Airs with lute tablature (first book, 1624), 2008.
[^5]: Paolo Ansermet, Claudine Cherici. Benigne de bacilly : L’art de bien chanter, 2006.
[^6]: Adrien Le Roy. Livre d’airs de cour miz sur le luth. http://imslp.org/wiki/Livre_d%27airs_de_cour_miz_sur_le_luth_(Le_Roy,_Adrien), 1571.
[^7]: Étienne Moulinié. Airs de cour premier livre. http://imslp.org/wiki/Airs_de_cour_(Moulini%C3%A9,_%C3%89tienne), 1624.
[^8]: Wikipedia. Mensural notation — Wikipedia, the free encyclopedia. https://en.wikipedia.org/wiki/Mensural_notation, October 2013.
