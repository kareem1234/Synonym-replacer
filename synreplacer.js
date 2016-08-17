'use strict';
var natural = require('natural');
var pluralize = require('pluralize')
var WordPOS = require('wordpos');
var wordpos = new WordPOS();
var pos = require('pos');
var async = require('async');
var TriGramSearch = require('./Trigrams');
var punctuation = ["'", ":",",","—","...",'!',"(",")",".","?",'"',';'];
require('./arrayIncludes');


class SynReplacer {

	constructor(text){
		this.text = text;
		this.posTags = null;
		this.synIndexes = [];
		this.synIndexGroups = [];
		this.transformations = {};
	}
	tagText(){
		var words = new pos.Lexer().lex(this.text);
		var tagger = new pos.Tagger();
		this.posTags = tagger.tag(words);
	}
	mergeText(){
		console.log(this.text);
		var newText ='';
		this.posTags.forEach((tag)=>{
			if(punctuation.includes(tag[0]))
				newText+=tag[0];
			else
				newText = newText+" "+tag[0];
		});
		this.text = newText;
	}
	getSynIndexes(){
		this.posTags.forEach((tag,index)=>{
			if(this._shouldGetSyn(tag[1])){
				this.synIndexes.push(index);
			}
		});
		this._groupSynIndexes();
	}
	replace(callback){
		this.tagText();
		this.getSynIndexes();
		this.replaceAllSyns((err)=>{
			if(err)callback(err);
			else {
				//this.mergeText();
				callback(this.text);
			}
		});
	}
	replaceAllSyns(callback){
		if(this.synIndexGroups.length === 0){
			callback(null);
			return;
		}
		var tasks = [];
		var wordIndexes = this.synIndexGroups.shift();
		var count = 0;
		wordIndexes.forEach((indx)=>{
			tasks.push((callback)=>{
				async.waterfall([ 
					(callback)=>{this._getSyns(indx,callback)},
					(syns,callback)=>{this._getBestSyn(syns,indx,callback)},
					(syn,callback)=>{this._addBestSyn(syn,indx,callback)}
				],(err,results)=>{
					if(err)callback(err);
					else callback(null);
				});
			});
		});
		async.parallel(tasks,(err)=>{
			console.log("finsihed");
			if(err)callback(err);
			else this.replaceAllSyns(callback);
		});
	}
	_getSyns(index,callback){
		var word
		var plural = this._isPlural(index);
		word = (plural === false) ? this.posTags[index][0] :  plural;
		this._synLookUp(word,this.posTags[index][1],(err,syns)=>{
			if(!err){
				syns.forEach((syn)=>{
					if(plural){
						syn = this._pluralize(index,syn);
					}
				});
			}
			//console.log("one finished "+index+" "+this.posTags[index][1]);
			callback(err,syns);
		});
	}
	_getBestSyn(syns,index,callback){
		if(syns.length === 0){
			callback(null,null);
			return;
		}else{
			var tasks = [];
			syns.forEach((syn)=>{
				var tri = this._createTrigram(index,syn);
						//console.log("syn index is: "+index)
				tasks.push((callback)=>{
					this._getTrigramCount(tri,callback);
				});
			});
			//console.log("syn index is: "+index)
			async.parallel(tasks,(err,results)=>{
				if(err)callback(err);
				else{
					var max = 0;
					var result = null;
					results.forEach((trg,index)=>{
						if(trg != null){
							if(trg[0]>max){
								result = syns[index];
								max = trg[0];
							}
						}
					});
					callback(null,result);
				}
			});
		}
	}
	_addBestSyn(syn,index,callback){
		if(syn != null  && !this._isSame(syn,this.posTags[index][0])){
			console.log("adding syn",syn);
			this.transformations[index] = this.posTags[index][0];
			this.posTags[index][0] = syn;
		}
		callback(null);
	}
	_isSame(w1,w2){
		if(w1.toLowerCase() === w2.toLowerCase())
			return true;
		return false;
	}
	_createTrigram(index,syn){
		var trigram  = null;
		var ispunc1 = null;
		var ispunc2 = null;
		if(index != 0)
			var ispunc1 =  punctuation.includes(this.posTags[index-1][0]);
		if(index != this.posTags.length)
			var ispunc2 =  punctuation.includes(this.posTags[index+1][0]);
		//console.log("syn index is: "+index)
		if(ispunc1 || index === 0)
			trigram = [syn,this.posTags[index+1][0],this.posTags[index+2][0]];
		else if (ispunc2 || index === this.posTags.length-1)
			trigram = [this.posTags[index-2][0],this.posTags[index-1][0],syn];
		else
			trigram = [this.posTags[index-1][0],syn,this.posTags[index+1][0]];
		return trigram;
	}
	_getTrigramCount(trigram,callback){
		var trigramSearch = new TriGramSearch(trigram);
		trigramSearch.search(callback);
	}
	_pluralize(index,word){
		
		return pluralize(word);
	}
	_isPlural(word){
		return false;
	}
	_isCapital(word){
		if(word.charAt(0).toLowerCase() === word.charAt(0))
			return false;
		return true;
	}
	_synLookUp(word,pos,callback){
		var onResult = (results,word)=>{
			//console.log(`searched ${word} ${pos}`);
			var res = this._parseSyns(results,pos);
			callback(null,res);
		};
		if(this._isAdjective(pos)){
			wordpos.lookupAdjective(word,onResult)
			return;
		}
		else if(this._isNoun(pos)){
			wordpos.lookupNoun(word,onResult)
			return
		}
		else if(this._isVerb(pos)){
			wordpos.lookupVerb(word,onResult)
			return
		}
		else if(this._isAdverb(pos)){
			wordpos.lookupAdverb(word,onResult)
			return
		}else{
			//console.log('no lookup');
		}
	}
	_parseSyns(results,pos){
		var syns = [];
		results.forEach((result)=>{
			if(result.pos === pos.toLowerCase().charAt(0)){
				syns = syns.concat(result.synonyms);
			}
		});
		return syns;
	}
	_groupSynIndexes(){
		var arr = [];
		var lastIndex = -3;
		var matched = false;
		for(var i = 0; i< this.synIndexes.length;i++){
			if((this.synIndexes[i] - lastIndex ) >= 3){
				if(this._shouldIndex(this.synIndexes[i])){
					arr.push(this.synIndexes[i]);
					lastIndex = this.synIndexes[i];
					matched = true;
				}

			}
		}
		if(matched){
			this.synIndexGroups.push(arr);
			this._groupSynIndexes();
		}
	}
	_shouldIndex(index){
		var shouldIndex = true;
		this.synIndexGroups.forEach((arr)=>{
			arr.forEach((indx)=>{
				if(indx === index){
					shouldIndex =  false;
				}
			});
		});
		return shouldIndex;
	}
	_shouldGetSyn(pos){
		return (   this._isAdjective(pos) 
			   	|| this._isNoun(pos)
			   	|| this._isVerb(pos)
			   	|| this._isAdverb(pos) );
	}
	_isAdjective(pos){
		return ['JJ','JJR','JJS'].includes(pos); 
	}
	_isNoun(pos){
		return ['NN','NNP','NNPS','NNS'].includes(pos); 
	}
	_isVerb(pos){
		return ['VB','VBD','VBG','VBN','VBP','VBZ'].includes(pos); 
	}
	_isAdverb(pos){
		return ['RB','RBR','RBS'].includes(pos); 
	}

}

module.exports = SynReplacer;