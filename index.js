'use strict';

var azure = require('azure-storage');
var Promise = require('bluebird');
var util = require('util');
var url = require('url');
var BaseStorage = require('../../../core/server/storage/base');

function ghostStorageAzure(config) {
    BaseStorage.call(this);
    this.options = config || {};
}

util.inherits(ghostStorageAzure, BaseStorage);

ghostStorageAzure.prototype.save = function(image) {
    var _this = this;
    var blobService = azure.createBlobService(_this.options.connectionString);
    var uniqueName = new Date().getMonth() + "/" + new Date().getFullYear() + "/" + image.name;

    return new Promise(function(resolve, reject) {
        blobService.createContainerIfNotExists(_this.options.container, { publicAccessLevel: 'blob' }, function(error) {
            if (!error) {
                blobService.createBlockBlobFromLocalFile(_this.options.container, uniqueName, image.path, function(error) {
                    if (!error) {
                        var urlValue = blobService.getUrl(_this.options.container, uniqueName);

                        if(!_this.options.cdnUrl){
                            resolve(urlValue);
                        } else {
                            var parsedUrl = url.parse(urlValue, true, true);
                            var protocol = (_this.options.useHttps ? "https" : "http") + "://";
                            resolve(protocol + _this.options.cdnUrl  + parsedUrl.path);
                        }
                    } else {
                        reject('ERROR: creating file on storage!' + error);
                    }
                });
            } else {
                reject('ERROR: creating container!' + error);
            }
        });
    });
}

ghostStorageAzure.prototype.serve = function() {
    return function(req, res, next) {
        next();
    };
}

// TODO: check image
ghostStorageAzure.prototype.exists = function(image) {
    return new Promise(function(resolve, reject) {
        resolve(false);
    });
}

// TODO: delete image from storage
ghostStorageAzure.prototype.delete = function(image, targetDir) {
    return new Promise(function(resolve) {
        resolve(false);
    });
};

module.exports = ghostStorageAzure;
