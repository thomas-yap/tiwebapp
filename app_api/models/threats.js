var mongoose = require('mongoose');

var providerSchema = new mongoose.Schema(
    { 
        name: {type: String, required: true}, 
        provider: {type: String, required: true}, 
        dateUpdated: {type: Date, required: true}, 
        url: String, 
        text_desc: String 
    });

  var threatSchema = new mongoose.Schema(
  { 
        name : {type: String, required: true}, 
        dateCreated: {type: Date, required: true}, 
        dateUpdated: {type: Date, required: true}, 
        url: String, 
        alsoKnownAs: [String], 
        providers: [providerSchema], 
        text_final_desc: String }
  ); 

module.exports =  {
  providerSchema : providerSchema,
  threatSchema : threatSchema
};
