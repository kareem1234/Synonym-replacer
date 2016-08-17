
	//FOR VERSION 2.0

'use strict';
var googleTranslate = require('google-translate')();


class Translator{


	constructor(){
		this.langs = ['es','fr','it','de','ru','pt'];
		return this;
	}
	translate(text,callback){
		this.gTranslate(text,callback);
	}
	ranLn(){
		return this.langs[Math.floor(Math.random()*this.langs.length)];
	}
	gTranslate(text,callback){
		var originalText = text;
		var newLang = this.ranLn();
		googleTranslate.translate(text, 'en',newLang,(err, data2)=>{
			if(err){callback(err); return;}
  			googleTranslate.translate(data2.translatedText,newLang,en,(err,data2)=>{
  				if(err){callback(err); return;}
  				callback(null,data2.translatedText);
  			})
  			
		});
	}

}
module.exports = new Translator();


