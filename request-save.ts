/**
 * 요청 옵션
 * - 캐쉬 여부
 * - 헤더 
 * - 타임 아웃
 */
interface RequestOptions {
    ignoreCache?: boolean;
    headers?: { [key: string]: string };
    // 0 (or negative) to wait forever
    timeout?: number;
}

/**
 * 기본 요청 옵션
 * - 캐싱 : false
 * - 헤더
 * - 타임아웃: 5000
 */
export const DEFAULT_REQUEST_OPTIONS = {
    ignoreCache: false,
    headers: {
        'Accept': 'application/json, text/javascript, text/plain',
    },
    // default max duration for a request
    timeout: 5000,
};

/**
 * 결과 인터페이스
 * - ok인가
 * - 결과 상태
 * - 결과 상태 텍스트
 * - 결과 data
 * - json 객체
 * - 헤더
 */
export interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    data: string;
    json: <T>() => T;
    headers: string,
}

/**
 * 객체를 쿼리문으로 만듦
 * @param params Query 객체
 */
function queryParams(params: any = {}) {
    return Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
}

/**
 * 전체 URL을 만듦
 * @param url 스키마 + 도메인네임
 * @param params 쿼리 객체
 */
function withQuery(url: string, params: any = {}) {
    const queryString = queryParams(params);
    return queryString ? url + (url.indexOf('?') === -1 ? '?' : '&') + queryString : url;
}

/**
 * XHR 결과를 파싱한다
 * @param xhr XHR 객체
 */
function parseXHRResult(xhr: XMLHttpRequest): Response {
    return {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhr.getAllResponseHeaders(),
        data: xhr.responseText,
        json: <T>() => JSON.parse(xhr.responseText) as T,
    };
}

function errorResponse(xhr: XMLHttpRequest, message: string | null = null): Response {
    return {
        ok: false,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhr.getAllResponseHeaders(),
        data: message || xhr.statusText,
        json: <T>() => JSON.parse(message || xhr.statusText) as T,
    };
}

export function request(
    method: 'get' | 'post',
    url: string,
    queryParams: any = {},
    body: any = null,
    options: RequestOptions = DEFAULT_REQUEST_OPTIONS) {

    const ignoreCache = options.ignoreCache || DEFAULT_REQUEST_OPTIONS.ignoreCache;
    const headers = options.headers || DEFAULT_REQUEST_OPTIONS.headers;
    const timeout = options.timeout || DEFAULT_REQUEST_OPTIONS.timeout;

    var result = new Promise<Response>((resolve, reject) => {
        let requestCompleted = false;
        const xhr = new XMLHttpRequest();
        xhr.open(method, withQuery(url, queryParams));

        // 헤더가 있으면 key, value를 헤더정보로 지정
        if (headers) {
            Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
        }

        // 캐싱이 필요 없다면 no-cache로 지정
        if (ignoreCache) {
            xhr.setRequestHeader('Cache-Control', 'no-cache');
        }

        // 요청이 성공적으로 완료되었을 때
        xhr.onload = evt => {
            requestCompleted = true;
            resolve(parseXHRResult(xhr));
        }

        xhr.onerror = evt => {
            requestCompleted = true;
            resolve(errorResponse(xhr, 'Failed to make request.'));
        }

        // POST 요청이고 바디가 있으면 헤더 붙이고 문자열로 바꾸어서 send
        if (method === 'post' && body) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(body));
        } else {
            // GET이면 만들어진 URL에 쿼리가 붙어있기 때문에 그냥 전송
            xhr.send();
        }
    });

    return result;
}