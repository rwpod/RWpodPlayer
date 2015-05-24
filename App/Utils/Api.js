"use strict";


var Api = {
  getPodcasts () {
    var url = "http://www.rwpod.com/api/podcasts.json";
    return fetch(url).then((res) => res.json());
  }
};


module.exports = Api;
