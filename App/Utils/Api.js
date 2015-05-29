/**
 * @flow
 */

"use strict";

var Api = {
  getPodcasts (page: ?number) {
    var url = "http://www.rwpod.com/api/podcasts";
    if (page) {
      url += "/page/" + page.toString();
    }
    url += ".json";
    return fetch(url).then((res) => res.json());
  }
};


module.exports = Api;
