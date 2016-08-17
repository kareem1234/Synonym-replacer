var expect    = require("chai").expect;
var SynReplacer = require('./SynReplacer2');
var triSearch = require('./Trigrams');
var trigramSearch = new triSearch(['the','ball','now']);
var trigramSearch2 = new triSearch(['the','ball','hits']);
var newsyns = null;
var newIndxes = null;
var text = `

You missed the scandalous, racy leaked photos of a drunken former 2003/2004 USC Song Girl Sarah Carmona having some steamy girl-on-girl action at a nightclub then she was photographed in July of 2008 in La Jolla, CA at a USC Song Girls reunion beach party where all the Song Girls past and present were stinking drunk and acting like shameless 
`;
//var synRplr = new SynReplacer(text);
/*
describe("Trigrams", function() {
  it(" convert index to bytes", function(done) {
      var indexes = trigramSearch.getByteIndexes(1000000);
      console.log("indexes: "+indexes);
      done();
  });
  it("read trigrams.txt at index", function(done) {
      trigramSearch.readIndex(0,(err,data)=>{
        expect(err).to.equal(null);
        console.log("printing line: "+data);
        done();
      });
  });
  it("compare trigrams to a given line", function(done) {
      var line = '25\ta\tback\tpocket\t*********************************';
      //a back  porch
      var trigram = ['dry','on','a'];
      var isBefore = trigramSearch.isBefore(line,trigram);
      console.log("trigram sortOder: "+isBefore);
      done();
  });
  it("find a string", function(done) {
    // index the ball hits 760870
      var trigramSearch3  = new triSearch(['the','ball','hits']);
      trigramSearch3.search((err,data)=>{
        console.log(data);
        done();
      });
  });
});
*/

describe("SynReplacer",function(){
  /*
  it("tag text", function(done) {
      synRplr.tagText();
      console.log(synRplr.posTags);
      done();
  });
  it("get synIndexes", function(done) {
      synRplr.getSynIndexes();
      console.log(synRplr.synIndexGroups);
      done();
  });
  */
  it("replace text with syns", function(done) {
      this.timeout(12000)
      var syn = new SynReplacer(text);
      syn.replace((err)=>{
        if(err)console.log(err);
        console.log(syn.text);
        done();
      });
  });

//end of file
});


