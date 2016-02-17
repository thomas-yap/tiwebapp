var mongoose = require("mongoose");
var threatsSchema = require("../models/threats");
var Threat = mongoose.model('Threat',threatsSchema.threatSchema);

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.threatsCreate = function(req, res) {
    console.log(req.body);

    Threat.create({
        name: req.body.name,
        dateCreated: new Date(req.body.dateCreated),
        dateUpdated: new Date(req.body.dateUpdated),
        url: req.body.url,
        alsoKnownAs: req.body.alsoKnownAs, // Must be an array
        providers: [],
        text_final_desc: req.body.text_final_desc
    }, function(err, threat) {
        if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
        } else {
            console.log(threat);
            sendJSONresponse(res, 201, threat);
        }
    });
};

module.exports.threatsReadOne = function(req, res) {
    console.log('Finding threat details', req.params);
    if (req.params && req.params.threatid) {
        Threat
            .findById(req.params.threatid)
            .exec(function(err, threat) {
                if (!threat) {
                    sendJSONresponse(res, 404, {
                        "message": "threatid not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(threat);
                sendJSONresponse(res, 200, threat);
            });
    } else {
        console.log('No threatid specified');
        sendJSONresponse(res, 404, {
            "message": "No threatid in request"
        });
    }
};

/* threats/:threatid/providers */
module.exports.providersCreate = function(req, res) {
    if (req.params.threatid) {
        Threat
            .findById(req.params.threatid)
            .select('providers')
            .exec(
                function(err, threat) {
                    if (err) {
                        sendJSONresponse(res, 400, err);
                    } else {
                        doAddProvider(req, res, threat);
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, threatid required"
        });
    }
};

/* PUT /threats/:threatid */
module.exports.threatUpdateOne = function(req, res) {
    if (!req.params.threatid) {
        sendJSONresponse(res, 404, {"message" : "Not found, threatid is required"});
        return;
    }
    Threat
        .findById(req.params.threatid)
        .select("-providers")
        .exec( function (err, threat) {
            if (!threat) {
                sendJSONresponse(res, 404, {"message" : "threatid not found"});
                return;
            }else if (err) {
                sendJSONresponse(res, 400, err);
                return;
            }
            threat.name = req.body.name;
            threat.dateCreated = new Date(req.body.dateCreated);
            threat.dateUpdated = new Date(req.body.dateUpdated);
            threat.url = req.body.url;
            threat.alsoKnownAs = req.body.alsoKnownAs;
            threat.text_final_desc = req.body.text_final_desc;
            threat.save(function (err, threat) {
                if (err) {
                    sendJSONresponse(res, 404, err);
                }else {
                    sendJSONresponse(res, 200, threat);
                }
            });
        });
}

/* DELETE /threats/:threatid */
module.exports.threatDeleteOne = function(req, res) {
    var threatid = req.params.threatid;
    if (threatid) {
        Threat
            .findByIdAndRemove(threatid)
            .exec( function (err, threat) {
                if (err) {
                    sendJSONresponse(res, 404, err);
                    return;
                }
                sendJSONresponse(res, 200, null);
            });
    } else {
        sendJSONresponse(res, 404, {"message" : "No threatid"});
    }
}

/* GET /threats/:threatid/providers/:providerid */
module.exports.providersRead = function(req,res) {
    console.log("Getting single provider");
    if (req.params && req.params.threatid && req.params.providerid) {
        Threat
            .findById(req.params.threatid)
            .select('name providers')
            .exec(
                function(err, threat) {
                    console.log(threat);
                    var response;
                    if (!threat) {
                        sendJSONresponse(res, 404, {
                            "message": "threatid not found"
                        });
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    if (threat.providers && threat.providers.length > 0) {
                        provider = threat.providers.id(req.params.providerid);
                        if (!provider) {
                            sendJSONresponse(res, 404, {
                                "message": "providerid not found"
                            });
                        } else {
                            response = {
                                name: provider.name,
                                threatid: req.params.threatid,
                                provider: provider.provider,
                                dateUpdated: provider.dateUpdated,
                                url: provider.url,
                                text_desc: provider.text_desc,
                                 _id: req.params.providerid
                            };
                            sendJSONresponse(res, 200, response);
                        }
                    } else {
                        sendJSONresponse(res, 404, {
                            "message": "No providers found"
                        });
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, locationid and reviewid are both required"
        });
    }
}

/* PUT /threats/:threatid/providers/:providerid */
module.exports.providersUpdate = function(req,res) {
    if (!req.params.threatid || !req.params.providerid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, threatid and providerid are both required"
        });
        return;
    }
    Threat
        .findById(req.params.threatid)
        .select('providers')
        .exec(
            function(err, threat) {
                if (!threat) {
                    sendJSONresponse(res, 404, {
                        "message": "threatid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (threat.providers && threat.providers.length > 0) {
                    var thisProvider = threat.providers.id(req.params.providerid);
                    if (!thisProvider) {
                        sendJSONresponse(res, 404, {
                            "message": "providerid not found"
                        });
                    } else {
                        thisProvider.name = req.body.name;
                        thisProvider.provider = req.body.provider;
                        thisProvider.dateUpdated = new Date(req.body.dateUpdated);
                        thisProvider.url = req.body.url;
                        thisProvider.text_desc = req.body.text_desc;
                        threat.save(function(err, threat) {
                            if (err) {
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 200, threat);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message": "No provider to update"
                    });
                }
            }
        );
}

/* DELETE /threats/:threatid/providers/:providerid */
module.exports.providersDelete = function(req, res) {
    if (!req.params.threatid || !req.params.providerid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, threatid and providerid are both required"
        });
        return;
    }
    Threat
        .findById(req.params.threatid)
        .select('providers')
        .exec(
            function(err, threat) {
                if (!threat) {
                    sendJSONresponse(res, 404, {
                        "message": "threatid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (threat.providers && threat.providers.length > 0) {
                    if (!threat.providers.id(req.params.providerid)) {
                        sendJSONresponse(res, 404, {
                            "message": "providerid not found"
                        });
                    } else {
                        threat.providers.id(req.params.providerid).remove();
                        threat.save(function(err) {
                            if (err) {
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 200, null);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message": "No provider to delete"
                    });
                }
            }
        );
}

var doAddProvider = function(req, res, threat) {
    if (!threat) {
        sendJSONresponse(res, 404, "threatid not found");
    } else {
        threat.providers.push({
            name: req.body.name,
            provider: req.body.provider,
            dateUpdated: new Date(req.body.dateUpdated),
            url: req.body.url,
            text_desc: req.body.text_desc
        });
        threat.save(function(err, threat) {
            var thisProvider;
            if (err) {
                sendJSONresponse(res, 400, err);
            } else {
                thisProvider = threat.providers[threat.providers.length - 1];
                sendJSONresponse(res, 201, thisProvider);
            }
        });
    }
};