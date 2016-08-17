# Synonym-replacer

A simple node.js app that scans texts for words that can be replaced with synonyms, and replaces them.

Algorithim has a text file database of a 1 million different trigrams and their frequencies.
After getting a list of synonyms for a given word it uses a binary scan of the file to see which synonym appears most often in the
given context.



To Run :

node app.js

navigate to http://localhost:3000/
