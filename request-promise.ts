const SERVER_HOSTNAME_DEV = "http://tot-server.dev.9rum.cc/";

interface Option {
  method: "GET" | "POST",
  path: string,
  headers: {},
  params: {}
}

/**
 * [함수기능]
 * XMLHttpRequest를 수행하는 함수로 Promise를 반환합니다.
 * 
 * [사용방법]
 * request({
 *     method: "POST",
 *     path: "player/" + this._player.playerId + "/init",
 *     headers: {},
 *     params: {
 *         name: this._player.name,
 *         floor: this._floor,
 *         img_url: this._player.profileImgUrl
 *     }
 * }).then((data) => {
 *     console.log(data);
 * }).catch((error) => {
 *     console.log(error);
 * });
 * 
 * @param opts Option Type
 * - method: "GET" | "POST",
 * - path: string,
 * - headers: {},
 * - params: {}
 */
export function request(opts: Option) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(opts.method, SERVER_HOSTNAME_DEV + opts.path);

    if (opts.headers) {
      Object.keys(opts.headers).forEach(function (key) {
        xhr.setRequestHeader(key, opts.headers[key]);
      });
    }

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject({
          status: xhr.status,
          data: this.statusText,
        });
      }
    };

    xhr.onerror = function () {
      reject({
        status: xhr.status,
        data: this.statusText,
      });
    };

    xhr.send(JSON.stringify(opts.params));
  });
}