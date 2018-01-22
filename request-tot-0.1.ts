mport { REQUEST_METHOD } from "../Script/Enum";

//TODO beta real 만들
const SERVER_HOSTNAME_DEV = "http://test/";
const SERVER_HOSTNAME_REAL = "http://real/";

type TYPE_PHASE = "REAL" | "DEV";

class HttpRequest {
    private _xhr        : XMLHttpRequest;
    private _path       : string;
    private _param      : {} = {};
    private _method     : REQUEST_METHOD;
    private _callback   : (jsonResult: string) => void;
    private _phase      : TYPE_PHASE;

    /**
     * [사용방법]
     *  const req = new HttpRequest(REQUEST_METHOD.POST);
     *  req.addHeader("", "");
     *  req.setPath("player/" + GameManager.player.getPlayerId() + /init);
     *  req.addParam("name", "HWANG");
     *  req.addParam("floor", "1000");
     *  req.setCallback((result) => { });
     *  req.send();
     * 
     * @param method Request Method 지정
     */
    // TODO enum 쓰지말고 union 으로 설정
    public constructor(method: REQUEST_METHOD) {
        this._xhr    = new XMLHttpRequest();
        this._method = method;
    }

    public setPhase(phase: TYPE_PHASE) {
        this._phase = phase;
    }

    /**
     * HttpRequest Header 추가
     * @param header 
     * @param value
     */
    // 문서 잘 작성하기
    public addHeader(header: string, value: string) {
        this._xhr.setRequestHeader(header, value);
    }

    /**
     * HttpRequest Path 지정
     * @param path 
     */
    public setPath(path: string) {
        this._path = path;
    }

    /**
     * HttpRequest Param 추가
     * @param key 
     * @param value 
     */
    public addParam(key: string, value: string | number) {
        this._param[key] = value;
    }
    
    /**
     * HttpRequest Response에 대한 Callback 지정
     * @param callback 
     */
    public setCallback(callback: (jsonResult: string) => void) {
        this._callback = callback;
    }

    /**
     * HttpRequest Send
     */
    public send() {
        let hostName;
        if (this._phase === "REAL") {
            hostName = SERVER_HOSTNAME_REAL;
        } else {
            hostName = SERVER_HOSTNAME_DEV;
        }
        this._xhr.open(this._method, hostName + this._path, true);
        this._xhr.onreadystatechange = this._onResponse.bind(this);
        this._xhr.send(JSON.stringify(this._param));
        // this.onload
    }

    /**
     * HttpRequest onreadystatechange에 의한 Callback
     */
    private _onResponse() {
        if (this._xhr.readyState == 4 && (this._xhr.status >= 200 && this._xhr.status < 400)) {
            var response = this._xhr.responseText;
            this._callback(JSON.parse(response));
        }
    }
}

export default HttpRequest;