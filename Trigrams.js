'use strict';
var lineSize = 50;
var file = 'trigrams.txt';
var fs = require('fs');
var spaceDelim = '\t';
var startIndex =  Math.floor(1020009/2);
class TriGramSearch {

	constructor(trigram){
		this.maxIndex  =  1020009;
		this.minIndex = 0;
		this.trigram = trigram;
		return this;
	}
	search(callback){
		this.getTrigramCount(startIndex,callback);
	}
	getTrigramCount(index,callback){
		this.readIndex(index,(err,data)=>{
			if(err)callback(err);
			else{
				var gtr = this.isBefore(data,this.trigram);
				if(gtr > 0)
					this.maxIndex = index;
				else if(gtr < 0)
					this.minIndex = index;
				else if (gtr === 0){
					callback(null,this.createTrigram(data));
					return;
				}

				if(this.getNewIndex() === this.minIndex){
					callback(null,null);
					return;
				}
				this.getTrigramCount(this.getNewIndex(),callback);
			}
		});
	}
	createTrigram(line){
		line = line.split(/[\t,\s,\n]+/)
		line = this.removeEmptyString(line);
		var count = line.shift();
		return [count,[line[0],line[1],line[2]]];
	}
	getNewIndex(){
		return Math.floor((this.maxIndex+this.minIndex) /2);
	}
	readIndex(index,callback){
		var byteIndex = this.getByteIndexes(index);
		var start = byteIndex[0];
		var end = byteIndex[1];
		var stream = fs.createReadStream(file,{start:start,end:end,encoding:'utf8'});
		stream
			.on('data',(data)=>callback(null,data))
			.on('err',(err)=>callback(err));
	}
	isBefore(line,trigram){
		line = line.split(/[\t,\s,\n]+/)
		line = this.removeEmptyString(line);
		var trigram2 = [line[1],line[2],line[3]];
		return this.compare(trigram2,trigram);
	}
	trigramIndex(data){
		return data.split(spaceDelim)[0];
	}
	removeEmptyString(lineArr){
		var newArray = [];
		lineArr.forEach((str)=>{
			if(str != '' && !str.includes("*"))
				newArray.push(str);
		});
		return newArray;
	}
	compare(trigram1,trigram2){
		if(trigram1[0].localeCompare(trigram2[0]) != 0)
			return trigram1[0].localeCompare(trigram2[0]);
		else if(trigram1[1].localeCompare(trigram2[1]) != 0)
			return trigram1[1].localeCompare(trigram2[1]);
		else
			return trigram1[2].localeCompare(trigram2[2]); 
	}
	getByteIndexes(index){
		var start = 0;
		var end = start+lineSize;
		var i = 0;
		while(i<index){
			i++;
			start = end+1;
			end = start+lineSize;
		}
		return [start,end];
	}


}

module.exports = TriGramSearch;