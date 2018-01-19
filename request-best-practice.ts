function makeRequest (opts) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(opts.method, opts.url);
      
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };

      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };

      if (opts.headers) {
        Object.keys(opts.headers).forEach(function (key) {
          xhr.setRequestHeader(key, opts.headers[key]);
        });
      }

      var params = opts.params;
      xhr.send(JSON.stringify(params));
    });
  }
  
  // Headers and params are optional
  makeRequest({
    method: 'GET',
    url: 'http://example.com'
  })
  .then(function (datums) {
    return makeRequest({
      method: 'POST',
      url: datums.url,
      params: {
        score: 9001
      },
      headers: {
        'X-Subliminal-Message': 'Upvote-this-answer'
      }
    });
  })
  .catch(function (err) {
    console.error('Augh, there was an error!', err.statusText);
  });